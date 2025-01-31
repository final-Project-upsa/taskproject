import secrets
import string
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.urls import reverse
from ..models import Invitation

def generate_invitation_token(length=32):
    """Generate a secure random token for invitations"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def send_invitation_email(invitation):
    """Send invitation email to new employee"""
    context = {
        'organization': invitation.organization.name,
        'inviter': invitation.invited_by.full_name,
        'role': invitation.get_role_display(),
        'registration_link': generate_registration_link(invitation.token),
        'expiry_date': invitation.expires_at.strftime('%Y-%m-%d %H:%M'),
    }
    
    html_message = render_to_string('emails/invitation.html', context)
    plain_message = render_to_string('emails/invitation_plain.txt', context)
    
    send_mail(
        subject=f'Invitation to join {invitation.organization.name}',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        html_message=html_message,
    )
    
def send_invitationsuccess_email(invitation):
    """Send invitation Success email to the new employee"""
    context = {
        'organization': invitation.organization.name,
        'inviter': invitation.invited_by.full_name,
        'role': invitation.get_role_display(),
        'username': invitation.email,
    }
    
    html_message = render_to_string('emails/invitationsuccess.html', context)
    plain_message = render_to_string('emails/invitationsuccess_plain.txt', context)
    
    send_mail(
        subject=f'You are now a member of {invitation.organization.name} as a {invitation.role}',
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        html_message=html_message,
    )

def generate_registration_link(token_str):
    """
    Generate the full registration URL for the invitation
    Uses the organization's subdomain for the frontend registration link
    """
    try:
        # Retrieve the invitation object using the token string
        invitation = Invitation.objects.get(token=token_str)
        
        # Get the organization from the invitation
        organization = invitation.organization
        frontend_base_url = f"http://{organization.subdomain}.localhost:5173"
        
        # Construct the frontend registration path
        registration_path = f"/register/{token_str}"
        
        # Combine to create the full frontend registration URL
        return f"{frontend_base_url}{registration_path}"
    
    except Invitation.DoesNotExist:
        raise ValueError(f"No invitation found for token: {token_str}")