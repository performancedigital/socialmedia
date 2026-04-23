/**
 * @file types/content.ts
 * @description Tipos relacionados a conteúdo, funil e formatos
 */

export enum ContentType {
  FEED_STATIC = 'feed_static',
  FEED_CAROUSEL = 'feed_carousel',
  FEED_REEL = 'feed_reel',
  STORY_SINGLE = 'story_single',
  STORY_SEQUENCE = 'story_sequence',
  STORY_POLL = 'story_poll',
  STORY_QUESTION = 'story_question',
  STORY_QUIZ = 'story_quiz',
}

export enum FunnelStage {
  ATENCAO = 'atencao',       // Conteúdo viral/educativo - topo do funil
  INTERESSE = 'interesse',   // Cases/provas sociais - meio do funil
  DESEJO = 'desejo',         // Transformação/benefícios - fundo do funil
  ACAO = 'acao',             // CTA direto/promoções - conversão
}

export interface ContentItem {
  id: string;
  client_id: string;
  content_type: ContentType;
  funnel_stage: FunnelStage;
  title?: string;
  copy: string;
  hashtags?: string;
  visual_prompt?: string;
  image_url?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export enum ContentStatus {
  RASCUNHO = 'rascunho',
  AGENDADO = 'agendado',
  PUBLICADO = 'publicado',
  ARQUIVADO = 'arquivado',
}

export interface ScheduleItem {
  day: number;
  date: string;
  content_type: ContentType;
  funnel_stage: FunnelStage;
  theme: string;
  objective: string;
  copy?: string;
  visual_prompt?: string;
}

export interface StaticPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string;
  imagePrompt: string;
  funnel_stage: FunnelStage;
}

export interface CarouselSlide {
  slideNumber: number;
  text: string;
  visual_prompt?: string;
}

export interface Carousel {
  id: string;
  topic: string;
  slides: CarouselSlide[];
  caption: string;
  hashtags: string;
  funnel_stage: FunnelStage;
}

export interface Reel {
  id: string;
  title: string;
  script: string;
  hook: string;
  caption: string;
  hashtags: string;
  duration_seconds: number;
  visual_prompt?: string;
  funnel_stage: FunnelStage;
}

export interface Story {
  id: string;
  type: 'single' | 'sequence' | 'poll' | 'question' | 'quiz';
  content: string;
  visual_prompt?: string;
  interactive_elements?: {
    poll_options?: string[];
    question_sticker?: string;
    quiz_options?: { text: string; correct: boolean }[];
  };
  funnel_stage: FunnelStage;
}

export interface GenerationResult {
  schedule: ScheduleItem[];
  staticPosts: StaticPost[];
  carousels: Carousel[];
  reels?: Reel[];
  stories?: Story[];
}

export interface ContentConstraints {
  stories_per_day: number;
  reels_per_week: number;
  feeds_per_week: number;
  carousels_per_week?: number;
  funnel_distribution?: {
    atencao: number;
    interesse: number;
    desejo: number;
    acao: number;
  };
}

export const DEFAULT_CONSTRAINTS: ContentConstraints = {
  stories_per_day: 3,
  reels_per_week: 3,
  feeds_per_week: 2,
  carousels_per_week: 1,
  funnel_distribution: {
    atencao: 40,
    interesse: 30,
    desejo: 20,
    acao: 10,
  },
};

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  [FunnelStage.ATENCAO]: 'Atenção',
  [FunnelStage.INTERESSE]: 'Interesse',
  [FunnelStage.DESEJO]: 'Desejo',
  [FunnelStage.ACAO]: 'Ação',
};

export const FUNNEL_STAGE_COLORS: Record<FunnelStage, string> = {
  [FunnelStage.ATENCAO]: '#3b82f6',    // blue-500
  [FunnelStage.INTERESSE]: '#8b5cf6',  // violet-500
  [FunnelStage.DESEJO]: '#f59e0b',     // amber-500
  [FunnelStage.ACAO]: '#ef4444',       // red-500
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  [ContentType.FEED_STATIC]: 'Feed Estático',
  [ContentType.FEED_CAROUSEL]: 'Carrossel',
  [ContentType.FEED_REEL]: 'Reel',
  [ContentType.STORY_SINGLE]: 'Story',
  [ContentType.STORY_SEQUENCE]: 'Sequência',
  [ContentType.STORY_POLL]: 'Enquete',
  [ContentType.STORY_QUESTION]: 'Caixa de Perguntas',
  [ContentType.STORY_QUIZ]: 'Quiz',
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  [ContentType.FEED_STATIC]: 'image',
  [ContentType.FEED_CAROUSEL]: 'layers',
  [ContentType.FEED_REEL]: 'video',
  [ContentType.STORY_SINGLE]: 'circle',
  [ContentType.STORY_SEQUENCE]: 'list',
  [ContentType.STORY_POLL]: 'bar-chart',
  [ContentType.STORY_QUESTION]: 'help-circle',
  [ContentType.STORY_QUIZ]: 'check-circle',
};
