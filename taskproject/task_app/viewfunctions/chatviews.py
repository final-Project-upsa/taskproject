from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from ..modeldefinitions.chatmodels import Chat, Participant, Message, MessageAttachment
from ..serializers.chatSerializer import ChatSerializer, MessageSerializer
from django.core.files.uploadhandler import TemporaryFileUploadHandler
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
import mimetypes

User = get_user_model()

class ChatViewSet(viewsets.ViewSet):
    def create(self, request):
        user = request.user
        data = request.data

        # Validate chat type
        chat_type = data.get('chat_type', 'GROUP')
        if chat_type not in ['GROUP', 'DIRECT']:
            return Response(
                {"error": "Invalid chat type"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate participants
        participants = data.get('participants', [])
        if chat_type == 'DIRECT' and len(participants) != 1:
            return Response(
                {"error": "Direct chat must have exactly one participant"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for existing chat with same participants
        if chat_type == 'DIRECT':
            existing_chat = Chat.objects.filter(
                chat_type='DIRECT',
                participants__user=user
            ).filter(
                participants__user_id=participants[0]
            ).first()

            if existing_chat:
                return Response(
                    {
                        "error": "Chat already exists", 
                        "chat_id": existing_chat.id
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # For group chats, check if a group with exactly these participants exists
            participant_ids = set(participants + [user.id])
            existing_chats = Chat.objects.filter(chat_type='GROUP')
            
            for chat in existing_chats:
                chat_participant_ids = set(
                    chat.participants.values_list('user_id', flat=True)
                )
                if chat_participant_ids == participant_ids:
                    return Response(
                        {
                            "error": "Group chat with these participants already exists",
                            "chat_id": chat.id
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

        try:
            with transaction.atomic():
                # Create chat
                chat = Chat.objects.create(
                    name=data.get('name'),
                    organization=user.organization,
                    chat_type=chat_type,
                    created_by=user
                )

                # Add creator as a participant
                Participant.objects.create(chat=chat, user=user)

                # Add other participants
                for participant_id in participants:
                    participant_user = User.objects.filter(
                        id=participant_id, 
                        organization=user.organization
                    ).first()
                    
                    if participant_user:
                        Participant.objects.create(
                            chat=chat, 
                            user=participant_user
                        )

                serializer = ChatSerializer(chat)
                return Response(
                    serializer.data, 
                    status=status.HTTP_201_CREATED
                )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def list(self, request):
        user = request.user
        chats = Chat.objects.filter(participants__user=user).distinct()
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        user = request.user
        data = request.data
        chat = Chat.objects.filter(id=pk).first()

        if not chat:
            return Response(
                {"error": "Chat not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the chat creator or admin
        if chat.created_by != user and user.role != 'ADMIN':
            return Response(
                {"error": "You are not authorized to add participants"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Add participants
        participants = data.get('participants', [])
        added_participants = []
        errors = []

        for participant_id in participants:
            try:
                participant_user = User.objects.filter(
                    id=participant_id, 
                    organization=user.organization
                ).first()
                
                if participant_user:
                    # Check if participant already exists
                    participant, created = Participant.objects.get_or_create(
                        chat=chat,
                        user=participant_user
                    )
                    
                    if created:
                        added_participants.append(participant_user.email)
                    else:
                        errors.append(f"User {participant_user.email} is already a participant")
                else:
                    errors.append(f"User with ID {participant_id} not found")

            except Exception as e:
                errors.append(f"Error adding participant {participant_id}: {str(e)}")

        return Response({
            "added_participants": added_participants,
            "errors": errors
        }, status=status.HTTP_200_OK)
        
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Endpoint to mark a chat's messages as read for the current user.
        Access via POST /api/chats/{chat_id}/mark_read/
        """
        user = request.user
        participant = Participant.objects.filter(
            chat_id=pk,
            user=user
        ).first()
        
        if participant:
            participant.has_unread = False
            # If there are messages in the chat, set the last read message
            last_message = Message.objects.filter(chat_id=pk).order_by('-timestamp').first()
            if last_message:
                participant.last_read_message = last_message
            participant.save()
            return Response({'status': 'success'})
        return Response(
            {'error': 'Not a participant'}, 
            status=status.HTTP_403_FORBIDDEN
        )
        
        
        
        
class MessageViewSet(viewsets.ViewSet):
    parser_classes= (MultiPartParser, FormParser)
    def list(self, request, chat_id=None):
        user = request.user

        # Check if user is a participant in the chat
        if not Participant.objects.filter(chat_id=chat_id, user=user).exists():
            return Response({"error": "You are not a participant in this chat"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(chat_id=chat_id).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, chat_id=None):
        user = request.user
        try:
            # Validate chat participation
            if not Participant.objects.filter(chat_id=chat_id, user=user).exists():
                return Response(
                    {"error": "You are not a participant in this chat"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Create message with better error handling
            with transaction.atomic():
                message = Message.objects.create(
                    chat_id=chat_id,
                    sender=user,
                    content=request.data.get('content', ''),
                    has_attachments='attachments' in request.FILES
                )

                attachments_data = []
                # Handle file attachments with validation
                if 'attachments' in request.FILES:
                    files = request.FILES.getlist('attachments')
                    
                    # Add size validation (example: 10MB limit)
                    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
                    
                    for file in files:
                        if file.size > MAX_FILE_SIZE:
                            raise ValidationError(f"File {file.name} is too large. Maximum size is 10MB")
                            
                        # Validate file type if needed
                        content_type = file.content_type or 'application/octet-stream'
                        
                        attachment = MessageAttachment.objects.create(
                            message=message,
                            file=file,
                            file_name=file.name,
                            file_size=file.size,
                            file_type=content_type
                        )
                        
                        # Build attachment data with absolute URL
                        attachments_data.append({
                            'id': attachment.id,
                            'file': request.build_absolute_uri(attachment.file.url),
                            'file_name': attachment.file_name,
                            'file_size': attachment.file_size,
                            'file_type': attachment.file_type
                        })

                # Serialize response
                serializer = MessageSerializer(message, context={'request': request})
                response_data = serializer.data
                
                # # Replace attachments data with our processed data including absolute URLs
                # if attachments_data:
                #     response_data['attachments'] = attachments_data

                return Response(response_data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            print(f"Error creating message: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": "An error occurred while creating the message", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )