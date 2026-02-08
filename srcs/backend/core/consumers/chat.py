import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from core.models import Circle, Message

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        self.user = await self.authenticate_user()
        if not self.user:
            return await self.close_with_log("Authentication failed")

        if not await self.is_circle_member():
            return await self.close_with_log("User is not a circle member")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message")
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received")
            return

        if not message:
            return

        await self.save_message(message)

        await self.broadcast_message(message)
        await self.send_notifications(message)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": {
                "username": event["sender_username"],
                "id": event["sender_id"]
            }
        }))

    async def task_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "task_update",
            "action": event["action"]
        }))

    async def authenticate_user(self):
        token_key = self.get_token_from_query()
        if not token_key:
            return None
        return await self.get_user_from_token(token_key)

    def get_token_from_query(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(
            param.split("=") for param in query_string.split("&") if "=" in param
        )
        return params.get("token")

    async def is_circle_member(self):
        return await self.check_membership(self.user, self.room_name)

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

    async def send_notifications(self, message):
        member_ids = await self.get_circle_members()
        for member_id in member_ids:
            if member_id == self.user.id:
                continue

            await self.channel_layer.group_send(
                f"notifications_{member_id}",
                {
                    "type": "send_notification",
                    "notification": {
                        "type": "circle_message",
                        "sender": self.user.username,
                        "circle_id": self.room_name,
                        "message": message
                    }
                }
            )

    async def close_with_log(self, reason):
        logger.warning(f"WebSocket closed: {reason}")
        await self.close()

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def check_membership(self, user, circle_id):
        return Circle.objects.filter(
            id=circle_id,
            members=user
        ).exists()

    @database_sync_to_async
    def save_message(self, content):
        circle = Circle.objects.get(id=self.room_name)
        Message.objects.create(
            sender=self.user,
            content=content,
            circle=circle
        )

    @database_sync_to_async
    def get_circle_members(self):
        return list(
            Circle.objects.get(id=self.room_name)
            .members
            .values_list("id", flat=True)
        )
