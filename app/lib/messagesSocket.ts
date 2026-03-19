import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string | undefined, onMessage: (message: any) => void) => {
  if (socket) {
    socket.disconnect();
  }
  const url = (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  if (!url) {
    throw new Error('Socket URL is not configured');
  }

  socket = io(url, {
    auth: token ? { token } : undefined,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('newMessage', (message: any) => {
    onMessage(message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
