
import React, { useState, useEffect, useMemo } from 'react';
import { HOT_TOPICS_LIST, HotTopic } from '../constants';

type CategoryType = 'Geral' | 'Clínica Médica' | 'Cirurgia Geral' | 'Ginecologia e Obstetrícia' | 'Pediatria' | 'Medicina Preventiva';

const HotTopics: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Geral');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [topics, setTopics] = useState<HotTopic[]>([]);
  const [isManageMode, setIsManageMode] = useState(false);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', area: '', observations: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState({ name: '', area: '', category: 'Clínica Médica' as CategoryType, observations: '' });

  const [visibleObservationName, setVisibleObservationName] = useState<string | null>(null);

  // Keyboard navigation
  const [focusedTopicName, setFocusedTopicName] = useState<string | null>(null);

  useEffect(() => {
    const savedChecks = localStorage.getItem('medstudy_hot_checked');
    if (savedChecks) setCheckedItems(JSON.parse(savedChecks));

    const savedTopics = localStorage.getItem('medstudy_custom_hot_topics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    } else {
      setTopics(HOT_TOPICS_LIST);
    }
  }, []);

  const filteredTopics = useMemo(() => 
    activeCategory === 'Geral' ? topics : topics.filter(t => t.category === activeCategory),
  [topics, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (isManageMode) return;

      const currentIdx = filteredTopics.findIndex(t => t.name === focusedTopicName);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % filteredTopics.length;
        if (filteredTopics[nextIdx]) setFocusedTopicName(filteredTopics[nextIdx].name);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + filteredTopics.length) % filteredTopics.length;
        if (filteredTopics[prevIdx]) setFocusedTopicName(filteredTopics[prevIdx].name);
      } else if (e.key === 'Enter') {
        if (focusedTopicName) {
          e.preventDefault();
          toggleCheck(focusedTopicName);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTopicName, filteredTopics, isManageMode]);

  const saveTopics = (newTopics: HotTopic[]) => {
    setTopics(newTopics);
    localStorage.setItem('medstudy_custom_hot_topics', JSON.stringify(newTopics));
  };

  const toggleCheck = (itemName: string) => {
    if (isManageMode) return;
    const newChecked = { ...checkedItems, [itemName]: !checkedItems[itemName] };
    setCheckedItems(newChecked);
    localStorage.setItem('medstudy_hot_checked', JSON.stringify(newChecked));
  };

  const handleAddTopic = () => {
    if (!newTopicForm.name || !newTopicForm.area) return;
    const newTopic: HotTopic = {
      name: newTopicForm.name,
      area: newTopicForm.area,
      category: newTopicForm.category as any,
      observations: newTopicForm.observations
    };
    saveTopics([...topics, newTopic]);
    setNewTopicForm({ name: '', area: '', category: activeCategory === 'Geral' ? 'Clínica Médica' : activeCategory, observations: '' });
    setShowAddForm(false);
  };

  const handleDeleteTopicFromList = (topic: HotTopic) => {
    if (confirm(`Excluir tema "${topic.name}" permanentemente?`)) {
      const newTopics = topics.filter(t => t !== topic);
      saveTopics(newTopics);
    }
  };

  const startEditFromList = (topic: HotTopic) => {
    const realIndex = topics.findIndex(t => t === topic);
    setEditingIndex(realIndex);
    setEditForm({ name: topic.name, area: topic.area, observations: topic.observations || '' });
  };

  const handleSaveEdit = (realIndex: number) => {
    const newTopics = topics.map((t, i) => {
      if (i === realIndex) {
        return { ...t, name: editForm.name, area: editForm.area, observations: editForm.observations };
      }
      return t;
    });
    saveTopics(newTopics);
    setEditingIndex(null);
  };

  const handleUpdateObservations = (topicName: string, text: string) => {
    const newTopics = topics.map(t => {
      if (t.name === topicName) {
        return { ...t, observations: text };
      }
      return t;
    });
    saveTopics(newTopics);
  };

  const resetToDefault = () => {
    if (confirm("Deseja resetar todos os temas para o padrão do edital? Suas edições serão perdidas.")) {
      saveTopics(HOT_TOPICS_LIST);
    }
  };

  const categories: { id: CategoryType; label: string; icon: string; color: string }[] = [
    { id: 'Geral', label: 'Ver Tudo', icon: '🌐', color: 'slate' },
    { id: 'Clínica Médica', label: 'Clínica', icon: '🩺', color: 'blue' },
    { id: 'Cirurgia Geral', label: 'Cirurgia', icon: '🔪', color: 'red' },
    { id: 'Ginecologia e Obstetrícia', label: 'G.O.', icon: '🤰', color: 'pink' },
    { id: 'Pediatria', label: 'Pedi', icon: '👶', color: 'green' },
    { id: 'Medicina Preventiva', label: 'Prev', icon: '🏥', color: 'indigo' },
  ];

  const completedAllCount = Object.values(checkedItems).filter(Boolean).length;
  const totalAllCount = topics.length;
  const progressPercent = totalAllCount > 0 ? Math.round((completedAllCount / totalAllCount) * 100) : 0;
  
  const categoryCompletedCount = filteredTopics.filter(t => checkedItems[t.name]).length;

  const getThemeColor = (category?: string) => {
    const cat = category || activeCategory;
    return categories.find(c => c.id === cat)?.color || 'orange';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden transition-all duration-700`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-white/10 p-2 rounded-2xl backdrop-blur-md text-3xl border border-white/10">🔥</span>
              <h2 className="text-4xl font-black tracking-tight">CERMAM Hot Topics</h2>
            </div>
            <p className="text-gray-300 font-medium max-w-xl text-lg opacity-90">
              Assuntos estratégicos. Personalize com dicas e mnemônicos exclusivos clicando no ícone de anotação.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 min-w-[220px] text-center shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-orange-400">Domínio CERMAM</p>
            <div className="text-4xl font-black mb-1">{progressPercent}%</div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-3">
              <div className="bg-orange-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[10px] mt-2 font-bold text-gray-400">{completedAllCount} de {totalAllCount} dominados</p>
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 flex-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 gap-1 ${
                activeCategory === cat.id
                  ? `bg-white dark:bg-slate-800 border-${cat.color}-500 shadow-lg scale-105 z-10`
                  : 'bg-gray-50 dark:bg-slate-900 border-transparent text-gray-400 hover:bg-white hover:border-gray-200 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${activeCategory === cat.id ? `text-${cat.color}-600 dark:text-${cat.color}-400` : ''}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 border shadow-lg ${
              showAddForm 
                ? 'bg-red-50 border-red-200 text-red-500' 
                : 'bg-orange-600 border-orange-700 text-white hover:bg-orange-700'
            }`}
          >
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Tema'}
          </button>
          <button 
            onClick={() => setIsManageMode(!isManageMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isManageMode 
                ? 'bg-slate-800 border-slate-900 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50'
            }`}
          >
            {isManageMode ? '✅ Pronto' : '✏️ Editar Lista'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-orange-900/30 p-8 rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-2xl">🔥</div>
             <div>
                <h4 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Novo Tema Quente</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inclua o "pulo do gato" nas observações</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Tema</label>
              <input 
                type="text" 
                placeholder="Ex: Pielonefrite Aguda"
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 dark:border-orange-900/50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                value={newTopicForm.name}
                onChange={e => setNewTopicForm({...newTopicForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-área</label>
              <input 
                type="text" 
                placeholder="Ex: UROLOGIA"
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 dark:border-orange-900/50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-400 uppercase text-xs font-bold"
                value={newTopicForm.area}
                onChange={e => setNewTopicForm({...newTopicForm, area: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Área Médica</label>
              <select
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 dark:border-orange-900/50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-400 text-xs uppercase font-bold"
                value={newTopicForm.category}
                onChange={e => setNewTopicForm({...newTopicForm, category: e.target.value as CategoryType})}
              >
                {categories.filter(c => c.id !== 'Geral').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anotações / Dicas de Prova</label>
              <textarea 
                placeholder="Escreva mnemônicos ou lembretes rápidos..."
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 dark:border-orange-900/50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-400 min-h-[100px] resize-none"
                value={newTopicForm.observations}
                onChange={e => setNewTopicForm({...newTopicForm, observations: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Descartar</button>
            <button onClick={handleAddTopic} className="px-10 py-3 bg-gray-900 dark:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] transition-all">Salvar Tema</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl p-8 relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-${getThemeColor()}-50 dark:bg-${getThemeColor()}-900/20 flex items-center justify-center text-2xl`}>
              {categories.find(c => c.id === activeCategory)?.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                {activeCategory === 'Geral' ? 'Domínio Total do Edital' : activeCategory}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">⌨️ Navegue com as setas ⬆️⬇️ e marque com Enter</p>
            </div>
          </div>
          <div className={`px-4 py-2 bg-${getThemeColor()}-50 dark:bg-${getThemeColor()}-900/20 rounded-xl text-xs font-black text-${getThemeColor()}-600 dark:text-${getThemeColor()}-400 border border-${getThemeColor()}-100 dark:border-${getThemeColor()}-800`}>
            {categoryCompletedCount} / {filteredTopics.length} CONCLUÍDOS
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-4">
          {filteredTopics.map((topic, idx) => {
            const realIdx = topics.findIndex(t => t === topic);
            const isEditing = editingIndex === realIdx;
            const topicColor = getThemeColor(topic.category);
            const isFocused = focusedTopicName === topic.name;
            const isObsVisible = visibleObservationName === topic.name;

            return (
              <div 
                key={`${topic.name}-${idx}`} 
                onClick={() => {
                  if (!isManageMode) toggleCheck(topic.name);
                  setFocusedTopicName(topic.name);
                }}
                onMouseEnter={() => setFocusedTopicName(topic.name)}
                className={`break-inside-avoid mb-4 flex flex-col p-4 rounded-3xl border transition-all cursor-pointer group group/item ${
                  isFocused 
                    ? `ring-4 ring-${topicColor}-500/30 border-${topicColor}-400 bg-white dark:bg-slate-800 shadow-xl scale-[1.02] z-10` 
                    : checkedItems[topic.name] && !isManageMode
                      ? `bg-${topicColor}-50/30 dark:bg-${topicColor}-900/10 border-${topicColor}-100 dark:border-${topicColor}-800/50 shadow-sm opacity-60` 
                      : 'bg-gray-50/50 dark:bg-slate-800/30 border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  {isEditing ? (
                    <div className="flex-1 space-y-3 animate-in fade-in" onClick={e => e.stopPropagation()}>
                      <input 
                        autoFocus
                        className={`w-full text-[10px] font-black uppercase text-${topicColor}-600 dark:text-${topicColor}-400 border-b border-${topicColor}-200 dark:border-slate-800 bg-transparent outline-none p-1`}
                        value={editForm.area}
                        onChange={e => setEditForm({...editForm, area: e.target.value})}
                      />
                      <input 
                        className="w-full text-sm font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-transparent outline-none p-1"
                        value={editForm.name}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                      <textarea 
                        className="w-full text-xs text-gray-500 bg-gray-50 dark:bg-slate-900 rounded-xl p-2 outline-none resize-none"
                        value={editForm.observations}
                        placeholder="Observações..."
                        onChange={e => setEditForm({...editForm, observations: e.target.value})}
                      />
                      <div className="flex justify-end gap-1 pt-2">
                        <button onClick={() => setEditingIndex(null)} className="p-1 text-[10px] font-bold text-gray-400">Cancelar</button>
                        <button onClick={() => handleSaveEdit(realIdx)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!isManageMode && (
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                          checkedItems[topic.name] 
                            ? `bg-${topicColor}-600 border-${topicColor}-600 text-white scale-110 shadow-lg shadow-${topicColor}-200 dark:shadow-none` 
                            : 'border-gray-200 dark:border-slate-700 text-transparent group-hover/item:border-gray-400 dark:group-hover/item:border-slate-500'
                        }`}>
                          {checkedItems[topic.name] ? '✓' : ''}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-[9px] font-black transition-all uppercase tracking-tighter ${
                            checkedItems[topic.name] && !isManageMode ? `text-${topicColor}-400 opacity-50` : `text-${topicColor}-600 dark:text-${topicColor}-400`
                          }`}>
                            {topic.area}
                          </p>
                        </div>
                        <p className={`text-sm font-bold leading-tight transition-all truncate ${
                          checkedItems[topic.name] && !isManageMode ? 'text-gray-400 dark:text-slate-600 line-through font-medium' : 'text-gray-800 dark:text-slate-200'
                        }`}>
                          {topic.name}
                        </p>
                      </div>
                      <div className="flex gap-1 items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <button 
                          onClick={(e) => { e.stopPropagation(); setVisibleObservationName(isObsVisible ? null : topic.name); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isObsVisible ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'}`}
                          title="Ver Observações"
                         >
                           📝
                         </button>
                         {isManageMode && (
                           <>
                             <button 
                              onClick={(e) => { e.stopPropagation(); startEditFromList(topic); }}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100"
                             >
                               ✏️
                             </button>
                             <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTopicFromList(topic); }}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                             >
                               🗑️
                             </button>
                           </>
                         )}
                      </div>
                    </>
                  )}
                </div>
                
                {isObsVisible && !isEditing && (
                  <div className="mt-3 pt-3 border-t dark:border-slate-800 animate-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
                    <textarea 
                      className="w-full text-xs text-gray-600 dark:text-slate-400 bg-amber-50/30 dark:bg-slate-900 p-3 rounded-xl border-none outline-none focus:ring-1 focus:ring-amber-200 min-h-[80px] font-medium leading-relaxed"
                      value={topic.observations || ''}
                      placeholder="Adicione mnemônicos, dicas ou pontos chave de provas anteriores..."
                      onChange={e => handleUpdateObservations(topic.name, e.target.value)}
                    />
                    <p className="text-[8px] text-amber-500 font-black uppercase mt-1 px-1">Salvamento automático habilitado</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="text-6xl opacity-10">🔭</div>
             <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">Nenhum tema encontrado nesta categoria</p>
             <button onClick={() => setShowAddForm(true)} className="text-orange-600 font-bold text-xs underline decoration-2 underline-offset-4">Adicionar o Primeiro Tema</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotTopics;
