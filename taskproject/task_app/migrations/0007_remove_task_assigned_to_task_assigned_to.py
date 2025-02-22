# Generated by Django 5.1.4 on 2025-02-21 17:22

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0006_alter_notification_notification_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='assigned_to',
        ),
        migrations.AddField(
            model_name='task',
            name='assigned_to',
            field=models.ManyToManyField(blank=True, related_name='assigned_tasks', to=settings.AUTH_USER_MODEL),
        ),
    ]
