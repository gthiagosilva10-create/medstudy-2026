
import React, { useState, useMemo } from 'react';
import { Area, WeeklySchedule, StudyStatus, Topic, MonthlyPlans } from '../types';
import { HotTopic } from '../constants';

interface ScheduleProps {
  areas: Area[];
  hotTopics: HotTopic[];
  hotTopicChecks: Record<string, boolean>;
  activeMonthId: string;
  onMonthChange: (monthId: string) => void;
  monthIds: string[];
  weeklySchedule: WeeklySchedule;
  allWeeklySchedules: Record<string, WeeklySchedule>;
  monthlyPlans: MonthlyPlans;
  orderedMonthIds: string[];
  collapsedMonths: Record<string, boolean>;
  targetExamDate: string;
  onToggleTopicStatus: (topicId: string) => void;
  onUpdateSchedule: (dayIndex: number, topicIds: string[]) => void;
  onUpdateMonthlyPlan: (monthId: string, content: string) => void;
  onToggleMonthCollapse: (monthId: string) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ 
  areas, 
  hotTopics,
  hotTopicChecks,
  activeMonthId,
  onMonthChange,
  monthIds,
  weeklySchedule, 
  allWeeklySchedules,
  monthlyPlans,
  onToggleTopicStatus,
  onUpdateSchedule,
  onUpdateMonthlyPlan,
}) => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [isPickingTopic, setIsPickingTopic] = useState<{ dayIndex: number; initialTab: 'curriculum' | 'hot' } | null>(null);
  const [pickerTab, setPickerTab] = useState<'curriculum' | 'hot'>('curriculum');
  const [pickerSearch, setPickerSearch] = useState('');
  
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const allTopicsMap = useMemo(() => {
    const map: Record<string, { name: string; areaName: string; subArea?: string; color: string; isHot?: boolean; status?: StudyStatus }> = {};
    areas.forEach(area => {
      area.topics.forEach(topic => {
        map[topic.id] = { 
          name: topic.name, 
          areaName: area.name, 
          subArea: topic.subArea, 
          color: area.color, 
          status: topic.status 
        };
      });
    });
    hotTopics.forEach((topic, index) => {
      const hotId = `hot_${index}`;
      const colorMap: Record<string, string> = {
        'Clínica Médica': 'blue', 'Cirurgia Geral': 'red', 'Ginecologia e Obstetrícia': 'pink',
        'Pediatria': 'green', 'Medicina Preventiva': 'indigo'
      };
      const isChecked = hotTopicChecks[topic.name];
      map[hotId] = {
        name: topic.name, 
        areaName: topic.category,
        subArea: topic.area,
        color: colorMap[topic.category] || 'orange', 
        isHot: true,
        status: isChecked ? StudyStatus.COMPLETED : StudyStatus.NOT_STARTED
      };
    });
    return map;
  }, [areas, hotTopics, hotTopicChecks]);

  const handleOpenPicker = (dayIndex: number, tab: 'curriculum' | 'hot') => {
    setPickerTab(tab);
    setPickerSearch('');
    setIsPickingTopic({ dayIndex, initialTab: tab });
  };

  const handleAddTopicToDay = (topicId: string) => {
    if (isPickingTopic === null) return;
    const currentDayTopics = weeklySchedule[isPickingTopic.dayIndex] || [];
    if (!currentDayTopics.includes(topicId)) {
      onUpdateSchedule(isPickingTopic.dayIndex, [...currentDayTopics, topicId]);
    }
  };

  const handleClearDay = (dayIndex: number) => {
    if (confirm(`Limpar todos os temas de ${days[dayIndex]}?`)) {
      onUpdateSchedule(dayIndex, []);
    }
  };

  const handleDeleteIndividualTopic = (dayIndex: number, topicId: string, topicName: string) => {
    if (confirm(`Remover "${topicName}" de ${days[dayIndex]}?`)) {
      const currentDayTopics = weeklySchedule[dayIndex] || [];
      onUpdateSchedule(dayIndex, currentDayTopics.filter(id => id !== topicId));
    }
  };

  const getBgColorClass = (color: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-50/50 dark:bg-green-900/10 border-green-500';
    switch (color) {
      case 'blue': return 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100';
      case 'red': return 'bg-red-50/90 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100';
      case 'pink': return 'bg-pink-50/90 dark:bg-pink-900/20 border-pink-500 text-pink-900 dark:text-pink-100';
      case 'green': return 'bg-green-50/90 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100';
      case 'indigo': return 'bg-indigo-50/90 dark:bg-indigo-900/20 border-indigo-500 text-indigo-900 dark:text-indigo-100';
      default: return 'bg-orange-50/90 dark:bg-orange-900/20 border-orange-500 text-orange-900 dark:text-orange-100';
    }
  };

  const getMonthTopics = (monthId: string) => {
    const ids = new Set<string>();
    const schedule = allWeeklySchedules[monthId] || {};
    Object.values(schedule).forEach(dayIds => {
      dayIds.forEach(id => ids.add(id));
    });
    return Array.from(ids);
  };

  const filteredCurriculumAreas = useMemo(() => {
    return areas.map(area => {
      const filtered = area.topics.filter(t => t.name.toLowerCase().includes(pickerSearch.toLowerCase()));
      if (pickerSearch && filtered.length === 0) return null;
      return { ...area, topics: filtered };
    }).filter(Boolean) as Area[];
  }, [areas, pickerSearch]);

  const filteredHotTopics = useMemo(() => {
    return hotTopics.filter(t => t.name.toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [hotTopics, pickerSearch]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Navegação */}
      <div className="flex flex-col gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/30 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Organizador de Estudos</p>
            <p className="text-xl font-black text-gray-800 dark:text-white">Gerenciamento 2026</p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => setView('weekly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-900 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}
            >
              📅 Semanal
            </button>
            <button 
              onClick={() => setView('monthly')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}
            >
              🗓️ Mensal
            </button>
          </div>
        </div>

        {view === 'weekly' && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar animate-in fade-in duration-300">
            {monthIds.map(m => (
              <button 
                key={m} 
                onClick={() => onMonthChange(m)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap border-2 ${activeMonthId === m ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105 z-10' : 'bg-white dark:bg-slate-800 border-transparent text-gray-400 hover:text-blue-500'}`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'weekly' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {days.map((day, idx) => {
            const scheduledIds = weeklySchedule[idx] || [];
            return (
              <div key={day} className="flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-white dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all overflow-hidden">
                <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">{day}</span>
                    <h5 className="text-base font-black text-gray-800 dark:text-white leading-tight">Plano Diário</h5>
                  </div>
                  {scheduledIds.length > 0 && (
                    <button onClick={() => handleClearDay(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Limpar Dia">🗑️</button>
                  )}
                </div>
                
                <div className="flex-1 p-4 space-y-3 min-h-[250px] max-h-[400px] overflow-y-auto scrollbar-hide">
                  {scheduledIds.length > 0 ? scheduledIds.map(topicId => {
                    const topic = allTopicsMap[topicId];
                    if (!topic) return null;
                    const isCompleted = topic.status === StudyStatus.COMPLETED || topic.status === StudyStatus.REVIEWED;
                    return (
                      <div key={topicId} className={`p-3 rounded-2xl text-[10px] font-bold border-l-4 shadow-sm transition-all relative group/item hover:scale-[1.02] flex items-center gap-3 ${getBgColorClass(topic.color, isCompleted)}`}>
                        <div className={`flex-1 leading-tight ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                          <div className="flex items-center gap-1">
                            {topic.isHot && <span className="text-xs">🔥</span>}
                            <span className="truncate block max-w-[120px]">{topic.name}</span>
                          </div>
                          <span className={`block mt-0.5 text-[7px] font-black uppercase tracking-tight opacity-70`}>
                            {topic.subArea || topic.areaName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => onToggleTopicStatus(topicId)} className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] border ${isCompleted ? 'bg-green-500 border-green-600 text-white shadow-inner' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-blue-400'}`}>
                            {isCompleted ? '✓' : ''}
                          </button>
                          <button onClick={() => handleDeleteIndividualTopic(idx, topicId, topic.name)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 font-black text-xs transition-colors">×</button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="h-full flex items-center justify-center py-10 opacity-30 text-center">
                       <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Livre</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30 flex gap-2">
                  <button onClick={() => handleOpenPicker(idx, 'curriculum')} className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[9px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-900/40">📚 Edital</button>
                  <button onClick={() => handleOpenPicker(idx, 'hot')} className="flex-1 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl text-[9px] font-black uppercase hover:bg-orange-100 transition-all border border-orange-100 dark:border-orange-900/40">🔥 Quentes</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h4 className="text-3xl font-black uppercase tracking-tight">Fluxo Anual de Estudos - 2026</h4>
               <p className="text-sm opacity-60 font-medium">Visualização panorâmica de todos os assuntos planejados para o ano.</p>
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🗓️</div>
          </div>

          <div className="space-y-16">
            {monthIds.map((m) => {
              const monthTopics = getMonthTopics(m);
              return (
                <div key={m} className="space-y-6">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-slate-800 p-10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl font-black select-none pointer-events-none uppercase">
                      {m.split(' ')[0]}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-10 border-b dark:border-slate-800 pb-8">
                       <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shrink-0">
                         {m.charAt(0)}
                       </div>
                       <div className="text-center md:text-left">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{m}</h3>
                          <p className="text-xs text-gray-500 font-medium">Conteúdo programático para este período.</p>
                       </div>
                       <div className="ml-auto px-6 py-2 bg-gray-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400">
                          {monthTopics.length} Temas Agendados
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {monthTopics.length > 0 ? monthTopics.map(id => {
                         const topic = allTopicsMap[id];
                         if (!topic) return null;
                         const isCompleted = topic.status === StudyStatus.COMPLETED || topic.status === StudyStatus.REVIEWED;
                         return (
                           <div key={`${m}-${id}`} className={`px-5 py-4 rounded-3xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 shadow-inner' : `bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 shadow-sm hover:border-${topic.color}-400`}`}>
                              <span className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : `bg-${topic.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}`}></span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-black truncate leading-tight ${isCompleted ? 'text-green-700 line-through opacity-60' : 'text-gray-800 dark:text-white'}`}>
                                  {topic.isHot && '🔥 '}{topic.name}
                                </p>
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-0.5">
                                  {topic.subArea || topic.areaName}
                                </p>
                              </div>
                              <button onClick={() => onToggleTopicStatus(id)} className="shrink-0 text-xl transition-transform hover:scale-125">
                                {isCompleted ? '✅' : '⬜'}
                              </button>
                           </div>
                         );
                       }) : (
                         <div className="col-span-full py-10 text-center opacity-40">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Mês sem agendamentos</p>
                         </div>
                       )}
                    </div>

                    <div className="mt-10 pt-8 border-t dark:border-slate-800">
                       <div className="flex items-center gap-3 mb-4">
                          <span className="text-lg">✍️</span>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metas Estratégicas: {m}</h4>
                       </div>
                       <textarea 
                          value={monthlyPlans[m] || ''}
                          onChange={(e) => onUpdateMonthlyPlan(m, e.target.value)}
                          placeholder={`Defina as metas e prioridades para ${m}...`}
                          className="w-full h-24 bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border-none p-6 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-100 shadow-inner resize-none leading-relaxed transition-all"
                       />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPickingTopic !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b dark:border-slate-800 flex flex-col gap-4 bg-gray-50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black text-gray-800 dark:text-white">Selecionar Assunto</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Para {days[isPickingTopic.dayIndex]} - {activeMonthId}</p>
                </div>
                <button onClick={() => setIsPickingTopic(null)} className="text-xl font-bold p-2 hover:bg-gray-100 rounded-full dark:text-white transition-all">✕</button>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-3 shadow-inner border dark:border-slate-700">
                <span className="text-lg">🔍</span>
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white font-medium"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                />
              </div>

              <div className="flex bg-gray-200/50 dark:bg-slate-800 p-1 rounded-2xl w-full">
                <button 
                  onClick={() => setPickerTab('curriculum')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${pickerTab === 'curriculum' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-gray-400'}`}
                >
                  📚 Edital Vertical
                </button>
                <button 
                  onClick={() => setPickerTab('hot')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${pickerTab === 'hot' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600' : 'text-gray-400'}`}
                >
                  🔥 Temas Quentes
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {pickerTab === 'curriculum' ? (
                filteredCurriculumAreas.length > 0 ? filteredCurriculumAreas.map(area => (
                  <div key={area.id} className="space-y-4">
                    <div className={`p-4 rounded-2xl bg-${area.color}-600 text-white font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-lg`}>
                       <span className="text-xl">{area.icon}</span> {area.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {area.topics.map(topic => {
                         const isAdded = (weeklySchedule[isPickingTopic.dayIndex] || []).includes(topic.id);
                         return (
                           <button
                             key={topic.id}
                             onClick={() => handleAddTopicToDay(topic.id)}
                             className={`text-left p-3 rounded-xl border transition-all flex flex-col ${isAdded ? 'opacity-40 cursor-default bg-gray-100' : `bg-white border-gray-100 hover:border-${area.color}-400 hover:bg-${area.color}-50 dark:hover:bg-slate-800 dark:text-white`}`}
                           >
                             <span className="text-xs font-bold leading-tight pr-4">{topic.name}</span>
                             <span className="text-[9px] font-black uppercase opacity-40 mt-1">{topic.subArea || area.name}</span>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                )) : <div className="text-center py-20 text-gray-400 italic">Nenhum assunto do edital encontrado.</div>
              ) : (
                <div className="space-y-6">
                  {['Clínica Médica', 'Cirurgia Geral', 'Ginecologia e Obstetrícia', 'Pediatria', 'Medicina Preventiva'].map(cat => {
                    const topicsInCat = filteredHotTopics.filter(t => t.category === cat);
                    if (pickerSearch && topicsInCat.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-4">
                        <h4 className="font-black text-gray-400 dark:text-slate-500 uppercase text-[10px] tracking-widest border-l-4 border-orange-500 pl-2">{cat}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {topicsInCat.map((topic) => {
                            const index = hotTopics.findIndex(t => t.name === topic.name);
                            const hotId = `hot_${index}`;
                            const isAdded = (weeklySchedule[isPickingTopic.dayIndex] || []).includes(hotId);
                            return (
                              <button
                                key={hotId}
                                onClick={() => handleAddTopicToDay(hotId)}
                                className={`text-left p-3 rounded-xl border transition-all flex flex-col ${isAdded ? 'opacity-40 cursor-default bg-gray-100' : 'bg-white border-gray-100 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800 dark:text-white'}`}
                              >
                                <span className="text-xs font-bold leading-tight">🔥 {topic.name}</span>
                                <span className="text-[9px] font-black uppercase opacity-40 mt-1">{topic.area}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {pickerSearch && filteredHotTopics.length === 0 && <div className="text-center py-20 text-gray-400 italic">Nenhum tema quente encontrado.</div>}
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                <button onClick={() => setIsPickingTopic(null)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Salvar Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
