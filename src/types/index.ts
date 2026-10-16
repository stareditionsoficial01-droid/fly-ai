export type AiMode = 'fast' | 'pro';

export interface AttachedImage {
  data: string; // Base64 data URL
  mimeType: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: AttachedImage;
  generatedImage?: {
    url: string;
    prompt: string;
    countIndex?: number;
  };
  mode?: AiMode;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: AiMode;
  messages: Message[];
}

export interface VoiceSettings {
  speechRate: number;
  speechPitch: number;
  selectedVoiceURI: string | null;
  autoReadResponses: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
}

export interface MemoryItem {
  id: string;
  text: string;
  category?: 'preference' | 'fact' | 'project' | 'chat_context';
  sourceConversationId?: string;
  sourceConversationTitle?: string;
  createdAt: number;
  type: 'auto' | 'manual';
}

export interface MemorySettings {
  enabled: boolean;
  autoExtract: boolean;
  memories: MemoryItem[];
}

