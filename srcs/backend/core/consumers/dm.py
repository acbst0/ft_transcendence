import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import DirectMessage

logger = logging.getLogger(__name__)


class DMConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.target_user_id = int(self.scope["url_route"]["kwargs"]["user_id"])

        self.user = await self.authenticate_user()
        if not self.user:
            return await self.close_with_log("Authentication failed")

        if self.user.id == self.target_user_id:
            return await self.close_with_log("Self-DM attempt blocked")

        if not await self.target_user_exists():
            return await self.close_with_log("Target user does not exist")

        self.room_group_name = self.build_room_name()

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message")
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received in DMConsumer")
            return

        if not message:
            return

        await self.save_message(message)
        await self.broadcast_message(message)
        await self.send_notification(message)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": {
                "username": event["sender_username"],
                "id": event["sender_id"]
            }
        }))

    async def authenticate_user(self):
        token_key = self.get_token_from_query()
        if not token_key:
            return None
        return await self.get_user_from_token(token_key)

    def get_token_from_query(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(param.split("=") for param in query_string.split("&") if "=" in param)
        return params.get("token")

    def build_room_name(self):
        users = sorted([self.user.id, self.target_user_id])
        return f"dm_{users[0]}_{users[1]}"

    async def broadcast_message(self, message):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender_username": self.user.username,
                "sender_id": self.user.id
            }
        )

    async def send_notification(self, message):
        await self.channel_layer.group_send(
            f"notifications_{self.target_user_id}",
            {
                "type": "send_notification",
                "notification": {
                    "type": "direct_message",
                    "sender": self.user.username,
                    "sender_id": self.user.id,
                    "message": message
                }
            }
        )

    async def close_with_log(self, reason):
        logger.warning(f"DM WebSocket closed: {reason}")
        await self.close()

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def target_user_exists(self):
        return User.objects.filter(id=self.target_user_id).exists()

    @database_sync_to_async
    def save_message(self, content):
        receiver = User.objects.get(id=self.target_user_id)
        DirectMessage.objects.create(sender=self.user, receiver=receiver, content=content)
