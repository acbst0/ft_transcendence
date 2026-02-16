from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from urllib.parse import parse_qs

@database_sync_to_async
def get_user_from_token(token_key):
    if not token_key:
        return None
    
    token = Token.objects.filter(key=token_key).select_related('user').first()
    return token.user if token else None

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()
        
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token_key = query_params.get('token', [None])[0]
        
        user = await get_user_from_token(token_key)
        
        if user and user.is_authenticated:
            scope['user'] = user
            return await super().__call__(scope, receive, send)
        
        await send(
		{
            'type': 'websocket.close',
            'code': 4001,
        }
		)
