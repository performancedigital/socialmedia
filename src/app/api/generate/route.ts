/**
 * @file route.ts
 * @description Esta rota da API (Next.js App Router) é responsável por receber os dados do formulário
 * do painel NexusCopy e se comunicar com a API do Google Gemini para gerar o conteúdo das redes sociais.
 * A rota atua como um intermediário seguro, garantindo que as chaves da API não sejam expostas ao cliente (frontend).
 */

import { NextResponse } from 'next/server';
import { enlargePrompt } from '@/lib/ai-service';

/**
 * Lida com as requisições POST para gerar copys usando Inteligência Artificial.
 * 
 * Esta função executa um fluxo de duas etapas:
 * 1. Enriquecimento: Usa o serviço `enlargePrompt` para expandir os dados básicos.
 * 2. Geração: Usa o Gemini para criar o cronograma completo de 30 dias com base nos dados enriquecidos.
 * 
 * @param {Request} request - O objeto de requisição recebido do cliente.
 * 
 * Espera-se que o corpo (body) da requisição seja um JSON contendo:
 * - `theme` (string): O tema principal da campanha.
 * - `clientName` (string): O nome da empresa/cliente.
 * - `instagram` (string): O @ do instagram ou contexto do perfil.
 * - `days` (number/string): A quantidade de dias para o cronograma.
 * - `targetAudience` (string): O público alvo da campanha.
 * 
 * @returns {NextResponse} Uma resposta JSON contendo o objeto de copys geradas
 * (`schedule`, `staticPosts`, `carousels`) ou um objeto de erro com status 500.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme, clientName, instagram, days, targetAudience } = body;

    // Etapa de Enriquecimento (Prompt Engineering Automatizado)
    const enrichedData = await enlargePrompt({ theme, clientName, targetAudience });
    
    const finalAudience = enrichedData?.expandedAudience || targetAudience;
    const finalTheme = enrichedData?.expandedTheme || theme;
    const visualMood = enrichedData?.visualStyle || "Premium, Professional, Instagram Optimized";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const systemPrompt = `Você é um estrategista de conteúdo sênior e copywriter extraordinário para Instagram.
Aja como uma ferramenta que cria 1 mês de conteúdo hiper-qualificado em segundos.
Cliente: ${clientName}
Instagram (Contexto): ${instagram}
Tema Expandido: ${finalTheme}
Persona Detalhada: ${finalAudience}
Estilo Visual Requerido: ${visualMood}
Dias de Cronograma: ${days}

Crie um cronograma extraordinário com:
1. Copys para posts estáticos (imagem única) focados em conversão e engajamento.
2. Copys para Carrosséis (separados por slide: Hook, Retenção, CTA).
3. Um cronograma dia a dia sugerindo quando postar cada conteúdo.
4. Prompts ultra-realistas em inglês (estilo Midjourney/DALL-E) para gerar as imagens de cada post.

Você deve responder ESTRITAMENTE no seguinte formato JSON (e nada mais, sem markdown, apenas o JSON válido):
{
  "schedule": [
    { "day": 1, "format": "Static ou Carousel", "theme": "...", "objective": "..." }
  ],
  "staticPosts": [
    { "title": "...", "caption": "...", "hashtags": "...", "imagePrompt": "..." }
  ],
  "carousels": [
    { 
      "topic": "...",
      "slides": [
        { "slideNumber": 1, "text": "...", "visualContext": "..." }
      ],
      "caption": "...",
      "hashtags": "..."
    }
  ]
}`;

    // Tenta primeiro com Gemini
    let data;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      });
      data = await response.json();
    } catch (err) {
      console.error('Gemini Fetch Error:', err);
    }

    // Fallback para OpenAI se o Gemini falhar (ex: chave bloqueada/leaked)
    if (!data || data.error) {
      console.warn('Gemini falhou ou chave bloqueada. Tentando fallback com OpenAI...');
      const openAiKey = process.env.OPENAI_API_KEY;
      if (openAiKey) {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: "json_object" }
          })
        });
        const aiData = await aiResponse.json();
        if (aiData.choices?.[0]?.message?.content) {
          return NextResponse.json(JSON.parse(aiData.choices[0].message.content));
        }
      }
      
      // Se nem o fallback funcionar, retorna o erro original do Gemini
      throw new Error(data?.error?.message || 'Falha na geração (Gemini & OpenAI indisponíveis)');
    }

    const textOutput = data.candidates[0].content.parts[0].text;
    
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch (e) {
      const cleanText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error generating copy:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
