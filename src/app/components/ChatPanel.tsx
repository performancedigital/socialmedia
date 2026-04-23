"use client";

import { useState, useRef, useEffect } from "react";
import { useClient } from "@/lib/client-context";
import { Send, Bot, Loader2, Sparkles, Zap, Trash2, X } from "lucide-react";

interface ChatPanelProps {
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const { activeClient } = useClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startAnalysis = () => {
    if (!activeClient) {
      alert("Selecione um cliente primeiro.");
      return;
    }

    const prompt = `Analise o perfil @${activeClient.instagram_handle} (${activeClient.name}) no nicho ${activeClient.niche}. Forneca 3 ideias de conteudo.`;
    setInput(prompt);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeClient) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, clientId: activeClient.id }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Erro: ${data.error}` }]);
        return;
      }

      if (data.choices?.[0]?.message) {
        setMessages([...newMessages, {
          role: "assistant",
          content: data.choices[0].message.content
        }]);
      }
    } catch (error) {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Erro de conexao. Tente novamente." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Limpar mensagens?")) setMessages([]);
  };

  if (!activeClient) {
    return (
      <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex justify-between">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-gray-400" />
            <span className="font-bold text-sm">Estrategista IA</span>
          </div>
          {onClose && <button onClick={onClose}><X size={18} /></button>}
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <Sparkles className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500">Selecione um cliente para comecar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-200 shadow-xl">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: activeClient.brand_colors?.primary || '#000' }}
          >
            {activeClient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-sm">Estrategista IA</span>
            <p className="text-xs text-gray-400">{activeClient.name}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="mx-auto mb-4 text-gray-200" size={48} />
            <p className="text-gray-400 text-sm mb-4">Sou seu estrategista de conteudo.</p>
            
            <button 
              onClick={startAnalysis}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto"
            >
              <Zap size={16} /> 
              Analisar @{activeClient.instagram_handle}
            </button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-black text-white rounded-tr-none' 
                  : 'bg-gray-100 text-black rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-400">Pensando...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
        
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          IA especialista em {activeClient.niche}
        </p>
      </div>
    </div>
  );
}
