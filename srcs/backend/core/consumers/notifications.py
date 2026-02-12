import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = await self.authenticate_user()
        if not user or not user.is_authenticated:
            logger.warning("Unauthenticated notification socket connection rejected")
            return await self.close()

        self.user = user
        self.user_id = user.id
        self.group_name = f"notifications_{self.user_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        logger.debug(
            "Ignored incoming message on notification socket",
            extra={"user_id": getattr(self.user, "id", None)}
        )

    async def send_notification(self, event):
        notification = event.get("notification")
        if not notification:
            logger.warning("Notification event received without payload")
            return

        await self.send(text_data=json.dumps({
            "type": "notification",
            "data": notification
        }))

    async def authenticate_user(self):
        token_key = self.get_token_from_query()
        if not token_key:
            return AnonymousUser()
        return await self.get_user_from_token(token_key)

    def get_token_from_query(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(param.split("=") for param in query_string.split("&") if "=" in param)
        return params.get("token")

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return AnonymousUser()
