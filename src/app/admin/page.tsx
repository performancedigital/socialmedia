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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-black transition-colors mb-6 group">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> VOLTAR AO PAINEL
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-black uppercase flex items-center gap-3">
              <Shield className="text-gray-400" size={32} />
              ADMINISTRAÇÃO
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              className="w-full input-glass rounded-2xl p-3 pl-11 text-sm outline-none" 
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-6">
          <div className="glass-panel rounded-[2rem] overflow-hidden border-gray-100 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  <th className="px-8 py-6">USUÁRIO</th>
                  <th className="px-8 py-6">STATUS</th>
                  <th className="px-8 py-6">ROLE</th>
                  <th className="px-8 py-6">ÚLTIMO ACESSO</th>
                  <th className="px-8 py-6 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">{u.full_name || 'Usuário sem nome'}</span>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{u.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-tighter">
                          <Ban size={10} /> BLOQUEADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                          <CheckCircle size={10} /> ATIVO
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'text-black' : 'text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-medium text-gray-400">
                      {new Date(u.updated_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => toggleBlock(u.id, u.is_blocked)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm ${
                            u.is_blocked 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
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
