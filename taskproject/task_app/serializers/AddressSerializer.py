from rest_framework import serializers
from ..models import BusinessAddress

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessAddress
        fields = [
            'id',
            'organization',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'country',
            'business_phone'
        ]
        read_only_fields = ['id']

    def validate_business_phone(self, value):
        # Basic phone number validation
        if not value:
            return value
            
        # Remove any non-digit characters for validation
        cleaned_number = ''.join(filter(str.isdigit, value))
        
        # Check if the number has a reasonable length
        if len(cleaned_number) < 10 or len(cleaned_number) > 15:
            raise serializers.ValidationError(
                'Phone number must be between 10 and 15 digits long'
            )
            
        return value

    def validate_postal_code(self, value):
        country = self.initial_data.get('country')
        if not country or not value:
            return value

        # Add postal code validation based on country
        if country == 'US':
            import re
            if not re.match(r'^\d{5}(-\d{4})?$', value):
                raise serializers.ValidationError(
                    'Invalid US postal code format'
                )
        # Add other country-specific validations as needed
        
        return value