from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from ..models import CustomUser, Department
from ..modeldefinitions.taskmodels import Task, TaskComment, TaskAttachment, TeamActivity
from ..serializers.task import TaskSerializer, TaskCommentSerializer, TaskAttachmentSerializer, TeamActivitySerializer
from ..permissions import TaskPermission
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.http import FileResponse
import mimetypes


from django.http import JsonResponse
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.exceptions import PermissionDenied
from rest_framework import generics

class TeamActivityListView(generics.ListAPIView):
    serializer_class = TeamActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Fetch activities for the current user's organization
        return TeamActivity.objects.filter(
            task__organization=self.request.user.organization
        ).order_by('-timestamp')[:20]  # Limit to the last 20 activities


@api_view(['GET'])
@permission_classes([IsAuthenticated, TaskPermission])
def task_list(request):
    # Base query: get active tasks for the organization
    tasks = Task.objects.filter(
        organization=request.user.organization,
        is_active=True
    )
    
    # Filter tasks based on user role
    if request.user.role in ['ADMIN', 'MANAGER']:
        tasks = tasks.filter(
            Q(created_by=request.user) |
            Q(assigned_to__in=[request.user]) |
            Q(assigned_by=request.user)
        ).distinct()
    else:
        tasks = tasks.filter(
            Q(created_by=request.user) |
            Q(assigned_to__in=[request.user])
        ).distinct()
    
    # Calendar-specific date range filtering
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date and end_date:
        tasks = tasks.filter(due_date__range=[start_date, end_date])
    
    # Regular filters
    status_filter = request.query_params.get('status')
    priority_filter = request.query_params.get('priority')
    department_filter = request.query_params.get('department')
    search_query = request.query_params.get('search')

    if status_filter:
        tasks = tasks.filter(status=status_filter)
    if priority_filter:
        tasks = tasks.filter(priority=priority_filter)
    if department_filter:
        tasks = tasks.filter(department_id=department_filter)
    if search_query:
        tasks = tasks.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    serializer = TaskSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated, TaskPermission])
