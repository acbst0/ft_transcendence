import React, { useState, useRef, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import './Chat.css';

const Chat = ({ roomName = 'general' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [notifications, setNotifications] = useState('');
  const messagesEndRef = useRef(null);

  // WebSocket bağlantısı
  const { isConnected, isLoading, sendMessage } = useWebSocket(
    `/ws/chat/${roomName}/`,
    {
      onMessage: (data) => {
        if (data.type === 'chat_message') {
          setMessages((prev) => [...prev, {
            sender: data.sender,
            message: data.message,
            timestamp: new Date().toLocaleTimeString(),
          }]);
        } else if (data.type === 'user_event') {
          setNotifications(data.message);
          setTimeout(() => setNotifications(''), 3000);
        }
      },
      onConnect: () => {
        console.log('Sohbet odası bağlandı');
      },
      onDisconnect: () => {
        console.log('Sohbet odası bağlantısı kesildi');
      },
      onError: (error) => {
        console.error('Sohbet hatası:', error);
      },
    }
  );

  // Mesajlar güncellendiğinde sayfayı aşağıya kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mesaj gönder
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() && isConnected) {
      sendMessage({ message: inputValue });
      setInputValue('');
    }
  };

  if (isLoading) {
    return <div className="chat-container">Bağlanılıyor...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{roomName} Sohbeti</h2>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Bağlandı' : '🔴 Bağlantı Kesildi'}
        </div>
      </div>

      {notifications && (
        <div className="notification">
          {notifications}
        </div>
      )}

      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">Henüz mesaj yok</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message">
              <div className="message-header">
                <strong>{msg.sender}</strong>
                <span className="message-time">{msg.timestamp}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Mesajınızı yazın..."
          disabled={!isConnected}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!isConnected || !inputValue.trim()}
          className="send-button"
        >
          Gönder
        </button>
      </form>
    </div>
  );
};

export default Chat;
