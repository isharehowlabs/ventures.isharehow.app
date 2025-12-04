import { io, Socket } from 'socket.io-client';
import { getBackendUrl, getTasksBackendUrl } from './backendUrl';

let socket: Socket | null = null;
let tasksSocket: Socket | null = null;
let reconnectAttempts = 0;
let tasksReconnectAttempts = 0;
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

// Get socket connection specifically for tasks - uses tasks backend URL
// This ensures tasks don't connect to Web3 or other services
export const getTasksSocket = (): Socket => {
  if (!tasksSocket) {
    const backendUrl = getTasksBackendUrl();
    
    // Log connection attempt for debugging
    if (typeof window !== 'undefined') {
      console.log('Initializing Tasks Socket.io connection to:', backendUrl);
      console.log('Current origin:', window.location.origin);
    }
    
    tasksSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 10000,
      autoConnect: true,
      extraHeaders: {},
    });

    // Add error handling with detailed logging
    tasksSocket.on('connect_error', (error: Error & { type?: string; description?: string; context?: any }) => {
      tasksReconnectAttempts++;
      console.warn('Tasks Socket.io connection error:', {
        message: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        attempts: tasksReconnectAttempts,
        maxAttempts: MAX_RECONNECT_ATTEMPTS,
        backendUrl,
        currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server',
      });
      
      if (tasksReconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('Max reconnection attempts reached. Tasks Socket.io disabled.');
        tasksSocket?.disconnect();
      }
    });

    tasksSocket.on('connect', () => {
      tasksReconnectAttempts = 0; // Reset on successful connection
      console.log('Tasks Socket.io connected successfully to:', backendUrl);
    });

    tasksSocket.on('disconnect', (reason) => {
      console.log('Tasks Socket.io disconnected:', {
        reason,
        backendUrl,
        wasConnected: tasksSocket?.connected,
      });
      if (reason === 'io server disconnect') {
        // Server disconnected, don't auto-reconnect
        tasksSocket?.disconnect();
      }
    });

    // Log transport upgrade
    tasksSocket.on('upgrade', (transport) => {
      console.log('Tasks Socket.io transport upgraded to:', transport.name);
    });
  }
  return tasksSocket;
};

export const disconnectTasksSocket = () => {
  if (tasksSocket) {
    tasksSocket.disconnect();
    tasksSocket = null;
    tasksReconnectAttempts = 0;
  }
};

