/**
 * @file app/components/ClientSelector.tsx
 * @description Componente de seleção de cliente ativo
 */

"use client";

import { useState } from "react";
import { useClient } from "@/lib/client-context";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Settings, 
  LogOut,
  Check
} from "lucide-react";

export default function ClientSelector() {
  const { clients, activeClient, setActiveClient, loading } = useClient();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <div className="w-24 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <button
        onClick={() => router.push('/clients/new')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff5500] text-white text-sm font-bold hover:bg-[#ff5500]/90 transition-colors"
      >
        <Plus size={16} />
        Adicionar Cliente
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border-2 border-gray-100 hover:border-gray-200 transition-all"
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: activeClient?.brand_colors?.primary || '#000' }}
        >
          {activeClient?.name?.charAt(0).toUpperCase() || 'C'}
        </div>
        
        <div className="text-left hidden md:block">
          <p className="text-xs font-bold text-black leading-none">{activeClient?.name || 'Selecionar'}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">@{activeClient?.instagram_handle || 'cliente'}</p>
        </div>
        
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border-2 border-gray-100 shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                Seus Clientes
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setActiveClient(client);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors ${
                    activeClient?.id === client.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: client.brand_colors?.primary || '#000' }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-black">{client.name}</p>
                    <p className="text-[10px] text-gray-400">@{client.instagram_handle}</p>
                  </div>
                  
                  {activeClient?.id === client.id && (
                    <Check size={16} className="text-[#ff5500]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-gray-100 space-y-1">
              <button
                onClick={() => {
                  router.push('/clients/new');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <Plus size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Novo Cliente</span>
              </button>
              
              {activeClient && (
                <button
                  onClick={() => {
                    router.push(`/clients/${activeClient.id}/settings`);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Configurações</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  router.push('/clients');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <Building2 size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Ver Todos</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
