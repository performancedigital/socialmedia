/**
 * @file route.ts
 * @description Rota de API para o Chat de Planejamento Estratégico.
 * Utiliza o modelo GPT-4o da OpenAI para auxiliar o usuário no brainstorming de campanhas.
 */

import { NextResponse } from 'next/server';

/**
 * Lida com requisições POST para conversação com o estrategista IA.
 * 
 * @param {Request} request - Objeto da requisição contendo o histórico de `messages`.
 * @returns {NextResponse} Resposta com a conclusão do chat da OpenAI.
 */
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um estrategista sênior de marketing digital. Seu objetivo é ajudar o usuário a definir o Tema, Público Alvo e Personas para campanhas de Instagram. Seja criativo, direto e ajude a refinar as ideias para que os prompts de imagem e texto sejam "ultra perfeitos".'
          },
          ...messages
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
