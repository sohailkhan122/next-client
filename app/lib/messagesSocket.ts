import { io, Socket } from 'socket.io-client';
import axiosInstance from './axiosInstance';

let socket: Socket | null = null;

const resolveSocketUrl = (): string => {
  const configuredUrl = (process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3001';
};

export const initializeSocket = <T>(
  token: string | undefined,
  onMessage: (message: T) => void,
) => {
  return (async () => {
  if (socket) {
    socket.disconnect();
  }
  const url = resolveSocketUrl();

  let socketToken = token;

  if (!socketToken) {
    const { data } = await axiosInstance.get<{ token: string }>('/auth/socket-token');
    socketToken = data.token;
  }

  socket = io(url, {
    auth: { token: socketToken },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('newMessage', (message: T) => {
    onMessage(message);
  });

  return socket;
  })();
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};