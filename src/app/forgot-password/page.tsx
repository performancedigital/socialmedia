"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border-white/10 shadow-2xl">
          <Link href="/login" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar para o Login
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold glow-text mb-2">Recuperar Senha</h1>
                <p className="text-gray-400 text-sm">Enviaremos um link de redefinição para o seu e-mail.</p>
              </div>

              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-indigo-300/60">E-mail Cadastrado</label>
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
                  {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={48} />
              <h2 className="text-xl font-bold text-white mb-2">E-mail Enviado!</h2>
              <p className="text-gray-400 text-sm mb-8">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <Link href="/login" className="btn-primary rounded-xl p-3 inline-flex items-center gap-2 text-sm font-bold w-full justify-center">
                Voltar para o Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
