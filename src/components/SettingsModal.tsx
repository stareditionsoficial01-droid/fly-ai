import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Zap,
  Sparkles,
  Trash2,
  ShieldCheck,
  Server,
  Check,
  Play,
  Brain,
  RefreshCw,
  Plus,
  Settings as SettingsIcon,
  HelpCircle,
  FolderKanban,
  User,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { SpeechSynthesisService } from '../utils/speech';
import { AiMode, ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  initialTab?: 'general' | 'memory';
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialTab = 'general',
  onClose,
}) => {
  const { theme, setTheme } = useTheme();
  const {
    currentMode,
    setCurrentMode,
    clearAllConversations,
    voiceSettings,
    updateVoiceSettings,
    memorySettings,
    isSyncingMemories,
    toggleMemory,
    addCustomMemory,
    deleteMemory,
    clearAllMemories,
    syncMemoriesFromConversations,
  } = useChat();

  const [activeTab, setActiveTab] = useState<'general' | 'memory'>(initialTab);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceSettings.selectedVoiceURI || '');
  const [rate, setRate] = useState<number>(voiceSettings.speechRate || 1.0);
  const [autoRead, setAutoRead] = useState<boolean>(voiceSettings.autoReadResponses || false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [confirmClearMemories, setConfirmClearMemories] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Memory UI state
  const [isAddingMemory, setIsAddingMemory] = useState<boolean>(false);
  const [newMemoryText, setNewMemoryText] = useState<string>('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<'preference' | 'fact' | 'project' | 'chat_context'>('fact');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [memoryFilter, setMemoryFilter] = useState<'all' | 'preference' | 'fact' | 'project' | 'chat_context'>('all');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    SpeechSynthesisService.getInstance().speak(
      'Olá! Este é um teste da voz do Fly AI. Sua ideia, nossa inteligência.',
      {
        rate,
        voiceURI: selectedVoice || null,
      }
    );
  };

  const handleSave = () => {
    updateVoiceSettings({
      speechRate: rate,
      selectedVoiceURI: selectedVoice || null,
      autoReadResponses: autoRead,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSyncMemories = async () => {
    try {
      setSyncFeedback(null);
      const res = await syncMemoriesFromConversations();
      if (res.addedCount > 0) {
        setSyncFeedback(`${res.addedCount} nova(s) memória(s) identificada(s) dos seus chats anteriores!`);
      } else {
        setSyncFeedback('Memória atualizada! Nenhuma nova informação pendente nos chats.');
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback(err.message || 'Falha ao sincronizar memórias dos chats.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    addCustomMemory(newMemoryText.trim(), newMemoryCategory);
    setNewMemoryText('');
    setIsAddingMemory(false);
  };

  const themes: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'system', label: 'Automático', icon: Laptop },
  ];

  const modes: Array<{ id: AiMode; title: string; subtitle: string; icon: typeof Zap }> = [
    {
      id: 'fast',
      title: 'Fly AI 1.5 — Rápido',
      subtitle: 'Respostas ágeis para suas ideias cotidianas',
      icon: Zap,
    },
    {
      id: 'pro',
      title: 'Fly AI 2.1 — Pro',
      subtitle: 'Mais profundidade para desafios complexos e analíticos',
      icon: Sparkles,
    },
  ];

  const filteredMemories = memorySettings.memories.filter((m) => {
    if (memoryFilter === 'all') return true;
    return m.category === memoryFilter;
  });

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'preference':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
            <Heart className="w-2.5 h-2.5" /> Preferência
          </span>
        );
      case 'project':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FolderKanban className="w-2.5 h-2.5" /> Projeto
          </span>
        );
      case 'chat_context':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <MessageSquare className="w-2.5 h-2.5" /> Chat Anterior
          </span>
        );
      case 'fact':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <User className="w-2.5 h-2.5" /> Fato Pessoal
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-2xl bg-white dark:bg-[#121623] rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]">
        {/* Mobile handle indicator */}
        <div className="pt-2 pb-0.5 sm:hidden flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Opções & Configurações
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize a inteligência, memória contínua, voz e aparência
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#121623]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Geral & Modelos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'memory'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-[#121623]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-500" />
            <span>Memória do Fly AI</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                memorySettings.enabled
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {memorySettings.enabled ? `${memorySettings.memories.length} ativa` : 'Desligada'}
            </span>
          </button>
        </div>

        {/* Tab 1: General Options */}
        {activeTab === 'general' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
            {/* Memory Quick Switch Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      Memória entre Chats
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        memorySettings.enabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {memorySettings.enabled ? 'Ativa' : 'Desativada'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {memorySettings.enabled
                      ? `${memorySettings.memories.length} item(ns) lembrado(s) dos chats anteriores.`
                      : 'O Fly AI pode relembrar o que aconteceu nos seus chats anteriores.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('memory')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shrink-0 cursor-pointer shadow-xs"
              >
                Abrir Memória
              </button>
            </div>

            {/* Section 1: Visual Theme */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Tema Visual
              </label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Default AI Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Modo Padrão de Inteligência
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = currentMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCurrentMode(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {m.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {m.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Voice & Speech Controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Recursos de Voz & Síntese
                </label>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Testar voz</span>
                </button>
              </div>

              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Leitura Automática
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ler em voz alta cada nova resposta gerada pelo Fly AI
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRead}
                    onChange={(e) => setAutoRead(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    <span>Velocidade da voz</span>
                    <span className="font-mono text-blue-500 font-bold">{rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {availableVoices.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Voz do sintetizador
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Voz Padrão do Sistema (Automática)</option>
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Architecture & Provider Transparency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Transparência dos Modelos & Backend
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Infraestrutura Real em Execução
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      Todas as requisições do Fly AI são intermediadas de forma 100% segura pelo servidor Node/Express backend. Nenhuma chave secreta ou credencial é exposta ao navegador.
                    </p>
                    <div className="mt-2 space-y-1 text-[11px] font-mono bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div>• <strong>Fly AI 1.5 Rápido:</strong> Motor de velocidade ultra-ágil</div>
                      <div>• <strong>Fly AI 2.1 Pro:</strong> Motor de raciocínio analítico com imagens ilimitadas</div>
                      <div>• <strong>Memória Contínua:</strong> Recuperação de contexto entre conversas passadas</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                      Privacidade e Armazenamento
                    </span>
                    Suas mensagens e histórico ficam salvos exclusivamente no armazenamento local deste dispositivo. Nenhum dado de conversa é compartilhado ou vendido a terceiros.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Data Management */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Gerenciamento de Dados
              </label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                    Limpar Histórico Local
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Exclui todas as conversas salvas neste navegador
                  </span>
                </div>

                {confirmClear ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearAllConversations();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Confirmar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apagar dados
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Memória do Fly AI (O que aconteceu nos chats anteriores) */}
        {activeTab === 'memory' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
            {/* Master Toggle Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/25 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/25">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Memória do Fly AI
                      {memorySettings.enabled ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Ativa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                          Desativada
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Relembra automaticamente o que aconteceu nas suas conversas anteriores.
                    </p>
                  </div>
                </div>

                {/* Big Switch Button */}
                <button
                  type="button"
                  onClick={() => toggleMemory()}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                    memorySettings.enabled
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {memorySettings.enabled ? 'Desativar' : 'Ativar Memória'}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/15">
                💡 <strong>Como funciona:</strong> Ao conversar com o Fly AI em qualquer chat, a IA utiliza essa memória para relembrar fatos, preferências, projetos e decisões tomadas em chats anteriores. Assim, você não precisa se repetir!
              </p>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncMemories}
                  disabled={isSyncingMemories || !memorySettings.enabled}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-semibold text-xs border border-purple-500/25 transition-all cursor-pointer disabled:opacity-40"
                  title="Analisar e sincronizar fatos de todos os chats anteriores"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMemories ? 'animate-spin' : ''}`} />
                  <span>{isSyncingMemories ? 'Analisando chats...' : 'Sincronizar Chats'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingMemory(!isAddingMemory)}
                  disabled={!memorySettings.enabled}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Adicionar Fato Manual</span>
                </button>
              </div>

              {memorySettings.memories.length > 0 && (
                <div>
                  {confirmClearMemories ? (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">Limpar memórias?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmClearMemories(false)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearAllMemories();
                          setConfirmClearMemories(false);
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-semibold cursor-pointer"
                      >
                        Sim
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearMemories(true)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpar memória</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Form: Add Custom Memory */}
            {isAddingMemory && (
              <form
                onSubmit={handleAddMemorySubmit}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-blue-500/30 space-y-3 animate-in fade-in"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    O que você quer que o Fly AI lembre para sempre?
                  </label>
                  <textarea
                    rows={2}
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder="Ex.: Meu nome é Pedro, sou arquiteto de software e prefiro código em TypeScript com comentários breves."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">Tipo:</span>
                    {(['fact', 'preference', 'project', 'chat_context'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewMemoryCategory(cat)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          newMemoryCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat === 'fact' && 'Fato'}
                        {cat === 'preference' && 'Preferência'}
                        {cat === 'project' && 'Projeto'}
                        {cat === 'chat_context' && 'Chat Passado'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingMemory(false)}
                      className="px-3 py-1 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!newMemoryText.trim()}
                      className="px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Salvar Memória
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] mr-1">Filtrar:</span>
              <button
                type="button"
                onClick={() => setMemoryFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  memoryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Todas ({memorySettings.memories.length})
              </button>
              <button
                type="button"
                onClick={() => setMemoryFilter('preference')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  memoryFilter === 'preference'
                    ? 'bg-pink-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Preferências
              </button>
              <button
                type="button"
                onClick={() => setMemoryFilter('fact')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  memoryFilter === 'fact'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Fatos
              </button>
              <button
                type="button"
                onClick={() => setMemoryFilter('project')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  memoryFilter === 'project'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Projetos
              </button>
              <button
                type="button"
                onClick={() => setMemoryFilter('chat_context')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  memoryFilter === 'chat_context'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Chats Anteriores
              </button>
            </div>

            {/* List of Remembered Items */}
            <div className="space-y-2">
              {filteredMemories.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    Nenhuma lembrança salva nesta categoria
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Converse com o Fly AI ou clique em "Sincronizar Chats" para que a IA aprenda o que aconteceu nos seus chats anteriores.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSyncMemories}
                      disabled={isSyncingMemories}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Sincronizar Chats Agora
                    </button>
                  </div>
                </div>
              ) : (
                filteredMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-purple-500/30 transition-all flex items-start justify-between gap-2.5 shadow-2xs group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(mem.category)}
                        <span className="text-[10px] text-slate-400">
                          {mem.type === 'auto' ? 'Extraído de chat anterior' : 'Definido manualmente'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {mem.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteMemory(mem.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer shrink-0"
                      title="Excluir esta lembrança"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferências salvas!
            </span>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>Memória do Fly AI: {memorySettings.enabled ? 'Ativa e contínua' : 'Desativada'}</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            {activeTab === 'general' ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Salvar alterações
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
