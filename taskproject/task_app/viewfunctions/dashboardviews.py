from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Prefetch
from ..models import Department, CustomUser
from ..serializers.department import DepartmentWithMembersSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes



from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Prefetch
from ..models import Department, CustomUser
from ..serializers.department import DepartmentSerializer

class OrganizationTeamView(generics.ListAPIView):
    """
    Enhanced view to provide department and team member data structured for the frontend.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DepartmentSerializer
    
    def get_queryset(self):
        return Department.objects.filter(
            organization=self.request.user.organization
        ).prefetch_related(
            Prefetch(
                'members',
                queryset=CustomUser.objects.filter(
                    organization=self.request.user.organization,
                    is_active=True
                ).select_related('department')
            )
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        departments_data = []

        for department in queryset:
            members = department.members.all()
            
            members_data = [{
                'id': member.id,
                'name': f"{member.first_name} {member.last_name}",
                'role': member.get_role_display(),
                'job_title': member.job_title,
                'email': member.email,
                'phone_number': member.phone_number,
                'avatar': f'/api/placeholder/{member.id}/32/32',  # Using member ID to generate unique placeholder
            } for member in members]

            departments_data.append({
                'id': department.id,
                'name': department.name,
                'description': department.description,
                'members': members_data
            })

        return Response({
            'departments': departments_data,
            'organization_name': request.user.organization.name
        })



# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_dashboard(request):
#     user = request.user
#     return Response({
#         'id': user.id,
#         'name': user.get_full_name() or user.username,
#         'email': user.email,
#         'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else None,
#         # will add more user att herre
#     })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """
    Get comprehensive user dashboard data
    """
    user = request.user
    
    try:
        # Use the existing UserSerializer
        user_data = UserSerializer(user).data
        
        dashboard_data = {
            **user_data,
            'organization' : user.organization.name,
            'stats': {
                'tasks_total': 36,
                'tasks_completed': 24,
                'project_progress': 80,
            }
        }
        
        return Response(dashboard_data)
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return Response(
            {'error': f'Failed to fetch dashboard data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )