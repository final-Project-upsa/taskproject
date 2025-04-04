from django.db import models
from django.utils.text import slugify
from django.utils import timezone

class TaskPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'

class TaskStatus(models.TextChoices):
    TODO = 'TODO', 'To Do'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    REVIEW = 'REVIEW', 'Under Review'
    COMPLETED = 'COMPLETED', 'Completed'
    ARCHIVED = 'ARCHIVED', 'Archived'
    
class TaskType(models.TextChoices):
    PERSONAL = 'PERSONAL', 'Personal'
    MEETING = 'MEETING', 'Meeting'
    PROJECT = 'PROJECT', 'Project'
    DEADLINE = 'DEADLINE', 'Deadline'
    REMINDER = 'REMINDER', 'Reminder'

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    organization = models.ForeignKey('task_app.Organization', on_delete=models.CASCADE, related_name='tasks')
    department = models.ForeignKey('task_app.Department', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)  
    created_by = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='created_tasks')
    assigned_by = models.ForeignKey('task_app.CustomUser',on_delete=models.CASCADE, null=True, related_name='tasks_assigned', blank=True)
    assigned_to = models.ManyToManyField('task_app.CustomUser', related_name='assigned_tasks', blank=True) 
    priority = models.CharField(max_length=10, choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    status = models.CharField(max_length=15, choices=TaskStatus.choices, default=TaskStatus.TODO)
    type = models.CharField(max_length=20, choices=TaskType.choices, default=TaskType.PERSONAL)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    progress_percentage = models.IntegerField(default=0)
    last_updated_by = models.ForeignKey(
        'task_app.CustomUser', 
        on_delete=models.CASCADE, 
        null=True, 
        related_name='last_updated_tasks'
    )
    completion_date = models.DateTimeField(null=True, blank=True)
    time = models.TimeField(default='09:00', blank=True, null=True) 
    duration = models.IntegerField(default=60, blank=True, null=True) 

    class Meta:
        ordering = ['-created_at']

class TaskComment(models.Model):
    task = models.ForeignKey('task_app.Task', on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']



def task_attachment_path(instance, filename):
    """
    File will be uploaded to:
    media/organizations/<org_name_slug>/tasks/<task_id>/attachments/<filename>
    """
    org_name_slug = slugify(instance.task.organization.name)
    return f'organizations/{org_name_slug}/tasks/{instance.task.id}/attachments/{filename}'

class TaskAttachment(models.Model):
    task = models.ForeignKey('task_app.Task', on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=task_attachment_path)
    file_name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.task.title}"
    



class TeamActivity(models.Model):
    ACTIVITY_TYPES = [
        ('TASK_COMPLETED', 'Task Completed'),
        ('TASK_COMMENT', 'Task Comment'),
        ('FILE_UPLOAD', 'File Upload'),
        ('TASK_CREATED', 'Task Created'),
        ('TASK_ASSIGNED', 'Task Assigned'),
    ]

    user = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    comment = models.ForeignKey('TaskComment', on_delete=models.CASCADE, null=True, blank=True)
    attachment = models.ForeignKey('TaskAttachment', on_delete=models.CASCADE, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.name} - {self.get_activity_type_display()} at {self.timestamp}"