import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Model Configuration & Provider Transparency Info
export interface ModelModeConfig {
  id: 'fast' | 'pro';
  name: string;
  badge: string;
  slogan: string;
  description: string;
  backendModel: string;
  thinkingLevel: ThinkingLevel;
  systemInstruction: string;
  recommendedFor: string[];
}

const MODES: Record<'fast' | 'pro', ModelModeConfig> = {
  fast: {
    id: 'fast',
    name: 'Fly AI 1.5 — Rápido',
    badge: '1.5 Rápido',
    slogan: 'Respostas ágeis para suas ideias.',
    description: 'Motor Fly AI Rápido impulsionado por Gemini 3.8 Flash: ultrarrápido, ágil e eficiente, ideal para conversas cotidianas, redação e respostas imediatas.',
    backendModel: 'gemini-3.8-flash',
    thinkingLevel: ThinkingLevel.LOW,
    systemInstruction: `Você é o Fly AI 1.5 — Rápido, um assistente de inteligência artificial veloz, moderno e amigável.
Seu slogan oficial é: "Sua ideia. Nossa inteligência."
Objetivo principal: Entregar respostas ágeis, naturais, claras e diretas para dúvidas, redação, resumos e tarefas do dia a dia com a máxima rapidez.
Diretrizes:
- Responda sempre em português brasileiro (a não ser que o usuário solicite explicitamente outro idioma).
- Seja objetivo e amigável, sem enrolação desnecessária.
- Use formatação Markdown limpa (títulos, listas, negrito e blocos de código quando útil).
- IDENTIDADE DO MODELO (REGRA RIGOROSA E INVIOLÁVEL): Se o usuário perguntar qual modelo, IA ou tecnologia você usa, qual versão, quem é o provedor de infraestrutura ou algo similar, NUNCA cite, mencione ou revele nomes técnicos subjacentes (como Gemini, Google, Llama, DeepSeek, OpenAI, GPT, etc.). Identifique-se SEMPRE e EXCLUSIVAMENTE como "Fly AI" (especificamente "Fly AI 1.5 — Rápido"), uma tecnologia proprietária de inteligência artificial sob o lema "Sua ideia. Nossa inteligência.".
- REGRA IMPORTANTE: Se o usuário pedir algo muito difícil, insolúvel, fora de alcance prático ou que você não consiga realizar com segurança e precisão, diga claramente com educação e honestidade que infelizmente não consegue fazer aquilo no momento (por exemplo: "Infelizmente não consigo realizar isso no momento..."), explicando brevemente o motivo com gentileza e sugerindo uma alternativa se houver.`,
    recommendedFor: ['Perguntas rápidas', 'Redação de e-mails e posts', 'Resumos de textos', 'Brainstorming ágil'],
  },
  pro: {
    id: 'pro',
    name: 'Fly AI 2.1 — Pro',
    badge: '2.1 Pro',
    slogan: 'Mais profundidade para desafios complexos.',
    description: 'Motor Fly AI Pro impulsionado por Gemini 3.1 Pro projetado para raciocínio em etapas, programação avançada, matemática e planejamento estratégico.',
    backendModel: 'gemini-3.1-pro-preview',
    thinkingLevel: ThinkingLevel.HIGH,
    systemInstruction: `Você é o Fly AI 2.1 — Pro, o modo de alta capacidade e raciocínio profundo do Fly AI.
Seu slogan oficial é: "Sua ideia. Nossa inteligência."
Objetivo principal: Resolver problemas complexos com raciocínio analítico, etapas estruturadas, depuração minuciosa de código e planejamento estratégico.
Diretrizes:
- Responda em português brasileiro com alto nível técnico, precisão e rigor.
- Quando confrontado com programação, forneça código limpo, comentado, boas práticas e explique as decisões tomadas.
- Em problemas lógicos, matemáticos ou conceituais, decomponha o raciocínio em passos compreensíveis.
- IDENTIDADE DO MODELO (REGRA RIGOROSA E INVIOLÁVEL): Se o usuário perguntar qual modelo, IA ou tecnologia você usa, qual versão, quem é o provedor de infraestrutura ou algo similar, NUNCA cite, mencione ou revele nomes técnicos subjacentes (como Gemini, Google, Llama, DeepSeek, OpenAI, GPT, etc.). Identifique-se SEMPRE e EXCLUSIVAMENTE como "Fly AI" (especificamente "Fly AI 2.1 — Pro"), o sistema de raciocínio profundo e analítico da plataforma Fly AI sob o lema "Sua ideia. Nossa inteligência.".
- REGRA IMPORTANTE: Caso o usuário solicite algo excessivamente difícil, insolúvel, que envolva previsão do futuro, quebra de criptografia inquebrável, ações físicas ou qualquer tarefa que ultrapasse a capacidade computacional e operacional real do modelo, informe de maneira sincera, profissional e cordial: "Infelizmente não consigo realizar isso no momento", esclarecendo a razão técnica da impossibilidade e oferecendo caminhos alternativos para ajudar.`,
    recommendedFor: ['Programação e depuração', 'Raciocínio lógico e matemática', 'Análise de dados e arquitetura', 'Planejamento de projetos'],
  },
};

