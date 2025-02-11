from rest_framework import serializers
from ..modeldefinitions.chatmodels import Chat, Participant, Message, MessageAttachment
from ..serializers.user import UserSerializer

class ParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Participant
        fields = ['user', 'joined_at']

class ChatSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()
    
    def get_participants(self, obj):
        participants = obj.participants.all()
        return [
            {
                'id': participant.user.id,
                'name': participant.user.username,
                'email': participant.user.email,
            }
            for participant in participants
        ]
    
    def get_last_message(self, obj):
        if not obj.last_message:
            return None
        
        return {
            'content': obj.last_message.content,
            'timestamp': obj.last_message.timestamp,
            'has_attachments': obj.last_message.has_attachments,
            'sender': {
                'id': obj.last_message.sender.id,
                'name': obj.last_message.sender.username,
                'email': obj.last_message.sender.email
            }
        }
    
    def get_unread(self, obj):
        request = self.context.get('request')
        if request and request.user:
            participant = obj.participants.filter(user=request.user).first()
            return participant.has_unread if participant else False
        return False
    
    class Meta:
        model = Chat
        fields = ['id', 'name', 'organization', 'chat_type', 'created_by', 
                 'created_at', 'participants', 'last_message', 'unread']
        

class MessageAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageAttachment
        fields = ['id', 'file_name', 'file_size', 'file_type', 'file_url']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    def get_sender(self, obj):
        return {
            'id': obj.sender.id,
            'name': obj.sender.username,
            'email': obj.sender.email
        }
    
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'timestamp', 'has_attachments', 'attachments']
        
        

