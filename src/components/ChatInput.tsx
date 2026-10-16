import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  Mic,
  MicOff,
  X,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AttachedImage } from '../types';

interface ChatInputProps {
  onOpenImageStudio?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onOpenImageStudio }) => {
  const {
    sendMessage,
    isGenerating,
    stopGeneration,
    currentMode,
    proImagesRemaining,
  } = useChat();
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [text]);

  // Clean speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if ((!text.trim() && !attachedImage) || isGenerating) return;

    const messageText = text;
    const img = attachedImage || undefined;

    setText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageText, img);
  };

  // Image attachment handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedImage({
        data: result,
        mimeType: file.type,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // Web Speech API: Voice Dictation
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Navegador sem suporte a ditado direto. Experimente o Chrome.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setSpeechError('Permissão para microfone negada.');
        } else {
          setSpeechError(`Erro no microfone: ${event.error}`);
        }
        setIsListening(false);
        setTimeout(() => setSpeechError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSpeechError('Não foi possível iniciar o microfone.');
      setIsListening(false);
      setTimeout(() => setSpeechError(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-6 pb-2.5 sm:pb-5 shrink-0">
      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Listening Active Banner */}
      {isListening && (
        <div className="mb-1.5 p-2 rounded-xl bg-blue-500/10 dark:bg-blue-900/30 border border-blue-500/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
              Ouvindo sua voz...
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Concluir
          </button>
        </div>
      )}

      {/* Attached Image Preview Pill */}
      {attachedImage && (
        <div className="mb-1.5 flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-fit max-w-full">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950/20 shrink-0">
            <img
              src={attachedImage.data}
              alt="Prévia"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-[200px]">
              {attachedImage.name || 'Imagem'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Remover anexo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Outer Container */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-[#131825] shadow-md shadow-slate-200/40 dark:shadow-black/30 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-1.5 sm:p-2.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            currentMode === 'pro'
              ? 'Pergunte ao Fly AI Pro...'
              : 'Converse com o Fly AI...'
          }
          rows={1}
          className="w-full resize-none bg-transparent px-2 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden min-h-[38px] max-h-[140px] leading-relaxed"
        />

        {/* Input Bottom Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 mt-1">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Attach Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Anexar imagem"
              aria-label="Anexar imagem"
            >
              <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Voice Dictation button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Parar ditado' : 'Ditar mensagem por voz'}
              aria-label="Microfone"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>

            {/* Quick Image Creator button for Pro Mode */}
            {currentMode === 'pro' && (
              <button
                type="button"
                onClick={() => {
                  setText((prev) => (prev.trim() ? prev : 'Crie uma imagem de '));
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                title="Criar imagens ilimitadas com Fly AI 2.1 Pro"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Criar Imagem</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Ilimitado
                </span>
              </button>
            )}

            {/* Image Studio quick launcher (desktop only) */}
            {onOpenImageStudio && (
              <button
                type="button"
                onClick={onOpenImageStudio}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Abrir estúdio de imagens da IA"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Estúdio de Imagem</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* If Generating: Show Stop button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Interromper geração"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar</span>
              </button>
            ) : (
              /* Send button */
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() && !attachedImage}
                className={`w-8.5 h-8.5 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 rounded-full sm:rounded-xl text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  text.trim() || attachedImage
                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer shadow-blue-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Enviar mensagem (Enter)"
                aria-label="Enviar"
              >
                <span className="hidden sm:inline">Enviar</span>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="hidden sm:block mt-1.5 text-center text-[11px] text-slate-400 dark:text-slate-500">
        O Fly AI pode cometer deslizes em detalhes factuais. Verifique dados críticos.
      </p>
    </div>
  );
};