def task_create(request):
    from django.utils import timezone
    from datetime import datetime
    
    try:
        # Get date and time separately
        date_str = request.data.get('due_date')
        time_str = request.data.get('time', '09:00')
        
        # Combine date and time and make it timezone-aware
        due_datetime = datetime.strptime(
            f"{date_str} {time_str}", 
            '%Y-%m-%d %H:%M'
        ).replace(tzinfo=timezone.get_current_timezone())
        
        # Create new data dictionary with the correct datetime
        data = {
            **request.data,
            'due_date': due_datetime,
            'time': time_str
        }
        
        serializer = TaskSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            status_value = request.data.get('status', 'TODO')
            department_id = request.data.get('department')
            assigned_to_ids = request.data.get('assigned_to', [])
            
            # Handle department-wide assignment
            if department_id:
                department = get_object_or_404(Department, id=department_id)
                if department.organization != request.user.organization:
                    return Response(
                        {"error": "You can only assign tasks to departments in your organization"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                department_members = CustomUser.objects.filter(department=department)
                assigned_to_ids = [member.id for member in department_members]
            
            # Handle individual assignment
            elif not assigned_to_ids:
                assigned_to_ids = [request.user.id]
            
            # Create the task
            task = serializer.save(
                organization=request.user.organization,
                created_by=request.user,
                assigned_by=request.user,
                status=status_value,
                time=time_str,
                duration=request.data.get('duration', 60)
            )
            
            # Assign the task to multiple users
            task.assigned_to.set(assigned_to_ids)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except ValueError as e:
        return Response(
            {"error": f"Invalid date or time format: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )



@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, TaskPermission])
def task_detail(request, pk):
    task = get_object_or_404(Task, pk=pk, organization=request.user.organization)
    
    if request.method == 'GET':
        # Calculate progress based on status
        if task.status == 'COMPLETED':
            task.progress_percentage = 100
        elif task.status == 'IN_PROGRESS':
            task.progress_percentage = 50
        elif task.status == 'REVIEW':
            task.progress_percentage = 75
        else:
            task.progress_percentage = 0
            
        # Update completion date if status is COMPLETED
        if task.status == 'COMPLETED' and not task.completion_date:
            task.completion_date = timezone.now()
            task.save()
            
        serializer = TaskSerializer(task, context={
            'request': request,
            'current_user': request.user
        })
        return Response({
            **serializer.data,
            'current_user_id': request.user.id
        })
    
    elif request.method == 'PUT':
        if request.data.get('action') == 'mark_completed':
            # Check if this is a personal task or assigned task
            if task.created_by == task.assigned_to:
                # Personal task - directly mark as completed
                task.status = 'COMPLETED'
                task.completion_date = timezone.now()
            else:
                # Assigned task - set to review first
                if task.status != 'COMPLETED':  # Prevent overwriting if already completed
                    task.status = 'REVIEW'
            
            task.save()
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        
        # Handle review approval
        elif request.data.get('action') == 'approve_completion':
            # Check if the current user is either the task assigner or creator
            if request.user.id not in [task.assigned_by.id, task.created_by.id]:
                return Response(
                    {"error": "Only the task assigner or creator can approve completion"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if task.status == 'REVIEW':
                task.status = 'COMPLETED'
                task.completion_date = timezone.now()
                task.save()
                serializer = TaskSerializer(task)
                return Response(serializer.data)
            else:
                return Response(
                    {"error": "Task must be in review status to approve completion"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        # Regular update
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        task.is_active = False
        task.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated, TaskPermission])
def add_task_comment(request, task_id):
    task = get_object_or_404(Task, pk=task_id, organization=request.user.organization)
    
    serializer = TaskCommentSerializer(data=request.data)
    if serializer.is_valid():
        # Auto-update status to IN_PROGRESS if it's in TODO or ASSIGNED
        if task.status in ['TODO', 'ASSIGNED']:
            task.status = 'IN_PROGRESS'
            task.save()
            
        # Create the comment
        comment = serializer.save(
            task=task,
            author=request.user
        )
        
        # Return updated task data along with the new comment
        task_serializer = TaskSerializer(task)
        return Response({
            'task': task_serializer.data,
            'comment': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, TaskPermission])
def add_task_attachment(request, task_id):
    task = get_object_or_404(Task, pk=task_id, organization=request.user.organization)
    
    serializer = TaskAttachmentSerializer(data=request.data)
    if serializer.is_valid():
        # Auto-update status to IN_PROGRESS if it's in TODO
        if task.status in ['TODO', 'ASSIGNED']:
            task.status = 'IN_PROGRESS'
            task.save()
            
        # Create the attachment
        attachment = serializer.save(
            task=task,
            uploaded_by=request.user
        )
        
        # Return updated task data along with the new attachment
        task_serializer = TaskSerializer(task)
        return Response({
            'task': task_serializer.data,
            'attachment': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def download_task_attachment(request, attachment_id):
    try:
        # Verify the signed URL
        signer = TimestampSigner()
        unsigned_value = signer.unsign(request.GET.get('sig', ''), max_age=300)
        if int(unsigned_value) != attachment_id:
            raise PermissionDenied("Invalid attachment ID in signature")
    except (BadSignature, SignatureExpired) as e:
        return Response(
            {"error": "Invalid or expired download link"},
            status=403
        )

    try:
        attachment = TaskAttachment.objects.get(id=attachment_id)
    except TaskAttachment.DoesNotExist:
        return Response(
            {"error": "Attachment not found"},
            status=404
        )

    # Get the actual file content type
    content_type = None
    if attachment.file_name:
        content_type = mimetypes.guess_type(attachment.file_name)[0]
    if not content_type:
        content_type = 'application/octet-stream'

    try:
        # Use FileResponse for streaming the file
        response = FileResponse(
            attachment.file.open('rb'),
            content_type=content_type,
            as_attachment=True,
            filename=attachment.file_name
        )
        
        # Add necessary headers
        response['Content-Disposition'] = f'attachment; filename="{attachment.file_name}"'
        return response
        
    except Exception as e:
        return Response(
            {"error": f"Error accessing file: {str(e)}"},
            status=500
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, TaskPermission])
def bulk_update_tasks(request):
    task_ids = request.data.get('task_ids', [])
    update_data = request.data.get('update_data', {})
    
    if not task_ids or not update_data:
        return Response(
            {"error": "Both task_ids and update_data are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tasks = Task.objects.filter(
        id__in=task_ids,
        organization=request.user.organization
    )
    
    tasks.update(**update_data)
    return Response({"message": f"Updated {len(task_ids)} tasks"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_analytics(request):
    # Get tasks for the organization
    tasks = Task.objects.filter(organization=request.user.organization)
    
    # Overall statistics
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='COMPLETED').count()
    overdue_tasks = tasks.filter(
        due_date__lt=timezone.now(),
        status__in=['TODO', 'IN_PROGRESS']
    ).count()
    
    # Tasks by status
    status_distribution = tasks.values('status').annotate(
        count=Count('id')
    )
    
    # Tasks by priority
    priority_distribution = tasks.values('priority').annotate(
        count=Count('id')
    )
    
    # Department performance
    department_stats = tasks.values('department__name').annotate(
        total=Count('id'),
        completed=Count('id', filter=Q(status='COMPLETED')),
        overdue=Count('id', filter=Q(
            due_date__lt=timezone.now(),
            status__in=['TODO', 'IN_PROGRESS']
        ))
    )
    
    # Recent activity
    recent_tasks = tasks.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).values('created_at__date').annotate(
        count=Count('id')
    ).order_by('created_at__date')
    
    return Response({
        'overview': {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            'overdue_tasks': overdue_tasks
        },
        'status_distribution': status_distribution,
        'priority_distribution': priority_distribution,
        'department_stats': department_stats,
        'recent_activity': recent_tasks
    })
    

@api_view(['POST'])
@permission_classes([IsAuthenticated, TaskPermission])
def assign_task(request, task_id):
    """
    Endpoint for managers/admins to assign tasks to employees or departments
    """
    # Get the task
    task = get_object_or_404(Task, pk=task_id, organization=request.user.organization)
    
    # Check if user has permission to assign tasks
    if request.user.role not in ['MANAGER', 'ADMIN', 'HOD']:
        return Response(
            {"error": "You do not have permission to assign tasks"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Prevent assigning completed tasks
    if task.status == 'COMPLETED':
        return Response(
            {"error": "Cannot assign a completed task"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    department_id = request.data.get('department_id')
    employee_id = request.data.get('employee_id')

    # For managers/HODs, ensure they can only assign tasks within their department
    if request.user.role in ['MANAGER', 'HOD']:
        if department_id and int(department_id) != request.user.department.id:
            return Response(
                {"error": "You can only assign tasks within your department"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if employee_id:
            employee = get_object_or_404(CustomUser, id=employee_id)
            if employee.department != request.user.department:
                return Response(
                    {"error": "You can only assign tasks to employees in your department"},
                    status=status.HTTP_403_FORBIDDEN
                )
    
    # Department-wide assignment
    if department_id:
        department = get_object_or_404(Department, id=department_id)
        department_members = CustomUser.objects.filter(department=department)
        
        if not department_members.exists():
            return Response(
                {"error": "No employees in the selected department"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the existing task for each member
        for member in department_members:
            task.assigned_to = member
            task.assigned_by = request.user  # Current user is the assigner
            task.status = 'ASSIGNED'
            task.save()
        
        serializer = TaskSerializer(task)
        return Response({
            "message": f"Task assigned to {len(department_members)} department members",
            "task": serializer.data
        })
    
    # Individual employee assignment
    elif employee_id:
        employee = get_object_or_404(CustomUser, id=employee_id)
        
        # Update the existing task
        task.assigned_to = employee
        task.assigned_by = request.user  # Current user is the assigner
        task.status = 'ASSIGNED'
        task.save()
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    return Response(
        {"error": "Either department_id or employee_id must be provided"},
        status=status.HTTP_400_BAD_REQUEST
    )
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated, TaskPermission])
def generate_signed_download_url(request, attachment_id):
    signer = TimestampSigner()
    attachment = get_object_or_404(TaskAttachment, id=attachment_id)
    
    # Generate signed URL valid for 5 minutes
    signed_value = signer.sign(str(attachment_id))
    path = reverse('download-task-attachment', args=[attachment_id])
    full_url = request.build_absolute_uri(path) + f'?sig={signed_value}'
    
    return Response({'signed_url': full_url}, status=status.HTTP_200_OK)
    