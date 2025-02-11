from django.db import models
from ..models import CustomUser, Organization
from django.core.validators import FileExtensionValidator


class MessageAttachment(models.Model):
    message = models.ForeignKey('Message', on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(
        upload_to='chat_attachments/%Y/%m/%d/',
        validators=[FileExtensionValidator(
            allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
        )]
    )
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.message.chat.id})"
    
    

class Chat(models.Model):
    CHAT_TYPES = [
        ('DIRECT', 'Direct Chat'),
        ('GROUP', 'Group Chat'),
    ]

    name = models.CharField(max_length=255, blank=True, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='chats')
    chat_type = models.CharField(max_length=10, choices=CHAT_TYPES, default='GROUP')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, related_name='created_chats')
    last_message = models.ForeignKey('Message', on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Chat {self.id}"

    @property
    def is_group_chat(self):
        return self.chat_type == 'GROUP'

class Participant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chats')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_message = models.ForeignKey('Message', on_delete=models.SET_NULL, null=True, related_name='+')
    has_unread = models.BooleanField(default=False)

    class Meta:
        unique_together = ['chat', 'user']

    def __str__(self):
        return f"{self.user.email} in {self.chat.name or 'Chat'}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    has_attachments = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update chat's last message
            self.chat.last_message = self
            self.chat.save()
            
            # Mark as unread for other participants
            Participant.objects.filter(
                chat=self.chat
            ).exclude(
                user=self.sender
            ).update(has_unread=True)

    def __str__(self):
        return f"{self.sender.email}: {self.content[:50]}"