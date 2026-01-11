
import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface GeneralNotesProps {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
}

const GeneralNotes: React.FC<GeneralNotesProps> = ({ notes, onUpdateNotes }) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sincroniza o activeNoteId caso as notas mudem (ex: primeira carga)
  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Anotação',
      content: '',
      updatedAt: new Date().toISOString()
    };
    onUpdateNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateActiveNote = (content: string) => {
    if (!activeNoteId) return;

    // A primeira linha vira o título automaticamente estilo iPhone
    const lines = content.trim().split('\n');
    const newTitle = lines[0] ? (lines[0].length > 30 ? lines[0].substring(0, 30) + '...' : lines[0]) : 'Sem título';

    const updatedNotes = notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, title: newTitle, updatedAt: new Date().toISOString() } 
        : n
    );
    
    // Opcional: Trazer para o topo da lista se editado
    // updatedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    onUpdateNotes(updatedNotes);
  };

  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja apagar esta anotação?')) {
      const filtered = notes.filter(n => n.id !== id);
      onUpdateNotes(filtered);
      if (activeNoteId === id) {
        setActiveNoteId(filtered.length > 0 ? filtered[0].id : null);
      }
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      
      {/* Sidebar de Notas (Estilo iPhone) */}
      <div className="w-64 md:w-80 border-r dark:border-slate-800 flex flex-col bg-gray-50/50 dark:bg-slate-900/30">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 dark:text-white">Anotações</h3>
            <button 
              onClick={handleCreateNewNote}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none hover:scale-110 transition-all"
              title="Nova Nota"
            >
              <span className="text-xl">📝</span>
            </button>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border-none outline-none text-xs dark:text-white shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-5 cursor-pointer border-b dark:border-slate-800/50 transition-all relative group ${activeNoteId === note.id ? 'bg-white dark:bg-slate-800' : 'hover:bg-gray-100/50 dark:hover:bg-slate-800/20'}`}
            >
              <div className="flex justify-between items-start pr-4">
                <h4 className={`text-sm font-black truncate ${activeNoteId === note.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-slate-200'}`}>
                  {note.title || 'Sem título'}
                </h4>
                <button 
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all absolute top-5 right-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                {new Date(note.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 line-clamp-1 mt-1 font-medium">
                {note.content || 'Nenhum texto adicional'}
              </p>
            </div>
          )) : (
            <div className="p-10 text-center space-y-2 opacity-30">
              <p className="text-4xl">📭</p>
              <p className="text-[10px] font-black uppercase text-gray-500">Nenhuma nota</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-slate-800 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{notes.length} Notas no total</p>
        </div>
      </div>

      {/* Editor Principal */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-900/50">
        {activeNote ? (
          <>
            <div className="px-8 py-4 border-b dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Editando agora
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const now = new Date();
                    handleUpdateActiveNote(activeNote.content + `\n[${now.toLocaleTimeString()}] `);
                  }}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition-all"
                >
                  🕒 Carimbo
                </button>
                <button 
                  onClick={handleCreateNewNote}
                  className="px-4 py-2 bg-gray-900 text-white dark:bg-slate-800 rounded-xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all"
                >
                  Finalizar & Nova Nota
                </button>
              </div>
            </div>
            
            <textarea
              autoFocus
              value={activeNote.content}
              onChange={(e) => handleUpdateActiveNote(e.target.value)}
              placeholder="Digite aqui sua anotação... O título será gerado automaticamente pela primeira linha."
              className="flex-1 w-full p-10 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-slate-200 leading-relaxed resize-none outline-none font-medium text-lg placeholder:text-gray-300 dark:placeholder:text-slate-700"
            />

            <div className="absolute bottom-6 right-8 pointer-events-none opacity-20">
               <span className="text-6xl grayscale">✍️</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-5xl">📒</div>
            <div className="max-w-xs space-y-2">
               <h3 className="text-xl font-black text-gray-800 dark:text-white">Selecione uma Nota</h3>
               <p className="text-sm text-gray-500">Escolha um bloco ao lado para editar ou crie um novo para registrar seus aprendizados.</p>
            </div>
            <button 
              onClick={handleCreateNewNote}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl"
            >
              Criar Primeira Nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralNotes;
