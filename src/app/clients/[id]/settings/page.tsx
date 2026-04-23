/**
 * @file app/clients/[id]/settings/page.tsx
 * @description Página de configurações do cliente
 */

"use client";

import { useState, useEffect } from "react";
import { useClient } from "@/lib/client-context";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  AtSign, 
  Palette, 
  Users, 
  Layers,
  Loader2,
  Check,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { NICHE_OPTIONS, NicheType, Client } from "@/types/client";

export default function ClientSettingsPage() {
  const { clients, updateClient, deleteClient, loading: clientsLoading } = useClient();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    instagram_handle: '',
    niche: 'outro' as NicheType,
    brand_colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#ff5500',
    },
    voice_tone: 'profissional',
    target_audience: '',
    content_pillars: ['', '', ''],
  });

  useEffect(() => {
    if (!clientsLoading) {
      const foundClient = clients.find(c => c.id === clientId);
      if (foundClient) {
        setClient(foundClient);
        setFormData({
          name: foundClient.name,
          instagram_handle: foundClient.instagram_handle,
          niche: foundClient.niche as NicheType,
          brand_colors: {
            primary: foundClient.brand_colors?.primary || '#000000',
            secondary: foundClient.brand_colors?.secondary || '#ffffff',
            accent: foundClient.brand_colors?.accent || '#ff5500',
          },
          voice_tone: foundClient.voice_tone,
          target_audience: foundClient.target_audience || '',
          content_pillars: foundClient.content_pillars?.length 
            ? [...foundClient.content_pillars, '', '', ''].slice(0, 3)
            : ['', '', ''],
        });
      }
      setLoading(false);
    }
  }, [clients, clientId, clientsLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await updateClient(clientId, {
        ...formData,
        instagram_handle: formData.instagram_handle.replace('@', ''),
        content_pillars: formData.content_pillars.filter(p => p.trim() !== ''),
      });

      if (updated) {
        alert('Cliente atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteClient(clientId);
    if (success) {
      router.push('/clients');
    } else {
      alert('Erro ao excluir cliente');
    }
  };

  const updatePillar = (index: number, value: string) => {
    const newPillars = [...formData.content_pillars];
    newPillars[index] = value;
    setFormData({ ...formData, content_pillars: newPillars });
  };

  if (loading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#ff5500]" size={48} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Cliente não encontrado</h2>
          <button
            onClick={() => router.push('/clients')}
            className="text-[#ff5500] font-bold hover:underline"
          >
            Voltar para lista de clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/clients')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              Configurações do Cliente
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Edite as informações de {client.name}
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-gray-100 p-8">
          {/* Informações Básicas */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 flex items-center justify-center">
                <Building2 className="text-[#ff5500]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Informações Básicas</h2>
                <p className="text-sm text-gray-500">Dados principais do cliente</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Nome do Cliente *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors"
                placeholder="Ex: Empresa XYZ"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Instagram @</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors"
                  placeholder="@empresaxyz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Nicho/Mercado *</label>
              <select
                required
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value as NicheType })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors bg-white"
              >
                {NICHE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Identidade Visual */}
          <div className="space-y-6 mb-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 flex items-center justify-center">
                <Palette className="text-[#ff5500]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Identidade Visual</h2>
                <p className="text-sm text-gray-500">Cores e tom de voz da marca</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, primary: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_colors.primary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, primary: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, secondary: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_colors.secondary}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, secondary: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Cor de Destaque</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_colors.accent}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, accent: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_colors.accent}
                    onChange={(e) => setFormData({
                      ...formData,
                      brand_colors: { ...formData.brand_colors, accent: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Tom de Voz</label>
              <select
                value={formData.voice_tone}
                onChange={(e) => setFormData({ ...formData, voice_tone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors bg-white"
              >
                <option value="profissional">Profissional</option>
                <option value="descontraido">Descontraído</option>
                <option value="formal">Formal</option>
                <option value="jovem">Jovem</option>
                <option value="autoritario">Autoritário</option>
                <option value="amigavel">Amigável</option>
              </select>
            </div>
          </div>

          {/* Estratégia de Conteúdo */}
          <div className="space-y-6 mb-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 flex items-center justify-center">
                <Layers className="text-[#ff5500]" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Estratégia de Conteúdo</h2>
                <p className="text-sm text-gray-500">Público e pilares de conteúdo</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Público-Alvo</label>
              <div className="relative">
                <Users className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors min-h-[100px] resize-none"
                  placeholder="Descreva o público-alvo: idade, interesses, dores, desejos..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Pilares de Conteúdo</label>
              <p className="text-xs text-gray-500 mb-3">3 temas principais que guiarão sua estratégia</p>
              
              {formData.content_pillars.map((pillar, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-400 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={pillar}
                    onChange={(e) => updatePillar(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#ff5500] outline-none transition-colors"
                    placeholder={`Pilar ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/clients')}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 rounded-3xl border-2 border-red-100 p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-lg font-bold text-red-700">Zona de Perigo</h2>
          </div>
          <p className="text-sm text-red-600 mb-4">
            A exclusão do cliente é irreversível. Todos os dados associados serão permanentemente removidos.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} />
            Excluir Cliente
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-black">Confirmar Exclusão</h2>
            </div>
            <p className="text-gray-500 mb-6">
              Tem certeza que deseja excluir <strong>{client.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
