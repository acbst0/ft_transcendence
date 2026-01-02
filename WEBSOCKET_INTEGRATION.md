# WebSocket Entegrasyonu

Bu projede Django Channels kullanarak gerçek zamanlı WebSocket desteği eklenmiştir.

## Backend Kurulumu

### Yüklü Paketler
- `channels` - Django WebSocket desteği
- `channels-redis` - Channel Layer backend olarak Redis
- `daphne` - ASGI server

### Backend Yapısı

#### 1. **consumers.py** - WebSocket Consumer'ları
Projede iki ana consumer tanımlıdır:

- **ChatConsumer** (`ws/chat/<room_name>/`)
  - Sohbet odalarını yönetir
  - Oda grubuna katıl/ayrıl
  - Mesajları broadcast eder
  - Kullanıcı katılım/ayrılım bildirimlerini gönderir

- **NotificationConsumer** (`ws/notifications/`)
  - Kimliği doğrulanmış kullanıcılara bildirim gönderir
  - Kişisel bildirim kanalı

#### 2. **routing.py** - WebSocket URL Yönlendirmesi
```python
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
```

#### 3. **settings.py** - Django Ayarları
- `INSTALLED_APPS`'e `'channels'` ve `'daphne'` eklendi
- `ASGI_APPLICATION` atandı
- `CHANNEL_LAYERS` Redis ile yapılandırıldı

#### 4. **asgi.py** - ASGI Konfigürasyonu
Daphne ASGI server'ını kullanır ve WebSocket bağlantılarını yönlendirir

### Başlatma
```bash
# Geliştirme ortamında
daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application

# Docker'da (otomatik)
# Dockerfile CMD içinde Daphne çalıştırılır
```

## Frontend Kurulumu

### Hook: `useWebSocket`
Custom React hook ile WebSocket bağlantısını yönetin.

**Kullanım:**
```javascript
import useWebSocket from './hooks/useWebSocket';

function MyComponent() {
  const { isConnected, isLoading, sendMessage } = useWebSocket(
    '/ws/chat/general/',
    {
      onMessage: (data) => {
        console.log('Mesaj alındı:', data);
      },
      onConnect: () => {
        console.log('Bağlandı');
      },
      onDisconnect: () => {
        console.log('Bağlantı kesildi');
      },
      onError: (error) => {
        console.error('Hata:', error);
      },
    }
  );

  const handleSend = () => {
    sendMessage({ message: 'Merhaba!' });
  };

  return (
    <div>
      <p>Durum: {isConnected ? 'Bağlandı' : 'Bağlantı Kesildi'}</p>
      <button onClick={handleSend} disabled={!isConnected}>
        Gönder
      </button>
    </div>
  );
}
```

### Bileşen: `Chat`
Hazır kullanıma uygun sohbet bileşeni.

**Kullanım:**
```javascript
import Chat from './components/Chat';

function App() {
  return <Chat roomName="general" />;
}
```

## Mesaj Formatı

### Chat Mesajları
**Gönderme:**
```json
{
  "message": "Merhaba, bu bir mesajdır"
}
```

**Alma:**
```json
{
  "type": "chat_message",
  "message": "Merhaba, bu bir mesajdır",
  "sender": "kullanıcı_adı"
}
```

### Kullanıcı Olayları
```json
{
  "type": "user_event",
  "message": "Bir kullanıcı odaya katıldı",
  "event": "user_joined" // veya "user_left"
}
```

### Bildirimler
**Alma:**
```json
{
  "type": "notification",
  "data": {
    "title": "Bildirim Başlığı",
    "message": "Bildirim İçeriği"
  }
}
```

## Bildirim Gönderme (Backend)

Python kodundan bildirim göndermek için:

```python
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_notification_to_user(user_id, notification_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'send_notification',
            'notification': notification_data,
        }
    )
```

## Docker Yapısı

### Backend (Daphne)
- Port: 8000
- Server: Daphne ASGI
- Redis Channel Layer kullanır

### Frontend (React)
- Port: 3000
- WebSocket otomatik URL'yi belirler

### Caddy (Reverse Proxy)
- WebSocket header'larını doğru şekilde yönetir
- `/ws/*` yolunu backend'e yönlendirir

## Geliştirme Tamamlama Listesi

- [x] Django Channels kurulumu
- [x] WebSocket Consumer'ları oluştur
- [x] URL Routing yapılandır
- [x] React Hook oluştur
- [x] Chat Bileşeni yap
- [x] Daphne server yapılandır
- [x] Caddy WebSocket desteği ekle
- [x] Redis Channel Layer kurulumu

## Sorun Giderme

### WebSocket bağlantısı başarısız
1. Redis çalışıyor mu kontrol edin: `docker exec ft_transcendence_redis redis-cli ping`
2. Backend loglarını kontrol edin: `docker logs ft_transcendence_backend`
3. Frontend konsolunda hatalar olup olmadığını kontrol edin

### Mesajlar iletilmiyor
- Consumer'da `group_send` çağrıldığını doğrulayın
- Channel Layer'ın Redis'e bağlı olduğunu doğrulayın

### Caddy WebSocket sorunu
- `Caddyfile`'da WebSocket header'ları doğru yapılandırıldığını kontrol edin
