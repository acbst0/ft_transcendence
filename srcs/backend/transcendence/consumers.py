import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat functionality"""
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name', 'general')
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_event',
                'message': f'Bir kullanıcı odaya katıldı',
                'event': 'user_joined'
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_event',
                'message': f'Bir kullanıcı odadan ayrıldı',
                'event': 'user_left'
            }
        )

    async def receive(self, text_data):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': self.scope['user'].username if self.scope['user'].is_authenticated else 'Anonymous'
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))

    async def chat_message(self, event):
        """Receive message from room group"""
        message = event['message']
        sender = event['sender']
        
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'sender': sender
        }))

    async def user_event(self, event):
        """Handle user events (join/leave)"""
        await self.send(text_data=json.dumps({
            'type': 'user_event',
            'message': event['message'],
            'event': event['event']
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close()
            return
        
        self.user_id = self.scope['user'].id
        self.notification_group_name = f'notifications_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )

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
        notification = event['notification']
        
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': notification
        }))
