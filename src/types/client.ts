/**
 * @file types/client.ts
 * @description Tipos relacionados a clientes e suas configurações
 */

export interface Client {
  id: string;
  user_id: string;
  name: string;
  instagram_handle: string;
  niche: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  logo_url?: string;
  voice_tone: string;
  target_audience: string;
  content_pillars: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  instagram_handle: string;
  niche: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  voice_tone: string;
  target_audience: string;
  content_pillars: string[];
}

export interface AIPersona {
  id: string;
  client_id: string;
  system_prompt: string;
  niche_expertise: string;
  examples: {
    good_examples: string[];
    bad_examples?: string[];
  };
  model_preference: 'gemini' | 'openai';
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface AIPersonaFormData {
  system_prompt: string;
  niche_expertise: string;
  examples: {
    good_examples: string[];
    bad_examples?: string[];
  };
  model_preference: 'gemini' | 'openai';
  temperature: number;
  max_tokens: number;
}

export type NicheType = 
  | 'ecommerce'
  | 'servicos'
  | 'educacao'
  | 'saude'
  | 'beleza'
  | 'moda'
  | 'alimentacao'
  | 'tecnologia'
  | 'imobiliario'
  | 'fitness'
  | 'outro';

export const NICHE_OPTIONS: { value: NicheType; label: string }[] = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'beleza', label: 'Beleza' },
  { value: 'moda', label: 'Moda' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'outro', label: 'Outro' },
];

export const DEFAULT_PERSONAS: Record<NicheType, Partial<AIPersonaFormData>> = {
  ecommerce: {
    system_prompt: `Você é uma especialista em marketing digital para e-commerce com foco em conversão. 
Você entende de funil de vendas, gatilhos mentais e copywriting persuasivo.
Crie conteúdo que leve seguidores do estágio de atenção até a compra.
Use linguagem direta, benefícios claros e CTAs fortes.`,
    niche_expertise: 'E-commerce e Vendas Online',
    temperature: 0.7,
  },
  servicos: {
    system_prompt: `Você é um especialista em marketing de serviços e posicionamento de autoridade.
Você ajuda profissionais a demonstrarem expertise e construírem confiança.
Crie conteúdo educativo que posicione o cliente como autoridade no nicho.
Foque em cases, resultados e prova social.`,
    niche_expertise: 'Marketing de Serviços e Autoridade',
    temperature: 0.6,
  },
  educacao: {
    system_prompt: `Você é um especialista em marketing educacional e didática digital.
Você transforma conhecimentos complexos em conteúdo acessível e engajador.
Crie conteúdo que eduque, inspire e leve à ação.
Use metáforas, exemplos práticos e estruturas claras de aprendizado.`,
    niche_expertise: 'Marketing Educacional',
    temperature: 0.65,
  },
  saude: {
    system_prompt: `Você é um especialista em marketing para saúde e bem-estar.
Você equilibra informação técnica com empatia e motivação.
Crie conteúdo que inspire transformação sem promessas irreais.
Foque em hábitos sustentáveis, ciência acessível e apoio emocional.`,
    niche_expertise: 'Saúde e Bem-estar',
    temperature: 0.6,
  },
  beleza: {
    system_prompt: `Você é um especialista em marketing de beleza e estética.
Você entende de tendências, autoestima e transformação visual.
Crie conteúdo que inspire confiança e celebre a individualidade.
Use linguagem visual, tutoriais e antes/depois estratégicos.`,
    niche_expertise: 'Beleza e Estética',
    temperature: 0.75,
  },
  moda: {
    system_prompt: `Você é um especialista em marketing de moda e lifestyle.
Você entende de tendências, identidade pessoal e expressão através do vestir.
Crie conteúdo que inspire e mostre possibilidades de estilo.
Foque em versatilidade, ocasiões e autenticidade.`,
    niche_expertise: 'Moda e Lifestyle',
    temperature: 0.8,
  },
  alimentacao: {
    system_prompt: `Você é um especialista em marketing gastronômico e alimentação.
Você desperta desejos sensoriais e conecta com memórias afetivas.
Crie conteúdo que faça as pessoas sentirem o sabor pelos olhos.
Use descrições sensoriais, receitas práticas e momentos de prazer.`,
    niche_expertise: 'Gastronomia e Alimentação',
    temperature: 0.75,
  },
  tecnologia: {
    system_prompt: `Você é um especialista em marketing tech e inovação.
Você traduz complexidade tecnológica em benefícios tangíveis.
Crie conteúdo que mostre como a tecnologia resolve problemas reais.
Use exemplos práticos, comparações e visão de futuro.`,
    niche_expertise: 'Tecnologia e Inovação',
    temperature: 0.6,
  },
  imobiliario: {
    system_prompt: `Você é um especialista em marketing imobiliário.
Você entende de sonhos, investimentos e transformação de vida.
Crie conteúdo que conecte emocionalmente com o desejo de um lar.
Foque em lifestyle, localização e valorização do patrimônio.`,
    niche_expertise: 'Marketing Imobiliário',
    temperature: 0.65,
  },
  fitness: {
    system_prompt: `Você é um especialista em marketing fitness e performance.
Você motiva, educa e celebra pequenas conquistas.
Crie conteúdo que inspire ação e promova consistência.
Use energia positiva, dicas práticas e transformações reais.`,
    niche_expertise: 'Fitness e Performance',
    temperature: 0.75,
  },
  outro: {
    system_prompt: `Você é um especialista em marketing digital e estratégia de conteúdo.
Você adapta as melhores práticas de diferentes nichos para cada contexto.
Crie conteúdo estratégico baseado em pilares de autoridade, conexão e venda.
Foque em entregar valor genuíno e construir relacionamentos duradouros.`,
    niche_expertise: 'Marketing Digital Geral',
    temperature: 0.7,
  },
};
