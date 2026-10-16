import React from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { SpeechSynthesisService } from '../utils/speech';

export const VoicePlaybackBar: React.FC = () => {
  const { speakingState, stopSpeaking } = useChat();

  if (!speakingState.isSpeaking) return null;

  const handleTogglePause = () => {
    const synth = SpeechSynthesisService.getInstance();
    if (speakingState.isPaused) {
      synth.resume();
    } else {
      synth.pause();
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-30 max-w-[92vw]">
      <div className="flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md shadow-xl border border-slate-700/80 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-2 bg-blue-400 rounded-full animate-soundwave-1"></span>
            <span className="w-1 h-3.5 bg-blue-400 rounded-full animate-soundwave-2"></span>
            <span className="w-1 h-2 bg-blue-400 rounded-full animate-soundwave-3"></span>
          </div>
        </div>

        <span className="font-medium text-slate-200 truncate max-w-[150px] sm:max-w-xs">
          {speakingState.isPaused ? 'Leitura pausada' : 'Lendo resposta...'}
        </span>

        <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
          <button
            type="button"
            onClick={handleTogglePause}
            className="p-1 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={speakingState.isPaused ? 'Continuar leitura' : 'Pausar leitura'}
          >
            {speakingState.isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={stopSpeaking}
            className="p-1 rounded-full hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors"
            title="Parar leitura"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
