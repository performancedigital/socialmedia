/**
 * @file lib/ai/personas.ts
 * @description Gerenciamento de personas de IA por cliente
 */

import { supabase } from '../supabase';
import { AIPersona, AIPersonaFormData, Client, DEFAULT_PERSONAS, NicheType } from '@/types/client';

/**
 * Busca a persona de IA de um cliente
 */
export async function getPersonaByClientId(clientId: string): Promise<AIPersona | null> {
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    console.error('Erro ao buscar persona:', error);
    return null;
  }

  return data as AIPersona;
}

/**
 * Cria uma nova persona para um cliente
 */
export async function createPersona(
  clientId: string, 
  personaData: AIPersonaFormData
): Promise<AIPersona | null> {
  const { data, error } = await supabase
    .from('ai_personas')
    .insert([{
      client_id: clientId,
      ...personaData,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar persona:', error);
    return null;
  }

  return data as AIPersona;
}

/**
 * Atualiza uma persona existente
 */
export async function updatePersona(
  personaId: string, 
  personaData: Partial<AIPersonaFormData>
): Promise<AIPersona | null> {
  const { data, error } = await supabase
    .from('ai_personas')
    .update({
      ...personaData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', personaId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar persona:', error);
    return null;
  }

  return data as AIPersona;
}

/**
 * Cria ou atualiza a persona de um cliente baseada no nicho
 * Usa os templates padrão definidos em DEFAULT_PERSONAS
 */
export async function setupDefaultPersona(
  clientId: string, 
  niche: NicheType
): Promise<AIPersona | null> {
  const existingPersona = await getPersonaByClientId(clientId);
  
  const defaultConfig = DEFAULT_PERSONAS[niche] || DEFAULT_PERSONAS.outro;
  
  const personaData: AIPersonaFormData = {
    system_prompt: defaultConfig.system_prompt || '',
    niche_expertise: defaultConfig.niche_expertise || 'Marketing Digital',
    examples: defaultConfig.examples || { good_examples: [] },
    model_preference: defaultConfig.model_preference || 'gemini',
    temperature: defaultConfig.temperature || 0.7,
    max_tokens: defaultConfig.max_tokens || 2000,
  };

  if (existingPersona) {
    return updatePersona(existingPersona.id, personaData);
  } else {
    return createPersona(clientId, personaData);
  }
}

/**
 * Gera um system prompt customizado baseado nos dados do cliente
 */
export function generateCustomSystemPrompt(client: Client): string {
  const pillars = client.content_pillars?.length 
    ? client.content_pillars.join(', ') 
    : 'Autoridade, Conexão, Venda';

  return `Você é uma especialista em marketing digital e estratégia de conteúdo para ${client.niche}.

CONTEXTO DO CLIENTE:
- Nome: ${client.name}
- Instagram: @${client.instagram_handle}
- Nicho: ${client.niche}
- Tom de voz: ${client.voice_tone}
- Público-alvo: ${client.target_audience}
- Pilares de conteúdo: ${pillars}

SUAS RESPONSABILIDADES:
1. Criar conteúdo estratégico que posicione ${client.name} como autoridade em ${client.niche}
2. Equilibrar os pilares de conteúdo: ${pillars}
3. Usar um tom de voz ${client.voice_tone} que conecte com ${client.target_audience}
4. Estruturar o conteúdo para o funil de vendas: Atenção → Interesse → Desejo → Ação
5. Criar copy persuasiva e prompts visuais detalhados para cada peça de conteúdo

DIRETRIZES:
- Sempre pense em como o conteúdo pode gerar engajamento E conversão
- Use gatilhos mentais apropriados para o nicho ${client.niche}
- Crie conteúdo que eduque, inspire e venda
- Mantenha consistência com a identidade da marca`;
}

/**
 * Cache de personas em memória (para performance)
 */
const personaCache: Map<string, { persona: AIPersona; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Busca persona com cache
 */
export async function getPersonaWithCache(clientId: string): Promise<AIPersona | null> {
  const cached = personaCache.get(clientId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.persona;
  }

  const persona = await getPersonaByClientId(clientId);
  
  if (persona) {
    personaCache.set(clientId, { persona, timestamp: Date.now() });
  }

  return persona;
}

/**
 * Limpa o cache de uma persona
 */
export function clearPersonaCache(clientId: string): void {
  personaCache.delete(clientId);
}
