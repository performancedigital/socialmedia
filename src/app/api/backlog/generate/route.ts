/**
 * @file app/api/backlog/generate/route.ts
 * @description API para gerar conteúdo a partir de itens do backlog
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBacklogContent } from '@/lib/ai/service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { client_id, backlog_id } = await request.json();

    if (!client_id || !backlog_id) {
      return NextResponse.json(
        { error: 'client_id e backlog_id são obrigatórios' },
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

    // Busca o item do backlog
    const { data: backlogItem, error: backlogError } = await supabase
      .from('backlog_items')
      .select('*')
      .eq('id', backlog_id)
      .single();

    if (backlogError || !backlogItem) {
      return NextResponse.json(
        { error: 'Item do backlog não encontrado' },
        { status: 404 }
      );
    }

    // Gera conteúdo usando IA
    const result = await generateBacklogContent({
      client,
      backlogTitle: backlogItem.title,
      description: backlogItem.description,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao gerar conteúdo' },
        { status: 500 }
      );
    }

    // Cria os itens no calendário
    const calendarItems = [];

    if (result.staticPosts) {
      for (const post of result.staticPosts) {
        calendarItems.push({
          client_id,
          content_type: 'feed_static',
          funnel_stage: post.funnel_stage || 'atencao',
          title: post.title,
          copy: post.caption,
          hashtags: post.hashtags,
          visual_prompt: post.imagePrompt,
          status: 'rascunho',
        });
      }
    }

    if (result.carousels) {
      for (const carousel of result.carousels) {
        calendarItems.push({
          client_id,
          content_type: 'feed_carousel',
          funnel_stage: carousel.funnel_stage || 'interesse',
          title: carousel.topic,
          copy: carousel.caption,
          hashtags: carousel.hashtags,
          visual_prompt: JSON.stringify(carousel.slides),
          status: 'rascunho',
        });
      }
    }

    if (result.reels) {
      for (const reel of result.reels) {
        calendarItems.push({
          client_id,
          content_type: 'feed_reel',
          funnel_stage: reel.funnel_stage || 'desejo',
          title: reel.title,
          copy: reel.caption,
          hashtags: reel.hashtags,
          visual_prompt: reel.visual_prompt,
          status: 'rascunho',
        });
      }
    }

    // Insere no calendário
    if (calendarItems.length > 0) {
      const { data: insertedItems, error: insertError } = await supabase
        .from('content_calendar')
        .insert(calendarItems)
        .select();

      if (insertError) {
        console.error('Erro ao salvar no calendário:', insertError);
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo gerado' },
          { status: 500 }
        );
      }

      // Atualiza o backlog item
      await supabase
        .from('backlog_items')
        .update({ 
          status: 'pronto',
          updated_at: new Date().toISOString(),
        })
        .eq('id', backlog_id);

      return NextResponse.json({
        success: true,
        data: result,
        calendar_items: insertedItems,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Erro na API de backlog:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
