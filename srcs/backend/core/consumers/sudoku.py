import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from core.models import Circle, SudokuGame

logger = logging.getLogger(__name__)


class SudokuConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.circle_id = self.scope["url_route"]["kwargs"]["circle_id"]
        self.group_name = f"sudoku_{self.circle_id}"

        user = await self.authenticate_user()
        if not user or not user.is_authenticated:
            logger.warning("Sudoku socket rejected (unauthenticated)")
            return await self.close()

        self.user = user

        if not await self.is_circle_member():
            logger.warning(
                "Sudoku socket rejected (not a member)",
                extra={"user_id": self.user.id, "circle_id": self.circle_id}
            )
            return await self.close()

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send_existing_game_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received in SudokuConsumer")
            return

        event_type = data.get("type")

        if event_type == "update_cell":
            await self.handle_cell_update(data)

        elif event_type == "new_game":
            await self.handle_new_game(data)

        else:
            logger.warning("Unknown event type", extra={"type": event_type})

    async def handle_cell_update(self, data):
        try:
            row = data["row"]
            col = data["col"]
            value = data["value"]
            is_mistake = data.get("is_mistake", False)
        except KeyError:
            logger.warning("Invalid cell update payload")
            return

        mistakes = await self.update_game_cell(row=row, col=col, value=value, is_mistake=is_mistake)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "board_update",
                "row": row,
                "col": col,
                "value": value,
                "mistakes": mistakes,
                "sender_id": self.user.id
            }
        )

    async def handle_new_game(self, data):
        try:
            board = data["board"]
            initial_board = data["initial_board"]
            solution = data.get("solution", [])
            difficulty = data.get("difficulty", "easy")
        except KeyError:
            logger.warning("Invalid new game payload")
            return

        await self.create_or_update_game(board=board, initial_board=initial_board, solution=solution, difficulty=difficulty)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "new_game_started",
                "board": board,
                "initial_board": initial_board,
                "solution": solution,
                "difficulty": difficulty,
                "mistakes": 0
            }
        )

    async def board_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def new_game_started(self, event):
        await self.send(text_data=json.dumps({
            "type": "new_game",
            "board": event["board"],
            "initial_board": event["initial_board"],
            "solution": event["solution"],
            "difficulty": event["difficulty"],
            "mistakes": event["mistakes"]
        }))

    async def send_existing_game_state(self):
        game = await self.get_game_state()
        if not game:
            return

        await self.send(text_data=json.dumps({
            "type": "game_state",
            **game
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
        params = dict(param.split("=") for param in query_string.split("&") if "=" in param)
        return params.get("token")

    async def is_circle_member(self):
        return await self.check_membership(self.user, self.circle_id)

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return AnonymousUser()

    @database_sync_to_async
    def check_membership(self, user, circle_id):
        return Circle.objects.filter(id=circle_id, members=user).exists()

    @database_sync_to_async
    def get_game_state(self):
        try:
            game = SudokuGame.objects.get(circle_id=self.circle_id)
            return {
                "board": game.board,
                "initial_board": game.initial_board,
                "solution": game.solution,
                "difficulty": game.difficulty,
                "is_solved": game.is_solved,
                "mistakes": game.mistakes
            }
        except SudokuGame.DoesNotExist:
            return None

    @database_sync_to_async
    def update_game_cell(self, row, col, value, is_mistake):
        game = SudokuGame.objects.get(circle_id=self.circle_id)

        board = game.board
        board[row][col] = value
        game.board = board

        if is_mistake:
            game.mistakes += 1

        game.save(update_fields=["board", "mistakes"])
        return game.mistakes

    @database_sync_to_async
    def create_or_update_game(self, board, initial_board, solution, difficulty):
        circle = Circle.objects.get(id=self.circle_id)
        SudokuGame.objects.update_or_create(
            circle=circle,
            defaults={
                "board": board,
                "initial_board": initial_board,
                "solution": solution,
                "difficulty": difficulty,
                "is_solved": False,
                "mistakes": 0
            }
        )
