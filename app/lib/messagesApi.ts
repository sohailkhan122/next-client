import axiosInstance from './axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageParticipant {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string | MessageParticipant;
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: (string | MessageParticipant)[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Create or return existing 1-to-1 conversation with another user */
export const apiCreateOrGetConversation = async (
  participantId: string,
): Promise<Conversation> => {
  const res = await axiosInstance.post('/conversations', { participantId });
  return res.data;
};

/** Get all conversations for the authenticated user */
export const apiGetConversations = async (): Promise<Conversation[]> => {
  const res = await axiosInstance.get('/conversations');
  return res.data;
};

/** Get all messages in a conversation */
export const apiGetMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const res = await axiosInstance.get(`/conversations/${conversationId}/messages`);
  return res.data;
};

/** Send a message to a conversation */
export const apiSendMessage = async (
  conversationId: string,
  content: string,
): Promise<ChatMessage> => {
  const res = await axiosInstance.post(`/conversations/${conversationId}/messages`, { content });
  return res.data;
};
