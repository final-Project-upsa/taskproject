# Generated by Django 5.1.4 on 2025-01-26 14:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0002_alter_task_assigned_to_alter_task_department'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(choices=[('ADMIN', 'ADMIN'), ('MANAGER', 'MANAGER'), ('EMPLOYEE', 'EMPLOYEE'), ('H.O.D', 'H.O.D')], default='employee', max_length=20),
        ),
        migrations.AlterField(
            model_name='invitation',
            name='role',
            field=models.CharField(choices=[('ADMIN', 'ADMIN'), ('MANAGER', 'MANAGER'), ('EMPLOYEE', 'EMPLOYEE'), ('H.O.D', 'H.O.D')], max_length=20),
        ),
    ]
