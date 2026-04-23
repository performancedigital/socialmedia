/**
 * @file app/backlog/page.tsx
 * @description Página de gestão de backlog (posts pendentes)
 */

"use client";

import { useState, useEffect } from "react";
import { useClient } from "@/lib/client-context";
import { supabase } from "@/lib/supabase";
import { BacklogItem, BacklogFormData } from "@/types/calendar";
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Play, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  X
} from "lucide-react";

const PRIORITY_COLORS = {
  baixa: 'bg-gray-100 text-gray-600',
  media: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-600',
  urgente: 'bg-red-100 text-red-600',
};

const STATUS_ICONS = {
  pendente: Clock,
  em_producao: Loader2,
  pronto: CheckCircle,
  agendado: Calendar,
};

export default function BacklogPage() {
  const { activeClient } = useClient();
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BacklogFormData>({
    title: '',
    description: '',
    priority: 'media',
    theme_ideas: [],
    reference_links: [],
  });

  useEffect(() => {
    if (activeClient) {
      fetchBacklog();
    }
  }, [activeClient]);

  const fetchBacklog = async () => {
    if (!activeClient) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('backlog_items')
      .select('*')
      .eq('client_id', activeClient.id)
      .order('created_at', { ascending: false });
    
    setBacklogItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    const { error } = await supabase
      .from('backlog_items')
      .insert([{
        client_id: activeClient.id,
        ...formData,
      }]);

    if (error) {
      console.error('Erro ao criar item:', error);
      alert('Erro ao criar item');
      return;
    }

    setFormData({
      title: '',
      description: '',
      priority: 'media',
      theme_ideas: [],
      reference_links: [],
    });
    setShowForm(false);
    fetchBacklog();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const { error } = await supabase
      .from('backlog_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
      return;
    }

    fetchBacklog();
  };

  const generateContent = async (item: BacklogItem) => {
    if (!activeClient) return;
    
    setGenerating(item.id);
    
    try {
      const response = await fetch('/api/backlog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: activeClient.id,
          backlog_id: item.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Conteúdo gerado com sucesso! Verifique o calendário.');
        fetchBacklog();
      } else {
        alert('Erro ao gerar conteúdo: ' + data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar conteúdo');
    } finally {
      setGenerating(null);
    }
  };

  if (!activeClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Nenhum cliente selecionado</h2>
          <p className="text-gray-500">Selecione um cliente para gerenciar o backlog</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              Backlog de Conteúdo
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeClient.name} • Gerencie posts pendentes e atrasados
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors"
          >
            <Plus size={20} />
            Adicionar Item
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: backlogItems.length, color: 'bg-gray-100' },
            { label: 'Pendentes', value: backlogItems.filter(i => i.status === 'pendente').length, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Em Produção', value: backlogItems.filter(i => i.status === 'em_producao').length, color: 'bg-blue-100 text-blue-700' },
            { label: 'Prontos', value: backlogItems.filter(i => i.status === 'pronto').length, color: 'bg-green-100 text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-2xl p-4`}>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Novo Item no Backlog</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Título *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none"
                    placeholder="Ex: 12 posts sobre lançamento de produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none min-h-[100px] resize-none"
                    placeholder="Detalhes sobre o que precisa ser criado..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none bg-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Backlog List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#ff5500]" size={32} />
          </div>
        ) : backlogItems.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 text-center">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Backlog vazio</h2>
            <p className="text-gray-500 mb-6">Adicione posts pendentes para organizar sua produção</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90"
            >
              Adicionar Primeiro Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {backlogItems.map((item) => {
              const StatusIcon = STATUS_ICONS[item.status];
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-[#ff5500]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority.toUpperCase()}
                        </span>
                        
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <StatusIcon size={12} />
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                      
                      {item.description && (
                        <p className="text-sm text-gray-500 mb-4">{item.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {item.status === 'pendente' && (
                        <button
                          onClick={() => generateContent(item)}
                          disabled={generating === item.id}
                          className="flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white rounded-xl font-bold text-sm hover:bg-[#ff5500]/90 disabled:opacity-50"
                        >
                          {generating === item.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              Gerar
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
