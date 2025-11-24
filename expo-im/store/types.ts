/**
 * Store Types and Interfaces
 * Centralized type definitions for all stores
 */

// ============================================================================
// Auth Store Types
// ============================================================================

export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
}

export interface AuthActions {
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateToken: (token: string) => void;
  setUserInfo: (userInfo: UserInfo) => void;
}

export type AuthStore = AuthState & AuthActions;

// ============================================================================
// User Store Types
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  messagePreview: boolean;
}

export interface UserState {
  profile: UserProfile | null;
  settings: UserSettings;
  loading: boolean;
}

export interface UserActions {
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
  clearUserData: () => void;
}

export type UserStore = UserState & UserActions;

// ============================================================================
// IM Store Types
// ============================================================================

export type IMConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export interface IMConversation {
  conversationID: string;
  type: 'C2C' | 'GROUP';
  name?: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: IMMessage;
  lastMessageTime?: number;
  isPinned?: boolean;
}

export interface IMMessage {
  messageID: string;
  conversationID: string;
  sender: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'custom';
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed';
  isRead?: boolean;
}

export interface IMState {
  connectionStatus: IMConnectionStatus;
  conversations: IMConversation[];
  currentConversation: string | null;
  messages: Record<string, IMMessage[]>; // conversationID -> messages
  unreadCount: number;
}

export interface IMActions {
  setConnectionStatus: (status: IMConnectionStatus) => void;
  setConversations: (conversations: IMConversation[]) => void;
  addMessage: (conversationID: string, message: IMMessage) => void;
  updateConversation: (conversation: IMConversation) => void;
  setCurrentConversation: (conversationID: string | null) => void;
  markAsRead: (conversationID: string) => void;
  clearIMData: () => void;
}

export type IMStore = IMState & IMActions;

// ============================================================================
// App Store Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh-CN' | 'en-US';
export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface AppState {
  theme: ThemeMode;
  language: Language;
  networkStatus: NetworkStatus;
  isFirstLaunch: boolean;
}

export interface AppActions {
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setFirstLaunch: (isFirst: boolean) => void;
}

export type AppStore = AppState & AppActions;
