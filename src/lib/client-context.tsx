/**
 * @file lib/client-context.tsx
 * @description Contexto para gerenciamento do cliente ativo
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Client } from '@/types/client';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

interface ClientContextType {
  clients: Client[];
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  loading: boolean;
  refreshClients: () => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client | null>;
  updateClient: (clientId: string, clientData: Partial<Client>) => Promise<Client | null>;
  deleteClient: (clientId: string) => Promise<boolean>;
}

const ClientContext = createContext<ClientContextType>({
  clients: [],
  activeClient: null,
  setActiveClient: () => {},
  loading: true,
  refreshClients: async () => {},
  createClient: async () => null,
  updateClient: async () => null,
  deleteClient: async () => false,
});

const STORAGE_KEY = '@performance:activeClientId';

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClientState] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega clientes do usuário
  const fetchClients = async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar clientes:', error);
      setLoading(false);
      return;
    }

    setClients(data || []);

    // Restaura cliente ativo do localStorage ou usa o primeiro
    const storedClientId = localStorage.getItem(STORAGE_KEY);
    if (storedClientId) {
      const stored = data?.find(c => c.id === storedClientId);
      if (stored) {
        setActiveClientState(stored);
      } else if (data?.length > 0) {
        setActiveClientState(data[0]);
        localStorage.setItem(STORAGE_KEY, data[0].id);
      }
    } else if (data?.length > 0) {
      setActiveClientState(data[0]);
      localStorage.setItem(STORAGE_KEY, data[0].id);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  // Atualiza cliente ativo e persiste
  const setActiveClient = (client: Client | null) => {
    setActiveClientState(client);
    if (client) {
      localStorage.setItem(STORAGE_KEY, client.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Cria novo cliente
  const createClient = async (clientData: Partial<Client>): Promise<Client | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id: user.id,
        ...clientData,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }

    await fetchClients();
    return data as Client;
  };

  // Atualiza cliente
  const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...clientData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }

    await fetchClients();
    
    // Atualiza cliente ativo se for o mesmo
    if (activeClient?.id === clientId) {
      setActiveClient(data as Client);
    }

    return data as Client;
  };

  // Deleta cliente
  const deleteClient = async (clientId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      return false;
    }

    await fetchClients();

    // Limpa cliente ativo se for o deletado
    if (activeClient?.id === clientId) {
      const remaining = clients.filter(c => c.id !== clientId);
      setActiveClient(remaining.length > 0 ? remaining[0] : null);
    }

    return true;
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        activeClient,
        setActiveClient,
        loading,
        refreshClients: fetchClients,
        createClient,
        updateClient,
        deleteClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => useContext(ClientContext);
