/**
 * @file lib/ai/service.ts
 * @description Serviço centralizado de IA com suporte a personas customizadas
 */

import { AIPersona } from '@/types/client';
import { ContentConstraints, FunnelStage, ContentType, GenerationResult, ScheduleItem } from '@/types/content';
import { getPersonaWithCache, generateCustomSystemPrompt } from './personas';
import { Client } from '@/types/client';

interface GenerateContentParams {
  client: Client;
  constraints: ContentConstraints;
  month: number;
  year: number;
  additionalContext?: string;
}

interface GenerateBacklogParams {
  client: Client;
  backlogTitle: string;
  description?: string;
}

/**
 * Gera o calendário editorial completo usando a persona do cliente
 */
export async function generateEditorialCalendar({
  client,
  constraints,
  month,
  year,
  additionalContext,
}: GenerateContentParams): Promise<GenerationResult | null> {
  try {
    // Busca a persona do cliente
    let persona = await getPersonaWithCache(client.id);
    
    // Se não existir persona, cria uma temporária baseada no cliente
    const systemPrompt = persona?.system_prompt || generateCustomSystemPrompt(client);
    const temperature = persona?.temperature || 0.7;
    const maxTokens = persona?.max_tokens || 4000;

    // Calcula os dias do mês
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalStories = daysInMonth * constraints.stories_per_day;
    const totalReels = Math.ceil((daysInMonth / 7) * constraints.reels_per_week);
    const totalFeeds = Math.ceil((daysInMonth / 7) * constraints.feeds_per_week);

    const prompt = `${systemPrompt}

TAREFA: Crie um calendário editorial completo para ${client.name} (@${client.instagram_handle})

PERÍODO: ${month}/${year} (${daysInMonth} dias)

FREQUÊNCIA DE POSTAGEM:
- Stories: ${constraints.stories_per_day} por dia (total: ~${totalStories})
- Reels: ${constraints.reels_per_week} por semana (total: ~${totalReels})
- Feeds: ${constraints.feeds_per_week} por semana (total: ~${totalFeeds})

DISTRIBUIÇÃO DO FUNIL:
- Atenção (topo): ${constraints.funnel_distribution?.atencao || 40}%
- Interesse (meio): ${constraints.funnel_distribution?.interesse || 30}%
- Desejo (fundo): ${constraints.funnel_distribution?.desejo || 20}%
- Ação (conversão): ${constraints.funnel_distribution?.acao || 10}%

${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}` : ''}

RETORNE UM JSON EXATO com esta estrutura:
{
  "schedule": [
    {
      "day": 1,
      "date": "2024-01-01",
      "content_type": "feed_static|feed_carousel|feed_reel|story_single",
      "funnel_stage": "atencao|interesse|desejo|acao",
      "theme": "Tema do dia",
      "objective": "Objetivo estratégico",
      "copy": "Texto da legenda",
      "visual_prompt": "Prompt detalhado para imagem"
    }
  ],
  "staticPosts": [
    {
      "id": "uuid",
      "title": "Título do post",
      "caption": "Legenda completa com CTA",
      "hashtags": "#hashtag1 #hashtag2",
      "imagePrompt": "Prompt ultra-detalhado para DALL-E 3",
      "funnel_stage": "atencao|interesse|desejo|acao"
    }
  ],
  "carousels": [
    {
      "id": "uuid",
      "topic": "Tema do carrossel",
      "slides": [
        {"slideNumber": 1, "text": "Texto do slide 1", "visual_prompt": "Descrição visual"},
        {"slideNumber": 2, "text": "Texto do slide 2", "visual_prompt": "Descrição visual"}
      ],
      "caption": "Legenda do carrossel",
      "hashtags": "#hashtag1 #hashtag2",
      "funnel_stage": "atencao|interesse|desejo|acao"
    }
  ],
  "reels": [
    {
      "id": "uuid",
      "title": "Título do reel",
      "script": "Roteiro completo",
      "hook": "Gancho inicial (primeiros 3 segundos)",
      "caption": "Legenda",
      "hashtags": "#hashtag1 #hashtag2",
      "duration_seconds": 30,
      "visual_prompt": "Descrição visual",
      "funnel_stage": "atencao|interesse|desejo|acao"
    }
  ]
}

IMPORTANTE:
- Crie ${totalFeeds} posts de feed distribuídos ao longo do mês
- Crie ${totalReels} reels distribuídos ao longo do mês
- Respeite a distribuição do funil em TODOS os conteúdos
- Cada conteúdo deve ter copy persuasiva e prompts visuais detalhados
- Os prompts visuais devem ser compatíveis com DALL-E 3`;

    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.warn('Gemini falhou, tentando OpenAI fallback...');
      return generateWithOpenAI(prompt, temperature, maxTokens);
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText) as GenerationResult;
  } catch (error) {
    console.error('Erro ao gerar calendário:', error);
    return null;
  }
}

/**
 * Gera conteúdo para um item do backlog
 */
export async function generateBacklogContent({
  client,
  backlogTitle,
  description,
}: GenerateBacklogParams): Promise<Partial<GenerationResult> | null> {
  try {
    let persona = await getPersonaWithCache(client.id);
    const systemPrompt = persona?.system_prompt || generateCustomSystemPrompt(client);

    const prompt = `${systemPrompt}

TAREFA: Crie conteúdo completo para o seguinte tema do backlog:

TÍTULO: ${backlogTitle}
${description ? `DESCRIÇÃO: ${description}` : ''}

RETORNE UM JSON com:
{
  "staticPosts": [
    {
      "id": "uuid",
      "title": "Título",
      "caption": "Legenda completa",
      "hashtags": "#hashtags",
      "imagePrompt": "Prompt DALL-E 3",
      "funnel_stage": "atencao|interesse|desejo|acao"
    }
  ],
  "carousels": [...],
  "reels": [...]
}

Crie pelo menos uma opção de cada formato (post estático, carrossel, reel) para este tema.`;

    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 3000,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return generateWithOpenAI(prompt, 0.7, 3000);
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Erro ao gerar conteúdo do backlog:', error);
    return null;
  }
}

/**
 * Fallback para OpenAI quando Gemini falha
 */
async function generateWithOpenAI(
  prompt: string, 
  temperature: number, 
  maxTokens: number
): Promise<GenerationResult | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  
  if (!openAiKey) {
    throw new Error('OpenAI API key não configurada');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as GenerationResult;
}

/**
 * Classifica o estágio do funil de um conteúdo usando IA
 */
export async function classifyFunnelStage(content: string): Promise<FunnelStage> {
  const prompt = `Analise este conteúdo e classifique em qual estágio do funil ele se encaixa:

CONTEÚDO: ${content}

ESTÁGIOS DO FUNIL:
- ATENCAO: Conteúdo educativo, viral, que chama atenção (topo do funil)
- INTERESSE: Cases, provas sociais, depoimentos (meio do funil)
- DESEJO: Benefícios, transformação, resultados (fundo do funil)
- ACAO: CTA direto, promoções, vendas (conversão)

Responda apenas com uma palavra: ATENCAO, INTERESSE, DESEJO ou ACAO`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          },
        }),
      }
    );

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text.trim().toUpperCase();
    
    if (result.includes('ATENCAO')) return FunnelStage.ATENCAO;
    if (result.includes('INTERESSE')) return FunnelStage.INTERESSE;
    if (result.includes('DESEJO')) return FunnelStage.DESEJO;
    if (result.includes('ACAO')) return FunnelStage.ACAO;
    
    return FunnelStage.ATENCAO;
  } catch (error) {
    console.error('Erro ao classificar funil:', error);
    return FunnelStage.ATENCAO;
  }
}

/**
 * Expande um prompt básico em uma estratégia detalhada
 * Mantida para compatibilidade com código existente
 */
export async function enlargePrompt(input: { 
  theme: string; 
  clientName: string; 
  targetAudience: string;
  client?: Client;
}) {
  const { client, ...basicInput } = input;
  
  // Se tiver cliente, usa a persona dele
  let systemPrompt = '';
  if (client) {
    const persona = await getPersonaWithCache(client.id);
    systemPrompt = persona?.system_prompt || generateCustomSystemPrompt(client);
  } else {
    systemPrompt = `Você é um engenheiro de prompts especialista em Midjourney e copywriting sênior.`;
  }

  const prompt = `${systemPrompt}

Transforme os seguintes dados básicos em descrições ultra-detalhadas:

Cliente: ${basicInput.clientName}
Tema: ${basicInput.theme}
Público: ${basicInput.targetAudience}

Retorne um JSON com:
{
  "expandedAudience": "descrição detalhada da persona, medos, desejos, rotina",
  "expandedTheme": "expansão criativa do tema com ganchos emocionais",
  "visualStyle": "descrição do estilo visual premium (iluminação, cores, mood)"
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      const openAiKey = process.env.OPENAI_API_KEY;
      if (openAiKey) {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
        });
        const aiData = await aiResponse.json();
        return JSON.parse(aiData.choices[0].message.content);
      }
      throw new Error(data.error.message);
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error enlarging prompt:', error);
    return null;
  }
}
