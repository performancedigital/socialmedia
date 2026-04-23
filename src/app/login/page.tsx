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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass-panel p-8 rounded-3xl border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 mx-auto mb-4">
              <Sparkles size={32} />
            </div>
            <h1 className="text-2xl font-bold glow-text">Performance</h1>
            <p className="text-gray-400 text-sm mt-1">Social Media SaaS</p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-indigo-300/60">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    required
                    type="text" 
                    className="w-full input-glass rounded-xl p-2.5 pl-10 text-sm" 
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-indigo-300/60">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  required
                  type="email" 
                  className="w-full input-glass rounded-xl p-2.5 pl-10 text-sm" 
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-indigo-300/60">Senha</label>
                {isLogin && (
                  <Link href="/forgot-password" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors">
                    Esqueceu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  required
                  type="password" 
                  className="w-full input-glass rounded-xl p-2.5 pl-10 text-sm" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary mt-4 rounded-xl p-3 flex justify-center items-center gap-2 text-sm font-bold"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {isLogin ? "Entrar na Plataforma" : "Criar Minha Conta"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre aqui"}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          © 2026 Performance Social Media. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
