import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from core.models import Circle, Message

log = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.circle_id = self.scope["url_route"]["kwargs"].get("room_name")
        if not self.circle_id:
            return await self.close()

        self.group_name = "chat_" + str(self.circle_id)

        raw_qs = self.scope.get("query_string", b"").decode()
        token_key = None
        if raw_qs:
            parts = raw_qs.split("&")
            for p in parts:
                if p.startswith("token="):
                    token_key = p.split("=")[-1]
                    break

        if not token_key:
            log.warning("no token in ws connect")
            return await self.close()

        self.user = await self._get_user(token_key)
        if not self.user:
            log.warning("invalid token")
            return await self.close()

        self.circle = await self._load_circle(self.circle_id)
        if not self.circle:
            log.warning("circle missing %s", self.circle_id)
            return await self.close()

        is_member = await self._check_member(self.user.id)
        if not is_member:
            log.warning("user %s not in circle %s", self.user.id, self.circle_id)
            return await self.close()

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()


    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except Exception:
            log.warning("ws invalid json")
            return

        msg = data.get("message")
        if not msg or not msg.strip():
            return

        await self._create_msg(msg)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "msg": msg,
                "u": self.user.username,
                "uid": self.user.id
            }
        )

        member_ids = await self._member_ids()
        for mid in member_ids:
            if mid == self.user.id:
                continue

            await self.channel_layer.group_send(
                f"notifications_{mid}",
                {
                    "type": "send_notification",
                    "notification": {
                        "type": "circle_message",
                        "sender": self.user.username,
                        "sender_id": self.user.id,
                        "circle_id": self.circle_id,
                        "message": msg
                    }
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event.get("msg"),
            "sender": {
                "username": event.get("u"),
                "id": event.get("uid")
            }
        }))

    @database_sync_to_async
    def _get_user(self, token_key):
        try:
            obj = Token.objects.select_related("user").get(key=token_key)
            return obj.user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def _load_circle(self, cid):
        try:
            return Circle.objects.get(id=cid)
        except Circle.DoesNotExist:
            return None

    @database_sync_to_async
    def _check_member(self, user_id):
        return self.circle.members.filter(id=user_id).exists()

    @database_sync_to_async
    def _create_msg(self, text):
        Message.objects.create(sender=self.user, content=text, circle=self.circle)

    @database_sync_to_async
    def _member_ids(self):
        return list(self.circle.members.values_list("id", flat=True))
