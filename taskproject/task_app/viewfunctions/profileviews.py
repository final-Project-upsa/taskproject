from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..serializers.profile import UserProfileSerializer, ChangePasswordSerializer
from ..serializers.user import UserSerializer, NotificationSerializer
from rest_framework import generics
from ..modeldefinitions.notifications import Notification

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_profile(request):
    """
    GET: Retrieve user profile
    PUT: Update user profile
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Invalid old password'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)



class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Fetch notifications for the current user
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-timestamp')