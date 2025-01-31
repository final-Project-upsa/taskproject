from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..permissions import IsOrganizationAdmin, IsOrganizationManager
from ..models import Department, CustomUser
from ..serializers.department import DepartmentSerializer, DepartmentTransferSerializer, UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_departments(request):
    """List all departments in user's organization"""
    departments = Department.objects.filter(
        organization=request.user.organization
    )
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOrganizationAdmin])
def create_department(request):
    """Create a new department"""
    serializer = DepartmentSerializer(
        data=request.data,
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save(organization=request.user.organization)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOrganizationAdmin])
def manage_department(request, department_id):
    """Manage a specific department"""
    department = get_object_or_404(
        Department,
        id=department_id,
        organization=request.user.organization
    )

    if request.method == 'GET':
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DepartmentSerializer(
            department,
            data=request.data,
            context={'request': request},
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if department.members.exists():
            return Response(
                {'error': 'Cannot delete department with active members'},
                status=status.HTTP_400_BAD_REQUEST
            )
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOrganizationManager])
def transfer_employee(request):
    """Transfer employee to a different department"""
    serializer = DepartmentTransferSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(
        CustomUser,
        id=serializer.validated_data['user_id'],
        organization=request.user.organization
    )
    new_department = get_object_or_404(
        Department,
        id=serializer.validated_data['new_department_id'],
        organization=request.user.organization
    )

    # Check if user has permission to transfer
    if request.user.role == 'manager' and user.role == 'admin':
        return Response(
            {'error': 'Managers cannot transfer admin users'},
            status=status.HTTP_403_FORBIDDEN
        )

    old_department = user.department
    user.department = new_department
    user.save()

    return Response({
        'message': 'Employee transferred successfully',
        'user': user.email,
        'old_department': old_department.name if old_department else None,
        'new_department': new_department.name
    })
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_department_members(request, department_id):
    """
    Get members of a specific department
    """
    # Verify department belongs to user's organization
    department = get_object_or_404(
        Department, 
        id=department_id, 
        organization=request.user.organization
    )
    
    # For managers/HODs, only allow access to their own department
    if request.user.role in ['MANAGER', 'HOD'] and department.id != request.user.department.id:
        return Response(
            {"error": "You can only view members of your department"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get department members
    members = CustomUser.objects.filter(
        department=department,
        is_active=True
    )
    
    serializer = UserSerializer(members, many=True)
    return Response({
        'members': serializer.data
    })