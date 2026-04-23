"use client";

import { useState } from "react";
import { Sparkles, Calendar, Image as ImageIcon, Layers, Loader2, Send } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    clientName: "",
    instagram: "",
    theme: "",
    targetAudience: "",
    days: "30",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert("Erro ao gerar copys. Verifique o console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Form */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 glass-panel p-8 rounded-3xl flex flex-col h-fit">
        <div className="mb-8">
          <h1 className="text-3xl font-bold glow-text flex items-center gap-3">
            <Sparkles className="text-indigo-400" />
            NexusCopy
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            O gerador definitivo de conteúdo extraordinário em segundos.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">Nome do Cliente</label>
            <input 
              required
              type="text" 
              className="w-full input-glass rounded-xl p-3" 
              placeholder="Ex: Xikita Moda"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">Instagram (@)</label>
            <input 
              required
              type="text" 
              className="w-full input-glass rounded-xl p-3" 
              placeholder="Ex: @xikita.oficial"
              value={formData.instagram}
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">Tema do Mês</label>
            <input 
              required
              type="text" 
              className="w-full input-glass rounded-xl p-3" 
              placeholder="Ex: Lançamento Coleção Inverno"
              value={formData.theme}
              onChange={(e) => setFormData({...formData, theme: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">Público Alvo</label>
            <input 
              required
              type="text" 
              className="w-full input-glass rounded-xl p-3" 
              placeholder="Ex: Mulheres de 25-45 anos, mães"
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-200">Dias de Postagem</label>
            <input 
              required
              type="number" 
              className="w-full input-glass rounded-xl p-3" 
              placeholder="Ex: 30"
              value={formData.days}
              onChange={(e) => setFormData({...formData, days: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary mt-4 rounded-xl p-4 flex justify-center items-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {loading ? "Sintetizando Magia..." : "Gerar Mês Completo"}
          </button>
        </form>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 glass-panel rounded-3xl p-8 flex flex-col">
        {!result && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <Sparkles size={64} className="mb-6 text-indigo-500 animate-pulse" />
            <h2 className="text-2xl font-semibold mb-2">Pronto para a Mágica?</h2>
            <p className="max-w-md">
              Preencha os dados do seu cliente ao lado e deixe a IA gerar um mês inteiro de copys ultra-profissionais.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Loader2 size={64} className="mb-6 text-indigo-500 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2 animate-pulse glow-text">Analisando o Perfil...</h2>
            <p className="max-w-md text-gray-400">
              Gerando ganchos, prompts Midjourney, e estruturando carrosséis magnéticos. Isso levará alguns segundos.
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'schedule' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'hover:bg-white/5'}`}
              >
                <Calendar size={18} /> Cronograma
              </button>
              <button 
                onClick={() => setActiveTab('static')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'static' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'hover:bg-white/5'}`}
              >
                <ImageIcon size={18} /> Posts Estáticos
              </button>
              <button 
                onClick={() => setActiveTab('carousels')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'carousels' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'hover:bg-white/5'}`}
              >
                <Layers size={18} /> Carrosséis
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {activeTab === 'schedule' && (
                <div className="grid gap-4">
                  {result.schedule?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-4">
                      <div className="bg-indigo-500/20 text-indigo-300 p-3 rounded-lg font-bold min-w-[70px] text-center">
                        Dia {item.day}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{item.theme}</h3>
                        <p className="text-gray-400 text-sm mb-2"><span className="text-indigo-400">Formato:</span> {item.format}</p>
                        <p className="text-gray-300"><span className="text-indigo-400">Objetivo:</span> {item.objective}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'static' && (
                <div className="grid gap-6">
                  {result.staticPosts?.map((post: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-indigo-500/30 transition-all">
                      <h3 className="text-2xl font-bold text-white mb-4 glow-text">{post.title}</h3>
                      <div className="mb-4">
                        <h4 className="text-indigo-400 font-semibold mb-2">Legenda (Copy):</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{post.caption}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-indigo-400 font-semibold mb-2">Hashtags:</h4>
                        <p className="text-indigo-200">{post.hashtags}</p>
                      </div>
                      <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                        <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2"><ImageIcon size={16}/> Prompt Midjourney:</h4>
                        <p className="text-gray-400 font-mono text-sm">{post.imagePrompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'carousels' && (
                <div className="grid gap-8">
                  {result.carousels?.map((carousel: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-xl">
                      <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">{carousel.topic}</h3>
                      
                      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
                        {carousel.slides?.map((slide: any, sIdx: number) => (
                          <div key={sIdx} className="min-w-[280px] bg-black/40 border border-white/5 p-5 rounded-xl shrink-0">
                            <div className="text-indigo-400 font-bold mb-3">Slide {slide.slideNumber}</div>
                            <p className="text-white font-medium mb-4">{slide.text}</p>
                            <div className="text-xs text-gray-500 bg-white/5 p-2 rounded">
                              <span className="text-gray-400 block mb-1">Visual:</span>
                              {slide.visualContext}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-indigo-400 font-semibold mb-2">Legenda:</h4>
                        <p className="text-gray-300 mb-2">{carousel.caption}</p>
                        <p className="text-indigo-200 text-sm">{carousel.hashtags}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
