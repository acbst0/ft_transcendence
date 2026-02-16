# 🏗️ Backend Architecture Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Layer Architecture](#layer-architecture)
4. [Data Flow](#data-flow)
5. [API Design](#api-design)
6. [WebSocket Architecture](#websocket-architecture)
7. [Authentication & Security](#authentication--security)
8. [Database Schema](#database-schema)
9. [Project Structure](#project-structure)
10. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React SPA)                     │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
                 │ HTTP/REST                    │ WebSocket
                 │                              │
┌────────────────▼──────────────────────────────▼─────────────────┐
│                        CADDY (Reverse Proxy)                     │
│                  HTTPS/WSS Termination & Routing                 │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
                 ▼                              ▼
        ┌─────────────────┐           ┌──────────────────┐
        │   HTTP Routes   │           │  WebSocket URLs  │
        │   Django REST   │           │  Django Channels │
        └────────┬────────┘           └────────┬─────────┘
                 │                              │
                 ▼                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    DJANGO APPLICATION (ASGI)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              TokenAuthMiddleware (Security)              │  │
│  └────────────────┬────────────────┬────────────────────────┘  │
│                   │                │                            │
│        ┌──────────▼────────┐  ┌───▼──────────────┐            │
│        │  REST Framework   │  │ Channels Layer   │            │
│        │   (ViewSets)      │  │  (WebSocket)     │            │
│        └──────────┬────────┘  └───┬──────────────┘            │
│                   │                │                            │
│        ┌──────────▼────────────────▼──────────────┐            │
│        │         Business Logic Layer             │            │
│        │      (Views, Serializers, Models)        │            │
│        └──────────┬────────────────┬──────────────┘            │
└───────────────────┼────────────────┼───────────────────────────┘
                    │                │
         ┌──────────▼────────┐  ┌───▼──────────────┐
         │   PostgreSQL DB   │  │  Redis (Cache &  │
         │  (Persistent)     │  │  Channel Layer)  │
         └───────────────────┘  └──────────────────┘
```

---

## 🔧 Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Django | 4.2+ | Main web framework |
| **API** | Django REST Framework | 3.14+ | REST API endpoints |
| **WebSocket** | Django Channels | 4.0+ | Real-time bidirectional communication |
| **ASGI Server** | Daphne | 4.0+ | Async server for WebSocket support |
| **Database** | PostgreSQL | Latest | Primary data store |
| **Cache & Channel** | Redis | 4.5+ | Caching & WebSocket message broker |
| **Authentication** | Token Auth + OAuth2 | Built-in | User authentication |
| **Proxy** | Caddy | Latest | Reverse proxy & SSL/TLS |

### Python Dependencies

```
Django>=4.2,<5.0              # Web framework
djangorestframework>=3.14     # REST API
channels>=4.0                 # WebSocket support
daphne>=4.0                   # ASGI server
psycopg2-binary>=2.9          # PostgreSQL adapter
redis>=4.5                    # Redis client
django-redis>=5.2             # Django Redis integration
channels-redis>=4.0           # Channels Redis backend
django-cors-headers>=4.0      # CORS handling
social-auth-app-django>=5.0   # OAuth2 (Google)
Pillow>=9.0                   # Image processing
python-decouple>=3.8          # Environment variables
```

---

## 🏛️ Layer Architecture

### 1. Presentation Layer (API)

**Location:** `/core/views/`, `/core/serializers.py`

**Responsibilities:**
- HTTP request/response handling
- Input validation
- Data serialization/deserialization
- Authentication checks

**Components:**
- **ViewSets:** `CircleViewSet`, `TaskViewSet`, `ProfileView`, etc.
- **Serializers:** Convert Django models ↔ JSON
- **API Views:** `RegisterView`, `LoginView`, `GoogleLoginCallback`

### 2. Business Logic Layer

**Location:** `/core/views/`, `/core/models.py`

**Responsibilities:**
- Application business rules
- Permission checks
- Data manipulation
- Notification dispatching

**Key Patterns:**
- **ViewSet actions:** Custom endpoints like `@action(detail=True)`
- **Model methods:** Business logic in model classes
- **Signals:** (Not currently used, but available)

### 3. Data Access Layer

**Location:** `/core/models.py`

**Responsibilities:**
- Database schema definition
- ORM queries
- Data validation
- Relationship management

**Models:**
- `Circle` → Work groups
- `Task` → Task management
- `UserProfile` → Extended user data
- `Message`, `DirectMessage` → Messaging
- `SudokuGame`, `TicTacToeGame` → Games

### 4. Real-time Communication Layer

**Location:** `/core/consumers/`

**Responsibilities:**
- WebSocket connection management
- Real-time event broadcasting
- Async message handling

**Consumers:**
- `ChatConsumer` → Circle chat
- `DMConsumer` → Direct messaging
- `NotificationConsumer` → Push notifications
- `OnlineStatusConsumer` → Presence tracking
- `SudokuConsumer`, `TicTacToeConsumer` → Games

---

## 🔄 Data Flow

### REST API Request Flow

```
1. HTTP Request
   ↓
2. Caddy (SSL termination, routing)
   ↓
3. Django ASGI Application
   ↓
4. Middleware Stack
   - SecurityMiddleware
   - SessionMiddleware
   - CorsMiddleware
   - AuthenticationMiddleware
   ↓
5. URL Router (transcendence/urls.py → core/urls.py)
   ↓
6. ViewSet/APIView
   - Permission check (IsAuthenticated)
   - Rate limiting (throttling)
   ↓
7. Serializer (validation & deserialization)
   ↓
8. Business Logic (view methods)
   ↓
9. Database Query (Django ORM → PostgreSQL)
   ↓
10. Serializer (model → JSON)
    ↓
11. HTTP Response
```

### WebSocket Connection Flow

```
1. WebSocket Handshake (ws://... or wss://...)
   ↓
2. Caddy (protocol upgrade)
   ↓
3. Django ASGI (ProtocolTypeRouter)
   ↓
4. TokenAuthMiddleware
   - Parse query string: ?token=...
   - Validate token → User
   - Invalid? → Close connection (code 4001)
   ↓
5. WebSocket URL Router (core/routing.py)
   ↓
6. Consumer (e.g., ChatConsumer)
   - connect() → Join channel group
   - receive() → Handle incoming messages
   - disconnect() → Leave channel group
   ↓
7. Channel Layer (Redis)
   - Group messaging
   - Broadcasting to multiple connections
   ↓
8. Database Operations
   - Save messages
   - Update game state
   ↓
9. Broadcast to all group members
   ↓
10. WebSocket send (JSON messages)
```

---

## 🌐 API Design

### REST API Endpoints

#### Authentication
```
POST   /api/auth/register/              - User registration
POST   /api/auth/login/                 - User login (token)
GET    /api/auth/google/callback/       - OAuth2 callback
```

#### Circles (Work Groups)
```
GET    /api/circles/                    - List all circles
POST   /api/circles/                    - Create new circle
GET    /api/circles/{id}/               - Get circle details
PUT    /api/circles/{id}/               - Update circle (admin only)
DELETE /api/circles/{id}/               - Delete circle
GET    /api/circles/my_circles/         - User's circles
POST   /api/circles/join_by_code/       - Join by invite code
POST   /api/circles/{id}/join/          - Join circle
POST   /api/circles/{id}/leave/         - Leave circle
POST   /api/circles/{id}/kick_member/   - Kick member (admin)
```

#### Tasks
```
GET    /api/tasks/?circle_id={id}       - List tasks in circle
POST   /api/tasks/                      - Create task
GET    /api/tasks/{id}/                 - Get task details
PUT    /api/tasks/{id}/                 - Update task
DELETE /api/tasks/{id}/                 - Delete task (creator only)
POST   /api/tasks/{id}/toggle_check/    - Toggle checklist item
```

#### Messages
```
GET    /api/messages/?circle_id={id}    - Get circle messages
GET    /api/direct-messages/?target_id={id} - Get DM history
```

#### Profile
```
GET    /api/profile/me/                 - Get current user profile
PUT    /api/profile/me/                 - Update profile
POST   /api/profile/toggle_favorite/    - Add/remove favorite user
```

### WebSocket Endpoints

```
ws://backend/ws/chat/{circle_id}/?token={token}
  - Circle group chat
  - Events: chat_message, user_event

ws://backend/ws/chat/dm/{user_id}/?token={token}
  - Direct messaging
  - Events: chat_message

ws://backend/ws/notifications/?token={token}
  - Real-time notifications
  - Events: notification (task, message, favorite)

ws://backend/ws/online/?token={token}
  - Online/offline presence
  - Events: user_status, initial_state

ws://backend/ws/sudoku/{circle_id}/?token={token}
  - Collaborative Sudoku
  - Events: update_cell, new_game, board_update

ws://backend/ws/tictactoe/{circle_id}/?token={token}
  - TicTacToe game
  - Events: join_game, make_move, reset_game, leave_game
```

---

## 🔌 WebSocket Architecture

### Channel Layers Configuration

```python
# Redis-based channel layer
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': ['redis://redis:6379/0'],
        },
    },
}
```

### Channel Groups

| Group Name | Purpose | Members |
|-----------|---------|---------|
| `chat_{circle_id}` | Circle chat room | All circle members |
| `dm_{user1}_{user2}` | Direct message room | Two users |
| `notifications_{user_id}` | Personal notifications | Single user |
| `global_presence` | Online status tracking | All online users |
| `sudoku_{circle_id}` | Sudoku game | Circle members |
| `tictactoe_{circle_id}` | TicTacToe game | Circle members |

### Message Flow

```
User A sends message in Circle 123
    ↓
ChatConsumer.receive()
    ↓
Save to Message model (DB)
    ↓
channel_layer.group_send('chat_123', {...})
    ↓
Redis broadcasts to all members
    ↓
All ChatConsumer.chat_message() triggered
    ↓
websocket.send() to each client
```

---

## 🔐 Authentication & Security

### Authentication Methods

#### 1. Token Authentication (REST API)
```python
# Header
Authorization: Token abc123xyz456

# Used for all /api/* endpoints
```

#### 2. Token via Query String (WebSocket)
```
ws://backend/ws/chat/5/?token=abc123xyz456

# Validated by TokenAuthMiddleware
```

#### 3. Google OAuth2
```
Flow:
1. Frontend → /auth/login/google-oauth2/
2. Google authorization
3. Callback → /auth/complete/google-oauth2/
4. Pipeline creates UserProfile
5. Token generated
6. Redirect to frontend with token
```

### Security Layers

#### 1. Middleware Security
```python
TokenAuthMiddleware:
  - Validates token from query string
  - Rejects invalid/missing tokens (code 4001)
  - Attaches user to scope
  - No anonymous users allowed
```

#### 2. Permission Checks
```python
# ViewSet level
permission_classes = [IsAuthenticated]

# Custom checks
if circle.admin != request.user:
    raise PermissionDenied("Only admin can modify")

# Consumer level
if not await self.is_circle_member():
    await self.close()
```

#### 3. Rate Limiting
```python
DEFAULT_THROTTLE_RATES = {
    'anon': '10/minute',
    'user': '100/minute'
}
```

#### 4. CORS
```python
CORS_ALLOW_ALL_ORIGINS = True  # Development
CORS_ALLOW_CREDENTIALS = True
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Django built-in)
│─────────────│
│ id          │
│ username    │
│ email       │
│ password    │
└──────┬──────┘
       │ 1:1
       ▼
┌─────────────────┐
│  UserProfile    │
│─────────────────│
│ user (FK)       │
│ avatar (Image)  │
│ bio (Text)      │
│ is_online (Bool)│
│ kvkk_accepted   │
└─────────────────┘
       │
       │ M:M (favorites)
       └──────────┐
                  │
┌─────────────────▼────────┐
│       Circle             │
│──────────────────────────│
│ id (PK)                  │
│ name                     │
│ description              │
│ invite_code (Unique)     │
│ admin (FK → User)        │
│ members (M:M → User)     │
│ created_at               │
└────┬─────────────────────┘
     │ 1:M
     ▼
┌─────────────────────────┐
│        Task             │
│─────────────────────────│
│ id (PK)                 │
│ circle (FK)             │
│ title                   │
│ description             │
│ task_type (choice)      │
│ status (choice)         │
│ created_by (FK → User)  │
│ assignees (M:M → User)  │
│ created_at              │
└────┬────────────────────┘
     │ 1:M
     ▼
┌─────────────────────────┐
│   ChecklistItem         │
│─────────────────────────│
│ id (PK)                 │
│ task (FK)               │
│ content                 │
│ is_checked (Bool)       │
└─────────────────────────┘

┌─────────────────────────┐
│      Message            │
│─────────────────────────│
│ id (PK)                 │
│ circle (FK)             │
│ sender (FK → User)      │
│ content (Text)          │
│ timestamp               │
└─────────────────────────┘

┌─────────────────────────┐
│   DirectMessage         │
│─────────────────────────│
│ id (PK)                 │
│ sender (FK → User)      │
│ receiver (FK → User)    │
│ content (Text)          │
│ is_read (Bool)          │
│ timestamp               │
└─────────────────────────┘

┌─────────────────────────┐
│     SudokuGame          │
│─────────────────────────│
│ id (PK)                 │
│ circle (FK) 1:1         │
│ board (JSON)            │
│ initial_board (JSON)    │
│ solution (JSON)         │
│ difficulty              │
│ is_solved (Bool)        │
│ mistakes (Int)          │
└─────────────────────────┘

┌─────────────────────────┐
│   TicTacToeGame         │
│─────────────────────────│
│ id (PK)                 │
│ circle (FK) 1:1         │
│ board (JSON)            │
│ current_turn (Char)     │
│ player_x (FK → User)    │
│ player_o (FK → User)    │
│ winner (Char)           │
│ is_draw (Bool)          │
└─────────────────────────┘
```

### Model Choices

#### Task Types
- `assignment` - Assigned task
- `checklist` - Checklist task
- `note` - Note/reminder

#### Task Status
- `todo` - Not started
- `in_progress` - In progress
- `done` - Completed

---

## 📁 Project Structure

```
/srcs/backend/
│
├── transcendence/               # Django project configuration
│   ├── __init__.py
│   ├── settings.py              # Main settings
│   ├── urls.py                  # Root URL routing
│   ├── asgi.py                  # ASGI application (WebSocket support)
│   ├── wsgi.py                  # WSGI application (not used)
│   └── middleware.py            # TokenAuthMiddleware
│
├── core/                        # Main application
│   │
│   ├── models.py                # Database models (7 models)
│   ├── serializers.py           # DRF serializers
│   ├── urls.py                  # API URL routing
│   ├── routing.py               # WebSocket URL routing
│   ├── pipeline.py              # OAuth2 pipeline
│   │
│   ├── views/                   # API views
│   │   ├── __init__.py
│   │   ├── auth.py              # Registration, Login, OAuth
│   │   ├── circles.py           # Circle CRUD & actions
│   │   ├── tasks.py             # Task management
│   │   ├── messages.py          # Message history
│   │   └── profile.py           # User profile management
│   │
│   ├── consumers/               # WebSocket consumers
│   │   ├── __init__.py
│   │   ├── chat.py              # Circle chat
│   │   ├── dm.py                # Direct messaging
│   │   ├── notifications.py     # Real-time notifications
│   │   ├── online.py            # Online presence
│   │   ├── sudoku.py            # Sudoku game
│   │   └── tictactoe.py         # TicTacToe game
│   │
│   └── migrations/              # Database migrations (14 files)
│
├── media/                       # User uploads
│   └── avatars/                 # Profile pictures
│
├── manage.py                    # Django CLI
├── requirements.txt             # Python dependencies
└── Dockerfile                   # Container definition
```

---

## 🚀 Deployment Architecture

### Docker Compose Stack

```yaml
services:
  db:                    # PostgreSQL database
  redis:                 # Redis cache & channel layer
  backend:               # Django + Daphne
  frontend:              # React SPA
  caddy:                 # Reverse proxy & SSL
```

### Backend Service

```dockerfile
FROM python:3.x

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Migrations
RUN python manage.py migrate

# Static files
RUN python manage.py collectstatic --noinput

# Run Daphne ASGI server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "transcendence.asgi:application"]
```

### Environment Variables

```bash
# Database
POSTGRES_DB=transcendence
POSTGRES_USER=admin
POSTGRES_PASSWORD=***
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=***

# Django
DJANGO_SECRET_KEY=***
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*

# OAuth2
GOOGLE_OAUTH_CLIENT_ID=***
GOOGLE_OAUTH_CLIENT_SECRET=***
```

### Network Architecture

```
Internet (HTTPS/WSS)
    ↓
Caddy :443 (SSL termination)
    ↓
┌──────────────────────────┐
│  Internal Docker Network │
│                          │
│  backend:8000            │
│  frontend:3000           │
│  db:5432                 │
│  redis:6379              │
└──────────────────────────┘
```

---

## 📊 Performance Considerations

### Database Optimization
- **Select Related:** Used in serializers to reduce N+1 queries
- **Prefetch Related:** For ManyToMany relationships
- **Database Indexing:** On frequently queried fields (invite_code, timestamps)

### Caching Strategy
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
    }
}
```

### WebSocket Optimization
- **Channel Groups:** Efficient message broadcasting
- **Redis Backend:** Fast pub/sub for channel layer
- **Connection Pooling:** Database connections reused

---

## 🔍 Monitoring & Logging

### Logging Configuration
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```

### Health Check Endpoints
- Database connectivity: Django ORM queries
- Redis connectivity: Channel layer ping
- WebSocket: Connection count monitoring

---

## 📝 API Response Formats

### Success Response
```json
{
  "id": 1,
  "name": "Study Group",
  "description": "Our study circle",
  "created_at": "2026-02-16T20:00:00Z",
  "members": [...],
  "admin": {...}
}
```

### Error Response
```json
{
  "error": "Invalid code",
  "detail": "Circle not found"
}
```

### WebSocket Message Format
```json
{
  "type": "chat_message",
  "message": "Hello!",
  "sender": {
    "username": "ahmet",
    "id": 10
  }
}
```

---

## 🎯 Design Patterns Used

1. **Repository Pattern:** Models as data access layer
2. **ViewSet Pattern:** REST API controllers
3. **Serializer Pattern:** Data transformation
4. **Observer Pattern:** WebSocket event broadcasting
5. **Middleware Pattern:** Request/connection processing
6. **Factory Pattern:** Django's ORM create methods

---

## 🔄 Future Improvements

1. **Caching Layer:** Add Redis caching for frequently accessed data
2. **Celery:** Add background task queue for heavy operations
3. **API Versioning:** Implement /api/v1/ structure
4. **GraphQL:** Consider GraphQL for complex queries
5. **Monitoring:** Add Sentry for error tracking
6. **Testing:** Add comprehensive unit & integration tests
7. **Documentation:** OpenAPI/Swagger documentation

---

**Architecture Version:** 1.0  
**Last Updated:** 2026-02-16  
**Author:** Backend Team
