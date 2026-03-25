import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = <T>(
  token: string | undefined,
  onMessage: (message: T) => void,
) => {
  if (socket) {
    socket.disconnect();
  }
  const configuredUrl = (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  ).replace(/\/$/, '');

  const url =
    configuredUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

  if (!configuredUrl) {
    console.warn('Socket URL is missing, using fallback URL:', url);
  }

  // If token is not provided, try to get from localStorage (sometimes user saves it there)
  // or rely on cookies (withCredentials: true)
  const auth = token ? { token } : undefined;

  socket = io(url, {
    auth,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('newMessage', (message: T) => {
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
