import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI Image Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.data[0].url });

  } catch (error: any) {
    console.error('Image API Route Error:', error);
    return NextResponse.json({ error: 'Erro ao gerar imagem.' }, { status: 500 });
  }
}
