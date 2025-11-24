import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  IMConnectionStatus,
  IMConversation,
  IMMessage,
  IMStore
} from '../types';

/**
 * IM Store - Manages TencentCloud IM state
 *
 * Features:
 * - NO persistence (real-time data, will reconnect on app start)
 * - Immutable updates with immer
 * - Conversation and message management
 *
 * Note: This store is NOT persisted because IM data is real-time
 * and should be fetched fresh on app start.
 */
export const useIMStore = create<IMStore>()(
  immer((set) => ({
    // Initial State
    connectionStatus: 'disconnected',
    conversations: [],
    currentConversation: null,
    messages: {},
    unreadCount: 0,

    // Actions
    setConnectionStatus: (status: IMConnectionStatus) => {
      set((state) => {
        state.connectionStatus = status;
      });
    },

    setConversations: (conversations: IMConversation[]) => {
      set((state) => {
        state.conversations = conversations;
        // Update total unread count
        state.unreadCount = conversations.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
      });
    },

    addMessage: (conversationID: string, message: IMMessage) => {
      set((state) => {
        if (!state.messages[conversationID]) {
          state.messages[conversationID] = [];
        }
        state.messages[conversationID].push(message);

        // Update conversation's last message
        const conversation = state.conversations.find(
          (conv) => conv.conversationID === conversationID
        );
        if (conversation) {
          conversation.lastMessage = message;
          conversation.lastMessageTime = message.timestamp;
          if (conversationID !== state.currentConversation) {
            conversation.unreadCount += 1;
            state.unreadCount += 1;
          }
        }
      });
    },

    updateConversation: (conversation: IMConversation) => {
      set((state) => {
        const index = state.conversations.findIndex(
          (conv) => conv.conversationID === conversation.conversationID
        );
        if (index !== -1) {
          state.conversations[index] = conversation;
        } else {
          state.conversations.push(conversation);
        }

        // Recalculate total unread count
        state.unreadCount = state.conversations.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
      });
    },

    setCurrentConversation: (conversationID: string | null) => {
      set((state) => {
        state.currentConversation = conversationID;
      });
    },

    markAsRead: (conversationID: string) => {
      set((state) => {
        const conversation = state.conversations.find(
          (conv) => conv.conversationID === conversationID
        );
        if (conversation) {
          state.unreadCount -= conversation.unreadCount;
          conversation.unreadCount = 0;
        }
      });
    },

    clearIMData: () => {
      set((state) => {
        state.connectionStatus = 'disconnected';
        state.conversations = [];
        state.currentConversation = null;
        state.messages = {};
        state.unreadCount = 0;
      });
    },
  }))
);
