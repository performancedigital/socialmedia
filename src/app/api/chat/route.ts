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
        model: 'gpt-4o', // Tenta gpt-4o primeiro
        messages: [
          {
            role: 'system',
            content: `Você é o Estrategista Sênior da Performance Social Media. Sua missão é transformar perfis comuns em máquinas de autoridade e vendas no Instagram.

Quando o usuário fornecer um Nome e @Instagram:
1. Simule uma análise de mercado para o nicho dele.
2. Fale sobre a importância de métricas como Seguidores e Postagens (mesmo que você precise estimar ou pedir para ele confirmar, mostre que você entende do jogo).
3. Identifique as "Dores" e "Desejos" da audiência desse nicho específico.
4. Sugira 3 pilares de conteúdo: Autoridade, Conexão e Venda.
5. Ajude-o a refinar o "Tema da Campanha" para que ele possa preencher o formulário principal com perfeição.

Seja direto, use um tom profissional, encorajador e focado em resultados. Use emojis moderadamente para manter o visual "social media".`
          },
          ...messages
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Chat API Route Error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor de chat.' }, { status: 500 });
  }
}
