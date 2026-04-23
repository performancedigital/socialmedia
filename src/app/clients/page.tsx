/**
 * @file app/clients/page.tsx
 * @description Página de listagem de clientes
 */

"use client";

import { useClient } from "@/lib/client-context";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Plus, 
  AtSign, 
  Palette, 
  ArrowRight,
  Loader2
} from "lucide-react";

export default function ClientsPage() {
  const { clients, loading, setActiveClient } = useClient();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ff5500]" size={48} />
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
              Meus Clientes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie seus clientes e suas estratégias de conteúdo
            </p>
          </div>
          
          <button
            onClick={() => router.push('/clients/new')}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {clients.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} className="text-gray-400" />
            </div>
            
            <h2 className="text-xl font-bold text-black mb-2">Nenhum cliente ainda</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Comece adicionando seu primeiro cliente para criar estratégias de conteúdo personalizadas.
            </p>
            
            <button
              onClick={() => router.push('/clients/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5500] text-white rounded-xl font-bold hover:bg-[#ff5500]/90 transition-colors"
            >
              <Plus size={20} />
              Adicionar Primeiro Cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-[#ff5500]/30 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => {
                  setActiveClient(client);
                  router.push('/');
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                    style={{ backgroundColor: client.brand_colors?.primary || '#000' }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-lg truncate">{client.name}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <AtSign size={14} />
                      <span className="truncate">@{client.instagram_handle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                    {client.niche}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {client.voice_tone}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Palette size={14} className="text-gray-400" />
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: client.brand_colors?.primary }}
                      title="Primária"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: client.brand_colors?.secondary }}
                      title="Secundária"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  
                  <button className="flex items-center gap-1 text-[#ff5500] font-bold text-sm group-hover:gap-2 transition-all">
                    Acessar
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add New Card */}
            <button
              onClick={() => router.push('/clients/new')}
              className="rounded-2xl border-2 border-dashed border-gray-300 p-6 hover:border-[#ff5500] hover:bg-[#ff5500]/5 transition-all flex flex-col items-center justify-center gap-4 min-h-[240px]"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
              <span className="font-bold text-gray-500">Adicionar Novo Cliente</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
