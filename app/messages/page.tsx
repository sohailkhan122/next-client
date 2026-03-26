'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Avatar, Button, Empty, Skeleton, Badge } from 'antd';
import { ArrowLeftOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ListSkeleton } from '../components/skeletons';
import { apiGetMe, type AuthUser } from '../lib/authApi';
import { initializeSocket, disconnectSocket, reconnectSocket } from '../lib/messagesSocket';
import {
  apiGetConversations,
  type Conversation,
  type MessageParticipant,
} from '../lib/messagesApi';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const formatConversationLastTime = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MessagesPage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const myId = me?.id ?? me?._id;

  const loadConversations = useCallback(async () => {
    try {
      const user = await apiGetMe();

      if (user.role !== 'admin' && user.isApproved === false) {
        router.replace('/pending');
        return;
      }

      const convs = await apiGetConversations();

      setMe(user);
      setConversations(convs);
    } catch {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadConversations();

    let isDisposed = false;
    let socketRef: ReturnType<typeof initializeSocket> extends Promise<infer S> ? S | null : null = null;

    const handleUpdate = (updatedData: any) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === updatedData._id);
        if (index > -1) {
          const updatedConv = { ...prev[index], ...updatedData };
          const others = prev.filter((_, i) => i !== index);
          return [updatedConv, ...others];
        }
        return prev;
      });
    };

    const handleRead = (data: { _id: string }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === data._id ? { ...c, unreadCount: 0 } : c)),
      );
    };

    const initSocket = async () => {
      try {
        const socket = await initializeSocket(undefined, () => {});
        if (isDisposed) {
          socket.disconnect();
          return;
        }
        socketRef = socket;
        socket.on('conversationUpdated', handleUpdate);
        socket.on('conversationRead', handleRead);
      } catch {
        // Ignore socket init failures here; route guards handle auth state.
      }
    };

    void initSocket();

    const handleAuthRefresh = () => {
      reconnectSocket();
    };
    window.addEventListener('auth:refreshed', handleAuthRefresh);

    return () => {
      isDisposed = true;
      window.removeEventListener('auth:refreshed', handleAuthRefresh);
      if (socketRef) {
        socketRef.off('conversationUpdated', handleUpdate);
        socketRef.off('conversationRead', handleRead);
      }
      disconnectSocket();
    };
  }, [loadConversations]);

  const getOtherParticipant = (conv: Conversation): MessageParticipant | null => {
    if (!me) return null;
    const other = conv.participants.find((p) => {
      const id = typeof p === 'string' ? p : p._id;
      return id !== me.id && id !== me._id;
    });
    if (!other || typeof other === 'string') return null;
    return other as MessageParticipant;
  };

  if (loading) {
    return (
      <div className="page-bg">
        <Navbar title="Messages" />
        <div className="page-content flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 mx-1 flex items-center gap-3">
            <Skeleton.Button active style={{ height: 40, width: 40 }} />
            <Skeleton.Input active style={{ height: 32, width: 176 }} />
          </div>
          <ListSkeleton count={6} withAvatar />
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen flex flex-col bg-slate-50">
      <Navbar title="Messages" />
      <div className="page-content flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div variants={stagger} initial="hidden" animate="visible">

          {/* Header */}
          <motion.div variants={fadeUp} className="mb-6 mx-1">
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors rounded-full sm:rounded-xl"
              />
              <h1 className="m-0 text-2xl sm:text-3xl font-black text-slate-900 flex items-center tracking-tight">
                <MessageOutlined className="mr-2.5 text-indigo-500" />
                Messages
              </h1>
            </div>
          </motion.div>

          {/* Conversations */}
          {conversations.length === 0 ? (
            <motion.div variants={fadeUp}>
              <div className="rounded-3xl border-2 border-dashed border-indigo-200 bg-white py-16 text-center shadow-sm">
                <Empty
                  image={<MessageOutlined className="text-5xl text-indigo-200" />}
                  description={<span className="text-slate-500 font-medium text-[15px]">No conversations yet.</span>}
                />
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const name = other?.name ?? 'User';
                const email = other?.email ?? '';
                const senderId =
                  typeof conv.lastMessageSenderId === 'string'
                    ? conv.lastMessageSenderId
                    : conv.lastMessageSenderId?._id;
                const senderName =
                  typeof conv.lastMessageSenderId === 'string'
                    ? undefined
                    : conv.lastMessageSenderId?.name;

                let lastMsg = 'No messages yet';
                if (conv.lastMessage?.trim()) {
                  if (myId && senderId === myId) {
                    lastMsg = `You: ${conv.lastMessage}`;
                  } else {
                    lastMsg = `${senderName ?? other?.name ?? 'User'}: ${conv.lastMessage}`;
                  }
                }

                const lastTime = conv.lastMessageAt
                  ? formatConversationLastTime(conv.lastMessageAt)
                  : '';

                return (
                  <motion.div key={conv._id} variants={fadeUp}>
                    <div
                      onClick={() => router.push(`/messages/${conv._id}`)}
                      className="group flex items-center gap-4 px-5 py-4 bg-white rounded-[20px] border border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-300 hover:-translate-y-0.5"
                    >
                      <Badge count={conv.unreadCount} offset={[-6, 6]}>
                        <Avatar
                          size={52}
                          icon={<UserOutlined />}
                          className="shadow-md shadow-indigo-100/50 shrink-0 border-2 border-white"
                          style={{ background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }}
                        />
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-slate-800 text-[15px] sm:text-base truncate group-hover:text-indigo-600 transition-colors">
                          {name}
                        </div>
                        {email && <div className="text-xs font-medium text-slate-400 truncate mb-0.5">{email}</div>}
                        <div className="text-[13px] sm:text-sm text-slate-600 mt-1 truncate pr-4 font-medium opacity-90">
                          {lastMsg}
                        </div>
                      </div>
                      {lastTime && (
                        <div className="text-[11px] sm:text-xs font-bold text-slate-400 shrink-0 self-start mt-1 bg-slate-50 px-2 py-0.5 rounded-md">
                          {lastTime}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
