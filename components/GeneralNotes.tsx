
import React, { useState } from 'react';

interface GeneralNotesProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const GeneralNotes: React.FC<GeneralNotesProps> = ({ notes, onUpdateNotes }) => {
  const [copyStatus, setCopyStatus] = useState('Copiar');

  const handleTimestamp = () => {
    const now = new Date();
    const ts = `\n[${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    onUpdateNotes(notes + ts);
  };

  const handleClear = () => {
    if (confirm('Deseja apagar todas as notas do diário? Esta ação não pode ser desfeita.')) {
      onUpdateNotes('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopyStatus('Copiado!');
    setTimeout(() => setCopyStatus('Copiar'), 2000);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6 animate-in fade-in duration-500">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden flex-1 transition-all">
        
        {/* Toolbar Superior */}
        <div className="px-8 py-4 border-b dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-xl">📒</span> Diário de Bordo
            </h3>
            <span className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></span>
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Auto-save ativo
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleTimestamp}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-100 dark:border-blue-800"
            >
              🕒 Carimbo
            </button>
            <button 
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-gray-200 dark:hover:bg-slate-700 transition-all border dark:border-slate-700"
            >
              📋 {copyStatus}
            </button>
            <button 
              onClick={handleClear}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/30"
            >
              🗑️ Limpar
            </button>
          </div>
        </div>

        {/* Área de Escrita */}
        <div className="relative flex-1 p-8">
          <textarea
            value={notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Comece a escrever suas anotações gerais aqui... Reflexões sobre o simulado de hoje, dúvidas para perguntar ao preceptor ou sua estratégia para o próximo mês."
            className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-slate-200 leading-relaxed resize-none outline-none font-medium text-lg placeholder:text-gray-300 dark:placeholder:text-slate-700"
          />
        </div>

        {/* Footer Info */}
        <div className="px-8 py-3 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span>{wordCount} Palavras</span>
            <span>{notes.length} Caracteres</span>
          </div>
          <div className="italic opacity-60">
            Última alteração: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Dica do Dia */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 dark:border-slate-800 shadow-xl flex items-center gap-4 transition-all">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-2xl shrink-0">
          🧠
        </div>
        <div>
          <h4 className="font-black text-gray-800 dark:text-white text-sm">Método de Estudo Ativo</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
            Tente explicar para si mesmo um conceito difícil aqui. Transformar pensamento em texto é a melhor forma de fixar o conhecimento e identificar lacunas no aprendizado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralNotes;
