from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('TASK_DUE_SOON', 'Task Due Soon'),
        ('TASK_OVERDUE', 'Task Overdue'),
        ('TASK_COMMENT', 'New Comment'),
        ('TASK_STATUS_CHANGE', 'Task Status Changed'),
        ('TASK_ATTACHMENT', 'New Attachment'),
    )

    recipient = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Generic foreign key to related object (Task, Comment, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} for {self.recipient.username}"