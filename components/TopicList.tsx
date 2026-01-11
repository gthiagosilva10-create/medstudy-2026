
import React, { useState, useMemo, useEffect } from 'react';
import { Area, StudyStatus, Topic } from '../types';
import { getStudyTips } from '../services/gemini';

interface TopicListProps {
  areas: Area[];
  onStatusChange: (areaId: string, topicId: string, status: StudyStatus) => void;
  onTopicNameChange: (areaId: string, topicId: string, newName: string) => void;
  onTopicObservationChange: (areaId: string, topicId: string, observations: string) => void;
  onAddSubTopic: (areaId: string, topicId: string, subTopicName: string) => void;
  onRemoveSubTopic: (areaId: string, topicId: string, subTopicIndex: number) => void;
  onAddTopic: (areaId: string, name: string, subArea?: string) => void;
  onDeleteTopic: (areaId: string, topicId: string) => void;
  onRenameSubArea: (areaId: string, oldName: string, newName: string) => void;
  onDeleteSubArea: (areaId: string, subAreaName: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ 
  areas, 
  onStatusChange, 
  onTopicNameChange,
  onTopicObservationChange,
  onAddSubTopic,
  onRemoveSubTopic,
  onAddTopic,
  onDeleteTopic,
  onRenameSubArea,
  onDeleteSubArea
}) => {
  const [selectedArea, setSelectedArea] = useState<string>(areas[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [tips, setTips] = useState<{ [key: string]: string }>({});
  const [loadingTips, setLoadingTips] = useState<{ [key: string]: boolean }>({});
  
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [tempTopicName, setTempTopicName] = useState<string>('');

  const [editingSubArea, setEditingSubArea] = useState<{ areaId: string; name: string } | null>(null);
  const [tempSubAreaName, setTempSubAreaName] = useState('');

  const [visibleObservationId, setVisibleObservationId] = useState<string | null>(null);

  const [activeSubTopicInput, setActiveSubTopicInput] = useState<string | null>(null);
  const [tempSubTopic, setTempSubTopic] = useState('');

  const [activeNewTopicInSubArea, setActiveNewTopicInSubArea] = useState<string | null>(null);
  const [newTopicNameInSubArea, setNewTopicNameInSubArea] = useState('');

  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState({ name: '', subArea: '' });

  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(null);

  const filteredAreas = useMemo(() => {
    return areas.map(area => {
      if (selectedArea !== 'all' && area.id !== selectedArea) return null;
      
      const filteredTopics = area.topics.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.subArea && topic.subArea.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (searchTerm && filteredTopics.length === 0) return null;

      return { ...area, topics: filteredTopics };
    }).filter(Boolean) as Area[];
  }, [areas, selectedArea, searchTerm]);

  const flatVisibleTopics = useMemo(() => {
    let list: { topic: Topic; areaId: string }[] = [];
    filteredAreas.forEach(area => {
      area.topics.forEach(t => {
        list.push({ topic: t, areaId: area.id });
      });
    });
    return list;
  }, [filteredAreas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const currentIdx = flatVisibleTopics.findIndex(t => t.topic.id === focusedTopicId);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % flatVisibleTopics.length;
        if (flatVisibleTopics[nextIdx]) setFocusedTopicId(flatVisibleTopics[nextIdx].topic.id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + flatVisibleTopics.length) % flatVisibleTopics.length;
        if (flatVisibleTopics[prevIdx]) setFocusedTopicId(flatVisibleTopics[prevIdx].topic.id);
      } else if (e.key === 'Enter') {
        if (focusedTopicId) {
          e.preventDefault();
          const target = flatVisibleTopics.find(t => t.topic.id === focusedTopicId);
          if (target) {
            const currentStatus = target.topic.status;
            const nextStatus = currentStatus === StudyStatus.COMPLETED ? StudyStatus.NOT_STARTED : StudyStatus.COMPLETED;
            onStatusChange(target.areaId, target.topic.id, nextStatus);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTopicId, flatVisibleTopics, onStatusChange]);

  const handleGetTips = async (topic: Topic) => {
    setLoadingTips(prev => ({ ...prev, [topic.id]: true }));
    const result = await getStudyTips(topic.name);
    setTips(prev => ({ ...prev, [topic.id]: result || '' }));
    setLoadingTips(prev => ({ ...prev, [topic.id]: false }));
  };

  const startEditing = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTempTopicName(topic.name);
  };

  const saveTopicName = (areaId: string, topicId: string) => {
    if (tempTopicName.trim()) {
      onTopicNameChange(areaId, topicId, tempTopicName.trim());
    }
    setEditingTopicId(null);
  };

  const startEditingSubArea = (areaId: string, subAreaName: string) => {
    setEditingSubArea({ areaId, name: subAreaName });
    setTempSubAreaName(subAreaName);
  };

  const saveSubAreaName = () => {
    if (editingSubArea && tempSubAreaName.trim()) {
      onRenameSubArea(editingSubArea.areaId, editingSubArea.name, tempSubAreaName.trim());
    }
    setEditingSubArea(null);
  };

  const confirmDeleteSubArea = (areaId: string, subAreaName: string) => {
    if (confirm(`Deseja excluir permanentemente a sub-área "${subAreaName}" e TODOS os seus temas?`)) {
      onDeleteSubArea(areaId, subAreaName);
    }
  };

  const toggleObservation = (topicId: string) => {
    setVisibleObservationId(visibleObservationId === topicId ? null : topicId);
  };

  const handleAddSub = (areaId: string, topicId: string) => {
    if (tempSubTopic.trim()) {
      onAddSubTopic(areaId, topicId, tempSubTopic.trim());
      setTempSubTopic('');
      setActiveSubTopicInput(null);
    }
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicForm.name.trim() || selectedArea === 'all') return;
    onAddTopic(selectedArea, newTopicForm.name, newTopicForm.subArea);
    setNewTopicForm({ name: '', subArea: '' });
    setShowAddTopicForm(false);
  };

  const handleCreateTopicInSubArea = (areaId: string, subArea: string) => {
    if (!newTopicNameInSubArea.trim()) return;
    onAddTopic(areaId, newTopicNameInSubArea.trim(), subArea);
    setNewTopicNameInSubArea('');
    setActiveNewTopicInSubArea(null);
  };

  const confirmDeleteTopic = (areaId: string, topicId: string, name: string) => {
    if (confirm(`Excluir permanentemente o tema "${name}" do edital?`)) {
      onDeleteTopic(areaId, topicId);
    }
  };

  const renderAreaTopics = (area: Area, isGlobalView: boolean = false) => {
    const grouped: Record<string, Topic[]> = {};
    area.topics.forEach(topic => {
      const sub = topic.subArea || 'Outros';
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(topic);
    });

    return (
      <div key={area.id} className={`${isGlobalView ? 'mb-20 animate-in fade-in slide-in-from-bottom-4' : 'space-y-12'}`}>
        {isGlobalView && (
          <div className={`p-6 rounded-[2rem] bg-${area.color}-600 text-white shadow-lg flex items-center justify-between mb-10 border-b-8 border-${area.color}-700`}>
            <div className="flex items-center gap-6">
              <span className="text-4xl">{area.icon}</span>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{area.name}</h3>
                <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Edital Completo</p>
              </div>
            </div>
          </div>
        )}

        {(Object.entries(grouped) as [string, Topic[]][]).map(([subArea, topics]) => (
          <div key={`${area.id}-${subArea}`} className="space-y-6 mb-10">
            <div className="flex items-center gap-4 group/header">
              {editingSubArea?.areaId === area.id && editingSubArea?.name === subArea ? (
                <div className="flex items-center gap-2 animate-in zoom-in-95">
                  <input 
                    autoFocus
                    className={`text-[10px] font-black text-${area.color}-900 dark:text-${area.color}-300 bg-white dark:bg-slate-800 border-2 border-${area.color}-400 px-4 py-1 rounded-full uppercase outline-none`}
                    value={tempSubAreaName}
                    onChange={e => setTempSubAreaName(e.target.value)}
                    onBlur={saveSubAreaName}
                    onKeyDown={e => e.key === 'Enter' && saveSubAreaName()}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className={`text-[10px] font-black text-${area.color}-900 dark:text-${area.color}-300 bg-${area.color}-100/50 dark:bg-${area.color}-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest border border-${area.color}-200/50 dark:border-${area.color}-800/50 flex items-center gap-3`}>
                    {subArea}
                    <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                      <button onClick={() => startEditingSubArea(area.id, subArea)} title="Renomear Sub-área" className="hover:text-blue-500">✏️</button>
                      <button onClick={() => confirmDeleteSubArea(area.id, subArea)} title="Excluir Sub-área" className="hover:text-red-500">🗑️</button>
                    </div>
                  </h4>
                </div>
              )}
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
            </div>

            <div className="space-y-4">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  onMouseEnter={() => setFocusedTopicId(topic.id)}
                  className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden transition-all group ${
                    focusedTopicId === topic.id 
                      ? `ring-4 ring-${area.color}-500/20 border-${area.color}-400 shadow-2xl scale-[1.01] z-10` 
                      : 'hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl'
                  }`}
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 group/title flex items-center gap-3">
                      {editingTopicId === topic.id ? (
                        <div className="flex items-center gap-3 w-full animate-in zoom-in-95">
                          <input
                            autoFocus
                            type="text"
                            value={tempTopicName}
                            onChange={(e) => setTempTopicName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTopicName(area.id, topic.id);
                              if (e.key === 'Escape') setEditingTopicId(null);
                            }}
                            className="flex-1 px-4 py-2 border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-800 rounded-2xl outline-none text-base font-bold text-gray-800 dark:text-white"
                          />
                          <button onClick={() => saveTopicName(area.id, topic.id)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl">✅</button>
                          <button onClick={() => setEditingTopicId(null)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">❌</button>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-3">
                            <h5 className={`text-lg font-black leading-tight ${focusedTopicId === topic.id ? `text-${area.color}-700 dark:text-${area.color}-300` : 'text-gray-800 dark:text-white'}`}>
                              {topic.name}
                            </h5>
                            <button 
                              onClick={() => startEditing(topic)}
                              className="opacity-0 group-hover/title:opacity-100 p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
                              title="Editar nome"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => confirmDeleteTopic(area.id, topic.id, topic.name)}
                              className="opacity-0 group-hover/title:opacity-100 p-2 text-gray-300 dark:text-slate-600 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Excluir tema"
                            >
                              🗑️
                            </button>
                          </div>
                          {topic.observations && !visibleObservationId && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold line-clamp-1 mt-2 flex items-center gap-1">
                              <span className="text-sm">📌</span> {topic.observations}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => setActiveSubTopicInput(activeSubTopicInput === topic.id ? null : topic.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all border ${
                          activeSubTopicInput === topic.id 
                            ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-inner' 
                            : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                        }`}
                        title="Adicionar sub-tópico"
                      >
                        ➕
                      </button>

                      <button 
                        onClick={() => toggleObservation(topic.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all border ${
                          visibleObservationId === topic.id 
                            ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-inner' 
                            : topic.observations 
                              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400' 
                              : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                        }`}
                        title="Anotações de provas anteriores"
                      >
                        📝
                      </button>
                      
                      <button 
                        onClick={() => handleGetTips(topic)}
                        disabled={loadingTips[topic.id] || editingTopicId === topic.id}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 disabled:opacity-50 transition-all shadow-sm"
                        title="Pérolas de Prova (IA)"
                      >
                        {loadingTips[topic.id] ? '⏳' : '💡'}
                      </button>
                      
                      <select
                        disabled={editingTopicId === topic.id}
                        value={topic.status}
                        onChange={(e) => onStatusChange(area.id, topic.id, e.target.value as StudyStatus)}
                        className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl border-2 outline-none cursor-pointer min-w-[160px] appearance-none text-center transition-all ${
                          topic.status === StudyStatus.COMPLETED ? 'bg-green-600 border-green-700 text-white shadow-lg' :
                          topic.status === StudyStatus.IN_PROGRESS ? 'bg-amber-500 border-amber-600 text-white shadow-lg' :
                          topic.status === StudyStatus.REVIEWED ? 'bg-purple-600 border-purple-700 text-white shadow-lg' :
                          'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'
                        }`}
                      >
                        <option value={StudyStatus.NOT_STARTED}>Pendente</option>
                        <option value={StudyStatus.IN_PROGRESS}>Em Estudo</option>
                        <option value={StudyStatus.COMPLETED}>Concluído (Questões)</option>
                        <option value={StudyStatus.REVIEWED}>Revisado</option>
                      </select>
                    </div>
                  </div>
                  
                  {(topic.subTopics?.length || activeSubTopicInput === topic.id) && (
                    <div className="px-6 pb-5 border-t border-gray-50 dark:border-slate-800/50 pt-5 transition-colors">
                       <div className="flex flex-wrap gap-2.5 mb-4">
                        {topic.subTopics?.map((sub, idx) => (
                          <div key={idx} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 group/sub border border-gray-200/50 dark:border-slate-700/50 transition-all hover:bg-gray-200 dark:hover:bg-slate-700">
                            <span>{sub}</span>
                            <button 
                              onClick={() => onRemoveSubTopic(area.id, topic.id, idx)}
                              className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                       </div>
                       {activeSubTopicInput === topic.id && (
                         <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
                           <input 
                             autoFocus
                             type="text"
                             placeholder="Nome do sub-tópico..."
                             value={tempSubTopic}
                             onChange={(e) => setTempSubTopic(e.target.value)}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') handleAddSub(area.id, topic.id);
                               if (e.key === 'Escape') setActiveSubTopicInput(null);
                             }}
                             className="flex-1 text-xs border dark:border-slate-700 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-colors"
                           />
                           <button 
                             onClick={() => handleAddSub(area.id, topic.id)}
                             className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
                           >
                             Ok
                           </button>
                         </div>
                       )}
                    </div>
                  )}

                  {visibleObservationId === topic.id && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[2rem] p-6 shadow-inner transition-colors">
                        <label className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase mb-4 block tracking-widest">
                          Anotações de Provas Anteriores / "Pulos do Gato"
                        </label>
                        <textarea
                          autoFocus
                          placeholder="Ex: USP adora cobrar tratamento de 2ª linha para esta patologia..."
                          value={topic.observations || ''}
                          onChange={(e) => onTopicObservationChange(area.id, topic.id, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 dark:text-slate-200 leading-relaxed min-h-[120px] resize-none outline-none font-medium"
                        />
                        <div className="flex justify-end mt-4">
                          <button 
                            onClick={() => setVisibleObservationId(null)}
                            className="text-[10px] font-black text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-300 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl transition-all"
                          >
                            FECHAR ANOTAÇÃO
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {tips[topic.id] && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] p-6 text-sm text-gray-700 dark:text-slate-300 border border-blue-100 dark:border-blue-900/30 shadow-inner transition-colors">
                        <div className="font-black text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-3 text-xs uppercase tracking-widest">
                          <span className="text-xl">✨</span> Pérolas de Prova (Gemini)
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-slate-400 font-medium">
                          {tips[topic.id]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!searchTerm && (
                <div className="mt-4 animate-in fade-in duration-500">
                  {activeNewTopicInSubArea === subArea ? (
                    <div className="flex items-center gap-3 p-4 bg-white/40 dark:bg-slate-900/40 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl">
                      <input 
                        autoFocus
                        type="text"
                        placeholder={`Novo tema de ${subArea}...`}
                        value={newTopicNameInSubArea}
                        onChange={(e) => setNewTopicNameInSubArea(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateTopicInSubArea(area.id, subArea);
                          if (e.key === 'Escape') setActiveNewTopicInSubArea(null);
                        }}
                        className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        onClick={() => handleCreateTopicInSubArea(area.id, subArea)}
                        className="bg-gray-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all"
                      >
                        Salvar
                      </button>
                      <button 
                        onClick={() => setActiveNewTopicInSubArea(null)}
                        className="p-3 text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveNewTopicInSubArea(subArea)}
                      className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl text-gray-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-blue-200 dark:hover:border-blue-900 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-900/50 transition-all flex items-center justify-center gap-3"
                    >
                      <span>➕ Adicionar tema em {subArea}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/4 space-y-3">
        <h3 className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Visualização</h3>
        
        <button
          onClick={() => setSelectedArea('all')}
          className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
            selectedArea === 'all'
              ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 text-white shadow-lg scale-105 z-10'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl transition-transform group-hover:scale-110">📋</span>
            <span className="text-sm font-bold">Todos os Assuntos</span>
          </div>
          {selectedArea === 'all' && <span className="text-xs">❮</span>}
        </button>

        <div className="my-4 h-px bg-gray-200 dark:bg-slate-800"></div>

        <h3 className="px-4 py-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Filtrar por Área</h3>
        {areas.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
              selectedArea === area.id
                ? `bg-${area.color}-600 dark:bg-${area.color}-500 border-${area.color}-500 text-white shadow-lg scale-105 z-10`
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-2xl transition-transform group-hover:scale-110`}>{area.icon}</span>
              <span className="text-sm font-bold">{area.name}</span>
            </div>
            {selectedArea === area.id && <span className="text-xs">❮</span>}
          </button>
        ))}

        {selectedArea !== 'all' && !searchTerm && (
          <div className="pt-6">
             <button 
              onClick={() => setShowAddTopicForm(!showAddTopicForm)}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-lg transition-all border flex items-center justify-center gap-2 ${showAddTopicForm ? 'bg-red-50 border-red-200 text-red-500' : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700'}`}
            >
              {showAddTopicForm ? '✕ Cancelar Novo' : '+ Adicionar Nova Sub-área'}
            </button>
          </div>
        )}
      </div>

      <div className="lg:flex-1 space-y-6">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
           <span className="text-xl pl-2">🔍</span>
           <input 
              type="text" 
              placeholder="Pesquisar assunto no edital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium dark:text-white placeholder:text-gray-400"
           />
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="pr-2 text-gray-400 hover:text-gray-600">✕</button>
           )}
        </div>

        {showAddTopicForm && selectedArea !== 'all' && (
          <form onSubmit={handleCreateTopic} className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50 shadow-xl mb-6 animate-in slide-in-from-top-4 space-y-6">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl">➕</div>
                <div>
                   <h4 className="text-xl font-black text-gray-800 dark:text-white">Adicionar Tema / Sub-área em {areas.find(a => a.id === selectedArea)?.name}</h4>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Personalização Estrutural do Edital</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Assunto</label>
                   <input 
                      required
                      type="text" 
                      placeholder="Ex: Febre Tifoide"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white"
                      value={newTopicForm.name}
                      onChange={e => setNewTopicForm({...newTopicForm, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-área / Especialidade</label>
                   <input 
                      type="text" 
                      placeholder="Ex: Infectologia"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-100 dark:text-white"
                      value={newTopicForm.subArea}
                      onChange={e => setNewTopicForm({...newTopicForm, subArea: e.target.value})}
                   />
                </div>
             </div>
             <button type="submit" className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] transition-all">
                Salvar no Edital
             </button>
          </form>
        )}

        <div className="mb-4 bg-gray-100 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in duration-700">
           <span className="text-xl">⌨️</span>
           <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Use as Setas do Teclado para navegar e Enter para concluir temas.</p>
        </div>

        {filteredAreas.length === 0 ? (
          <div className="py-20 text-center text-gray-400 italic">
            Nenhum assunto encontrado para "{searchTerm}" nesta visualização.
          </div>
        ) : (
          filteredAreas.map(area => renderAreaTopics(area, selectedArea === 'all'))
        )}
      </div>
    </div>
  );
};

export default TopicList;
