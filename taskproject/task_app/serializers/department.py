from rest_framework import serializers
from ..models import Department, CustomUser
from .user import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'member_count']

    def get_member_count(self, obj):
        return obj.members.count()
    
    def validate(self, data):
        # Ensure department name is unique within organization
        request = self.context.get('request')
        if request and Department.objects.filter(
            organization=request.user.organization,
            name=data.get('name')
        ).exists():
            raise serializers.ValidationError("Department with this name already exists")
        return data

class DepartmentTransferSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    new_department_id = serializers.IntegerField()
    
    
class DepartmentWithMembersSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    members = UserSerializer(many=True, read_only=True, source='members.all')

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'member_count', 'members']

    def get_member_count(self, obj):
        return obj.members.count()
    
    def validate(self, data):
        # Ensure department name is unique within organization
        request = self.context.get('request')
        if request and Department.objects.filter(
            organization=request.user.organization,
            name=data.get('name')
        ).exists():
            raise serializers.ValidationError("Department with this name already exists")
        return data