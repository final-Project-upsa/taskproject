from django.db.models.signals import post_save
from django.dispatch import receiver
from .modeldefinitions.taskmodels import Task, TaskComment, TaskAttachment, TeamActivity
from .modeldefinitions.notifications import Notification
from django.utils import timezone
from datetime import timedelta


@receiver(post_save, sender=Task)
def log_task_completion(sender, instance, **kwargs):
    """
    Log activity when a task is marked as completed.
    """
    if instance.status == 'COMPLETED':
        for user in instance.assigned_to.all():  # Handle multiple assignees
            TeamActivity.objects.create(
                user=user,
                activity_type='TASK_COMPLETED',
                task=instance,
            )


@receiver(post_save, sender=TaskComment)
def log_task_comment(sender, instance, **kwargs):
    """
    Log activity when a comment is added to a task.
    """
    TeamActivity.objects.create(
        user=instance.author,
        activity_type='TASK_COMMENT',
        task=instance.task,
        comment=instance,
    )


@receiver(post_save, sender=TaskAttachment)
def log_file_upload(sender, instance, **kwargs):
    """
    Log activity when a file is uploaded to a task.
    """
    TeamActivity.objects.create(
        user=instance.uploaded_by,
        activity_type='FILE_UPLOAD',
        task=instance.task,
        attachment=instance,
    )


# Notification for Task Assignment
@receiver(post_save, sender=Task)
def notify_task_assignment(sender, instance, **kwargs):
    """
    Notify users when they are assigned to a task.
    """
    for user in instance.assigned_to.all():  # Handle multiple assignees
        if user != instance.created_by:  # Avoid notifying the creator
            Notification.objects.create(
                user=user,
                notification_type='TASK_ASSIGNED',
                message=f'You have been assigned to task "{instance.title}".',
                task=instance,
                task_type=instance.type,
            )


# Notification for Task Completion
@receiver(post_save, sender=Task)
def notify_task_completion(sender, instance, **kwargs):
    """
    Notify users when a task they are assigned to is completed.
    """
    if instance.status == 'COMPLETED':
        for user in instance.assigned_to.all():  # Handle multiple assignees
            Notification.objects.create(
                user=user,
                notification_type='TASK_COMPLETED',
                message=f'Task "{instance.title}" has been completed.',
                task=instance,
                task_type=instance.type,
            )


# Notification for Task Comments
@receiver(post_save, sender=TaskComment)
def notify_task_comment(sender, instance, **kwargs):
    """
    Notify users when a comment is added to a task they are assigned to.
    """
    for user in instance.task.assigned_to.all():  # Handle multiple assignees
        Notification.objects.create(
            user=user,
            notification_type='TASK_COMMENT',
            message=f'New comment on task "{instance.task.title}".',
            task=instance.task,
            task_type=instance.task.type,
        )


# Notification for Meetings and Reminders
@receiver(post_save, sender=Task)
def notify_meeting_reminder(sender, instance, **kwargs):
    """
    Notify users about upcoming meetings and reminders.
    """
    if instance.type == 'MEETING':
        now = timezone.now()
        meeting_time = instance.due_date
        time_diff = meeting_time - now

        reminder_times = [
            timedelta(hours=1),
            timedelta(minutes=30),
            timedelta(minutes=15),
            timedelta(minutes=5),
            timedelta(minutes=0),  # At the start time
        ]

        for reminder_time in reminder_times:
            if time_diff <= reminder_time and time_diff > reminder_time - timedelta(minutes=1):
                message = f'Meeting "{instance.title}" is starting '
                if reminder_time > timedelta(0):
                    minutes_until = reminder_time.seconds // 60
                    message += f'in {minutes_until} minute' + ('s' if minutes_until > 1 else '') + '.'  # Handle pluralization
                else:
                    message += 'now.'

                # Check if a notification for this time has already been sent
                if not Notification.objects.filter(
                    task=instance,
                    notification_type='MEETING_STARTING',
                    message__icontains=str(reminder_time.seconds // 60) if reminder_time > timedelta(0) else 'now.'
                ).exists():
                    for user in instance.assigned_to.all():  # Handle multiple assignees
                        Notification.objects.create(
                            user=user,
                            notification_type='MEETING_STARTING',
                            message=message,
                            task=instance,
                            task_type=instance.type,
                        )
                break  # Only one notification per time bracket

    elif instance.type == 'REMINDER':
        for user in instance.assigned_to.all():  # Handle multiple assignees
            Notification.objects.create(
                user=user,
                notification_type='REMINDER',
                message=f'Reminder: "{instance.title}".',
                task=instance,
                task_type=instance.type,
            )