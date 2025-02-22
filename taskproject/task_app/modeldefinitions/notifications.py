from django.db import models
from django.utils import timezone
from ..modeldefinitions.taskmodels import TaskType



class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('TASK_COMPLETED', 'Task Completed'),
        ('TASK_COMMENT', 'Task Comment'),
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('FILE_UPLOAD', 'File Upload'),
        ('MEETING_REMINDER', 'Meeting Reminder'),
        ('DEADLINE_APPROACHING', 'Deadline Approaching'),
        ('REMINDER', 'Reminder'),
    ]

    user = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.CharField(max_length=255)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True)
    task_type = models.CharField(max_length=20, choices=TaskType.choices, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.get_notification_type_display()} at {self.timestamp}"