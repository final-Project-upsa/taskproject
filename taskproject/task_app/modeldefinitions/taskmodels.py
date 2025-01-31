from django.db import models
from django.utils.text import slugify

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

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    organization = models.ForeignKey('task_app.Organization', on_delete=models.CASCADE, related_name='tasks')
    department = models.ForeignKey('task_app.Department', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)  
    created_by = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='created_tasks')
    assigned_by = models.ForeignKey('task_app.CustomUser',on_delete=models.SET_NULL, null=True, related_name='tasks_assigned', blank=True)
    assigned_to = models.ForeignKey('task_app.CustomUser', on_delete=models.CASCADE, related_name='assigned_tasks', null=True, blank=True) 
    priority = models.CharField(max_length=10, choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    status = models.CharField(max_length=15, choices=TaskStatus.choices, default=TaskStatus.TODO)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    progress_percentage = models.IntegerField(default=0)
    last_updated_by = models.ForeignKey(
        'task_app.CustomUser', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='last_updated_tasks'
    )
    completion_date = models.DateTimeField(null=True, blank=True)

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