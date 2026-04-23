import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { messages, clientId } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API nao configurada' }, 
        { status: 500 }
      );
    }

    let clientContext = '';
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (client) {
        clientContext = `
Cliente: ${client.name}
Instagram: @${client.instagram_handle}
Nicho: ${client.niche}
Tom: ${client.voice_tone}
Publico: ${client.target_audience}
Pilares: ${client.content_pillars?.join(', ')}
`;
      }
    }

    const systemPrompt = `Voce e estrategista de marketing digital especialista em Instagram.
${clientContext}

Suas responsabilidades:
1. Dar conselhos praticos sobre estrategia de conteudo
2. Sugerir ideias criativas alinhadas ao nicho
3. Responder de forma direta e objetiva
4. Usar exemplos concretos

Regras:
- Respostas curtas (maximo 3 paragrafos)
- Use bullet points
- Seja profissional mas acessivel`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Erro OpenAI:', data.error);
      return NextResponse.json(
        { error: 'Erro na geracao da resposta' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro na API de chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
