import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from './backendUrl';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl = getBackendUrl();
    socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

