import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from core.models import Circle, TicTacToeGame

logger = logging.getLogger(__name__)

class TicTacToeConsumer(AsyncWebsocketConsumer):
    """
    Manages real-time multiplayer Tic-Tac-Toe games inside a circle.
    """

    async def connect(self):
        self.circle_id = self.scope["url_route"]["kwargs"]["circle_id"]
        self.group_name = f"tictactoe_{self.circle_id}"

        user = await self.authenticate_user()
        if not user or not user.is_authenticated:
            logger.warning("TicTacToe socket rejected (unauthenticated)")
            return await self.close()

        self.user = user

        if not await self.is_circle_member():
            logger.warning(
                "TicTacToe socket rejected (not a member)",
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
            logger.warning("Invalid JSON received in TicTacToeConsumer")
            return

        event_type = data.get("type")

        if event_type == "make_move":
            await self.handle_make_move(data)
        elif event_type == "join_game":
            await self.handle_join_game(data)
        elif event_type == "reset_game":
            await self.handle_reset_game()
        elif event_type == "leave_game":
            await self.handle_leave_game()
        else:
            logger.warning("Unknown event type", extra={"type": event_type})

    async def handle_join_game(self, data):
        role = data.get("role")  # 'X' or 'O'
        if role not in ['X', 'O']:
            return

        success = await self.assign_player(role)
        if success:
            await self.broadcast_game_update()

    async def handle_make_move(self, data):
        try:
            row = data["row"]
            col = data["col"]
        except KeyError:
            return

        # Perform all DB operations in a sync wrapper
        move_result = await self.process_move(row, col)
        
        if move_result:
            await self.broadcast_game_update()

    @database_sync_to_async
    def process_move(self, row, col):
        try:
            game = TicTacToeGame.objects.get(circle_id=self.circle_id)
        except TicTacToeGame.DoesNotExist:
            return False

        # Validation logic
        # Validation logic
        if not game.player_x or not game.player_o:
            return False

        if game.winner or game.is_draw:
            return False

        # Check if it's user's turn
        if game.current_turn == 'X' and game.player_x != self.user:
            return False
        if game.current_turn == 'O' and game.player_o != self.user:
            return False

        # Check if cell is empty
        if game.board[row][col] is not None:
            return False

        # Apply move
        game.board[row][col] = game.current_turn
        
        # Check win/draw
        winner = self.check_winner(game.board)
        if winner:
            game.winner = winner
        elif self.check_draw(game.board):
            game.is_draw = True
        else:
            # Switch turn
            game.current_turn = 'O' if game.current_turn == 'X' else 'X'

        game.save()
        return True

    async def handle_reset_game(self):
        await self.reset_game_state()
        await self.broadcast_game_update()

    async def broadcast_game_update(self):
        state = await self.get_game_state_dict()
        await self.channel_layer.group_send(
            self.group_name,
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

    async def send_existing_game_state(self):
        state = await self.get_game_state_dict()
        if state:
            await self.send(text_data=json.dumps({
                "type": "game_state",
                "state": state
            }))

    # Logic Helpers
    def check_winner(self, board):
        # Rows
        for i in range(3):
            if board[i][0] and board[i][0] == board[i][1] == board[i][2]:
                return board[i][0]
        # Cols
        for i in range(3):
            if board[0][i] and board[0][i] == board[1][i] == board[2][i]:
                return board[0][i]
        # Diagonals
        if board[0][0] and board[0][0] == board[1][1] == board[2][2]:
            return board[0][0]
        if board[0][2] and board[0][2] == board[1][1] == board[2][0]:
            return board[0][2]
        return None

    def check_draw(self, board):
        for row in board:
            if None in row:
                return False
        return True

    # Database Helpers
    @database_sync_to_async
    def get_game_state_obj(self):
        try:
            return TicTacToeGame.objects.get(circle_id=self.circle_id)
        except TicTacToeGame.DoesNotExist:
            return None

    @database_sync_to_async
    def get_game_state_dict(self):
        game, created = TicTacToeGame.objects.get_or_create(
            circle_id=self.circle_id,
            defaults={
                'board': [[None, None, None], [None, None, None], [None, None, None]],
                'current_turn': 'X'
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
    def save_game_state(self, game):
        game.save()

    async def handle_leave_game(self):
        await self.leave_game_state()
        await self.broadcast_game_update()

    @database_sync_to_async
    def reset_game_state(self):
        TicTacToeGame.objects.filter(circle_id=self.circle_id).update(
            board=[[None, None, None], [None, None, None], [None, None, None]],
            current_turn='X',
            winner=None,
            is_draw=False,
            player_x=None,
            player_o=None
        )

    @database_sync_to_async
    def leave_game_state(self):
        try:
            game = TicTacToeGame.objects.get(circle_id=self.circle_id)
            if game.player_x == self.user:
                game.player_x = None
            elif game.player_o == self.user:
                game.player_o = None
            
            # If game was in progress and someone left, maybe reset? 
            # For now just clearing the player slot is enough, 
            # game logic handles missing players by preventing moves.
            
            game.save()
        except TicTacToeGame.DoesNotExist:
            pass

    @database_sync_to_async
    def assign_player(self, role):
        game, created = TicTacToeGame.objects.get_or_create(
            circle_id=self.circle_id,
            defaults={
                'board': [[None, None, None], [None, None, None], [None, None, None]],
                'current_turn': 'X'
            }
        )
        if role == 'X' and not game.player_x:
            if game.player_o == self.user:
                return False
            game.player_x = self.user
            game.save()
            return True
        elif role == 'O' and not game.player_o:
            if game.player_x == self.user:
                return False
            game.player_o = self.user
            game.save()
            return True
        return False

    # Auth Helpers (Same as Sudoku)
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

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            return Token.objects.select_related("user").get(key=token_key).user
        except Token.DoesNotExist:
            return AnonymousUser()

    async def is_circle_member(self):
        return await self.check_membership(self.user, self.circle_id)

    @database_sync_to_async
    def check_membership(self, user, circle_id):
        return Circle.objects.filter(id=circle_id, members=user).exists()
