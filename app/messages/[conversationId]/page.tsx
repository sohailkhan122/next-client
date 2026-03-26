'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Avatar, Button, Input, Modal, Popconfirm, Skeleton, message } from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { apiGetMe, type AuthUser } from '../../lib/authApi';
import { initializeSocket, disconnectSocket, reconnectSocket } from '../../lib/messagesSocket';
import {
  apiDeleteMessage,
  apiGetMessages,
  apiSendMessage,
  apiUpdateMessage,
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
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const bottomRef = useRef<HTMLDivElement>(null);

  const upsertMessage = useCallback((prev: ChatMessage[], incoming: ChatMessage): ChatMessage[] => {
    const filtered = prev.filter((m) => m._id !== incoming._id);
    return [...filtered, incoming].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await apiGetMessages(conversationId);
      setMessages(msgs);
    } catch {
      // ignore poll errors
    }
  }, [conversationId]);

  useEffect(() => {
    let socketCleanup: (() => void) | null = null;
    let isDisposed = false;

    const init = async () => {
      try {
        const user = await apiGetMe();

        if (user.role !== 'admin' && user.isApproved === false) {
          router.replace('/pending');
          return;
        }

        const convs = await apiGetConversations();

        setMe(user);
        const conv = convs.find((c: Conversation) => c._id === conversationId) ?? null;
        setConversation(conv);
        await fetchMessages();

        const socket = await initializeSocket(undefined, (newMessage: ChatMessage) => {
          if (newMessage.conversationId === conversationId) {
            setMessages((prev) => upsertMessage(prev, newMessage));
            // Mark as read immediately when receiving new message in active chat
            if (socket && socket.connected) {
               socket.emit('mark_as_read', conversationId);
            }
          }
        });

        if (isDisposed) {
          socket.disconnect();
          return;
        }

        const handleUpdatedMessage = (updatedMessage: ChatMessage) => {
          if (updatedMessage.conversationId === conversationId) {
            setMessages((prev) => prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)));
            setSelectedMessage((prev) =>
              prev && prev._id === updatedMessage._id ? updatedMessage : prev,
            );
          }
        };

        const handleDeletedMessage = (deletedMessageId: string) => {
          setMessages((prev) => prev.filter((m) => m._id !== deletedMessageId));
          setSelectedMessage((prev) => {
            if (prev && prev._id === deletedMessageId) {
              setMessageModalOpen(false);
              return null;
            }
            return prev;
          });
        };

        const handleMessagesRead = ({ conversationId: id }: { conversationId: string }) => {
          if (id === conversationId) {
             setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
          }
        };

        const joinRoom = () => {
           if (conversationId) {
             socket.emit('joinConversation', conversationId);
             socket.emit('mark_as_read', conversationId);
           }
        };
        
        socket.on('connect', joinRoom);
        socket.on('messageUpdated', handleUpdatedMessage);
        socket.on('messageDeleted', handleDeletedMessage);
        socket.on('messagesRead', handleMessagesRead);
        
        // If already connected when effect runs (re-renders), join manually
        if (socket.connected) {
           joinRoom();
        }

        socketCleanup = () => {
          socket.off('connect', joinRoom);
          socket.off('messageUpdated', handleUpdatedMessage);
          socket.off('messageDeleted', handleDeletedMessage);
          socket.off('messagesRead', handleMessagesRead);
        };

        const handleAuthRefresh = () => {
          reconnectSocket();
        };
        window.addEventListener('auth:refreshed', handleAuthRefresh);
        const previousCleanup = socketCleanup;
        socketCleanup = () => {
          window.removeEventListener('auth:refreshed', handleAuthRefresh);
          previousCleanup();
        };

      } catch {
        router.replace('/login');
        return;
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      isDisposed = true;
      if (socketCleanup) socketCleanup();
      disconnectSocket();
    };
  }, [conversationId, router, fetchMessages, upsertMessage]);
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
      const created = await apiSendMessage(conversationId, text);
      setMessages((prev) => upsertMessage(prev, created));
    } catch {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setSelectedMessage(msg);
    setEditingMessageId(msg._id);
    setEditingContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const openMessageModal = (msg: ChatMessage) => {
    setSelectedMessage(msg);
    setMessageModalOpen(true);
    setEditingMessageId(null);
    setEditingContent(msg.content);
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedMessage(null);
    handleCancelEdit();
  };

  const handleUpdate = async (messageId: string) => {
    const content = editingContent.trim();
    if (!content) {
      messageApi.warning('Message cannot be empty.');
      return;
    }

    setUpdatingMessageId(messageId);
    try {
      const updated = await apiUpdateMessage(conversationId, messageId, content);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, ...updated } : m)));
      setSelectedMessage((prev) => (prev && prev._id === messageId ? { ...prev, ...updated } : prev));
      setEditingMessageId(null);
      messageApi.success('Message updated.');
    } catch {
      messageApi.error('Failed to update message.');
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    setDeletingMessageId(messageId);
    try {
      await apiDeleteMessage(conversationId, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (selectedMessage?._id === messageId) closeMessageModal();
      messageApi.success('Message deleted.');
    } catch {
      messageApi.error('Failed to delete message.');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const other = getOtherParticipant();

  if (loading) {
    return (
      <div className="page-bg min-h-screen bg-slate-50">
        <Navbar title="Messages" />
        <div className="page-content max-w-175 w-full mx-auto flex-1 flex flex-col pb-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
            <Skeleton.Button active style={{ height: 40, width: 40 }} />
            <Skeleton.Avatar active size={40} shape="circle" />
            <div>
              <Skeleton.Input active style={{ height: 16, width: 144 }} />
              <div className="mt-2"><Skeleton.Input active style={{ height: 12, width: 112 }} /></div>
            </div>
          </div>
          <div className="flex-1 space-y-3 py-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton.Input active style={{ height: 44, width: i % 2 === 0 ? 224 : 208 }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 border-t border-slate-200 pb-6 pt-4">
            <Skeleton.Input active className="w-full" style={{ height: 44 }} />
            <Skeleton.Button active style={{ height: 48, width: 48 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg flex flex-col min-h-screen bg-slate-50">
      {contextHolder}
      <Navbar title="Messages" />
      <div className="page-content max-w-175 w-full mx-auto flex-1 flex flex-col pb-0 p-4 sm:p-6 lg:p-8">
        
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
            className="bg-linear-to-br from-indigo-500 to-indigo-600 shrink-0"
          />
          <div>
            <div className="font-bold text-slate-900 text-base">{other?.name ?? 'User'}</div>
            {other?.email && <div className="text-xs text-slate-400">{other.email}</div>}
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-1 py-2 flex flex-col gap-2.5 min-h-75 max-h-[calc(100vh-280px)]">
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
                <button
                  type="button"
                  onClick={() => openMessageModal(msg)}
                  className="max-w-[70%] text-left"
                >
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word ${
                      isMe
                        ? 'rounded-[18px_18px_4px_18px] bg-linear-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)]'
                        : 'rounded-[18px_18px_18px_4px] bg-slate-100 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] mt-1 opacity-65 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.isEdited ? ' • edited' : ''}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <Modal
          title="Message"
          open={messageModalOpen}
          onCancel={closeMessageModal}
          footer={
            selectedMessage &&
            (typeof selectedMessage.senderId === 'string'
              ? selectedMessage.senderId
              : selectedMessage.senderId?._id) === myId ? (
              <div className="flex justify-between">
                <Popconfirm
                  title="Delete this message?"
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => selectedMessage && handleDelete(selectedMessage._id)}
                >
                  <Button danger loading={selectedMessage ? deletingMessageId === selectedMessage._id : false}>
                    Delete
                  </Button>
                </Popconfirm>
                <div className="flex gap-2">
                  {editingMessageId === selectedMessage._id ? (
                    <>
                      <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>Cancel</Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={updatingMessageId === selectedMessage._id}
                        onClick={() => handleUpdate(selectedMessage._id)}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={() => handleStartEdit(selectedMessage)}>
                      Update
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button onClick={closeMessageModal}>Close</Button>
            )
          }
        >
          {selectedMessage && (
            <div className="space-y-3">
              {editingMessageId === selectedMessage._id ? (
                <Input.TextArea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  maxLength={1000}
                />
              ) : (
                <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 wrap-break-word">
                  {selectedMessage.content}
                </div>
              )}
              <div className="text-xs text-slate-400">
                Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                {selectedMessage.updatedAt && selectedMessage.updatedAt !== selectedMessage.createdAt
                  ? ` • Updated: ${new Date(selectedMessage.updatedAt).toLocaleString()}`
                  : ''}
              </div>
            </div>
          )}
        </Modal>

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
              input.trim() ? 'bg-linear-to-br from-indigo-500 to-indigo-600' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
