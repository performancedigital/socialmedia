"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        alert("Cadastro realizado! Verifique seu e-mail para confirmar (se habilitado).");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass-panel p-12 rounded-[3rem] shadow-2xl border-white bg-white">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 12H16V20" stroke="currentColor" strokeWidth="2.5" />
                <path d="M12 4V12" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-black uppercase leading-tight">
              Performance <br />
              <span className="text-[#ff5500]">Digital</span>
            </h1>
            <p className="text-gray-400 text-[11px] uppercase tracking-[0.4em] mt-4 font-black">Intelligence Platform</p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            {!isLogin && (
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text" 
                    className="w-full input-glass rounded-2xl p-4 pl-12 text-sm outline-none border-2 border-gray-100 focus:border-[#2200ff]" 
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full input-glass rounded-2xl p-4 pl-12 text-sm outline-none border-2 border-gray-100 focus:border-[#2200ff]" 
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[11px] uppercase tracking-widest font-black text-black">Senha</label>
                {isLogin && (
                  <Link href="/forgot-password" className="text-[11px] text-[#ff5500] hover:underline font-black uppercase tracking-widest">
                    Esqueceu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="password" 
                  className="w-full input-glass rounded-2xl p-4 pl-12 text-sm outline-none border-2 border-gray-100 focus:border-[#2200ff]" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 text-red-600 text-[11px] font-black uppercase">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary mt-6 rounded-2xl p-5 flex justify-center items-center gap-3 text-sm font-black shadow-2xl transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              {isLogin ? "ACESSAR PLATAFORMA" : "CRIAR CONTA AGORA"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[12px] text-gray-500 hover:text-black font-black uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Novo aqui? Cadastre-se gratuitamente" : "Já é membro? Clique para entrar"}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-12 text-[10px] text-gray-400 uppercase tracking-[0.5em] font-black">
          © 2026 Performance Digital • Growth Excellence
        </p>
      </div>
    </div>
  );
}
