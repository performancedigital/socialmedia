/**
 * @file ChatPanel.tsx
 * @description Componente de interface de chat para o Estrategista Performance Social Media.
 * Permite que o usuário faça brainstorming de campanhas com a IA.
 */

"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, Zap } from "lucide-react";

/**
 * Componente `ChatPanel` fornece uma interface de chat flutuante ou lateral.
 * 
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.formData - Dados atuais do formulário principal.
 * @param {Function} props.onApplyData - Função callback para aplicar sugestões da IA ao formulário principal.
 */
export default function ChatPanel({ formData, onApplyData }: { formData: any, onApplyData: (data: any) => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const startAnalysis = async () => {
    if (!formData.clientName || !formData.instagram) {
      alert("Por favor, preencha o Nome e o Instagram no formulário ao lado primeiro.");
      return;
    }

    const analysisPrompt = `Olá! Sou o Estrategista da Performance Social Media. Acabei de ver que você está trabalhando com o projeto "${formData.clientName}" (@${formData.instagram}). 

Gostaria que você fizesse uma análise estratégica inicial desse perfil, falasse sobre o nicho e sugerisse alguns temas poderosos para nossa campanha.`;

    setInput(analysisPrompt);
    // Trigger sendMessage immediately or just set input and let user click?
    // Let's automate it for better UX
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `❌ Erro: ${data.error}` }]);
        return;
      }

      if (data.choices?.[0]?.message) {
        setMessages([...newMessages, data.choices[0].message]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: "assistant", content: "❌ Falha crítica na conexão com o servidor de chat." }]);
    } finally {
      setLoading(false);
    }
  };

  const extractData = () => {
    // Basic extraction logic or just ask AI to format it
    // For now, let's just let the user copy paste or add a button "Extrair do Chat"
    // that calls another API or prompt
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Bot size={20} className="text-gray-400" />
        <h2 className="font-black text-xs uppercase tracking-widest text-black">ESTRATEGISTA DIGITAL</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-10 px-4">
            <Sparkles className="mx-auto mb-4 text-gray-200" size={48} />
            <p className="mb-6 text-xs font-medium uppercase tracking-widest leading-relaxed">Olá! Preencha os dados ao lado para uma análise estratégica completa.</p>
            <button 
              onClick={startAnalysis}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-black/10"
            >
              <Zap size={14} /> ANALISAR MEU PERFIL
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-gray-100 text-black rounded-tl-none border border-gray-50'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 input-glass rounded-xl px-4 py-3 text-sm outline-none"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
