/**
 * @file ai-service.ts
 * @description Centraliza as chamadas de IA para expansão de prompts e geração de conteúdo.
 */

/**
 * Enriquece e expande os inputs básicos do usuário em uma estratégia ultra-detalhada.
 * Esta função atua como uma camada de 'Prompt Engineering' automatizada.
 * 
 * @param {Object} input - Dados básicos fornecidos pelo usuário.
 * @param {string} input.theme - Tema da campanha.
 * @param {string} input.clientName - Nome do cliente.
 * @param {string} input.targetAudience - Público alvo básico.
 * 
 * @returns {Promise<Object|null>} Objeto com `expandedAudience`, `expandedTheme` e `visualStyle` ou null em caso de erro.
 */
export async function enlargePrompt(input: { theme: string, clientName: string, targetAudience: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const enlargementPrompt = `
    Como um engenheiro de prompts especialista em Midjourney e copywriting sênior, pegue os seguintes dados básicos e transforme-os em descrições ultra-detalhadas e realistas.
    
    Cliente: ${input.clientName}
    Tema: ${input.theme}
    Público: ${input.targetAudience}
    
    Retorne um JSON com:
    {
      "expandedAudience": "uma descrição de 2 parágrafos sobre a persona ideal, medos, desejos e rotina",
      "expandedTheme": "uma expansão criativa do tema com ganchos emocionais",
      "visualStyle": "descrição do estilo visual premium para as fotos (iluminação, cores, mood)"
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: enlargementPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await response.json();

    if (data.error) {
      console.warn("Gemini Enlarger falhou. Tentando OpenAI Fallback...");
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
            messages: [{ role: 'user', content: enlargementPrompt }],
            response_format: { type: "json_object" }
          })
        });
        const aiData = await aiResponse.json();
        return JSON.parse(aiData.choices[0].message.content);
      }
      throw new Error(data.error.message);
    }

    return JSON.parse(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Error enlarging prompt:", error);
    return null;
  }
}
