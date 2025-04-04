# Generated by Django 5.1.4 on 2025-02-19 08:45

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0002_teamactivity'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='notification',
            options={'ordering': ['-timestamp']},
        ),
        migrations.RenameField(
            model_name='notification',
            old_name='recipient',
            new_name='user',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='object_id',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='title',
        ),
        migrations.AddField(
            model_name='notification',
            name='task',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='task_app.task'),
        ),
        migrations.AddField(
            model_name='notification',
            name='timestamp',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='notification',
            name='message',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('TASK_COMPLETED', 'Task Completed'), ('TASK_ASSIGNED', 'Task Assigned'), ('FILE_UPLOAD', 'File Upload'), ('TASK_DUE_SOON', 'Task Due Soon'), ('TASK_OVERDUE', 'Task Overdue'), ('TASK_COMMENT', 'New Comment'), ('TASK_STATUS_CHANGE', 'Task Status Changed')], max_length=20),
        ),
    ]
