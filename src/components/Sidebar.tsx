import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  X,
  Zap,
  Sparkles,
  HardDrive,
  Settings,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { Conversation } from '../types';
import { FlyLogo } from './FlyLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: 'general' | 'memory') => void;
  onOpenImageStudio: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenImageStudio,
}) => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    createNewConversation,
    clearAllConversations,
    isGenerating,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.messages.some((m) => m.content.toLowerCase().includes(term))
    );
  }, [conversations, searchTerm]);

  // Group by date
  const groupedConversations = useMemo(() => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

    filteredConversations.forEach((conv) => {
      const time = conv.updatedAt || conv.createdAt;
      if (time >= startOfToday) {
        today.push(conv);
      } else if (time >= startOfYesterday) {
        yesterday.push(conv);
      } else if (time >= startOf7Days) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return [
      { label: 'Hoje', items: today },
      { label: 'Ontem', items: yesterday },
      { label: 'Últimos 7 dias', items: last7Days },
      { label: 'Anteriores', items: older },
    ].filter((group) => group.items.length > 0);
  }, [filteredConversations]);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteConversation(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleClearAllConfirm = () => {
    clearAllConversations();
    setConfirmClearAll(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[84vw] max-w-[320px] sm:w-80 bg-slate-50 dark:bg-[#0c0f17] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header inside sidebar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <FlyLogo size="sm" showSlogan />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              createNewConversation();
              if (window.innerWidth < 1024) onClose();
            }}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conversa</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar histórico..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-200/60 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nenhuma conversa ainda
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Suas conversas com o Fly AI ficarão salvas com segurança no seu dispositivo.
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Nenhuma conversa encontrada para "{searchTerm}".
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                  {group.label}
                </span>

                {group.items.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                      onClick={() => {
                        selectConversation(conv.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                        {conv.mode === 'pro' ? (
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        )}
                        <span className="truncate">{conv.title || 'Conversa sem título'}</span>
                      </div>

                      {/* Delete icon button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0"
                        title="Excluir conversa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer: Storage Info & Bottom Actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* Storage Transparency Notice */}
          <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <HardDrive className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Uso 100% Ilimitado
                <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded-full font-bold">Livre</span>
              </span>
              <span>Conversas e geração de imagens sem bloqueios.</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              onClick={() => {
                onOpenImageStudio();
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Estúdio de Imagens"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Estúdio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings('memory');
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center justify-center gap-1 p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium transition-colors border border-purple-500/20 cursor-pointer"
              title="Memória do Fly AI (Relembrar chats anteriores)"
            >
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>Memória</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings('general');
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Opções do Fly AI"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Opções</span>
            </button>
          </div>

          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="w-full text-center text-[11px] text-slate-400 hover:text-red-500 transition-colors pt-1"
            >
              Limpar todo o histórico
            </button>
          )}
        </div>
      </aside>

      {/* Modal: Confirm Delete Single Conversation */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Excluir conversa?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Esta ação removerá esta conversa permanentemente do seu histórico local no dispositivo.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear All */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Limpar todo o histórico?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Todas as conversas serão apagadas deste navegador. Esta ação não poderá ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearAllConfirm}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
              >
                Apagar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
