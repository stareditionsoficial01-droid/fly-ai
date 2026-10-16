import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  RotateCcw,
  Image as ImageIcon,
  Scan,
  AlertCircle,
  Check,
  Send,
  Upload,
} from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string, image?: { data: string; mimeType: string }) => void;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Analysis state
  const [analyzeImage, setAnalyzeImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState('Descreva os detalhes visuais, cores e elementos desta imagem.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar solicitação de imagem.');
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setGenError(err.message || 'Não foi possível gerar a imagem.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `fly-ai-generated-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAnalyzeError('Por favor, selecione um arquivo de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAnalyzeImage({
        data: event.target?.result as string,
        mimeType: file.type,
        name: file.name,
      });
      setAnalyzeError(null);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!analyzeImage || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: { data: analyzeImage.data, mimeType: analyzeImage.mimeType },
          prompt: analyzePrompt.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao analisar imagem.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Erro na análise:', err);
      setAnalyzeError(err.message || 'Falha ao comunicar com o modelo de visão.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-2xl bg-white dark:bg-[#121623] rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]">
        {/* Mobile handle indicator */}
        <div className="pt-2 pb-0.5 sm:hidden flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Modal Header */}
        <div className="px-4 py-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Estúdio de Imagens Fly AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geração autêntica e análise visual inteligente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'generate'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Gerar Imagem</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'analyze'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Scan className="w-4 h-4" />
              <span>Analisar com Visão</span>
            </div>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'generate' ? (
            /* TAB 1: GENERATE */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descreva a imagem que você deseja criar:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Uma paisagem futurista de uma cidade flutuante ao pôr do sol, estilo cinematográfico hiper-realista..."
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Proporção da imagem:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        aspectRatio === ratio
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Notice */}
              {genError && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Status do serviço de imagem:</span>
                    <span>{genError}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Gerando imagem autêntica...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Geração</span>
                  </>
                )}
              </button>

              {/* Generated Image Result Card */}
              {generatedImage && (
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black/40 flex items-center justify-center max-h-80">
                    <img
                      src={generatedImage}
                      alt="Gerada pelo Fly AI"
                      className="max-h-80 w-auto object-contain rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gerar outra versão</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar imagem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: ANALYZE WITH VISION */
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {!analyzeImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-blue-500 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Selecione uma imagem do seu dispositivo
                  </h4>
                  <p className="text-xs text-slate-400">
                    Formatos suportados: PNG, JPG, WEBP (até 8MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={analyzeImage.data}
                        alt="Análise"
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {analyzeImage.name}
                        </p>
                        <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> Imagem carregada
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAnalyzeImage(null)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                      title="Trocar imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      O que deseja saber sobre a imagem?
                    </label>
                    <input
                      type="text"
                      value={analyzePrompt}
                      onChange={(e) => setAnalyzePrompt(e.target.value)}
                      placeholder="Ex: Identifique os objetos, transcreva textos ou dê sugestões de design..."
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {analyzeError && (
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{analyzeError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Examinando detalhes com visão...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        <span>Analisar Imagem</span>
                      </>
                    )}
                  </button>

                  {analysisResult && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Resultado da Análise
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {analysisResult}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
