/**
 * @file app/api/calendar/generate/route.ts
 * @description API para geração de calendário editorial
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEditorialCalendar } from '@/lib/ai/service';
import { supabase } from '@/lib/supabase';
import { CalendarGenerationRequest } from '@/types/calendar';

export async function POST(request: NextRequest) {
  try {
    const body: CalendarGenerationRequest = await request.json();
    const { client_id, month, year, constraints, additionalContext } = body;

    if (!client_id || !month || !year) {
      return NextResponse.json(
        { error: 'Dados incompletos. client_id, month e year são obrigatórios.' },
        { status: 400 }
      );
    }

    // Busca dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Gera o calendário usando IA
    const result = await generateEditorialCalendar({
      client,
      constraints,
      month,
      year,
      additionalContext,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao gerar calendário' },
        { status: 500 }
      );
    }

    // Salva os itens no banco de dados
    const calendarItems = [];
    
    // Adiciona posts estáticos ao calendário
    if (result.staticPosts) {
      for (const post of result.staticPosts) {
        calendarItems.push({
          client_id,
          content_type: 'feed_static',
          funnel_stage: post.funnel_stage,
          title: post.title,
          copy: post.caption,
          hashtags: post.hashtags,
          visual_prompt: post.imagePrompt,
          status: 'rascunho',
        });
      }
    }

    // Adiciona carrosséis ao calendário
    if (result.carousels) {
      for (const carousel of result.carousels) {
        calendarItems.push({
          client_id,
          content_type: 'feed_carousel',
          funnel_stage: carousel.funnel_stage,
          title: carousel.topic,
          copy: carousel.caption,
          hashtags: carousel.hashtags,
          visual_prompt: JSON.stringify(carousel.slides),
          status: 'rascunho',
        });
      }
    }

    // Adiciona reels ao calendário
    if (result.reels) {
      for (const reel of result.reels) {
        calendarItems.push({
          client_id,
          content_type: 'feed_reel',
          funnel_stage: reel.funnel_stage,
          title: reel.title,
          copy: reel.caption,
          hashtags: reel.hashtags,
          visual_prompt: reel.visual_prompt,
          status: 'rascunho',
        });
      }
    }

    // Insere no banco
    if (calendarItems.length > 0) {
      const { error: insertError } = await supabase
        .from('content_calendar')
        .insert(calendarItems);

      if (insertError) {
        console.error('Erro ao salvar calendário:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      items_created: calendarItems.length,
    });

  } catch (error) {
    console.error('Erro na API de calendário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