// API: System & Provider Info
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'Fly AI',
    slogan: 'Sua ideia. Nossa inteligência.',
    hasApiKey: !!apiKey,
    modes: MODES,
    transparency: {
      provider: 'Fly AI Neural Cloud Engine',
      currentBackendModels: {
        fast: 'Fly AI 1.5 — Rápido (Motor Ultra-Ágil)',
        pro: 'Fly AI 2.1 — Pro (Motor Deep Thinking Analítico)',
        vision: 'Fly AI Vision (Módulo de Visão Computacional)',
        imageGen: 'Fly AI Image Studio (Módulo de Renderização Criativa)',
      },
      note: 'A plataforma Fly AI opera com uma arquitetura neural segura em nuvem sob o slogan "Sua ideia. Nossa inteligência.", projetada para entregar máxima agilidade no modo 1.5 e raciocínio profundo no modo 2.1.',
    },
  });
});

// API: Chat Streaming endpoint with SSE
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, mode = 'fast', image, memoryContext } = req.body;

  if (!apiKey) {
    res.status(500).json({
      error: 'Chave de API (GEMINI_API_KEY) não configurada no servidor. Configure no painel de segredos.',
    });
    return;
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Nenhuma mensagem foi fornecida.' });
    return;
  }

  const selectedMode = mode === 'pro' ? MODES.pro : MODES.fast;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Prepare Gemini contents array from messages history
  // Messages format: { role: 'user' | 'assistant', content: string, image?: { data: string, mimeType: string } }
  try {
    // Smart sliding window to support infinite conversations without token exhaustion
    // Retain up to 24 most recent messages, and keep image payload only on recent turns
    const recentMessages = messages.slice(-24);
    const contents: any[] = [];

    for (let i = 0; i < recentMessages.length; i++) {
      const msg = recentMessages[i];
      const isLatestTurn = i >= recentMessages.length - 2;
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: any[] = [];

      // Only forward heavy base64 inline images if recent to conserve tokens and bandwidth
      if (msg.image && msg.image.data && isLatestTurn) {
        let base64Data = msg.image.data;
        let mimeType = msg.image.mimeType || 'image/jpeg';
        if (base64Data.includes('base64,')) {
          const split = base64Data.split('base64,');
          mimeType = split[0].replace('data:', '').replace(';', '');
          base64Data = split[1];
        }
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    let fullText = '';
    async function runStreaming(modelToUse: string, configToUse: any) {
      const stream = await ai.models.generateContentStream({
        model: modelToUse,
        contents,
        config: configToUse,
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text, mode: selectedMode.id })}\n\n`);
        }
      }
    }

    // Build active system instruction including long-term chat memory if enabled
    let activeSystemInstruction = selectedMode.systemInstruction;
    if (memoryContext && typeof memoryContext === 'string' && memoryContext.trim()) {
      activeSystemInstruction += `\n\n[MEMÓRIA DE CHATS ANTERIORES DO USUÁRIO]:\nVocê tem acesso à memória de conversas anteriores e preferências do usuário. Use essas lembranças de forma natural e proativa quando o usuário perguntar sobre conversas passadas, projetos anteriores ou contexto já discutido:\n${memoryContext.trim()}`;
    }

    // Resilient generation with automatic failover to keep conversations unlimited & uninterrupted
    const primaryConfig: any = {
      systemInstruction: activeSystemInstruction,
    };
    // Omit thinkingConfig on fast mode for lowest latency; on pro mode only include if supported
    if (selectedMode.id === 'pro' && selectedMode.backendModel.includes('3.8-flash')) {
      primaryConfig.thinkingConfig = { thinkingLevel: selectedMode.thinkingLevel };
    }

    try {
      await runStreaming(selectedMode.backendModel, primaryConfig);
    } catch (primaryErr: any) {
      console.warn(`Aviso no modelo principal (${selectedMode.backendModel}):`, primaryErr?.message || primaryErr);
      const isTransientOrQuota =
        primaryErr?.status === 429 ||
        primaryErr?.status === 503 ||
        primaryErr?.status === 400 ||
        String(primaryErr?.message).includes('429') ||
        String(primaryErr?.message).includes('503') ||
        String(primaryErr?.message).includes('400') ||
        String(primaryErr?.message).includes('quota') ||
        String(primaryErr?.message).includes('RESOURCE_EXHAUSTED') ||
        String(primaryErr?.message).includes('UNAVAILABLE') ||
        String(primaryErr?.message).includes('not found') ||
        String(primaryErr?.message).includes('Thinking level');

      if (isTransientOrQuota && !fullText) {
        console.warn('Realizando failover inteligente para garantir resposta ininterrupta...');
        await new Promise((r) => setTimeout(r, 400));

        // In Pro mode, fallback to Gemini 3.8 Flash first, then Flash-Lite if needed
        const fallbackModel = selectedMode.id === 'pro' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';
        try {
          await runStreaming(fallbackModel, {
            systemInstruction: activeSystemInstruction,
          });
        } catch (secondaryErr: any) {
          console.warn('Failover secundário para gemini-3.1-flash-lite...');
          await runStreaming('gemini-3.1-flash-lite', {
            systemInstruction: activeSystemInstruction,
          });
        }
      } else {
        throw primaryErr;
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, fullText, mode: selectedMode.id })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Erro na geração Fly AI:', error);
    let errorMessage = 'Ocorreu um erro ao comunicar com a inteligência artificial.';

    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Limite de cota de uso temporariamente atingido. Por favor, aguarde alguns instantes antes de enviar uma nova mensagem.';
    } else if (error?.message) {
      errorMessage = `Erro do modelo: ${error.message}`;
    }

    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// API: Image Generation endpoint
app.post('/api/images/generate', async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Informe uma descrição para gerar a imagem.' });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Chave de API não configurada.' });
    return;
  }

  let generatedImageUrl = '';
  let explanationText = '';

  // 1. First attempt native image model
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        explanationText += part.text;
      }
    }
  } catch (primaryImgErr: any) {
    console.warn('Modelo nativo de imagem em cota ou requer faturamento. Ativando Motor Vetorial Neural Fly AI:', primaryImgErr?.message || primaryImgErr);
  }

  // 2. If raster generation was quota-limited, synthesize rich vector artwork with Gemini
  if (!generatedImageUrl) {
    try {
      const viewBoxDimensions =
        aspectRatio === '16:9' ? '0 0 960 540' : aspectRatio === '9:16' ? '0 0 540 960' : aspectRatio === '4:3' ? '0 0 800 600' : '0 0 800 800';

      const svgPrompt = `Você é o mecanismo oficial de renderização visual e artística do Fly AI 2.1 Pro.
Crie uma obra visual em formato SVG completa, impressionante, moderna, altamente detalhada e harmoniosa baseada nesta descrição: "${prompt}".

Requisitos técnicos obrigatórios do código SVG:
1. Comece diretamente com <svg viewBox="${viewBoxDimensions}" xmlns="http://www.w3.org/2000/svg"> e termine com </svg>.
2. Inclua um fundo estético (<rect width="100%" height="100%" fill="..."/>) com gradientes adequados ao tema.
3. Use gradientes (<linearGradient>, <radialGradient>), filtros, sombras, formas bem definidas, caminhos (<path>), círculos, polígonos e cores vibrantes.
4. Represente visualmente com criatividade todos os elementos centrais solicitados no prompt.
5. Retorne ESTRITAMENTE o código SVG puro sem nenhum texto adicional antes ou depois e sem formatação markdown.`;

      // Try gemini-3.1-flash-lite then gemini-3.8-flash for vector synthesis
      let svgResponse;
      try {
        svgResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts: [{ text: svgPrompt }] },
        });
      } catch (liteErr) {
        svgResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [{ text: svgPrompt }] },
        });
      }

      const rawSvg = svgResponse.text || '';
      const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        const cleanSvg = svgMatch[0];
        const base64Svg = Buffer.from(cleanSvg, 'utf-8').toString('base64');
        generatedImageUrl = `data:image/svg+xml;base64,${base64Svg}`;
        explanationText = 'Imagem criada com o Motor Visual Vetorial do Fly AI 2.1 Pro.';
      }
    } catch (svgErr: any) {
      console.error('Falha na síntese vetorial Fly AI:', svgErr);
    }
  }

  if (generatedImageUrl) {
    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt,
      aspectRatio,
      explanation: explanationText || undefined,
    });
    return;
  }

  res.status(500).json({
    error: 'Não foi possível sintetizar a imagem no momento. Tente novamente com uma descrição alternativa.',
  });
});

// API: Image Analysis endpoint
app.post('/api/images/analyze', async (req: Request, res: Response) => {
  const { image, prompt = 'Descreva esta imagem detalhadamente em português.' } = req.body;

  if (!image || !image.data) {
    res.status(400).json({ error: 'Imagem não fornecida para análise.' });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Chave de API não configurada.' });
    return;
  }

  try {
    let base64Data = image.data;
    let mimeType = image.mimeType || 'image/jpeg';
    if (base64Data.includes('base64,')) {
      const split = base64Data.split('base64,');
      mimeType = split[0].replace('data:', '').replace(';', '');
      base64Data = split[1];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    res.json({
      success: true,
      analysis: response.text || 'Nenhuma análise gerada.',
    });
  } catch (error: any) {
    console.error('Erro na análise de imagem:', error);
    res.status(500).json({ error: error.message || 'Falha ao analisar imagem.' });
  }
});

// API: Extract memories and facts from previous conversations
app.post('/api/memories/extract', async (req: Request, res: Response) => {
  const { conversationsText } = req.body;

  if (!conversationsText || typeof conversationsText !== 'string' || !conversationsText.trim()) {
    res.status(400).json({ error: 'Nenhum texto de conversas fornecido para extração de memória.' });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Chave de API não configurada.' });
    return;
  }

  try {
    const prompt = `Analise as conversas anteriores a seguir entre o usuário e o Fly AI e extraia os fatos mais importantes que o Fly AI deve RELEMBRAR nos próximos chats para manter continuidade perfeita.

Foque em:
1. Preferências explícitas do usuário (linguagem, tom, gostos, rotinas).
2. Fatos e informações pessoais compartilhadas (nome, profissão, projetos, objetivos).
3. Ideias, projetos, tarefas e decisões tomadas em chats passados.
4. Tópicos principais e instruções personalizadas.

Conversas:
"""
${conversationsText.slice(0, 15000)}
"""

Retorne ESTRITAMENTE um array JSON de objetos no seguinte formato (sem formatação markdown e sem texto antes ou depois):
[
  { "text": "descrição concisa e direta do fato que o Fly AI deve lembrar", "category": "preference" }
]
Categorias permitidas: "preference", "fact", "project", "chat_context".
Se não houver informações relevantes suficientes para lembrar, retorne um array vazio [].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '[]';
    let memories = [];
    try {
      memories = JSON.parse(jsonText);
    } catch {
      const match = jsonText.match(/\[[\s\S]*\]/);
      if (match) {
        memories = JSON.parse(match[0]);
      }
    }

    res.json({ success: true, memories: Array.isArray(memories) ? memories : [] });
  } catch (error: any) {
    console.error('Erro na extração de memórias:', error);
    res.status(500).json({ error: 'Falha ao processar extração de memória.' });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fly AI Server rodando na porta ${PORT} [http://0.0.0.0:${PORT}]`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
