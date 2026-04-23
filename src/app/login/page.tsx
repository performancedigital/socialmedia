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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass-panel p-10 rounded-[2.5rem] shadow-xl border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <div className="w-8 h-8 border-4 border-white transform rotate-45"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">Performance <span className="font-light text-gray-500">Digital</span></h1>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-2 font-medium">Marketing Strategy Platform</p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            {!isLogin && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-400">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    required
                    type="text" 
                    className="w-full input-glass rounded-2xl p-3 pl-11 text-sm outline-none" 
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-gray-400">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  required
                  type="email" 
                  className="w-full input-glass rounded-2xl p-3 pl-11 text-sm outline-none" 
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400">Senha</label>
                {isLogin && (
                  <Link href="/forgot-password" size={16} className="text-[10px] text-black hover:underline font-bold uppercase tracking-widest transition-colors">
                    Esqueceu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  required
                  type="password" 
                  className="w-full input-glass rounded-2xl p-3 pl-11 text-sm outline-none" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-[11px] font-bold uppercase tracking-tighter">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary mt-4 rounded-2xl p-4 flex justify-center items-center gap-2 text-sm font-bold shadow-lg shadow-black/10"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {isLogin ? "ACESSAR PLATAFORMA" : "CRIAR CONTA AGORA"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] text-gray-400 hover:text-black font-bold uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Novo aqui? Cadastre-se gratuitamente" : "Já é membro? Clique para entrar"}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[9px] text-gray-400 uppercase tracking-[0.4em] font-medium">
          © 2026 Performance Digital • Intelligence & Growth
        </p>
      </div>
    </div>
  );
}
