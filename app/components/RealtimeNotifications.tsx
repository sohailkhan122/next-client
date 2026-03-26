'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { apiGetMe } from '../lib/authApi';
import { initializePushNotifications, subscribeToForegroundMessages } from '../lib/fcm';
import { initializeSocket, reconnectSocket, subscribeToIncomingMessages } from '../lib/messagesSocket';
import { showLocalNotification } from '../lib/notificationUtils';
import type { ChatMessage } from '../lib/messagesApi';

type IncomingSocketMessage = ChatMessage;

function buildAbsolutePath(path: string): string {
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

export default function RealtimeNotifications() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname || '');

  useEffect(() => {
    pathnameRef.current = pathname || '';
  }, [pathname]);

  useEffect(() => {
    let removeForegroundListener: (() => void) | null = null;
    let removeSocketListener: (() => void) | null = null;

    const isActiveConversationPath = (conversationId: string): boolean => {
      const activePath = pathnameRef.current;
      return activePath === `/messages/${conversationId}`;
    };

    const shouldShowSocketNotification = (message: IncomingSocketMessage): boolean => {
      const conversationId = String(message.conversationId ?? '');
      return !isActiveConversationPath(conversationId);
    };

    const setupRealtimeNotifications = async () => {
      try {
        await apiGetMe();
      } catch {
        return;
      }

      await initializePushNotifications();

      const unsubscribeForeground = await subscribeToForegroundMessages((payload) => {
        const title = payload.notification?.title ?? 'New message';
        const body = payload.notification?.body ?? '';
        const destination = payload.data?.clickAction ?? payload.data?.url ?? '/messages';
        const normalizedDestination = buildAbsolutePath(destination);

        if (!destination || pathnameRef.current === normalizedDestination) {
          return;
        }

        void showLocalNotification({
          title,
          body,
          url: normalizedDestination,
        });
      });

      if (unsubscribeForeground) {
        removeForegroundListener = unsubscribeForeground;
      }

      await initializeSocket();

      removeSocketListener = subscribeToIncomingMessages<IncomingSocketMessage>((incomingMessage) => {
        if (!shouldShowSocketNotification(incomingMessage)) {
          return;
        }

        const destination = `/messages/${incomingMessage.conversationId}`;
        const body = incomingMessage.content || 'You have a new message';

        void showLocalNotification({
          title: 'New message',
          body,
          url: destination,
        });
      });
    };

    void setupRealtimeNotifications();

    const handleAuthRefresh = () => {
      reconnectSocket();
    };

    window.addEventListener('auth:refreshed', handleAuthRefresh);

    return () => {
      window.removeEventListener('auth:refreshed', handleAuthRefresh);
      if (removeForegroundListener) removeForegroundListener();
      if (removeSocketListener) removeSocketListener();
    };
  }, []);

  return null;
}
