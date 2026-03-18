'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Avatar, Button, Input, Spin } from 'antd';
import { ArrowLeftOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { apiGetMe, type AuthUser } from '../../lib/authApi';
import { initializeSocket, disconnectSocket, getSocket } from '../../lib/messagesSocket';
import {
  apiGetMessages,
  apiSendMessage,
  apiGetConversations,
  type ChatMessage,
  type Conversation,
  type MessageParticipant,
} from '../../lib/messagesApi';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [me, setMe] = useState<AuthUser | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await apiGetMessages(conversationId);
      setMessages(msgs);
    } catch {
      // ignore poll errors
    }
  }, [conversationId]);

  useEffect(() => {
    const init = async () => {
      try {
        const [user, convs] = await Promise.all([apiGetMe(), apiGetConversations()]);
        setMe(user);
        const conv = convs.find((c: Conversation) => c._id === conversationId) ?? null;
        setConversation(conv);
        await fetchMessages();

        const token = localStorage.getItem('accessToken') || '';
        const socket = initializeSocket(token, (newMessage: ChatMessage) => {
          if (newMessage.conversationId === conversationId) {
            setMessages((prev) => [...prev.filter(m => m._id !== newMessage._id), newMessage]);
          }
        });
        socket.emit('joinConversation', conversationId);

      } catch {
        router.replace('/login');
        return;
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => disconnectSocket();
  }, [conversationId, router, fetchMessages]);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherParticipant = (): MessageParticipant | null => {
    if (!me || !conversation) return null;
    const otherParticipant = conversation.participants.find((p: string | MessageParticipant) => {
      const id = typeof p === 'string' ? p : p._id;
      return id !== me.id && id !== me._id;
    });
    if (!otherParticipant || typeof otherParticipant === 'string') return null;
    return otherParticipant as MessageParticipant;
  };

  const myId = me?.id ?? me?._id;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !myId) return;
    setSending(true);
    setInput('');
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        // Emit via WebSocket
        socket.emit('sendMessage', {
          conversationId,
          senderId: myId,
          content: text
        });
      } else {
        // Fallback
        await apiSendMessage(conversationId, text);
        await fetchMessages();
      }
    } catch {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const other = getOtherParticipant();

  if (loading) {
    return (
      <div className="page-bg min-h-screen bg-slate-50">
        <Navbar title="Messages" />
        <div className="page-content flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg flex flex-col min-h-screen bg-slate-50">
      <Navbar title="Messages" />
      <div className="page-content max-w-[700px] w-full mx-auto flex-1 flex flex-col pb-0 p-4 sm:p-6 lg:p-8">
        
        {/* Chat header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.replace('/messages')}
            className="rounded-[10px] font-semibold text-indigo-500 border-indigo-200 bg-indigo-50"
          />
          <Avatar
            size={40}
            icon={<UserOutlined />}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 shrink-0"
          />
          <div>
            <div className="font-bold text-slate-900 text-base">{other?.name ?? 'User'}</div>
            {other?.email && <div className="text-xs text-slate-400">{other.email}</div>}
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-1 py-2 flex flex-col gap-2.5 min-h-[300px] max-h-[calc(100vh-280px)]">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-12 text-sm">
              No messages yet. Say hello! 👋
            </div>
          )}

          {messages.map((msg) => {
            const senderId =
              typeof msg.senderId === 'string'
                ? msg.senderId
                : (msg.senderId as MessageParticipant)?._id;
            const isMe = senderId === myId;

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                    isMe 
                      ? 'rounded-[18px_18px_4px_18px] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)]' 
                      : 'rounded-[18px_18px_18px_4px] bg-slate-100 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {msg.content}
                  <div className="text-[10px] mt-1 opacity-65 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <div className="flex gap-2.5 pt-4 pb-6 border-t border-slate-200">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Type a message…"
            size="large"
            className="rounded-full pl-5 flex-1"
            maxLength={1000}
          />
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-12 h-12 shrink-0 border-none ${
              input.trim() ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
