import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  Zap,
  Code2,
  FileText,
  Lightbulb,
  Compass,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { MessageItem } from './MessageItem';
import { FlyLogo } from './FlyLogo';

interface ChatAreaProps {
  onOpenImageStudio?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onOpenImageStudio }) => {
  const {
    activeConversation,
    sendMessage,
    isGenerating,
    currentMode,
    activeError,
    clearError,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [activeConversation?.messages, isGenerating]);

  // Handle scroll to show/hide scroll to bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 160);
  };

  const quickMobileSuggestions = [
    { text: 'Ideias de negócios com IA', icon: Lightbulb, color: 'text-amber-500' },
    { text: 'Criar código limpo em TypeScript', icon: Code2, color: 'text-blue-500' },
    { text: 'Redigir proposta comercial', icon: FileText, color: 'text-emerald-500' },
    { text: 'Explicar o Paradoxo de Fermi', icon: Compass, color: 'text-purple-500' },
  ];

  const suggestions = [
    {
      category: 'Ideias & Estratégia',
      icon: Lightbulb,
      color: 'text-amber-500',
      items: [
        'Planejar um plano de marketing digital para lançamento de um produto SaaS',
        '3 ideias de modelos de negócios inovadores com inteligência artificial',
      ],
    },
    {
      category: 'Programação & Tech',
      icon: Code2,
      color: 'text-blue-500',
      items: [
        'Como estruturar uma API RESTful escalável em Node.js e TypeScript?',
        'Escreva uma função em React para sincronizar dados com debounce e cache',
      ],
    },
    {
      category: 'Redação & Comunicação',
      icon: FileText,
      color: 'text-emerald-500',
      items: [
        'Escreva um e-mail profissional e persuasivo para proposta comercial',
        'Elabore um resumo conciso com os principais tópicos da computação quântica',
      ],
    },
    {
      category: 'Raciocínio & Lógica',
      icon: Compass,
      color: 'text-purple-500',
      items: [
        'Explique o Paradoxo de Fermi e as principais hipóteses científicas',
        'Compare a eficiência e custos entre arquitetura de Microsserviços e Monolito',
      ],
    },
  ];

  const messages = activeConversation?.messages || [];

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative flex flex-col justify-between"
    >
      {/* Global Error Banner if any */}
      {activeError && (
        <div className="sticky top-0 z-20 mx-3 sm:mx-8 mt-2 p-3 rounded-2xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center justify-between gap-2 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="truncate">{activeError}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-800 dark:text-red-200 transition-colors shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-12 flex flex-col items-center text-center">
            {/* Logo Badge */}
            <div className="mb-3 sm:mb-5">
              <FlyLogo size="lg" showSlogan />
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 sm:mb-2">
              Olá! O que vamos criar hoje?
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm sm:max-w-md mb-4 sm:mb-6">
              Sua ideia. Nossa inteligência. Escolha um tema abaixo ou digite sua pergunta.
            </p>

            {/* Mode Banner Indicator */}
            <div className="w-full max-w-xs sm:max-w-md mb-4 sm:mb-8 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#121623] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-2.5 text-left">
              <div
                className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${
                  currentMode === 'pro'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {currentMode === 'pro' ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentMode === 'pro' ? 'Fly AI 2.1 — Pro' : 'Fly AI 1.5 — Rápido'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentMode === 'pro'
                    ? 'Raciocínio analítico avançado e etapas lógicas'
                    : 'Respostas ágeis para suas ideias cotidianas'}
                </p>
              </div>
            </div>

            {/* Mobile-Only Quick Tap Chips (Compact, neat 2x2 grid) */}
            <div className="w-full sm:hidden grid grid-cols-2 gap-2 text-left mb-2">
              {quickMobileSuggestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => sendMessage(item.text)}
                    className="p-2.5 rounded-2xl bg-white dark:bg-[#121623] border border-slate-200/90 dark:border-slate-800/90 text-left active:scale-97 transition-all flex flex-col justify-between min-h-[70px] shadow-2xs"
                  >
                    <Icon className={`w-4 h-4 ${item.color} mb-1`} />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                      {item.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop & Tablet Suggestions Grid */}
            <div className="hidden sm:grid w-full grid-cols-2 gap-3 text-left">
              {suggestions.map((sug, idx) => {
                const Icon = sug.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#121623] border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${sug.color}`} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sug.category}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {sug.items.map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => sendMessage(promptText)}
                          className="w-full text-left p-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                        >
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            → {promptText}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Messages Flow */
          <div className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
            {messages.map((message, index) => {
              const isLastAssistant =
                message.role === 'assistant' && index === messages.length - 1;
              return (
                <MessageItem
                  key={message.id || index}
                  message={message}
                  isLastAssistantMessage={isLastAssistant}
                />
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-20 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Rolar para as mensagens mais recentes"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
