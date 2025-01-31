from rest_framework import serializers
from ..models import Organization
from django.core.validators import RegexValidator

class OrganizationSerializer(serializers.ModelSerializer):
    subdomain = serializers.CharField(
        validators=[
            RegexValidator(
                regex='^[a-zA-Z0-9-]+$',
                message='Subdomain can only contain letters, numbers, and hyphens'
            )
        ]
    )
    
    class Meta:
        model = Organization
        fields = ['id', 'name', 'subdomain', 'timezone', 'industry', 'company_size', 'annual_revenue', 'website',
                  'selected_package', 'is_active', 'created_at']
        read_only_fields = ['created_at', 'is_active']
        
    def validate_subdomain(self, value):
        # Convert to lowercase
        value = value.lower()
        
        # Check if subdomain is already taken
        if Organization.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError('This subdomain is already taken')
            
        # Add any reserved subdomains
        reserved_subdomains = ['www', 'admin', 'api', 'mail']
        if value in reserved_subdomains:
            raise serializers.ValidationError('This subdomain is reserved')
            
        return value