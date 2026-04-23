"use client";

import { useState, useEffect } from "react";
import { Sparkles, Calendar, Image as ImageIcon, Layers, Loader2, Send, MessageSquare, Settings, Zap, Download, Copy, Check, LogOut, User as UserIcon, History } from "lucide-react";
import ChatPanel from "./components/ChatPanel";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

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
  const [showChat, setShowChat] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchHistory();
    }
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, content_generations(*)')
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory(data || []);
  };

  const loadFromHistory = (project: any) => {
    setFormData({
      clientName: project.client_name,
      instagram: project.instagram,
      theme: project.theme,
      targetAudience: project.target_audience,
      days: project.days,
    });
    if (project.content_generations?.[0]) {
      setResult(project.content_generations[0].content);
    }
    setShowHistory(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadCSV = () => {
    if (!result) return;
    
    let csv = "Dia,Formato,Tema,Objetivo\n";
    result.schedule?.forEach((item: any) => {
      csv += `${item.day},"${item.format}","${item.theme}","${item.objective}"\n`;
    });
    
    csv += "\nPOSTS ESTÁTICOS\nTitulo,Legenda,Hashtags,Prompt de Imagem\n";
    result.staticPosts?.forEach((post: any) => {
      csv += `"${post.title}","${post.caption.replace(/"/g, '""')}","${post.hashtags}","${post.imagePrompt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cronograma-${formData.clientName || 'social-media'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateImage = async (prompt: string, id: string) => {
    setGeneratingImage(id);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageUrls(prev => ({ ...prev, [id]: data.url }));
    } catch (err: any) {
      alert(`Erro ao gerar imagem: ${err.message}`);
    } finally {
      setGeneratingImage(null);
    }
  };

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

      if (user) {
        const { data: project } = await supabase
          .from('projects')
          .insert([{
            user_id: user.id,
            client_name: formData.clientName,
            instagram: formData.instagram,
            theme: formData.theme,
            target_audience: formData.targetAudience,
            days: formData.days
          }])
          .select()
          .single();

        if (project) {
          await supabase
            .from('content_generations')
            .insert([{
              project_id: project.id,
              user_id: user.id,
              content: data
            }]);
          fetchHistory();
        }
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-black" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Professional Header */}
      <header className="glass-panel px-8 py-4 flex justify-between items-center shrink-0 border-b-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-black flex items-center justify-center rounded-xl shadow-lg transform hover:rotate-3 transition-transform">
            {/* Brand Icon SVG - Styled based on user image */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2.5" />
              <path d="M4 12H16V20" stroke="currentColor" strokeWidth="2.5" />
              <path d="M12 4V12" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter text-black uppercase leading-none">
              Performance <span className="text-[#ff5500]">Digital</span>
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Growth & Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:text-black transition-all text-xs font-bold"
          >
            <History size={14} /> Histórico
          </button>

          <div className="hidden md:flex items-center gap-3 pr-6 border-r border-gray-200">
            <div className="text-right">
              <p className="text-xs font-bold text-black leading-none">{profile?.full_name || user.email}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{profile?.role === 'admin' ? 'Administrador' : 'Membro Premium'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
              <UserIcon size={16} />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-gray-500">
            {profile?.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors">
                Admin
              </button>
            )}
            <button onClick={signOut} className="hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              Sair <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row-reverse gap-6 h-[calc(100vh-72px)] overflow-hidden">
        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden border-gray-100 shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  PROJETOS RECENTES
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-black transition-colors">
                  <Check size={20} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-6 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-medium">
                    Nenhum projeto salvo ainda.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {history.map((project: any) => (
                      <div 
                        key={project.id} 
                        onClick={() => loadFromHistory(project)}
                        className="bg-gray-50 border border-gray-100 p-4 rounded-2xl hover:bg-white hover:border-black transition-all cursor-pointer group flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-bold text-black group-hover:text-black transition-colors">{project.client_name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">@{project.instagram} • {project.theme}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase">{new Date(project.created_at).toLocaleDateString('pt-BR')}</p>
                          <span className="text-[10px] text-black font-black uppercase mt-1 block tracking-tighter">Carregar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Sidebar - Form */}
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 overflow-y-auto pr-2 shrink-0">
          <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col h-fit border-2 border-gray-100 shadow-xl bg-white">
            <div className="mb-10">
              <h1 className="text-2xl font-black tracking-tighter text-black uppercase flex items-center gap-3">
                <Sparkles className="text-[#ff5500]" size={24} />
                ESTRATÉGIA
              </h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Marketing Intelligence</p>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Cliente / Projeto</label>
                <input 
                  required
                  type="text" 
                  className="w-full input-glass rounded-2xl p-4 text-sm border-2 border-gray-100 focus:border-[#2200ff] outline-none font-bold" 
                  placeholder="Nome do cliente"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Perfil (@)</label>
                <input 
                  required
                  type="text" 
                  className="w-full input-glass rounded-2xl p-4 text-sm border-2 border-gray-100 focus:border-[#2200ff] outline-none font-bold" 
                  placeholder="@usuario"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Tema da Campanha</label>
                <input 
                  required
                  type="text" 
                  className="w-full input-glass rounded-2xl p-4 text-sm border-2 border-gray-100 focus:border-[#2200ff] outline-none font-bold" 
                  placeholder="Ex: Lançamento de Inverno"
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Público Alvo</label>
                <input 
                  required
                  type="text" 
                  className="w-full input-glass rounded-2xl p-4 text-sm border-2 border-gray-100 focus:border-[#2200ff] outline-none font-bold" 
                  placeholder="Quem deve ver os posts?"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-widest font-black mb-3 text-black">Dias</label>
                  <input 
                    required
                    type="number" 
                    className="w-full input-glass rounded-2xl p-4 text-sm border-2 border-gray-100 font-bold" 
                    value={formData.days}
                    onChange={(e) => setFormData({...formData, days: e.target.value})}
                  />
                </div>
                <div className="flex-1 flex items-end">
                  <button 
                    type="button"
                    onClick={() => setShowChat(!showChat)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all text-[11px] font-black uppercase tracking-tighter ${
                      showChat ? 'bg-[#2200ff] border-[#2200ff] text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-black hover:text-black shadow-sm'
                    }`}
                  >
                    <MessageSquare size={16} /> {showChat ? 'FECHAR' : 'CHAT AI'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary mt-4 rounded-2xl p-5 flex justify-center items-center gap-3 text-sm font-black shadow-2xl transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {loading ? "SINTETIZANDO..." : "GERAR MÊS COMPLETO"}
              </button>
            </form>
          </div>
          
          <div className="glass-panel p-4 rounded-2xl flex flex-col gap-2 border-purple-500/10">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Nano Banana Engine</h3>
            <p className="text-[11px] text-gray-500">Modelo de geração de imagens do Google Studio ativo para prompts visuais.</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className={`flex-1 glass-panel rounded-3xl p-6 flex flex-col overflow-hidden transition-all duration-500`}>
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <Sparkles size={48} className="mb-4 text-indigo-500 animate-pulse" />
              <h2 className="text-xl font-semibold mb-2">Pronto para a Mágica?</h2>
              <p className="max-w-sm text-sm text-gray-400">
                Configure os detalhes da sua campanha ao lado para gerar 30 dias de conteúdo extraordinário.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 size={48} className="mb-4 text-indigo-500 animate-spin" />
              <h2 className="text-xl font-semibold mb-2 animate-pulse glow-text">Construindo Estratégia...</h2>
              <p className="max-w-sm text-sm text-gray-400">
                Refinando temas e gerando prompts de imagem realistas.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tabs & Export */}
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
                <div className="flex gap-2 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Calendar size={14} /> Cronograma
                  </button>
                  <button 
                    onClick={() => setActiveTab('static')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'static' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <ImageIcon size={14} /> Estáticos
                  </button>
                  <button 
                    onClick={() => setActiveTab('carousels')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'carousels' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Layers size={14} /> Carrosséis
                  </button>
                </div>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'schedule' && (
                  <div className="grid gap-3">
                    {result.schedule?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-4">
                        <div className="bg-indigo-500/20 text-indigo-300 px-3 py-2 rounded-xl font-black text-xs min-w-[60px] text-center uppercase">
                          Dia {item.day}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white">{item.theme}</h3>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-indigo-400 font-bold uppercase">{item.format}</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.objective}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'static' && (
                  <div className="grid gap-6">
                    {result.staticPosts?.map((post: any, idx: number) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 glow-text">{post.title}</h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-[10px] uppercase tracking-tighter text-indigo-400 font-black">Legenda Estratégica</h4>
                              <button 
                                onClick={() => copyToClipboard(post.caption, `copy-static-${idx}`)}
                                className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                {copiedId === `copy-static-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                {copiedId === `copy-static-${idx}` ? 'Copiado' : 'Copiar'}
                              </button>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {post.caption}
                              <div className="mt-4 text-indigo-300/60">{post.hashtags}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] uppercase tracking-tighter text-purple-400 font-black mb-2">Prompt Visual (Nano Banana)</h4>
                            <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 text-[11px] font-mono text-purple-200/70 leading-relaxed max-h-40 overflow-y-auto">
                              {post.imagePrompt}
                            </div>
                            
                            {imageUrls[`static-${idx}`] ? (
                              <div className="mt-3 rounded-2xl overflow-hidden border border-white/10">
                                <img src={imageUrls[`static-${idx}`]} alt="AI Generated" className="w-full h-auto" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleGenerateImage(post.imagePrompt, `static-${idx}`)}
                                disabled={generatingImage === `static-${idx}`}
                                className="w-full mt-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold py-2 rounded-xl border border-purple-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                              >
                                {generatingImage === `static-${idx}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                {generatingImage === `static-${idx}` ? 'Gerando...' : 'Gerar Imagem Agora'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'carousels' && (
                  <div className="grid gap-8">
                    {result.carousels?.map((carousel: any, idx: number) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white">{carousel.topic}</h3>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-black uppercase">{carousel.slides?.length} Slides</span>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                          {carousel.slides?.map((slide: any, sIdx: number) => (
                            <div key={sIdx} className="min-w-[220px] bg-black/40 border border-white/5 p-4 rounded-2xl shrink-0">
                              <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase">Slide {slide.slideNumber}</div>
                              <p className="text-xs text-white font-medium leading-relaxed">{slide.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                          <h4 className="text-[10px] uppercase font-black text-indigo-400 mb-2 text-center">Legenda do Carrossel</h4>
                          <p className="text-xs text-gray-300 leading-relaxed text-center">{carousel.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Chat Sidebar */}
        {showChat && (
          <aside className="w-full lg:w-80 xl:w-96 h-full animate-in slide-in-from-right duration-300 shrink-0">
            <ChatPanel formData={formData} onApplyData={(data) => setFormData({...formData, ...data})} />
          </aside>
        )}
      </main>
    </div>
  );
}
