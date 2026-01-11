
import React, { useState, useMemo } from 'react';
import { Area, Flashcard } from '../types';

interface FlashcardsProps {
  areas: Area[];
  flashcards: Flashcard[];
  onUpdateFlashcards: (flash: Flashcard[]) => void;
  primaryColor: string;
}

const Flashcards: React.FC<FlashcardsProps> = ({ areas, flashcards, onUpdateFlashcards, primaryColor }) => {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].id);
  const [isAdding, setIsAdding] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  const activeArea = areas.find(a => a.id === selectedAreaId);
  const areaFlashcards = useMemo(() => 
    flashcards.filter(f => f.areaId === selectedAreaId),
    [flashcards, selectedAreaId]
  );

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.front || !newCard.back) return;

    const card: Flashcard = {
      id: Date.now().toString(),
      areaId: selectedAreaId,
      front: newCard.front,
      back: newCard.back
    };

    onUpdateFlashcards([...flashcards, card]);
    setNewCard({ front: '', back: '' });
    setIsAdding(false);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Excluir este flashcard?')) {
      onUpdateFlashcards(flashcards.filter(f => f.id !== id));
    }
  };

  const startStudy = () => {
    if (areaFlashcards.length === 0) return;
    setIsStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentCardIndex < areaFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsStudyMode(false);
      alert('Sessão de estudo concluída!');
    }
  };

  return (
    <div className="space-y-6 h-full pb-10">
      {isStudyMode ? (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setIsStudyMode(false)}
            className="absolute top-8 right-8 text-white text-2xl font-bold hover:scale-110 transition-transform"
          >
            ✕
          </button>
          
          <div className="w-full max-w-lg space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center text-white/60 text-xs font-black uppercase tracking-widest">
              <span>{activeArea?.name}</span>
              <span>CARD {currentCardIndex + 1} / {areaFlashcards.length}</span>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="group h-[400px] [perspective:1000px] cursor-pointer"
            >
              <div className={`relative h-full w-full rounded-[3rem] shadow-2xl transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-white flex items-center justify-center p-12 text-center rounded-[3rem] [backface-visibility:hidden]">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pergunta</p>
                    <p className="text-2xl font-black text-slate-800 leading-tight">
                      {areaFlashcards[currentCardIndex].front}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-8 animate-pulse">Clique para virar</p>
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 bg-blue-600 text-white flex items-center justify-center p-12 text-center rounded-[3rem] [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Resposta</p>
                    <p className="text-xl font-bold leading-relaxed">
                      {areaFlashcards[currentCardIndex].back}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={nextCard}
                className="flex-1 py-5 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase shadow-xl hover:bg-slate-50 transition-all"
              >
                {currentCardIndex === areaFlashcards.length - 1 ? 'Finalizar' : 'Próximo Card'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Area Sidebar */}
            <div className="lg:w-1/4 space-y-3">
              <h3 className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Pastas por Área</h3>
              {areas.map(area => (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedAreaId === area.id
                      ? `bg-${area.color}-600 dark:bg-${area.color}-500 border-${area.color}-500 text-white shadow-lg scale-105 z-10`
                      : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <span className="text-sm font-bold block">{area.name}</span>
                      <span className="text-[9px] opacity-60 font-black uppercase">
                        {flashcards.filter(f => f.areaId === area.id).length} Cards
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="lg:flex-1 space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-${activeArea?.color}-50 dark:bg-${activeArea?.color}-900/20 flex items-center justify-center text-3xl`}>
                      {activeArea?.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white">{activeArea?.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Biblioteca de Flashcards</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={startStudy}
                      disabled={areaFlashcards.length === 0}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      🚀 Estudar Área
                    </button>
                    <button 
                      onClick={() => setIsAdding(!isAdding)}
                      className={`px-6 py-3 bg-white dark:bg-slate-800 border rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2 ${isAdding ? 'border-red-500 text-red-500' : 'border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                    >
                      {isAdding ? 'Cancelar' : '+ Novo Card'}
                    </button>
                  </div>
                </div>

                {isAdding && (
                  <form onSubmit={handleAddCard} className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frente (Pergunta/Conceito)</label>
                        <textarea 
                          required
                          value={newCard.front}
                          onChange={e => setNewCard({...newCard, front: e.target.value})}
                          placeholder="Qual o sinal de Blumberg?"
                          className="w-full h-24 p-4 rounded-2xl border dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verso (Resposta/Explicação)</label>
                        <textarea 
                          required
                          value={newCard.back}
                          onChange={e => setNewCard({...newCard, back: e.target.value})}
                          placeholder="Dor à descompressão brusca no ponto de McBurney. Sugere peritonite."
                          className="w-full h-24 p-4 rounded-2xl border dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-bold"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.01] transition-all">
                      Adicionar Card à Coleção
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areaFlashcards.map(card => (
                    <div key={card.id} className="p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl group relative hover:shadow-xl transition-all">
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="absolute top-4 right-4 text-xs opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                      >
                        ✕
                      </button>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-blue-500 uppercase">Frente</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white line-clamp-2">{card.front}</p>
                        </div>
                        <div className="space-y-1 border-t dark:border-slate-800 pt-3">
                          <p className="text-[8px] font-black text-emerald-500 uppercase">Verso</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{card.back}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {areaFlashcards.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="text-6xl grayscale opacity-20">🃏</div>
                      <div className="max-w-xs mx-auto">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sua pasta está vazia</p>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Crie flashcards de conceitos chave para fixar o conteúdo através da repetição espaçada.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Footer */}
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/5 shrink-0">
                  🧠
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2 italic">Dica de Fixação</h4>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    Flashcards são mais eficazes para **"O que"** e **"Como"**. Foque em sinais patognomônicos, critérios diagnósticos e doses de drogas de primeira linha. A revisão ativa é o segredo para a memória de longo prazo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Flashcards;
