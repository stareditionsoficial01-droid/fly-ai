import React from 'react';
import {
  Menu,
  Plus,
  Sun,
  Moon,
  Settings,
  Image as ImageIcon,
  Brain,
} from 'lucide-react';
import { FlyLogo } from './FlyLogo';
import { ModeSelector } from './ModeSelector';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: (tab?: 'general' | 'memory') => void;
  onOpenImageStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  onOpenImageStudio,
}) => {
  const { createNewConversation, isGenerating, memorySettings } = useChat();
  const { theme, setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(isDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <header className="h-13 sm:h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-md sticky top-0 z-30 px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0">
      {/* Left section: Hamburger for mobile + Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0"
          title="Abrir histórico e opções"
          aria-label="Menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className="cursor-pointer shrink-0"
          onClick={createNewConversation}
          title="Fly AI — Início"
        >
          <FlyLogo size="sm" />
        </div>
      </div>

      {/* Center: Mode Selector (compact pill on phones) */}
      <div className="flex items-center justify-center min-w-0 shrink">
        <ModeSelector />
      </div>

      {/* Right actions: New Chat + Theme toggle (+ desktop Image Studio and Settings) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Nova conversa button */}
        <button
          type="button"
          onClick={createNewConversation}
          disabled={isGenerating}
          className="flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40"
          title="Iniciar nova conversa limpa"
          aria-label="Nova Conversa"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Nova</span>
        </button>

        {/* Image Studio icon button (visible on tablet/desktop, accessible via sidebar drawer on phone) */}
        <button
          type="button"
          onClick={onOpenImageStudio}
          className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Estúdio de Imagens (Criar e Analisar)"
          aria-label="Estúdio de Imagens"
        >
          <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>

        {/* Theme quick switch (always visible and easy to tap) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema visual"
        >
          {isDark ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600" />
          )}
        </button>

        {/* Memória button (Relembrar conversas anteriores) */}
        <button
          type="button"
          onClick={() => onOpenSettings('memory')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
            memorySettings.enabled
              ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/25 shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={
            memorySettings.enabled
              ? `Memória Ativa: ${memorySettings.memories.length} item(ns) lembrado(s). Clique para ver as lembranças.`
              : 'Memória Desativada: Clique nas opções para ativar'
          }
          aria-label="Opção de Memória do Fly AI"
        >
          <Brain className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="hidden md:inline text-xs font-semibold">Memória</span>
          {memorySettings.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          )}
        </button>

        {/* Settings button (visible on tablet/desktop, accessible via sidebar drawer on phone) */}
        <button
          type="button"
          onClick={() => onOpenSettings('general')}
          className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Configurações e opções da IA"
          aria-label="Configurações"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};
