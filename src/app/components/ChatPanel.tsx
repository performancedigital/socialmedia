/**
 * @file ChatPanel.tsx
 * @description Componente de interface de chat para o Estrategista Nexus.
 * Permite que o usuário faça brainstorming de campanhas com a IA.
 */

"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

/**
 * Componente `ChatPanel` fornece uma interface de chat flutuante ou lateral.
 * 
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onApplyData - Função callback para aplicar sugestões da IA ao formulário principal.
 */
export default function ChatPanel({ onApplyData }: { onApplyData: (data: any) => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      
      if (data.choices?.[0]?.message) {
        setMessages([...newMessages, data.choices[0].message]);
      }
    } catch (error) {
      console.error("Chat error:", error);
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
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden border-indigo-500/20">
      <div className="p-4 border-b border-white/10 bg-indigo-500/10 flex items-center gap-2">
        <Bot size={20} className="text-indigo-400" />
        <h2 className="font-bold text-indigo-100">Estrategista Nexus</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <Sparkles className="mx-auto mb-4 opacity-20" size={48} />
            <p>Olá! Vamos planejar sua próxima campanha extraordinária?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 input-glass rounded-xl px-4 py-2 text-sm"
            placeholder="Pergunte algo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="bg-indigo-600 p-2 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
