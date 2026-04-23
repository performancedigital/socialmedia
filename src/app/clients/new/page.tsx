/**
 * @file app/clients/new/page.tsx
 * @description Página de cadastro de novo cliente
 */

"use client";

import { useState } from "react";
import { useClient } from "@/lib/client-context";
import { useRouter } from "next/navigation";
import { setupDefaultPersona } from "@/lib/ai/personas";
import { NICHE_OPTIONS, NicheType } from "@/types/client";
import { 
  ArrowLeft, 
  Building2, 
  AtSign, 
  Palette, 
  Users, 
  Layers,
  Loader2,
  Check
} from "lucide-react";

export default function NewClientPage() {
  const { createClient } = useClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Cria o cliente
      const client = await createClient({
        ...formData,
        instagram_handle: formData.instagram_handle.replace('@', ''),
        content_pillars: formData.content_pillars.filter(p => p.trim() !== ''),
      });

      if (client) {
        // Cria a persona padrão baseada no nicho
        await setupDefaultPersona(client.id, formData.niche);
        
        router.push('/clients');
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const updatePillar = (index: number, value: string) => {
    const newPillars = [...formData.content_pillars];
    newPillars[index] = value;
    setFormData({ ...formData, content_pillars: newPillars });
  };

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
              Novo Cliente
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure um novo cliente para começar a criar conteúdo
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-gray-100 p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-[#ff5500]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
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

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="w-full py-4 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Criar Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
