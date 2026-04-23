/**
 * @file types/calendar.ts
 * @description Tipos relacionados ao calendário editorial
 */

import { ContentType, FunnelStage, ContentStatus } from './content';

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  items: CalendarItem[];
}

export interface CalendarItem {
  id: string;
  client_id: string;
  content_type: ContentType;
  funnel_stage: FunnelStage;
  title: string;
  copy?: string;
  visual_prompt?: string;
  image_url?: string;
  scheduled_time?: string;
  status: ContentStatus;
  order: number;
}

export interface CalendarViewProps {
  clientId: string;
  month: number;
  year: number;
  onItemClick?: (item: CalendarItem) => void;
  onDayClick?: (date: string) => void;
  onItemMove?: (itemId: string, newDate: string) => void;
}

export interface BacklogItem {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  suggested_funnel_stage?: FunnelStage;
  suggested_content_type?: ContentType;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_producao' | 'pronto' | 'agendado';
  theme_ideas?: string[];
  reference_links?: string[];
  created_at: string;
  updated_at: string;
  scheduled_date?: string;
}

export interface BacklogFormData {
  title: string;
  description?: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  theme_ideas?: string[];
  reference_links?: string[];
}

export interface CalendarGenerationRequest {
  client_id: string;
  month: number;
  year: number;
  constraints: {
    stories_per_day: number;
    reels_per_week: number;
    feeds_per_week: number;
    carousels_per_week?: number;
    funnel_distribution: {
      atencao: number;
      interesse: number;
      desejo: number;
      acao: number;
    };
  };
  exclude_weekends?: boolean;
  focus_dates?: string[];
  additionalContext?: string;
}

export interface FunnelMetrics {
  total_items: number;
  by_stage: {
    atencao: number;
    interesse: number;
    desejo: number;
    acao: number;
  };
  by_type: {
    feed: number;
    story: number;
    reel: number;
    carousel: number;
  };
  distribution_percentage: {
    atencao: number;
    interesse: number;
    desejo: number;
    acao: number;
  };
  recommendations: string[];
}
