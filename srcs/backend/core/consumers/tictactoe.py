import json
import logging
from channels.generic.websocket import *
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from core.models import *

logger = logging.getLogger(__name__)


class TicTacToeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.circle_id = self.scope["url_route"]["kwargs"]["circle_id"]
        self.roomGroup = "tictactoe_%s" % self.circle_id

        user = await self._auth()

        if not user or not user.is_authenticated:
            logger.warning("unauth socket")
            await self.close()
            return

        self.user = user

        if not await self._is_member():
            logger.warning("not member %s" % user.id)
            await self.close()
            return

        await self.channel_layer.group_add(self.roomGroup, self.channel_name)
        await self.accept()

        await self._send_state()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.roomGroup, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except:
            return

        t = data.get("type")

        if t == "join_game":
            await self.join(data)
        elif t == "make_move":
            await self.move(data)
        elif t == "reset_game":
            await self.reset()
        elif t == "leave_game":
            await self.leave()
        else:
            logger.info("unknown event")

    async def join(self, data):
        role = data.get("role")

        if role not in ["X", "O"]:
            return

        ok = await self._assign(role)
        if ok:
            await self._broadcast()

    async def move(self, data):
        row = data.get("row")
        col = data.get("col")

        if row is None or col is None:
            return

        changed = await self._process(row, col)
        if changed:
            await self._broadcast()

    async def reset(self):
        await self._reset_game()
        await self._broadcast()

    async def leave(self):
        await self._leave_game()
        await self._broadcast()

    @database_sync_to_async
    def _process(self, row, col):
        try:
            game = TicTacToeGame.objects.get(circle_id=self.circle_id)
        except TicTacToeGame.DoesNotExist:
            return False

        if not game.player_x or not game.player_o:
            return False

        if game.winner or game.is_draw:
            return False

        if game.current_turn == "X" and game.player_x != self.user:
            return False
        if game.current_turn == "O" and game.player_o != self.user:
            return False

        if game.board[row][col] != None:
            return False

        game.board[row][col] = game.current_turn

        win = self._check(game.board)

        if win:
            game.winner = win
        elif self._draw(game.board):
            game.is_draw = True
        else:
            game.current_turn = "O" if game.current_turn == "X" else "X"

        game.save()
        return True

    def _check(self, b):
        for i in range(3):
            if b[i][0] and b[i][0] == b[i][1] == b[i][2]:
                return b[i][0]

        for i in range(3):
            if b[0][i] and b[0][i] == b[1][i] == b[2][i]:
                return b[0][i]

        if b[0][0] and b[0][0] == b[1][1] == b[2][2]:
            return b[0][0]

        if b[0][2] and b[0][2] == b[1][1] == b[2][0]:
            return b[0][2]

        return None

    def _draw(self, board):
        for r in board:
            if None in r:
                return False
        return True

    async def _broadcast(self):
        state = await self._state_dict()

        await self.channel_layer.group_send(
            self.roomGroup,
            {
                "type": "game_update",
                "state": state
            }
        )

    async def game_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "game_state",
            "state": event["state"]
        }))

    async def _send_state(self):
        state = await self._state_dict()
        await self.send(text_data=json.dumps({
            "type": "game_state",
            "state": state
        }))

    @database_sync_to_async
    def _state_dict(self):
        game, created = TicTacToeGame.objects.get_or_create(
            circle_id=self.circle_id,
            defaults={
                "board": [[None, None, None],
                          [None, None, None],
                          [None, None, None]],
                "current_turn": "X"
            }
        )

        return {
            "board": game.board,
            "current_turn": game.current_turn,
            "player_x": game.player_x.id if game.player_x else None,
            "player_o": game.player_o.id if game.player_o else None,
            "winner": game.winner,
            "is_draw": game.is_draw,
            "player_x_username": game.player_x.username if game.player_x else None,
            "player_o_username": game.player_o.username if game.player_o else None,
        }

    @database_sync_to_async
    def _reset_game(self):
        TicTacToeGame.objects.filter(circle_id=self.circle_id).update(
            board=[[None, None, None], [None, None, None], [None, None, None]],
            current_turn="X",
            winner=None,
            is_draw=False,
            player_x=None,
            player_o=None
        )

    @database_sync_to_async
    def _leave_game(self):
        try:
            game = TicTacToeGame.objects.get(circle_id=self.circle_id)
        except:
            return

        if game.player_x == self.user:
            game.player_x = None
        elif game.player_o == self.user:
            game.player_o = None

        game.save()

    @database_sync_to_async
    def _assign(self, role):
        game, created = TicTacToeGame.objects.get_or_create(
            circle_id=self.circle_id,
            defaults={
                "board": [[None, None, None],
                          [None, None, None],
                          [None, None, None]],
                "current_turn": "X"
            }
        )

        if role == "X":
            if game.player_x or game.player_o == self.user:
                return False
            game.player_x = self.user

        elif role == "O":
            if game.player_o or game.player_x == self.user:
                return False
            game.player_o = self.user

        else:
            return False

        game.save()
        return True

    async def _auth(self):
        u = self.scope.get("user")

        if u and u.is_authenticated:
            return u

        token = self._get_token()
        if not token:
            return AnonymousUser()

        return await self._user_from_token(token)

    def _get_token(self):
        qs = self.scope.get("query_string", b"").decode()

        params = {}
        for p in qs.split("&"):
            if "=" in p:
                k, v = p.split("=")
                params[k] = v

        return params.get("token")

    @database_sync_to_async
    def _user_from_token(self, key):
        try:
            return Token.objects.select_related("user").get(key=key).user
        except:
            return AnonymousUser()

    async def _is_member(self):
        return await self._check_member()

    @database_sync_to_async
    def _check_member(self):
        return Circle.objects.filter(id=self.circle_id, members=self.user).exists()
