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
  loading: false,
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
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Tabela clients nao encontrada ou erro:', error.message);
        setClients([]);
        setLoading(false);
        return;
      }

      const clientList = data || [];
      setClients(clientList);

      if (clientList.length > 0) {
        let storedId: string | null = null;
        try {
          storedId = localStorage.getItem(STORAGE_KEY);
        } catch (e) {}

        const stored = storedId ? clientList.find(c => c.id === storedId) : null;
        const selected = stored || clientList[0];
        setActiveClientState(selected);
        try { localStorage.setItem(STORAGE_KEY, selected.id); } catch (e) {}
      }
    } catch (err) {
      console.warn('Erro ao buscar clientes:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    } else {
      setClients([]);
      setActiveClientState(null);
      setLoading(false);
    }
  }, [user]);

  const setActiveClient = (client: Client | null) => {
    setActiveClientState(client);
    try {
      if (client) {
        localStorage.setItem(STORAGE_KEY, client.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  };

  const createClient = async (clientData: Partial<Client>): Promise<Client | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ user_id: user.id, ...clientData }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        return null;
      }

      await fetchClients();
      return data as Client;
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      return null;
    }
  };

  const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<Client | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...clientData, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        return null;
      }

      await fetchClients();
      if (activeClient?.id === clientId) setActiveClient(data as Client);
      return data as Client;
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      return null;
    }
  };

  const deleteClient = async (clientId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) {
        console.error('Erro ao deletar:', error);
        return false;
      }

      if (activeClient?.id === clientId) {
        const remaining = clients.filter(c => c.id !== clientId);
        setActiveClient(remaining.length > 0 ? remaining[0] : null);
      }
      await fetchClients();
      return true;
    } catch (err) {
      console.error('Erro ao deletar:', err);
      return false;
    }
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
