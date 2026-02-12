from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from core.models import UserProfile
from core.serializers import UserSerializer

class ProfileView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            if 'username' in request.data:
                user.username = request.data['username']
            if 'email' in request.data:
                user.email = request.data['email']
            if 'password' in request.data and request.data['password']:
                user.set_password(request.data['password'])
            user.save()
            
            profile, created = UserProfile.objects.get_or_create(user=user)
            if 'bio' in request.data:
                profile.bio = request.data['bio'][:200]
                profile.save()
            
            if 'remove_avatar' in request.data and request.data['remove_avatar'] == 'true':
                 profile, created = UserProfile.objects.get_or_create(user=user)
                 profile.avatar.delete(save=False)
                 profile.avatar = None
                 profile.save()
            elif 'avatar' in request.FILES:
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.avatar = request.FILES['avatar']
                profile.save()
                
            return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'])
    def toggle_favorite(self, request):
        from django.contrib.auth.models import User
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response({'error': 'User ID is required'}, status=400)
        
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
            
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if profile.favorites.filter(id=target_user_id).exists():
            profile.favorites.remove(target_user)
            is_favorited = False
        else:
            profile.favorites.add(target_user)
            is_favorited = True
            
            # Send Notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_{target_user.id}",
                {
                    "type": "send_notification",
                    "notification": {
                        "title": "New Favorite!",
                        "message": f"{request.user.username} has added you to their favorites!",
                        "type": "favorite",
                        "sender_id": request.user.id
                    }
                }
            )
            
        return Response({'is_favorited': is_favorited})
