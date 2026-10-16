import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AiMode, AttachedImage, Conversation, Message, VoiceSettings, MemoryItem, MemorySettings } from '../types';
import { SpeechSynthesisService } from '../utils/speech';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  currentMode: AiMode;
  setCurrentMode: (mode: AiMode) => void;
  isGenerating: boolean;
  activeError: string | null;
  clearError: () => void;
  sendMessage: (content: string, image?: AttachedImage) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastResponse: () => Promise<void>;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  renameConversation: (id: string, newTitle: string) => void;
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  speakingState: { isSpeaking: boolean; isPaused: boolean; text: string };
  toggleSpeakMessage: (text: string) => void;
  stopSpeaking: () => void;
  proImagesUsed: number;
  proImagesRemaining: number;
  proImagesMax: number;
  resetProImagesQuota: () => void;
  generateImageWithPro: (prompt: string) => Promise<void>;
  // Memory features
  memorySettings: MemorySettings;
  isSyncingMemories: boolean;
  toggleMemory: (enabled?: boolean) => void;
  addCustomMemory: (text: string, category?: 'preference' | 'fact' | 'project' | 'chat_context') => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;
  syncMemoriesFromConversations: () => Promise<{ addedCount: number }>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'fly_ai_conversations';
const PREFS_KEY = 'fly_ai_preferences';
const VOICE_KEY = 'fly_ai_voice_settings';
const MEMORY_KEY = 'fly_ai_memory_settings';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Falha ao carregar histórico local:', e);
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return null; // Start with fresh clean chat
  });

  const [currentMode, setCurrentMode] = useState<AiMode>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.defaultMode === 'pro' || parsed.defaultMode === 'fast') {
          return parsed.defaultMode;
        }
      }
    } catch {}
    return 'fast'; // Default: Fly AI 1.5 - Rápido
  });

  const [voiceSettings, setVoiceSettingsState] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(VOICE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      speechRate: 1.0,
      speechPitch: 1.0,
      selectedVoiceURI: null,
      autoReadResponses: false,
    };
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Pro Mode Image Generation (Unlimited)
  const PRO_IMAGES_KEY = 'fly_ai_pro_images_used';

  const [proImagesUsed, setProImagesUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(PRO_IMAGES_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        return isNaN(val) ? 0 : Math.max(0, val);
      }
    } catch {}
    return 0;
  });

  const proImagesRemaining = Infinity;
  const proImagesMax = Infinity;

  const resetProImagesQuota = () => {
    setProImagesUsed(0);
    try {
      localStorage.setItem(PRO_IMAGES_KEY, '0');
    } catch {}
  };

  // Memory Settings & State for long-term recall
  const [memorySettings, setMemorySettings] = useState<MemorySettings>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          autoExtract: parsed.autoExtract ?? true,
          memories: Array.isArray(parsed.memories) ? parsed.memories : [],
        };
      }
    } catch {}
    return {
      enabled: true,
      autoExtract: true,
      memories: [
        {
          id: 'mem_default_welcome',
          text: 'Usuário utiliza o Fly AI como assistente principal para produtividade, criatividade e ideias.',
          category: 'preference',
          createdAt: Date.now() - 3600000,
          type: 'auto',
        },
      ],
    };
  });

  const [isSyncingMemories, setIsSyncingMemories] = useState(false);

  const toggleMemory = (enabled?: boolean) => {
    setMemorySettings((prev) => {
      const updated: MemorySettings = {
        ...prev,
        enabled: enabled !== undefined ? enabled : !prev.enabled,
      };
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addCustomMemory = (text: string, category: 'preference' | 'fact' | 'project' | 'chat_context' = 'fact') => {
    if (!text.trim()) return;
    const newItem: MemoryItem = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text: text.trim(),
      category,
      createdAt: Date.now(),
      type: 'manual',
    };
    setMemorySettings((prev) => {
      const updated: MemorySettings = {
        ...prev,
        memories: [newItem, ...prev.memories],
      };
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteMemory = (id: string) => {
    setMemorySettings((prev) => {
      const updated: MemorySettings = {
        ...prev,
        memories: prev.memories.filter((m) => m.id !== id),
      };
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllMemories = () => {
    setMemorySettings((prev) => {
      const updated: MemorySettings = {
        ...prev,
        memories: [],
      };
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const syncMemoriesFromConversations = async (): Promise<{ addedCount: number }> => {
    if (conversations.length === 0) return { addedCount: 0 };
    setIsSyncingMemories(true);

    try {
      const allText = conversations
        .map((c) => {
          const msgs = c.messages
            .slice(-8)
            .map((m) => `${m.role === 'user' ? 'Usuário' : 'Fly AI'}: ${m.content.slice(0, 300)}`)
            .join('\n');
          return `--- Conversa: "${c.title}" ---\n${msgs}`;
        })
        .join('\n\n');

      const res = await fetch('/api/memories/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationsText: allText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao sincronizar memórias.');
      }

      const extracted: Array<{ text: string; category?: string }> = data.memories || [];
      let added = 0;

      setMemorySettings((prev) => {
        const existingTexts = new Set(prev.memories.map((m) => m.text.toLowerCase().trim()));
        const newItems: MemoryItem[] = [];

        for (const item of extracted) {
          if (item.text && !existingTexts.has(item.text.toLowerCase().trim())) {
            newItems.push({
              id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              text: item.text,
              category: (item.category as any) || 'chat_context',
              createdAt: Date.now(),
              type: 'auto',
            });
            existingTexts.add(item.text.toLowerCase().trim());
            added++;
          }
        }

        const updated: MemorySettings = {
          ...prev,
          memories: [...newItems, ...prev.memories],
        };

        try {
          localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
        } catch {}

        return updated;
      });

      return { addedCount: added };
    } catch (err: any) {
      console.error('Erro na sincronização de memórias:', err);
      throw err;
    } finally {
      setIsSyncingMemories(false);
    }
  };

  // Compile full memory context for AI prompts
  const compileMemoryContext = (): string => {
    if (!memorySettings.enabled) return '';
    const parts: string[] = [];

    // 1. Explicit user memories
    if (memorySettings.memories.length > 0) {
      parts.push('--- FATOS E PREFERÊNCIAS MEMORIZADOS ---');
      memorySettings.memories.slice(0, 20).forEach((m) => {
        const cat = m.category ? `[${m.category}] ` : '';
        parts.push(`• ${cat}${m.text}`);
      });
    }

    // 2. Synthesized summary of other previous conversations (excluding the active one)
    const otherConversations = conversations
      .filter((c) => c.id !== activeConversationId && c.messages.length > 0)
      .slice(0, 10);

    if (otherConversations.length > 0) {
      parts.push('\n--- RESUMO DE CHATS ANTERIORES DO USUÁRIO ---');
      otherConversations.forEach((c) => {
        const userMsgs = c.messages.filter((m) => m.role === 'user');
        const assistantMsgs = c.messages.filter((m) => m.role === 'assistant');
        const firstUserMsg = userMsgs[0]?.content?.slice(0, 100) || '';
        const lastUserMsg = userMsgs[userMsgs.length - 1]?.content?.slice(0, 120) || '';
        const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1]?.content?.slice(0, 140) || '';

        let chatSummary = `• Chat "${c.title}" (${c.messages.length} msgs): Início: "${firstUserMsg}"`;
        if (lastUserMsg && lastUserMsg !== firstUserMsg) {
          chatSummary += ` | Assunto final: "${lastUserMsg}"`;
        }
        if (lastAssistantMsg) {
          chatSummary += ` | Conclusão: "${lastAssistantMsg}"`;
        }
        parts.push(chatSummary);
      });
    }

    return parts.join('\n');
  };

  // Speech synthesis state
  const [speakingState, setSpeakingState] = useState<{ isSpeaking: boolean; isPaused: boolean; text: string }>({
    isSpeaking: false,
    isPaused: false,
    text: '',
  });

  useEffect(() => {
    const synth = SpeechSynthesisService.getInstance();
    const unsubscribe = synth.subscribe((state) => {
      setSpeakingState(state);
    });
    return () => unsubscribe();
  }, []);

  // Save conversations to localStorage with auto-prune protection for unlimited storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('LocalStorage cheio, podando imagens antigas para preservar textos:', e);
      try {
        const pruned = conversations.map((c, idx) =>
          idx > 8
            ? {
                ...c,
                messages: c.messages.map((m) => ({ ...m, image: undefined })),
              }
            : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      } catch (err2) {
        console.error('Falha ao persistir conversas:', err2);
      }
    }
  }, [conversations]);

  // Save voice settings
  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(VOICE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createNewConversation = () => {
    if (isGenerating) {
      stopGeneration();
    }
    setActiveConversationId(null);
    setActiveError(null);
  };

  const selectConversation = (id: string) => {
    if (isGenerating) {
      stopGeneration();
    }
    setActiveConversationId(id);
    setActiveError(null);
    const target = conversations.find((c) => c.id === id);
    if (target) {
      setCurrentMode(target.mode);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const clearAllConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim(), updatedAt: Date.now() } : c))
    );
  };

  const clearError = () => setActiveError(null);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const toggleSpeakMessage = (text: string) => {
    const synth = SpeechSynthesisService.getInstance();
    if (speakingState.isSpeaking && speakingState.text === text) {
      if (speakingState.isPaused) {
        synth.resume();
      } else {
        synth.pause();
      }
    } else {
      synth.speak(text, {
        rate: voiceSettings.speechRate,
        pitch: voiceSettings.speechPitch,
        voiceURI: voiceSettings.selectedVoiceURI,
      });
    }
  };

  const stopSpeaking = () => {
    SpeechSynthesisService.getInstance().stop();
  };

  // Helper to extract a friendly title from initial text
  const generateTitle = (text: string): string => {
    const cleaned = text.trim().replace(/\n+/g, ' ');
    if (cleaned.length <= 40) return cleaned;
    return cleaned.slice(0, 38) + '...';
  };

  const sendMessage = async (content: string, image?: AttachedImage) => {
    if ((!content || !content.trim()) && !image) return;
    if (isGenerating) return;

    setActiveError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      image,
      mode: currentMode,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      mode: currentMode,
      timestamp: Date.now(),
      isStreaming: true,
    };

    let targetConvId = activeConversationId;
    let currentConvMessages: Message[] = [];

    if (!targetConvId) {
      // Create new conversation
      targetConvId = `conv-${Date.now()}`;
      const newTitle = image && !content.trim() ? 'Análise de Imagem' : generateTitle(content);
      const newConversation: Conversation = {
        id: targetConvId,
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: currentMode,
        messages: [userMessage, assistantMessage],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(targetConvId);
      currentConvMessages = [userMessage];
    } else {
      // Append to existing
      const existing = conversations.find((c) => c.id === targetConvId);
      currentConvMessages = existing ? [...existing.messages, userMessage] : [userMessage];

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, userMessage, assistantMessage],
              }
            : c
        )
      );
    }

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if user is requesting image generation in Fly AI 2.1 Pro mode
    const isImageGenIntent =
      currentMode === 'pro' &&
      !image &&
      (() => {
        const t = content.trim().toLowerCase();
        return (
          t.startsWith('gere uma imagem') ||
          t.startsWith('gerar imagem') ||
          t.startsWith('gera imagem') ||
          t.startsWith('gere imagem') ||
          t.startsWith('crie uma imagem') ||
          t.startsWith('criar uma imagem') ||
          t.startsWith('cria uma imagem') ||
          t.startsWith('criar imagem') ||
          t.startsWith('crie imagem') ||
          t.startsWith('cria imagem') ||
          t.startsWith('desenhe') ||
          t.startsWith('desenhar') ||
          t.startsWith('desenha') ||
          t.startsWith('faça uma imagem') ||
          t.startsWith('fazer uma imagem') ||
          t.startsWith('faça imagem') ||
          t.startsWith('fazer imagem') ||
          t.startsWith('faz uma imagem') ||
          t.startsWith('crie uma arte') ||
          t.startsWith('criar uma arte') ||
          t.startsWith('crie uma foto') ||
          t.startsWith('gere uma foto') ||
          t.startsWith('faça uma foto') ||
          t.startsWith('ilustre') ||
          t.startsWith('ilustrar') ||
          t.startsWith('quero uma imagem') ||
          t.startsWith('quero um desenho') ||
          t.startsWith('/imagem') ||
          t.startsWith('/image') ||
          t.startsWith('/draw') ||
          t.includes('gerar uma imagem de') ||
          t.includes('crie uma imagem de') ||
          t.includes('cria uma imagem de') ||
          t.includes('gere uma imagem para') ||
          t.includes('faça uma imagem de') ||
          t.includes('desenhe para mim') ||
          t.includes('desenha para mim') ||
          /^(pode (criar|gerar|desenhar|fazer) uma imagem)/i.test(t)
        );
      })();

    if (isImageGenIntent) {
      // Generate image with Fly AI 2.1 Pro (Unlimited)
      try {
        let cleanPrompt = content
          .replace(/^(pode (criar|gerar|desenhar|fazer) uma imagem( de| para| sobre)?|gere uma imagem( de| para| sobre)?|gerar imagem( de| para| sobre)?|gera imagem( de| para| sobre)?|gere imagem( de| para| sobre)?|crie uma imagem( de| para| sobre)?|criar uma imagem( de| para| sobre)?|cria uma imagem( de| para| sobre)?|criar imagem( de| para| sobre)?|crie imagem( de| para| sobre)?|cria imagem( de| para| sobre)?|desenhe( para mim)?( um| uma)?|desenhar|desenha|faça uma imagem( de| para| sobre)?|fazer uma imagem( de| para| sobre)?|faça imagem( de| para| sobre)?|fazer imagem( de| para| sobre)?|faz uma imagem( de| para| sobre)?|crie uma arte( de| para| sobre)?|crie uma foto( de| para| sobre)?|gere uma foto( de| para| sobre)?|faça uma foto( de| para| sobre)?|quero uma imagem( de| para| sobre)?|quero um desenho( de| para| sobre)?|ilustre|ilustrar|\/imagem|\/image|\/draw)/i, '')
          .trim();
        if (!cleanPrompt) cleanPrompt = content.trim();

        // Update placeholder to indicate image generation in progress
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: `🎨 Criando imagem com Fly AI 2.1 Pro: "${cleanPrompt}"...`, isStreaming: true }
                      : m
                  ),
                }
              : c
          )
        );

        const imgRes = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleanPrompt, aspectRatio: '1:1' }),
          signal: controller.signal,
        });

        const imgData = await imgRes.json();
        if (!imgRes.ok || !imgData.success) {
          throw new Error(imgData.error || 'Falha ao processar imagem.');
        }

        const nextCount = proImagesUsed + 1;
        setProImagesUsed(nextCount);
        try {
          localStorage.setItem(PRO_IMAGES_KEY, nextCount.toString());
        } catch {}

        const replyText = `Aqui está a sua imagem gerada pelo **Fly AI 2.1 Pro**!\n\n**Descrição:** "${cleanPrompt}"\n\n*(Geração ilimitada de imagens • Fly AI 2.1 Pro • Imagem #${nextCount})*`;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? {
                          ...m,
                          content: replyText,
                          generatedImage: {
                            url: imgData.imageUrl,
                            prompt: cleanPrompt,
                            countIndex: nextCount,
                          },
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );

        setIsGenerating(false);
        abortControllerRef.current = null;
        return;
      } catch (imgErr: any) {
        if (imgErr.name === 'AbortError') {
          setIsGenerating(false);
          abortControllerRef.current = null;
          return;
        }
        console.error('Erro na geração de imagem Pro:', imgErr);
        const errReply = `Não foi possível gerar a imagem no momento: ${imgErr.message || 'Erro de conexão'}.\n\nVocê pode tentar novamente com uma descrição alternativa ou verificar sua conexão.`;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: errReply, isStreaming: false, isError: true }
                      : m
                  ),
                }
              : c
          )
        );
        setIsGenerating(false);
        abortControllerRef.current = null;
        return;
      }
    }

    try {
      // Prepare payload for backend
      const payloadMessages = currentConvMessages.map((m) => ({
        role: m.role,
        content: m.content,
        image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          mode: currentMode,
          memoryContext: compileMemoryContext(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro de conexão HTTP: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Não foi possível ler o fluxo da resposta.');

      const decoder = new TextDecoder();
      let streamedResponse = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split(/\r?\n/);
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawJson = line.slice(6).trim();
              if (!rawJson) continue;

            try {
              const data = JSON.parse(rawJson);

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.text) {
                streamedResponse += data.text;
                // Update assistant message content in state
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === targetConvId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantPlaceholderId
                              ? { ...m, content: streamedResponse, isStreaming: true }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }

              if (data.done) {
                // Done streaming
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === targetConvId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantPlaceholderId
                              ? { ...m, content: streamedResponse || data.fullText || '', isStreaming: false }
                              : m
                          ),
                        }
                      : c
                  )
                );

                if (voiceSettings.autoReadResponses && streamedResponse) {
                  SpeechSynthesisService.getInstance().speak(streamedResponse, {
                    rate: voiceSettings.speechRate,
                    pitch: voiceSettings.speechPitch,
                    voiceURI: voiceSettings.selectedVoiceURI,
                  });
                }
              }
            } catch (err: any) {
              if (err.message) throw err;
            }
          }
        }
      }
    }
  } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped generation
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, isStreaming: false, content: m.content || '(Geração interrompida)' }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        console.error('Erro ao enviar mensagem:', err);
        const errText = err.message || 'Falha de comunicação com o servidor Fly AI.';
        setActiveError(errText);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantPlaceholderId
                      ? {
                          ...m,
                          isStreaming: false,
                          isError: true,
                          content:
                            m.content ||
                            `Não foi possível concluir a resposta: ${errText}\n\nVocê pode tentar novamente ou verificar a sua conexão.`,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateLastResponse = async () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isGenerating) return;

    // Find the last user message
    const msgs = activeConversation.messages;
    const lastUserIndex = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualIndex = msgs.length - 1 - lastUserIndex;
    const lastUserMessage = msgs[actualIndex];

    // Remove any assistant responses after this user message
    const prunedMessages = msgs.slice(0, actualIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: prunedMessages,
            }
          : c
      )
    );

    // Re-send
    await sendMessage(lastUserMessage.content, lastUserMessage.image);
  };

  const generateImageWithPro = async (prompt: string) => {
    setCurrentMode('pro');
    await sendMessage(`Gere uma imagem de ${prompt}`);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        currentMode,
        setCurrentMode,
        isGenerating,
        activeError,
        clearError,
        sendMessage,
        stopGeneration,
        regenerateLastResponse,
        createNewConversation,
        selectConversation,
        deleteConversation,
        clearAllConversations,
        renameConversation,
        voiceSettings,
        updateVoiceSettings,
        speakingState,
        toggleSpeakMessage,
        stopSpeaking,
        proImagesUsed,
        proImagesRemaining,
        proImagesMax,
        resetProImagesQuota,
        generateImageWithPro,
        memorySettings,
        isSyncingMemories,
        toggleMemory,
        addCustomMemory,
        deleteMemory,
        clearAllMemories,
        syncMemoriesFromConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
