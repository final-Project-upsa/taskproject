from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import RegexValidator
from django.utils.text import slugify
from .modeldefinitions import taskmodels


class Organization(models.Model):
    # Basic Organization Details
    name = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=100, unique=True)
    industry = models.CharField(max_length=100)
    company_size = models.CharField(max_length=50)
    annual_revenue = models.CharField(max_length=50, blank=True)
    website = models.URLField(max_length=200, blank=True)
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    logo = models.ImageField(upload_to='org_logos/', null=True, blank=True)
    selected_package = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class BusinessAddress(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='business_address')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    business_phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.organization.name} - {self.city}, {self.country}"

# class BillingInfo(models.Model):
#     organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='billing_info')
#     billing_email = models.EmailField()
#     billing_address = models.TextField()
#     vat_number = models.CharField(max_length=50, blank=True)
    
#     # Note: Actual card details should be handled by a payment processor, not stored directly
#     cardholder_name = models.CharField(max_length=255)
#     # Store last 4 digits only for reference
#     card_last_four = models.CharField(max_length=4)
    
#     def __str__(self):
#         return f"Billing Info - {self.organization.name}"

class Department(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    
    class Meta:
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.name} - {self.organization.name}"

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, organization, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')
        if not organization:
            raise ValueError('Organization is required')
        if not first_name:
            raise ValueError('First name is required')
        if not last_name:
            raise ValueError('Last name is required')
        
        email = self.normalize_email(email)
        user = self.model(
            email=email, 
            username=username, 
            organization=organization,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
       
        return user

    def create_superuser(self, email, username, first_name, last_name, password=None, **extra_fields):
        # For superuser, we'll create a default organization if needed
        org, created = Organization.objects.get_or_create(
            name='Default Organization',
            subdomain='default',
            defaults={
                'industry': 'Technology',
                'company_size': 'Small',
                'selected_package': 'Enterprise'
            }
        )
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        return self.create_user(
            email=email, 
            username=username, 
            organization=org,
            first_name=first_name,
            last_name=last_name,
            password=password, 
            **extra_fields
        )

class CustomUser(AbstractBaseUser, PermissionsMixin):
    # Organization and Department Fields
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    
    # Role Choices
    ROLE_CHOICES = [
        ('ADMIN', 'ADMIN'),
        ('MANAGER', 'MANAGER'),
        ('EMPLOYEE', 'EMPLOYEE'),
        ('H.O.D', 'H.O.D'),
        #will add more rroles lerra
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    
    # User Fields
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be in format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return f"{self.email} ({self.organization.name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Invitation(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=CustomUser.ROLE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    invited_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)