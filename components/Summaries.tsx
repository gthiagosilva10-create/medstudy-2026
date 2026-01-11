
import React, { useState, useRef } from 'react';
import { Area, SummaryFile } from '../types';
import { jsPDF } from 'jspdf';

interface SummariesProps {
  areas: Area[];
  onUpdateArea: (updatedArea: Area) => void;
}

const Summaries: React.FC<SummariesProps> = ({ areas, onUpdateArea }) => {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeArea = areas.find(a => a.id === selectedAreaId) || areas[0];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateArea({ ...activeArea, summary: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type: 'pdf' | 'image' | 'other' = 
        file.type.includes('pdf') ? 'pdf' : 
        file.type.includes('image') ? 'image' : 'other';

      const newFile: SummaryFile = {
        id: Date.now().toString(),
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        addedAt: new Date().toISOString()
      };

      onUpdateArea({
        ...activeArea,
        files: [...(activeArea.files || []), newFile]
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Remover este arquivo dos resumos desta área?')) {
      onUpdateArea({
        ...activeArea,
        files: (activeArea.files || []).filter(f => f.id !== fileId)
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!activeArea || !activeArea.summary) {
      alert('Escreva algo no resumo antes de baixar!');
      return;
    }

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text(`Resumo MedStudy: ${activeArea.name}`, 10, 20);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 25, 200, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    
    const splitText = doc.splitTextToSize(activeArea.summary, 180);
    doc.text(splitText, 10, 35);
    
    doc.save(`Resumo_${activeArea.name.replace(/\s+/g, '_')}_MedStudy.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-10 animate-in fade-in duration-500">
      {/* Seletor de Área */}
      <div className="lg:w-1/4 space-y-3">
        <h3 className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Resumos por Bloco</h3>
        <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 scrollbar-hide">
          {areas.map(area => (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`w-full text-left px-4 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
                selectedAreaId === area.id
                  ? `bg-${area.color}-600 dark:bg-${area.color}-700 border-${area.color}-500 text-white shadow-xl scale-105 z-10`
                  : 'bg-white dark:bg-black border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">{area.icon}</span>
                <span className="text-sm font-bold">{area.name}</span>
              </div>
              {area.files && area.files.length > 0 && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">{area.files.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="lg:flex-1 flex flex-col gap-6">
        {/* Editor de Texto */}
        <div className="bg-white dark:bg-black rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col h-[60vh] overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-2xl">{activeArea?.icon}</span>
              Caderno de {activeArea?.name}
            </h4>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[8px] text-gray-400 font-black uppercase tracking-widest bg-white dark:bg-slate-800 px-3 py-1 rounded-full border dark:border-slate-700">Auto-save</span>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg"
              >
                📥 Baixar PDF
              </button>
            </div>
          </div>
          <textarea
            value={activeArea?.summary || ''}
            onChange={handleTextChange}
            placeholder={`Comece a escrever seus resumos estratégicos de ${activeArea?.name} aqui...\n\nUtilize este espaço para conceitos-chave, mnemônicos e "pulos do gato" encontrados em questões.`}
            className="flex-1 p-8 text-gray-800 dark:text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-0 bg-transparent text-lg font-medium placeholder:text-gray-300 dark:placeholder:text-slate-800"
          />
        </div>

        {/* Local para baixar resumos do aparelho (Upload) */}
        <div className="bg-white dark:bg-black rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Material de Apoio & Anexos</h5>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Carregue resumos, tabelas e imagens do seu aparelho</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>📂</span> Upload do Aparelho
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              accept="application/pdf,image/*" 
              onChange={handleFileUpload} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeArea.files && activeArea.files.length > 0 ? activeArea.files.map(file => (
              <div key={file.id} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-3xl border dark:border-slate-800 flex items-center justify-between group hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm shrink-0">
                    {file.type === 'pdf' ? '📕' : file.type === 'image' ? '🖼️' : '📁'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-800 dark:text-slate-200 truncate pr-2">{file.name}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">{file.type} • {new Date(file.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                   <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Abrir Arquivo"
                   >
                     👁️
                   </a>
                   <button 
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                   >
                     ✕
                   </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2rem] text-center space-y-3">
                <p className="text-4xl opacity-10 grayscale">📤</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Nenhum resumo anexado para {activeArea.name}</p>
                <p className="text-[9px] text-gray-300 italic">Dica: Anexe imagens de fluxogramas ou resumos em PDF que você já possui.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dica */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-[2rem] p-6 flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>Dica Pro:</strong> Centralize tudo aqui. Em vez de procurar resumos em pastas espalhadas no celular ou PC, anexe os arquivos mais importantes à área correspondente. Isso otimiza sua revisão pré-prova.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summaries;
