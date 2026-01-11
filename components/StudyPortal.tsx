
import React, { useState } from 'react';

const StudyPortal: React.FC = () => {
  const [activeSite, setActiveSite] = useState<'chatgpt' | 'gemini' | 'estrategia'>('chatgpt');

  const sites = {
    chatgpt: {
      name: 'ChatGPT',
      url: 'https://chatgpt.com',
      icon: '💬',
      desc: 'Use para resumir diretrizes, criar flashcards ou explicar conceitos complexos.',
      color: 'emerald'
    },
    gemini: {
      name: 'Gemini',
      url: 'https://gemini.google.com',
      icon: '✨',
      desc: 'Acesse a inteligência artificial do Google para pesquisas rápidas, análise de imagens e textos.',
      color: 'indigo'
    },
    estrategia: {
      name: 'Estratégia Med',
      url: 'https://estrategiamed.com.br',
      icon: '📚',
      desc: 'Acesse seu banco de questões, videoaulas e materiais em PDF.',
      color: 'blue'
    }
  };

  const handleOpenNewTab = () => {
    window.open(sites[activeSite].url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6 animate-in fade-in duration-500">
      {/* Top Tabs */}
      <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-xl w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveSite('chatgpt')}
          className={`px-6 md:px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeSite === 'chatgpt' ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <span>💬</span> ChatGPT
        </button>
        <button 
          onClick={() => setActiveSite('gemini')}
          className={`px-6 md:px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeSite === 'gemini' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <span>✨</span> Gemini
        </button>
        <button 
          onClick={() => setActiveSite('estrategia')}
          className={`px-6 md:px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeSite === 'estrategia' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <span>📚</span> Estratégia Med
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col relative group">
        
        {/* Iframe View (Attempt) */}
        <div className="flex-1 relative">
          <iframe 
            src={sites[activeSite].url} 
            className="w-full h-full border-none"
            title={sites[activeSite].name}
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
          />
          
          {/* Overlay / Fallback for sites that block iframes */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col items-center justify-center p-12 text-center space-y-8 z-10 pointer-events-none group-hover:opacity-100 transition-opacity">
            <div className={`w-24 h-24 rounded-[2rem] bg-${sites[activeSite].color}-100 flex items-center justify-center text-5xl shadow-inner border border-${sites[activeSite].color}-200 animate-bounce`}>
              {sites[activeSite].icon}
            </div>
            <div className="max-w-md space-y-3">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Portal {sites[activeSite].name}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {sites[activeSite].desc}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
                Nota: Plataformas de IA e Bancos de Questões costumam bloquear acesso embutido por segurança.
              </p>
            </div>
            
            <button 
              onClick={handleOpenNewTab}
              className={`pointer-events-auto px-12 py-5 bg-${sites[activeSite].color === 'emerald' ? 'emerald-600' : sites[activeSite].color === 'indigo' ? 'indigo-600' : 'blue-600'} hover:opacity-90 text-white rounded-3xl font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3`}
            >
              Acessar Agora 🚀
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Link Seguro e Verificado</span>
          </div>
          <span className="text-[10px] font-medium opacity-50 hidden sm:inline">{sites[activeSite].url}</span>
        </div>
      </div>

      {/* Quick Help Card */}
      <div className={`bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-xl flex items-center gap-6`}>
        <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-3xl shrink-0">
          💡
        </div>
        <div>
          <h4 className="font-black text-gray-800">Dica de Estudo</h4>
          <p className="text-sm text-gray-500 font-medium">
            Use o {sites[activeSite].name} para tirar dúvidas pontuais. O Gemini é excelente para organizar cronogramas e o ChatGPT para resumos curtos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyPortal;
