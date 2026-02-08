import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token

class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        try:
            query_string = self.scope['query_string'].decode()
            if 'token=' in query_string:
                token_key = query_string.split('token=')[1].split('&')[0]
                self.scope['user'] = await self.get_user_from_token(token_key)
        except Exception as e:
            pass

        if not self.scope['user'].is_authenticated:
            await self.close()
            return
        
        self.user_id = self.scope['user'].id
        self.notification_group_name = f'notifications_{self.user_id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.get(key=token_key).user
        except Token.DoesNotExist:
            from django.contrib.auth.models import AnonymousUser
            return AnonymousUser()

    async def receive(self, text_data):
        """Handle incoming notification"""
        try:
            data = json.loads(text_data)
            
            await self.send(text_data=json.dumps({
                'status': 'received'
            }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def send_notification(self, event):
        """Send notification to user"""
        notification = event.get('notification', event)
        data_to_send = notification if 'notification' in event else event
        
        if 'type' in data_to_send and data_to_send['type'] == 'send_notification':
             pass

        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': notification
        }))
