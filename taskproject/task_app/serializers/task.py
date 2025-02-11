from rest_framework import serializers
from ..modeldefinitions.taskmodels import Task, TaskAttachment, TaskComment, TaskPriority
from django.core.signing import TimestampSigner
from django.utils.http import urlsafe_base64_encode
from django.urls import reverse


# In your TaskAttachmentSerializer
class TaskAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'file', 'file_url', 'uploaded_by', 'uploaded_by_name', 'uploaded_at', 'file_name']
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                # Generate a signed download URL
                signer = TimestampSigner()
                uid = urlsafe_base64_encode(str(obj.id).encode())
                signature = signer.sign(uid)
                return request.build_absolute_uri(
                    reverse('download-attachment', kwargs={'attachment_id': obj.id})
                )
        return None

class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author', 'author_name', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    last_updated_by_name = serializers.CharField(source='last_updated_by.full_name', read_only=True)
    completion_date = serializers.DateTimeField(read_only=True)
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)
    assigned_to_id = serializers.IntegerField(source='assigned_to.id', read_only=True)
    assigned_by_id = serializers.IntegerField(source='assigned_by.id', read_only=True)
    current_user_id = serializers.SerializerMethodField()

    def get_current_user_id(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return request.user.id
        return None

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'organization', 'department', 
            'department_name', 'created_by', 'created_by_name', 'created_by_id',
            'assigned_to', 'assigned_to_name', 'assigned_to_id', 
            'assigned_by', 'assigned_by_id', 'priority', 'status', 'due_date', 'created_at', 'updated_at', 
            'is_active', 'comments', 'attachments', 'progress_percentage', 
            'last_updated_by', 'last_updated_by_name', 'completion_date',
            'current_user_id', 'duration', 'time', 'type',
        ]
        read_only_fields = ['organization', 'created_by', 'created_at', 'updated_at']