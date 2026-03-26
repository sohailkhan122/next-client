import { io, Socket } from 'socket.io-client';
import axiosInstance from './axiosInstance';

let socket: Socket | null = null;
const newMessageListeners = new Set<(message: unknown) => void>();

const fetchSocketToken = async (): Promise<string> => {
  const { data } = await axiosInstance.get<{ token: string }>('/auth/socket-token');
  return data.token;
};

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

export const initializeSocket = async (
  token?: string,
  onMessage?: (message: unknown) => void,
) => {
  if (onMessage) {
    newMessageListeners.add(onMessage);
  }

  if (socket) {
    if (!socket.connected) {
      try {
        const refreshedToken = await fetchSocketToken();
        socket.auth = { ...(socket.auth ?? {}), token: refreshedToken };
      } catch {
        // Keep previous auth token and let socket reconnect attempt proceed.
      }
      socket.connect();
    }
    return socket;
  }

  const url = resolveSocketUrl();

  let socketToken = token;

  if (!socketToken) {
    socketToken = await fetchSocketToken();
  }

  socket = io(url, {
    auth: { token: socketToken },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('newMessage', (message: unknown) => {
    newMessageListeners.forEach((listener) => listener(message));
  });

  socket.on('incomingMessage', (message: unknown) => {
    newMessageListeners.forEach((listener) => listener(message));
  });

  return socket;
};

export const subscribeToIncomingMessages = <T>(
  callback: (message: T) => void,
): (() => void) => {
  const wrappedCallback = callback as (message: unknown) => void;
  newMessageListeners.add(wrappedCallback);
  return () => {
    newMessageListeners.delete(wrappedCallback);
  };
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  newMessageListeners.clear();
};

export const reconnectSocket = () => {
  if (!socket || socket.connected) {
    return;
  }

  void fetchSocketToken()
    .then((token) => {
      if (!socket) return;
      socket.auth = { ...(socket.auth ?? {}), token };
      socket.connect();
    })
    .catch(() => {
      if (!socket) return;
      socket.connect();
    });
};