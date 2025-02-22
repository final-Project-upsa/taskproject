from rest_framework import serializers
from ..models import CustomUser
from ..modeldefinitions.notifications import Notification

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True) 
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                 'organization', 'department', 'role', 'phone_number', 'password'] 
        read_only_fields = ['date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    


class NotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.SerializerMethodField()
    task_type = serializers.CharField(source='task.type', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'message', 'task_title', 'task_type', 'is_read', 'timestamp']

    def get_task_title(self, obj):
        return obj.task.title if obj.task else "No Task"