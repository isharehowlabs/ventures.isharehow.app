import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from './backendUrl';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl = getBackendUrl();
    
    // Log connection attempt for debugging
    if (typeof window !== 'undefined') {
      console.log('Initializing Socket.io connection to:', backendUrl);
      console.log('Current origin:', window.location.origin);
    }
    
    socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 10000,
      autoConnect: true,
      // Add extra headers if needed
      extraHeaders: {},
    });

    // Add error handling with detailed logging
    socket.on('connect_error', (error: Error & { type?: string; description?: string; context?: any }) => {
      reconnectAttempts++;
      console.warn('Socket.io connection error:', {
        message: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        attempts: reconnectAttempts,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
        backendUrl,
        currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server',
      });
      
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('Max reconnection attempts reached. Socket.io disabled.');
        socket?.disconnect();
      }
    });

    socket.on('connect', () => {
      reconnectAttempts = 0; // Reset on successful connection
      console.log('Socket.io connected successfully to:', backendUrl);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', {
        reason,
        backendUrl,
        wasConnected: socket?.connected,
      });
      if (reason === 'io server disconnect') {
        // Server disconnected, don't auto-reconnect
        socket?.disconnect();
      }
    });

    // Log transport upgrade
    socket.on('upgrade', (transport) => {
      console.log('Socket.io transport upgraded to:', transport.name);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

