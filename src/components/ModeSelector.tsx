import React, { useState, useRef, useEffect } from 'react';
import { Zap, Sparkles, ChevronDown, Check, Info } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AiMode } from '../types';

interface ModeSelectorProps {
  compact?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ compact = false }) => {
  const { currentMode, setCurrentMode, isGenerating } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modes: Array<{
    id: AiMode;
    name: string;
    badge: string;
    tagline: string;
    details: string;
    icon: typeof Zap;
    color: string;
  }> = [
    {
      id: 'fast',
      name: 'Fly AI 1.5 — Rápido',
      badge: '1.5 Rápido',
      tagline: 'Respostas ágeis para suas ideias.',
      details: 'Motor de alta velocidade do Fly AI: ultra-rápido e eficiente, ideal para conversas diárias, resumos e respostas imediatas.',
      icon: Zap,
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      id: 'pro',
      name: 'Fly AI 2.1 — Pro',
      badge: '2.1 Pro',
      tagline: 'Mais profundidade para desafios complexos.',
      details: 'Raciocínio analítico avançado com Deep Thinking, programação detalhada, matemática, lógica em etapas e geração ilimitada de imagens.',
      icon: Sparkles,
      color: 'text-blue-500 dark:text-blue-400',
    },
  ];

  const activeConfig = modes.find((m) => m.id === currentMode) || modes[0];
  const ActiveIcon = activeConfig.icon;

  const handleSelect = (modeId: AiMode) => {
    if (isGenerating) return;
    setCurrentMode(modeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !isGenerating && setIsOpen(!isOpen)}
        disabled={isGenerating}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={isGenerating ? 'Não é possível alterar o modelo durante a geração' : 'Alternar modo de IA'}
        className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all text-xs font-semibold ${
          currentMode === 'pro'
            ? 'bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
            : 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
        } ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xs active:scale-95'}`}
      >
        <span className="flex items-center justify-center">
          <ActiveIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeConfig.color}`} />
        </span>

        {/* Compact on phone, full name on larger screens */}
        <span className="hidden sm:inline font-bold tracking-tight">
          {compact ? activeConfig.badge : activeConfig.name}
        </span>
        <span className="sm:hidden font-bold tracking-tight text-[11px]">
          {activeConfig.badge}
        </span>

        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel */}
          <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-15 sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:mt-2 sm:w-80 rounded-2xl bg-white dark:bg-[#141824] border border-slate-200 dark:border-slate-800 shadow-2xl sm:shadow-xl z-50 p-2 transform origin-top transition-all">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Selecione a Inteligência
              </span>
            </div>

            <div className="space-y-1.5">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = mode.id === currentMode;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleSelect(mode.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 active:scale-98 ${
                      isSelected
                        ? 'bg-slate-100/90 dark:bg-slate-800/80 border-blue-500/50 shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent'
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                        mode.id === 'pro'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {mode.name}
                        </span>
                        {isSelected && (
                          <span className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5 mr-0.5" /> Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                        "{mode.tagline}"
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 leading-snug">
                        {mode.details}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3 h-3 shrink-0 text-slate-400" />
              <span>O modo selecionado é aplicado às novas mensagens.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
