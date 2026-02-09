import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from core.models import UserProfile

logger = logging.getLogger(__name__)


class OnlineStatusConsumer(AsyncWebsocketConsumer):
    """
    Tracks real-time user presence and broadcasts
    online/offline status changes globally.
    """

    async def connect(self):
        user = await self.authenticate_user()
        if not user or not user.is_authenticated:
            logger.warning("Presence connection rejected (unauthenticated)")
            return await self.close()

        self.user = user
        self.group_name = "global_presence"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        await self.mark_user_online()
        await self.broadcast_status("online")
        await self.send_initial_state()

    async def disconnect(self, close_code):
        if hasattr(self, "user") and self.user.is_authenticated:
            await self.mark_user_offline()
            await self.broadcast_status("offline")

        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_status",
            "user_id": event["user_id"],
            "status": event["status"]
        }))

    async def broadcast_status(self, status):
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "status": status
            }
        )

    async def send_initial_state(self):
        online_users = await self.get_online_users()
        await self.send(text_data=json.dumps({
            "type": "initial_state",
            "online_users": online_users
        }))

    async def authenticate_user(self):
        if self.scope.get("user") and self.scope["user"].is_authenticated:
            return self.scope["user"]

        token_key = self.get_token_from_query()
        if not token_key:
            return AnonymousUser()

        return await self.get_user_from_token(token_key)

    def get_token_from_query(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = dict(
            param.split("=") for param in query_string.split("&") if "=" in param
        )
        return params.get("token")

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return AnonymousUser()

    @database_sync_to_async
    def mark_user_online(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        profile.is_online = True
        profile.save(update_fields=["is_online"])

    @database_sync_to_async
    def mark_user_offline(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        profile.is_online = False
        profile.save(update_fields=["is_online"])

    @database_sync_to_async
    def get_online_users(self):
        return list(
            UserProfile.objects
            .filter(is_online=True)
            .values_list("user_id", flat=True)
        )
