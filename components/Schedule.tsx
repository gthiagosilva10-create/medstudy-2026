
import React, { useState, useMemo, useEffect } from 'react';
import { Area, WeeklySchedule, Topic, MonthlyPlans, StudyStatus } from '../types';
import { HotTopic } from '../constants';

interface ScheduleProps {
  areas: Area[];
  hotTopics: HotTopic[];
  hotTopicChecks: Record<string, boolean>;
  activeMonthId: string;
  onMonthChange: (monthId: string) => void;
  weeklySchedule: WeeklySchedule;
  monthSchedules: Record<string, WeeklySchedule>;
  monthlyPlans: MonthlyPlans;
  orderedMonthIds: string[];
  collapsedMonths: Record<string, boolean>;
  targetExamDate: string;
  onToggleTopicStatus: (topicId: string) => void;
  onUpdateSchedule: (dayIndex: number, topicIds: string[]) => void;
  onUpdateMonthlyPlan: (monthId: string, content: string) => void;
  onUpdateMonthOrder: (newOrder: string[]) => void;
  onToggleMonthCollapse: (monthId: string) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ 
  areas, 
  hotTopics,
  hotTopicChecks,
  activeMonthId,
  onMonthChange,
  weeklySchedule, 
  monthSchedules,
  monthlyPlans,
  orderedMonthIds,
  collapsedMonths,
  targetExamDate,
  onToggleTopicStatus,
  onUpdateSchedule,
  onUpdateMonthlyPlan,
  onUpdateMonthOrder,
  onToggleMonthCollapse
}) => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [isPickingTopic, setIsPickingTopic] = useState<{ dayIndex: number; initialTab: 'curriculum' | 'hot' } | null>(null);
  const [pickerTab, setPickerTab] = useState<'curriculum' | 'hot'>('curriculum');
  
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Gera a lista base de meses caso não exista uma ordem salva
  const defaultStudyMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    const target = new Date(targetExamDate);
    let current = new Date(today.getFullYear(), today.getMonth(), 1);
    const limit = new Date(target.getFullYear(), target.getMonth(), 1);
    
    let count = 0;
    while (current <= limit || count < 6) {
      const monthId = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const monthName = current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ id: monthId, label: monthName.charAt(0).toUpperCase() + monthName.slice(1) });
      
      const nextMonth = new Date(current);
      nextMonth.setMonth(current.getMonth() + 1);
      current = nextMonth;
      
      count++;
      if (count > 48) break;
    }
    return months;
  }, [targetExamDate]);

  // Sincroniza a ordem salva com os IDs disponíveis
  const sortedMonths = useMemo(() => {
    if (!orderedMonthIds || orderedMonthIds.length === 0) return defaultStudyMonths;
    
    // Filtra IDs que podem ter sido removidos e adiciona novos meses gerados pela data
    const existingIds = defaultStudyMonths.map(m => m.id);
    const order = orderedMonthIds.filter(id => existingIds.includes(id));
    const missing = defaultStudyMonths.filter(m => !order.includes(m.id));
    
    const finalOrder = [...order, ...missing.map(m => m.id)];
    
    return finalOrder.map(id => {
      const found = defaultStudyMonths.find(m => m.id === id);
      return found || { id, label: id };
    });
  }, [defaultStudyMonths, orderedMonthIds]);

  const activeMonthLabel = useMemo(() => {
    return defaultStudyMonths.find(m => m.id === activeMonthId)?.label || activeMonthId;
  }, [activeMonthId, defaultStudyMonths]);

  const allTopicsMap = useMemo(() => {
    const map: Record<string, { name: string; areaName: string; color: string; isHot?: boolean; status?: StudyStatus }> = {};
    areas.forEach(area => {
      area.topics.forEach(topic => {
        map[topic.id] = { name: topic.name, areaName: area.name, color: area.color, status: topic.status };
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
        name: topic.name, areaName: topic.category,
        color: colorMap[topic.category] || 'orange', isHot: true,
        status: isChecked ? StudyStatus.COMPLETED : StudyStatus.NOT_STARTED
      };
    });
    return map;
  }, [areas, hotTopics, hotTopicChecks]);

  const handleNavigateMonth = (direction: 'next' | 'prev') => {
    const currentIndex = defaultStudyMonths.findIndex(m => m.id === activeMonthId);
    if (direction === 'next' && currentIndex < defaultStudyMonths.length - 1) {
      onMonthChange(defaultStudyMonths[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      onMonthChange(defaultStudyMonths[currentIndex - 1].id);
    }
  };

  const handleMoveMonth = (id: string, direction: 'up' | 'down') => {
    const currentOrder = sortedMonths.map(m => m.id);
    const idx = currentOrder.indexOf(id);
    if (direction === 'up' && idx > 0) {
      const newOrder = [...currentOrder];
      [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
      onUpdateMonthOrder(newOrder);
    } else if (direction === 'down' && idx < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      onUpdateMonthOrder(newOrder);
    }
  };

  const handleOpenPicker = (dayIndex: number, tab: 'curriculum' | 'hot') => {
    setPickerTab(tab);
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
    if (confirm(`Limpar todos os temas de ${days[dayIndex]} em ${activeMonthLabel}?`)) {
      onUpdateSchedule(dayIndex, []);
    }
  };

  const getTopicsForMonth = (monthId: string) => {
    const monthSched = monthSchedules[monthId];
    if (!monthSched) return [];
    
    const allIds = new Set<string>();
    (Object.values(monthSched) as string[][]).forEach(ids => {
      ids.forEach(id => allIds.add(id));
    });
    
    return Array.from(allIds).map(id => ({ id, ...allTopicsMap[id] })).filter(t => t.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/30 dark:border-slate-800 shadow-sm">
        <div className={`flex items-center gap-4 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-opacity ${view === 'monthly' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => handleNavigateMonth('prev')}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-400 font-bold"
          >
            ❮
          </button>
          <div className="px-4 text-center min-w-[160px]">
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Mês de Estudo</p>
            <p className="text-sm font-black text-gray-800 dark:text-white">{activeMonthLabel}</p>
          </div>
          <button 
            onClick={() => handleNavigateMonth('next')}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-400 font-bold"
          >
            ❯
          </button>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button 
            onClick={() => setView('weekly')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'weekly' ? 'bg-white dark:bg-slate-900 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}
          >
            📅 Grade Semanal
          </button>
          <button 
            onClick={() => setView('monthly')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-md text-gray-900 dark:text-white' : 'text-gray-400'}`}
          >
            🗓️ Visão Mensal
          </button>
        </div>
      </div>

      {view === 'weekly' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 animate-in fade-in zoom-in-95">
          {days.map((day, idx) => {
            const scheduledIds = weeklySchedule[idx] || [];
            return (
              <div key={day} className="flex flex-col gap-3 group">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b-4 border-gray-900/10 dark:border-slate-800 p-4 rounded-3xl flex justify-between items-center shadow-lg">
                  <span className="text-[10px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest">{day}</span>
                  {scheduledIds.length > 0 && (
                    <button onClick={() => handleClearDay(idx)} className="text-xs text-gray-400 hover:text-red-500">🗑️</button>
                  )}
                </div>
                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-dashed border-white/50 dark:border-slate-800 rounded-[2rem] min-h-[400px] p-3 flex flex-col gap-3 transition-all hover:bg-white/60 dark:hover:bg-slate-900/60">
                  <div className="flex-1 space-y-3">
                    {scheduledIds.map(topicId => {
                      const topic = allTopicsMap[topicId];
                      if (!topic) return null;
                      const isCompleted = topic.status === StudyStatus.COMPLETED || topic.status === StudyStatus.REVIEWED;

                      return (
                        <div 
                          key={topicId} 
                          className={`p-3 rounded-2xl text-[11px] font-bold border-l-4 shadow-sm transition-all relative group/item hover:scale-105 ${
                            isCompleted
                              ? `bg-green-50/50 dark:bg-green-900/10 border-green-500 text-gray-400 dark:text-slate-600 opacity-80`
                              : `bg-${topic.color}-50/90 dark:bg-${topic.color}-900/20 border-${topic.color}-500 text-${topic.color}-900 dark:text-${topic.color}-100`
                          } ${topic.isHot ? 'ring-2 ring-orange-400/20' : ''}`}
                        >
                          <div className={`pr-8 leading-tight ${isCompleted ? 'line-through' : ''}`}>
                            {topic.isHot && <span className="mr-1">🔥</span>}
                            {topic.name}
                          </div>
                          
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTopicStatus(topicId);
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all border ${
                                isCompleted 
                                  ? 'bg-green-500 border-green-600 text-white shadow-inner' 
                                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-300 hover:border-blue-400'
                              }`}
                              title={isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                            >
                              {isCompleted ? '✓' : ''}
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateSchedule(idx, scheduledIds.filter(id => id !== topicId));
                              }}
                              className="w-6 h-6 flex items-center justify-center opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <button 
                      onClick={() => handleOpenPicker(idx, 'curriculum')}
                      className="w-full py-3 border-2 border-dashed border-blue-100 dark:border-blue-900 rounded-2xl text-blue-500 dark:text-blue-400 text-[9px] font-black uppercase hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      📚 + Edital
                    </button>
                    <button 
                      onClick={() => handleOpenPicker(idx, 'hot')}
                      className="w-full py-3 border-2 border-dashed border-orange-100 dark:border-orange-900 rounded-2xl text-orange-500 dark:text-orange-400 text-[9px] font-black uppercase hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      🔥 + Quentes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-black">Planejamento Estratégico</h4>
              <p className="text-sm opacity-80 font-medium">Os temas da sua grade semanal aparecem automaticamente aqui.</p>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black bg-white/20 px-4 py-2 rounded-full uppercase tracking-widest">Folders Mensais</span>
               <span className="text-4xl">🚀</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sortedMonths.map((month) => {
              const monthTopics = getTopicsForMonth(month.id);
              const isCollapsed = collapsedMonths[month.id] || false;
              
              return (
                <div 
                  key={month.id} 
                  className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] border transition-all flex flex-col shadow-xl overflow-hidden ${activeMonthId === month.id ? 'ring-4 ring-blue-500/20 border-blue-100 dark:border-blue-900' : 'border-white/20 dark:border-slate-800'}`}
                >
                  <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center border-b dark:border-slate-800 gap-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onToggleMonthCollapse(month.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                        title={isCollapsed ? "Expandir" : "Minimizar"}
                      >
                        📂
                      </button>
                      <div>
                        <h5 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
                          {month.label}
                          {activeMonthId === month.id && (
                            <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Ativo</span>
                          )}
                        </h5>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{monthTopics.length} Temas Agendados</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {/* CONTROLES DE ORDEM */}
                       <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700">
                          <button 
                            onClick={() => handleMoveMonth(month.id, 'up')}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                            title="Subir na lista"
                          >
                            ⬆️
                          </button>
                          <button 
                            onClick={() => handleMoveMonth(month.id, 'down')}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                            title="Descer na lista"
                          >
                            ⬇️
                          </button>
                       </div>
                       
                       <button 
                         onClick={() => onToggleMonthCollapse(month.id)}
                         className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-blue-600 transition-all"
                       >
                         {isCollapsed ? 'Expandir Pasta' : 'Minimizar'}
                       </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Temas Agendados na Semana</p>
                        </div>
                        {monthTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-2 p-1">
                            {monthTopics.map(t => (
                              <div key={t.id} className={`px-3 py-1.5 rounded-xl text-[9px] font-black border flex items-center gap-1 transition-all hover:scale-105 ${
                                t.status === StudyStatus.COMPLETED || t.status === StudyStatus.REVIEWED
                                  ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50 opacity-60'
                                  : `bg-${t.color}-50 dark:bg-${t.color}-900/10 text-${t.color}-700 dark:text-${t.color}-300 border-${t.color}-100 dark:border-${t.color}-900/50`
                              }`}>
                                {t.isHot && <span>🔥</span>}
                                {t.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl text-center text-gray-300 dark:text-slate-700 italic text-xs">
                             Vazio: Use a Grade Semanal para planejar seus temas de {month.label}.
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                           <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Anotações do Mentor / Metas de Longo Prazo</p>
                         </div>
                         <textarea 
                            value={monthlyPlans[month.id] || ''}
                            onChange={(e) => onUpdateMonthlyPlan(month.id, e.target.value)}
                            placeholder={`Escreva suas metas para ${month.label} (ex: finalizar bloco de Hematologia)...`}
                            className="w-full min-h-[160px] bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 p-6 text-sm text-gray-800 dark:text-slate-200 leading-relaxed resize-none shadow-inner"
                          />
                      </div>
                    </div>
                  )}
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
                   <h3 className="text-2xl font-black text-gray-800 dark:text-white">Agendar Temas</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dia: {days[isPickingTopic.dayIndex]}</p>
                </div>
                <button onClick={() => setIsPickingTopic(null)} className="text-xl font-bold p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full dark:text-white">✕</button>
              </div>
              <div className="flex bg-gray-200/50 dark:bg-slate-800 p-1 rounded-2xl w-full">
                <button 
                  onClick={() => setPickerTab('curriculum')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${pickerTab === 'curriculum' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                >
                  📚 Edital Vertical
                </button>
                <button 
                  onClick={() => setPickerTab('hot')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${pickerTab === 'hot' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}
                >
                  🔥 Temas Quentes
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {pickerTab === 'curriculum' ? (
                areas.map(area => {
                   const subGroups: Record<string, Topic[]> = {};
                   area.topics.forEach(t => {
                      const grp = t.subArea || 'Geral';
                      if (!subGroups[grp]) subGroups[grp] = [];
                      subGroups[grp].push(t);
                   });

                   return (
                    <div key={area.id} className="space-y-6">
                      <div className={`p-4 rounded-2xl bg-${area.color}-600 text-white font-black uppercase text-xs tracking-widest flex items-center gap-3`}>
                         <span className="text-xl">{area.icon}</span> {area.name}
                      </div>
                      {Object.entries(subGroups).map(([sub, topics]) => (
                        <div key={sub} className="space-y-3">
                           <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{sub}</h5>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {topics.map(topic => {
                              const isAdded = (weeklySchedule[isPickingTopic.dayIndex] || []).includes(topic.id);
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => handleAddTopicToDay(topic.id)}
                                  className={`text-left p-3 rounded-xl border transition-all relative flex items-center justify-between group/btn ${
                                    isAdded
                                      ? `bg-${area.color}-50/50 dark:bg-${area.color}-900/10 border-${area.color}-200 text-${area.color}-300 cursor-default opacity-50`
                                      : `bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 hover:border-${area.color}-500 hover:bg-${area.color}-50 dark:hover:bg-${area.color}-900/10 text-gray-800 dark:text-slate-200`
                                  }`}
                                >
                                  <span className="text-xs font-bold leading-tight line-clamp-2 pr-4">{topic.name}</span>
                                  {isAdded && <span className="text-[10px]">✅</span>}
                                </button>
                              );
                            })}
                           </div>
                        </div>
                      ))}
                    </div>
                   );
                })
              ) : (
                <div className="space-y-6">
                  {['Clínica Médica', 'Cirurgia Geral', 'Ginecologia e Obstetrícia', 'Pediatria', 'Medicina Preventiva'].map(cat => {
                    const catTopics = hotTopics.map((t, i) => ({ ...t, index: i })).filter(t => t.category === cat);
                    return (
                      <div key={cat} className="space-y-4">
                        <h4 className="font-black text-gray-400 dark:text-slate-500 uppercase text-[10px] tracking-widest border-l-4 border-orange-500 pl-2">{cat}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {catTopics.map(topic => {
                            const hotId = `hot_${topic.index}`;
                            const isAdded = (weeklySchedule[isPickingTopic.dayIndex] || []).includes(hotId);
                            return (
                              <button
                                key={hotId}
                                onClick={() => handleAddTopicToDay(hotId)}
                                className={`text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                                  isAdded
                                    ? 'bg-orange-50/50 dark:bg-orange-900/10 text-orange-200 dark:text-orange-900 border-orange-100 dark:border-orange-950 opacity-50 cursor-default'
                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-800 dark:text-slate-200 shadow-sm'
                                }`}
                              >
                                <div className="flex gap-2">
                                   <span>🔥</span>
                                   <div className="font-bold text-sm leading-tight">{topic.name}</div>
                                </div>
                                {isAdded && <span className="text-[10px]">✅</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                <button 
                  onClick={() => setIsPickingTopic(null)}
                  className="bg-gray-900 dark:bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all"
                >
                  Concluído
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
