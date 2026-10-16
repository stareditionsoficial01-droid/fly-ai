// Web Speech API helpers for Voice Input and Text-to-Speech

export interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  startListening: (onTranscript: (text: string) => void, onError?: (err: any) => void) => void;
  stopListening: () => void;
}

export class SpeechSynthesisService {
  private static instance: SpeechSynthesisService;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private onStateChangeListeners: Array<(state: { isSpeaking: boolean; isPaused: boolean; text: string }) => void> = [];
  private currentText = '';

  private constructor() {}

  public static getInstance(): SpeechSynthesisService {
    if (!SpeechSynthesisService.instance) {
      SpeechSynthesisService.instance = new SpeechSynthesisService();
    }
    return SpeechSynthesisService.instance;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public subscribe(listener: (state: { isSpeaking: boolean; isPaused: boolean; text: string }) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach((l) =>
      l({
        isSpeaking: this.isSpeaking,
        isPaused: this.isPaused,
        text: this.currentText,
      })
    );
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      voiceURI?: string | null;
      onEnd?: () => void;
      onError?: (e: any) => void;
    }
  ) {
    if (!this.isSupported()) return;

    this.stop();

    // Clean markdown symbols for cleaner voice reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Bloco de código omitido da leitura.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = this.getVoices();
    if (options?.voiceURI) {
      const foundVoice = voices.find((v) => v.voiceURI === options.voiceURI);
      if (foundVoice) {
        utterance.voice = foundVoice;
      }
    } else {
      // Pick best pt-BR voice if available
      const ptVoice = voices.find((v) => v.lang.startsWith('pt-BR')) || voices.find((v) => v.lang.startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.notify();
      options?.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.currentText = cleanText;
    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (this.isSupported() && this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.isSupported() && this.isSpeaking && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentText = '';
      this.currentUtterance = null;
      this.notify();
    }
  }
}
