import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection management
 * @param {string} url - WebSocket URL (e.g., 'ws://localhost:8000/ws/chat/general/')
 * @param {Function} onMessage - Callback function when message is received
 * @param {Function} onConnect - Callback function when connected
 * @param {Function} onDisconnect - Callback function when disconnected
 * @param {Function} onError - Callback function when error occurs
 */
export const useWebSocket = (url, { onMessage, onConnect, onDisconnect, onError } = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webSocketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  // Connection handler
  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = url.startsWith('ws') ? url : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${url}`;
      
      webSocketRef.current = new WebSocket(wsUrl);

      webSocketRef.current.onopen = () => {
        console.log('WebSocket connected:', wsUrl);
        setIsConnected(true);
        setIsLoading(false);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
        
        if (onConnect) {
          onConnect();
        }
      };

      webSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      webSocketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        if (onDisconnect) {
          onDisconnect();
        }

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setTimeout(() => {
            connect();
          }, reconnectDelay.current);
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000); // Max 10s delay
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsLoading(false);
        
        if (onError) {
          onError(error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    }
  }, [url, onMessage, onConnect, onDisconnect, onError]);

  // Send message handler
  const sendMessage = useCallback((data) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Disconnect handler
  const disconnect = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
  }, []);

  // Effect: Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isLoading,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};

export default useWebSocket;
