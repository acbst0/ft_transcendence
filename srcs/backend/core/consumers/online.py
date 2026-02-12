import json
import logging
from channels.generic.websocket import *
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from core.models import UserProfile

logger = logging.getLogger(__name__)


class OnlineStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        usr = await self._auth()

        if not usr or not usr.is_authenticated:
            logger.warning("presence rejected")
            await self.close()
            return

        self.u = usr
        self.grp = "global_presence"

        await self.channel_layer.group_add(self.grp, self.channel_name)
        await self.accept()
        await self._setOn(True)
        await self._push("online")
        await self._initState()

    async def disconnect(self, code):

        if hasattr(self, "u") and self.u.is_authenticated:
            await self._setOn(False)
            await self._push("offline")

        if hasattr(self, "grp"):
            await self.channel_layer.group_discard(self.grp, self.channel_name)

    async def user_status(self, ev):
        await self.send(text_data=json.dumps({
            "type": "user_status",
            "user_id": ev["user_id"],
            "status": ev["status"]
        }))

    async def _push(self, st):
        await self.channel_layer.group_send(
            self.grp,
            {
                "type": "user_status",
                "user_id": self.u.id,
                "status": st
            }
        )

    async def _initState(self):
        lst = await self._online()

        await self.send(text_data=json.dumps({
            "type": "initial_state",
            "online_users": lst
        }))

    async def _auth(self):
        u = self.scope.get("user")

        if u and u.is_authenticated:
            return u

        tkn = self._getTkn()
        if not tkn:
            return AnonymousUser()

        return await self._fromTkn(tkn)

    def _getTkn(self):
        qs = self.scope.get("query_string", b"").decode()

        prms = {}
        for p in qs.split("&"):
            if "=" in p:
                k, v = p.split("=")
                prms[k] = v
        return prms.get("token")

    @database_sync_to_async
    def _fromTkn(self, k):
        try:
            return Token.objects.select_related("user").get(key=k).user
        except:
            return AnonymousUser()

    @database_sync_to_async
    def _setOn(self, val):
        prof, _ = UserProfile.objects.get_or_create(user=self.u)
        prof.is_online = val
        prof.save(update_fields=["is_online"])

    @database_sync_to_async
    def _online(self):
        return list(UserProfile.objects.filter(is_online=True).values_list("user_id", flat=True))
