import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme, clientName, instagram, days, targetAudience } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const systemPrompt = `Você é um estrategista de conteúdo sênior e copywriter extraordinário para Instagram.
Aja como uma ferramenta que cria 1 mês de conteúdo hiper-qualificado em segundos.
Cliente: ${clientName}
Instagram (Contexto): ${instagram}
Tema Principal: ${theme}
Público Alvo: ${targetAudience}
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error from Gemini API');
    }

    const textOutput = data.candidates[0].content.parts[0].text;
    
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch (e) {
      // Cleanup possible markdown formatting
      const cleanText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error generating copy:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
