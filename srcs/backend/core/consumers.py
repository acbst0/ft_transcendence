import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Circle, Message
from rest_framework.authtoken.models import Token

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Extract token from query string
        try:
            query_string = self.scope['query_string'].decode()
            token_key = query_string.split('token=')[1].split('&')[0]
            self.user = await self.get_user_from_token(token_key)
        except:
            await self.close()
            return

        if not self.user:
            await self.close()
            return
            
        # Check membership
        is_member = await self.check_membership(self.user, self.room_name)
        if not is_member:
            await self.close()
            return

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

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Save to DB
        await self.save_message(self.user, message, self.room_name)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_username': self.user.username,
                'sender_id': self.user.id
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        sender_username = event['sender_username']
        sender_id = event['sender_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': {'username': sender_username, 'id': sender_id}
        }))

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.get(key=token_key).user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def check_membership(self, user, circle_id):
        try:
            circle = Circle.objects.get(id=circle_id)
            return user in circle.members.all()
        except Circle.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, user, content, circle_id):
        circle = Circle.objects.get(id=circle_id)
        Message.objects.create(sender=user, content=content, circle=circle)
