from django.conf import settings
from django.http import HttpResponseNotFound
from ..models import Organization

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        hostname = request.get_host().split(':')[0]
        request.organization = None
        
        main_domain = getattr(settings, 'MAIN_DOMAIN', 'localhost')
        if hostname == main_domain:
            return self.get_response(request)
            
        subdomain = hostname.split('.')[0]
        try:
            org = Organization.objects.get(
                subdomain=subdomain,
                is_active=True
            )
            print("Middleware found organization:", type(org))
            print("Middleware organization ID:", org.id)
            request.organization = org
            print("Middleware set request.organization type:", type(request.organization))
            print("Middleware set request.organization ID:", request.organization.id)
        except Organization.DoesNotExist:
            return HttpResponseNotFound("Organization not found")

        return self.get_response(request)