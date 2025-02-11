import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .modeldefinitions.chatmodels import Chat, Message, MessageAttachment
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

CustomUser = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            content = text_data_json.get('content')
            sender_id = text_data_json.get('sender_id')
            attachment_ids = text_data_json.get('attachment_ids', [])

            if not sender_id:
                raise ValueError("Missing sender_id")

            # Save message to database
            chat = await self.get_chat()
            sender = await self.get_user(sender_id)
            
            # Create the message
            message = await self.create_message(chat, sender, content, bool(attachment_ids))

            # Get attachment information if any
            attachments = await self.get_attachments(attachment_ids) if attachment_ids else []

            # Prepare message data
            message_data = {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'chat': chat.id,
                    'content': content,
                    'sender': {
                        'id': sender.id,
                        'name': sender.username,
                        'email': sender.email
                    },
                    'timestamp': message.timestamp.isoformat(),
                    'attachments': attachments,
                    'has_attachments': bool(attachments)
                }
            }

            # Send to chat room
            await self.channel_layer.group_send(self.room_group_name, message_data)

        except Exception as e:
            print(f"Error processing message: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def get_chat(self):
        return Chat.objects.get(id=self.room_name)

    @database_sync_to_async
    def get_user(self, user_id):
        return CustomUser.objects.get(id=user_id)

    @database_sync_to_async
    def create_message(self, chat, sender, content, has_attachments):
        return Message.objects.create(
            chat=chat,
            sender=sender,
            content=content or '',
            has_attachments=has_attachments
        )

    @database_sync_to_async
    def get_attachments(self, attachment_ids):
        attachments = []
        for attachment in MessageAttachment.objects.filter(id__in=attachment_ids):
            file_url = f"/media/chat_attachments/{attachment.file.name.split('chat_attachments/')[-1]}" if attachment.file else None
            attachments.append({
                'id': attachment.id,
                'file_url': file_url,
                'file_name': attachment.file_name,
                'file_size': attachment.file_size,
                'file_type': attachment.file_type
            })
        return attachments
        
