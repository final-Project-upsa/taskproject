from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Organization, CustomUser, Invitation, Department
from .serializers.organization import OrganizationSerializer
from .serializers.user import UserSerializer
from .serializers.AddressSerializer import AddressSerializer


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers.auth import LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .utils.invitation import generate_invitation_token, send_invitation_email, send_invitationsuccess_email
from django.core.validators import RegexValidator


subdomain_validator = RegexValidator(
    regex=r'^[a-z0-9][a-z0-9-]*[a-z0-9]$',
    message='Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen'
)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_subdomain_availability(request, subdomain):
    try:
        # Validate subdomain format
        subdomain_validator(subdomain)
        
        # Check if subdomain exists
        exists = Organization.objects.filter(subdomain__iexact=subdomain).exists()
        
        # Additional checks can be added here (e.g., reserved words)
        reserved_subdomains = ['www', 'admin', 'api', 'dashboard', 'app']
        if subdomain.lower() in reserved_subdomains:
            return Response({
                'available': False,
                'message': 'This subdomain is reserved'
            })
        
        return Response({
            'available': not exists,
            'message': 'Subdomain is available' if not exists else 'Subdomain is already taken'
        })
        
    except Exception as e:
        return Response({
            'available': False,
            'message': str(e)
        }, status=400)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_organization(request):
    try:
        # Print received data for debugging
        print("Received data:", request.data)
        
        # Validate organization data
        org_data = {
            'name': request.data.get('name'),  # Changed from organization_name
            'subdomain': request.data.get('subdomain'),
            'industry': request.data.get('industry'),
            'company_size': request.data.get('company_size'),
            'annual_revenue': request.data.get('annual_revenue'),
            'website': request.data.get('website'),
            'timezone': request.data.get('timezone', 'UTC'),
            'language': request.data.get('language', 'en'),
            'selected_package': request.data.get('selected_package')
        }
        
        # Validate user data
        user_data = {
            'email': request.data.get('email'),
            'username': request.data.get('username'),
            'password': request.data.get('password'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
            'job_title': request.data.get('job_title'),
            'phone_number': request.data.get('phone_number'),
            'role': 'admin'
        }

        # Create organization
        org_serializer = OrganizationSerializer(data=org_data)
        if not org_serializer.is_valid():
            print("Organization validation errors:", org_serializer.errors)  # Debug line
            return Response(org_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        organization = org_serializer.save()
        
        # Create admin user
        user_data['organization'] = organization.id
        user_serializer = UserSerializer(data=user_data)
        
        if not user_serializer.is_valid():
            print("User validation errors:", user_serializer.errors)  # Debug line
            organization.delete()
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = user_serializer.save()
        
        # Create business address
        address_data = {
            'organization': organization.id,
            'address_line1': request.data.get('address_line1'),
            'address_line2': request.data.get('address_line2'),
            'city': request.data.get('city'),
            'state': request.data.get('state'),
            'postal_code': request.data.get('postal_code'),
            'country': request.data.get('country'),
            'business_phone': request.data.get('business_phone')
        }
        
        address_serializer = AddressSerializer(data=address_data)
        if address_serializer.is_valid():
            address_serializer.save()
        else:
            print("Address validation errors:", address_serializer.errors)  # Debug line
            # You might want to handle address validation errors differently
        
        # Generate tokens for immediate login
        refresh = RefreshToken.for_user(user)
        
        admin_department = Department.objects.create(
            organization=organization,
            name='Admin',
            description='Administrative Department for Organization Administrators'
        )
        
        # Update the user to be in the Admin department
        user.department = admin_department
        user.save()
        

        return Response({
            'message': 'Organization registered successfully',
            'organization': org_serializer.data,
            'user': user_serializer.data,
            'admin_department': {
                'id': admin_department.id,
                'name': admin_department.name
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("Exception:", str(e))  # Debug line
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter users by organization of the authenticated user
        """
        return CustomUser.objects.filter(organization=self.request.user.organization)

    @action(detail=False, methods=['post'])
    def invite(self, request):
        """
        Invite a new user to the organization
        """
        # Add your email invitation logic here
        pass
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Login for organization users through their subdomain
    """
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Looking up user with email={email} and organization_id={request.organization.id}")
        
        # user lookup debug
        try:
            user = CustomUser.objects.get(
                email=email, 
                organization_id=request.organization.id
            )
            print(f"User found. User ID: {user.id}")
            
            # password check
            if user.check_password(password):
                print("Password verified successfully")
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
            else:
                print("Password verification failed")
                return Response({
                    'error': 'Invalid credentials - password mismatch'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except CustomUser.DoesNotExist:
            print("No user found with this email in this organization")
            return Response({
                'error': 'Invalid credentials - user not found'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_employee(request):
    """
    Invite new employee to organization
    """
    try:
        # Check if d user can invit another person
        if request.user.role not in ['admin', 'manager']:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
       
        email = request.data.get('email')
        role = request.data.get('role', 'employee')
        department_id = request.data.get('department')
       
        # Generate invitation token
        token = generate_invitation_token() 
       
        # Save invitation to database
        invitation = Invitation.objects.create(
            organization=request.user.organization,
            email=email,
            role=role,
            department_id=department_id,
            invited_by=request.user,
            token=token
        )
       
        # Send invitation email
        send_invitation_email(invitation)
       
        return Response({
            'message': 'Invitation sent successfully'
        }, status=status.HTTP_200_OK)
      
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_employee(request, token):
    """
    Complete employee registration through invitation
    """
    try:
        # Verify invitation token
        invitation = get_object_or_404(Invitation, token=token, is_used=False, expires_at__gt=timezone.now())
        
        # Register user
        user_data = {
            'email': invitation.email,
            'username': request.data.get('username'),
            'password': request.data.get('password'),
            'first_name': request.data.get('first_name', ''),
            'last_name': request.data.get('last_name', ''),
            'phone_number': request.data.get('phone_number', ''),
            'organization': invitation.organization.id,
            'department': invitation.department_id,
            'role': invitation.role
        }
        
        user_serializer = UserSerializer(data=user_data)
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user = user_serializer.save()
        
        # mark invitation as used
        invitation.is_used = True
        invitation.used_at = timezone.now()
        invitation.save()
        
        # generate tokens for login
        refresh = RefreshToken.for_user(user)
        
        #send invitation success email
        send_invitationsuccess_email(invitation)
        
        return Response({
            'message': 'Registration successful',
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['GET'])
@permission_classes([AllowAny])
def get_invitation_details(request, token):
    """
    Fetch invitation details for registration
    """
    try:
        invitation = get_object_or_404(
            Invitation, 
            token=token, 
            is_used=False, 
            expires_at__gt=timezone.now()
        )
        
        return Response({
            'email': invitation.email,
            'organization': invitation.organization.name,
            'role': invitation.role,
            'department': invitation.department.name,
            
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
        

        
@api_view(['GET'])
@permission_classes([AllowAny])
def debug_check(request):
    org = Organization.objects.filter(subdomain='firstcompany').first()
    users = CustomUser.objects.filter(organization=org).values('email', 'organization__subdomain')
    
    return Response({
        'organization_exists': bool(org),
        'org_details': {
            'id': getattr(org, 'id', None),
            'name': getattr(org, 'name', None),
            'subdomain': getattr(org, 'subdomain', None)
        } if org else None,
        'users': list(users)
    })
    
@api_view(['GET'])
@permission_classes([AllowAny])
def debug_organization(request):
    return Response({
        'organization_type': str(type(request.organization)),
        'organization_value': str(request.organization),
        'organization_id': getattr(request.organization, 'id', None),
        'subdomain': request.get_host().split('.')[0],
        'full_host': request.get_host()
    })