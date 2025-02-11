import { create } from 'zustand';
import api from '../utils/api';

const useChatStore = create((set, get) => ({
  chats: [],
  selectedChatId: null,
  messages: {},
  isLoading: true,
  wsConnections: {}, // Store for multiple WebSocket connections

  initializeWebSocket: (chatId, userId) => {
    const { wsConnections } = get();
    
    // Return existing connection if it's active
    if (wsConnections[chatId] && wsConnections[chatId].readyState === WebSocket.OPEN) {
      return wsConnections[chatId];
    }
    
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const transformedMessage = {
        id: data.id,
        chat: chatId,
        content: data.content,
        sender: data.sender,
        timestamp: data.timestamp,
        attachments: data.attachments || [],
        has_attachments: data.has_attachments
      };
      
      get().updateChatWithMessage(transformedMessage, userId);
    };
    
    // Store the new connection
    set(state => ({
      wsConnections: {
        ...state.wsConnections,
        [chatId]: ws
      }
    }));
    
    return ws;
  },

  cleanupWebSockets: () => {
    const { wsConnections } = get();
    Object.values(wsConnections).forEach(ws => {
      if (ws) ws.close();
    });
    set({ wsConnections: {} });
  },

  setSelectedChat: (chatId) => {
    set({ selectedChatId: chatId });
    if (chatId) {
      get().fetchMessages(chatId);
      get().markChatAsRead(chatId);
    }
  },

  sortChats: (chats) => {
    return [...chats].sort((a, b) => {
      const timeA = a.last_message?.timestamp || a.created_at;
      const timeB = b.last_message?.timestamp || b.created_at;
      return new Date(timeB) - new Date(timeA);
    });
  },

  fetchChats: async () => {
    try {
      const response = await api.get('/api/chats/');
      const sortedChats = get().sortChats(response.data);
      set({ chats: sortedChats, isLoading: false });
      return sortedChats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      set({ isLoading: false });
      return [];
    }
  },

  updateChatWithMessage: (message, currentUserId) => {
    set((state) => {
      // Check if this chat exists in our list
      const chatExists = state.chats.some(chat => chat.id === message.chat);
      
      if (!chatExists) {
        // If it's a new chat, fetch all chats to get the new one
        get().fetchChats();
        return state;
      }

      const existingMessages = state.messages[message.chat] || [];
      const isDuplicate = existingMessages.some(m => m.id === message.id);
      if (isDuplicate) return state;

      const updatedChats = [...state.chats];
      const chatIndex = updatedChats.findIndex(chat => chat.id === message.chat);
      
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          last_message: {
            content: message.content,
            timestamp: message.timestamp,
            has_attachments: message.has_attachments,
            sender: message.sender
          },
          unread: message.sender.id !== currentUserId && state.selectedChatId !== message.chat
        };
        
        // Move the updated chat to the top
        const [updatedChat] = updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);
      }
      
      return {
        chats: updatedChats,
        messages: {
          ...state.messages,
          [message.chat]: [...existingMessages, message]
        }
      };
    });
  },

  markChatAsRead: async (chatId) => {
    try {
      await api.post(`/api/chats/${chatId}/mark-read/`);
      set(state => ({
        chats: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, unread: false } : chat
        )
      }));
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const response = await api.get(`/api/chats/${chatId}/messages/`);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: response.data
        }
      }));
      get().markChatAsRead(chatId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  handleSendMessage: async (chatId, content, userId, attachments = null) => {
    const { wsConnections } = get();
    const ws = wsConnections[chatId];
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected for chat:', chatId);
      return;
    }

    try {
      if (attachments) {
        const formData = new FormData();
        formData.append('content', content);
        for (let file of attachments) {
          formData.append('attachments', file);
        }
        
        const response = await api.post(`/api/chats/${chatId}/messages/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        ws.send(JSON.stringify({
          content,
          sender_id: userId,
          attachment_ids: response.data.attachments.map(att => att.id)
        }));
      } else {
        ws.send(JSON.stringify({
          content,
          sender_id: userId
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}));

export default useChatStore;