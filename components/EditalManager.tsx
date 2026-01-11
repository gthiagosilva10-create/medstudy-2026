
import React, { useState, useRef } from 'react';
import { CurriculumDoc } from '../types';

interface EditalManagerProps {
  docs: CurriculumDoc[];
  onUpdateDocs: (docs: CurriculumDoc[]) => void;
  primaryColor: string;
}

const EditalManager: React.FC<EditalManagerProps> = ({ docs, onUpdateDocs, primaryColor }) => {
  const [activeFolder, setActiveFolder] = useState<'all' | 'edital' | 'curriculo' | 'provas' | 'outros'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState<{ name: string; category: any; url: string; type: any }>({
    name: '',
    category: 'edital',
    url: '',
    type: 'pdf'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    { id: 'all', label: 'Tudo', icon: '📂', color: 'gray' },
    { id: 'edital', label: 'Editais Oficiais', icon: '📜', color: 'blue' },
    { id: 'curriculo', label: 'Currículo & Lattes', icon: '🎓', color: 'emerald' },
    { id: 'provas', label: 'Provas Anteriores', icon: '📝', color: 'amber' },
    { id: 'outros', label: 'Certificados/Outros', icon: '📁', color: 'purple' },
  ];

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name) return;

    const doc: CurriculumDoc = {
      id: Date.now().toString(),
      name: newDoc.name,
      category: newDoc.category,
      type: newDoc.type,
      url: newDoc.url,
      addedAt: new Date().toISOString()
    };

    onUpdateDocs([...docs, doc]);
    setIsAdding(false);
    setNewDoc({ name: '', category: 'edital', url: '', type: 'pdf' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type: any = file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'link';
      // Como não temos backend, guardamos o nome e simulamos um link local
      // Para persistência real de arquivos grandes, precisaríamos de uma API
      setNewDoc({ 
        ...newDoc, 
        name: file.name.split('.')[0], 
        type: type,
        url: URL.createObjectURL(file) 
      });
    }
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Deseja excluir este documento permanentemente?')) {
      onUpdateDocs(docs.filter(d => d.id !== id));
    }
  };

  const filteredDocs = activeFolder === 'all' ? docs : docs.filter(d => d.category === activeFolder);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Folder Nav */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id as any)}
            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 group ${
              activeFolder === folder.id 
                ? `bg-white dark:bg-slate-900 border-${primaryColor}-500 shadow-xl scale-105 z-10` 
                : 'bg-white/40 dark:bg-slate-900/40 border-transparent text-gray-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">{folder.icon}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeFolder === folder.id ? `text-${primaryColor}-600` : ''}`}>
              {folder.label}
            </span>
            <span className="text-[10px] opacity-50 font-bold">
              {folder.id === 'all' ? docs.length : docs.filter(d => d.category === folder.id).length} itens
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
          {folders.find(f => f.id === activeFolder)?.label}
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-3 bg-${primaryColor}-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-${primaryColor}-700 transition-all flex items-center gap-2`}
        >
          {isAdding ? '✕ Cancelar' : '+ Adicionar Documento'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddDoc} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 space-y-6 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Documento</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white"
                placeholder="Ex: Edital ENARE 2025"
                value={newDoc.name}
                onChange={e => setNewDoc({...newDoc, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pasta de Destino</label>
              <select 
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white font-bold"
                value={newDoc.category}
                onChange={e => setNewDoc({...newDoc, category: e.target.value as any})}
              >
                {folders.filter(f => f.id !== 'all').map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload ou Link</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white"
                  placeholder="Cole aqui a URL ou selecione um arquivo ao lado..."
                  value={newDoc.url}
                  onChange={e => setNewDoc({...newDoc, url: e.target.value, type: 'link'})}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-200"
                >
                  📁 Arquivo Local
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="application/pdf,image/*" />
              </div>
            </div>
          </div>
          <button type="submit" className={`w-full py-4 bg-${primaryColor}-600 text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] transition-all`}>
            Salvar na Pasta {folders.find(f => f.id === newDoc.category)?.label}
          </button>
        </form>
      )}

      {/* Docs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {doc.type === 'pdf' ? '📕' : doc.type === 'image' ? '🖼️' : '🔗'}
              </div>
              <button 
                onClick={() => handleDeleteDoc(doc.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 space-y-2">
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full bg-${primaryColor}-50 dark:bg-${primaryColor}-900/20 text-${primaryColor}-600 dark:text-${primaryColor}-400 uppercase tracking-widest`}>
                {doc.category}
              </span>
              <h4 className="text-sm font-black text-gray-800 dark:text-white leading-tight line-clamp-2">
                {doc.name}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold">Adicionado em {new Date(doc.addedAt).toLocaleDateString()}</p>
            </div>

            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`mt-6 w-full py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-center text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all`}
            >
              Abrir Documento
            </a>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-6">
            <div className="text-7xl opacity-20 grayscale">📂</div>
            <div className="max-w-xs mx-auto">
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Pasta Vazia</p>
              <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">Organize seus editais e certificados aqui para tê-los sempre à mão.</p>
            </div>
          </div>
        )}
      </div>

      {/* Dica do Dia */}
      <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/5 shrink-0">
          📜
        </div>
        <div>
          <h4 className="text-xl font-black mb-2 italic">Dica de Especialista</h4>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Mantenha uma cópia do seu currículo Lattes atualizada na pasta "Currículo". Muitas instituições pontuam a participação em ligas e monitorias durante a graduação. Ter os certificados organizados economiza tempo precioso na fase de análise de títulos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditalManager;
