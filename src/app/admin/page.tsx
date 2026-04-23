"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Users, Shield, ArrowLeft, Loader2, Ban, CheckCircle, Search } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.role !== 'admin') {
        router.push("/");
      } else {
        fetchUsers();
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      alert(error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !currentStatus })
      .eq('id', userId);
    
    if (error) {
      alert(error.message);
    } else {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.includes(searchTerm)
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
            </Link>
            <h1 className="text-3xl font-bold glow-text flex items-center gap-3">
              <Shield className="text-indigo-400" size={32} />
              Painel Administrativo
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              className="w-full input-glass rounded-xl p-2.5 pl-10 text-sm" 
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-6">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-indigo-300/60">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Último Acesso</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{u.full_name || 'Usuário sem nome'}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{u.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">
                          <Ban size={10} /> Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle size={10} /> Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase ${u.role === 'admin' ? 'text-purple-400' : 'text-gray-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-gray-400">
                      {new Date(u.updated_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => toggleBlock(u.id, u.is_blocked)}
                          className={`p-2 rounded-lg transition-all ${
                            u.is_blocked 
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                          title={u.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
