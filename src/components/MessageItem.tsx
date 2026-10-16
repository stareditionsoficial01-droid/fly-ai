import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Zap,
  Sparkles,
  AlertCircle,
  Maximize2,
  X,
  Download,
} from 'lucide-react';
import { Message } from '../types';
import { useChat } from '../context/ChatContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FlyLogo } from './FlyLogo';

interface MessageItemProps {
  message: Message;
  isLastAssistantMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isLastAssistantMessage }) => {
  const {
    speakingState,
    toggleSpeakMessage,
    stopSpeaking,
    regenerateLastResponse,
    isGenerating,
  } = useChat();

  const [copied, setCopied] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isUser = message.role === 'user';
  const isCurrentlySpeakingThis = speakingState.isSpeaking && speakingState.text === message.content;

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadGenerated = () => {
    if (!message.generatedImage?.url) return;
    const a = document.createElement('a');
    a.href = message.generatedImage.url;
    a.download = `fly-ai-2.1-pro-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.timestamp));

  return (
    <div
      className={`py-3 sm:py-6 px-2.5 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-100/70 dark:bg-[#111622]/70 border-y border-slate-200/50 dark:border-slate-800/40'
      }`}
    >
      <div className={`max-w-4xl mx-auto flex gap-2.5 sm:gap-4 items-start ${isUser ? 'justify-end' : ''}`}>
        {/* User Message (Modern mobile speech bubble aligned to right) */}
        {isUser ? (
          <div className="flex flex-col items-end max-w-[88%] sm:max-w-[80%]">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Você</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>

            {/* Attached Image if any */}
            {message.image && (
              <div className="mb-2 inline-block">
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/10 max-w-[240px] sm:max-w-sm">
                  <img
                    src={message.image.data}
                    alt={message.image.name || 'Imagem anexada'}
                    className="max-h-48 sm:max-h-60 w-auto object-contain rounded-2xl cursor-pointer"
                    onClick={() => setImageModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setImageModalOpen(true)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white"
                    title="Expandir imagem"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* User message bubble */}
            <div className="bg-blue-600 text-white dark:bg-blue-600 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tr-xs text-xs sm:text-[15px] leading-relaxed shadow-xs break-words font-normal">
              {message.content}
            </div>
          </div>
        ) : (
          /* AI Message */
          <>
            <div className="shrink-0 mt-0.5">
              <div className="relative">
                <FlyLogo size="sm" />
                {/* Badge for Mode */}
                <div
                  className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ring-2 ring-white dark:ring-[#111622] ${
                    message.mode === 'pro'
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                  title={message.mode === 'pro' ? 'Fly AI 2.1 — Pro' : 'Fly AI 1.5 — Rápido'}
                >
                  {message.mode === 'pro' ? (
                    <Sparkles className="w-2.5 h-2.5" />
                  ) : (
                    <Zap className="w-2.5 h-2.5" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  Fly AI
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    message.mode === 'pro'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  {message.mode === 'pro' ? '2.1 Pro' : '1.5 Rápido'}
                </span>

                <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-auto">
                  {formattedTime}
                </span>
              </div>

              {/* Body Text */}
              <div>
                {message.isError && (
                  <div className="flex items-center gap-2 p-3 mb-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{message.content}</span>
                  </div>
                )}

                {!message.isError && (
                  <>
                    <MarkdownRenderer content={message.content} />

                    {/* Pro Mode Generated Image Display */}
                    {message.generatedImage && (
                      <div className="my-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151a27] shadow-md max-w-md">
                        <div className="relative group overflow-hidden bg-slate-950 flex items-center justify-center">
                          <img
                            src={message.generatedImage.url}
                            alt={message.generatedImage.prompt}
                            className="w-full max-h-80 object-contain cursor-pointer transition-transform hover:scale-101"
                            onClick={() => setImageModalOpen(true)}
                          />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setImageModalOpen(true)}
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white cursor-pointer"
                              title="Expandir imagem"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadGenerated}
                              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white cursor-pointer"
                              title="Baixar imagem"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                              Fly AI 2.1 Pro • Imagem com IA
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                              "{message.generatedImage.prompt}"
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleDownloadGenerated}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {message.isStreaming && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 font-medium mt-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping"></span>
                        {message.mode === 'pro' ? 'Analisando profundamente...' : 'Digitando resposta...'}
                      </span>
                    )}
                  </>
                )}

                {/* Action Toolbar for AI message */}
                {!message.isStreaming && !message.isError && message.content && (
                  <div className="flex items-center gap-1 sm:gap-2 mt-2.5 pt-1.5 text-slate-400 dark:text-slate-400 flex-wrap">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                      title="Copiar resposta inteira"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Voice Speak / Stop Button */}
                    <button
                      type="button"
                      onClick={() => toggleSpeakMessage(message.content)}
                      className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer active:scale-95 ${
                        isCurrentlySpeakingThis
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium ring-1 ring-blue-500/40'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title={isCurrentlySpeakingThis ? 'Pausar/retomar leitura em voz alta' : 'Ouvir resposta com voz'}
                    >
                      {isCurrentlySpeakingThis ? (
                        speakingState.isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 text-blue-500" />
                            <span>Continuar</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-blue-500" />
                            <span>Pausar</span>
                          </>
                        )
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Ouvir</span>
                        </>
                      )}
                    </button>

                    {/* Stop Speaking button if active */}
                    {isCurrentlySpeakingThis && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                        title="Parar áudio"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Regenerate Button */}
                    {isLastAssistantMessage && !isGenerating && (
                      <button
                        type="button"
                        onClick={regenerateLastResponse}
                        className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs cursor-pointer ml-auto active:scale-95"
                        title="Tentar gerar novamente"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gerar novamente</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Image Preview Modal */}
      {imageModalOpen && (message.image || message.generatedImage) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {message.generatedImage && (
                <button
                  type="button"
                  onClick={handleDownloadGenerated}
                  className="p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                  title="Baixar imagem"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="p-2 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={message.generatedImage?.url || message.image?.data}
              alt="Visualização"
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
