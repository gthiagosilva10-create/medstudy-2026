
import React, { useMemo, useState } from 'react';
import { Area, StudyStatus, ExamRecord } from '../types';
import { HotTopic } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface DashboardProps {
  areas: Area[];
  hotTopics: HotTopic[];
  hotTopicChecks: Record<string, boolean>;
  exams: ExamRecord[];
  tabLabels: Record<string, string>;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  syncId: string;
  onConnectSync: (id: string) => void;
  onPushSync: () => void;
  onPullSync: () => void;
  lastSync: string;
  targetExamDate: string;
  targetExamName: string;
  onUpdateExamInfo: (name: string, date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  areas, 
  hotTopics, 
  hotTopicChecks, 
  exams,
  tabLabels,
  targetExamDate,
  targetExamName,
  onUpdateExamInfo
}) => {
  const [isEditingCountdown, setIsEditingCountdown] = useState(false);
  const [tempName, setTempName] = useState(targetExamName);
  const [tempDate, setTempDate] = useState(targetExamDate);

  const stats = useMemo(() => {
    let totalRegular = 0;
    let completedRegular = 0;

    areas.forEach(area => {
      area.topics.forEach(topic => {
        totalRegular++;
        if (topic.status === StudyStatus.COMPLETED || topic.status === StudyStatus.REVIEWED) completedRegular++;
      });
    });

    const totalHot = hotTopics.length;
    const completedHot = Object.values(hotTopicChecks).filter(Boolean).length;
    const totalGlobal = totalRegular + totalHot;
    const completedGlobal = completedRegular + completedHot;

    const simCount = exams.length;
    const avgScore = simCount > 0 
      ? Math.round(exams.reduce((acc, curr) => acc + (curr.correctAnswers / curr.totalQuestions), 0) / simCount * 100)
      : 0;

    return { 
      total: totalGlobal, 
      completed: completedGlobal,
      percentGlobal: totalGlobal > 0 ? Math.round((completedGlobal / totalGlobal) * 100) : 0,
      simulations: { count: simCount, avg: avgScore },
      regular: { total: totalRegular, completed: completedRegular, percent: totalRegular > 0 ? Math.round((completedRegular / totalRegular) * 100) : 0 },
      hot: { total: totalHot, completed: completedHot, percent: totalHot > 0 ? Math.round((completedHot / totalHot) * 100) : 0 }
    };
  }, [areas, hotTopics, hotTopicChecks, exams]);

  const countdown = useMemo(() => {
    const target = new Date(targetExamDate);
    const now = new Date();
    // Normalizar para o início do dia para evitar flutuações por hora
    const targetNormalized = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const nowNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diff = targetNormalized.getTime() - nowNormalized.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return {
      days: days > 0 ? days : 0,
      dateFormatted: target.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    };
  }, [targetExamDate]);

  const chartData = useMemo(() => {
    const data = areas.map(area => ({
      name: area.name.toUpperCase(),
      v: area.topics.filter(t => t.status === StudyStatus.COMPLETED || t.status === StudyStatus.REVIEWED).length,
      total: area.topics.length,
      color: area.color
    }));
    data.push({ 
      name: (tabLabels['hot-topics'] || 'TEMAS QUENTES').toUpperCase(), 
      v: stats.hot.completed, 
      total: stats.hot.total,
      color: 'orange' 
    });
    return data;
  }, [areas, stats.hot, tabLabels]);

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={-170} 
          y={0} 
          dy={4} 
          textAnchor="start" 
          fill="#64748b" 
          fontSize={12} 
          fontWeight="900"
          style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const handleSaveCountdown = () => {
    onUpdateExamInfo(tempName, tempDate);
    setIsEditingCountdown(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 🏁 COUNTDOWN SECTION */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-blue-600 group">
         
         <div className="relative z-10 text-center md:text-left space-y-2 flex-1">
            {isEditingCountdown ? (
              <div className="space-y-4 animate-in slide-in-from-left-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-blue-400">Nome da Prova Alvo</label>
                  <input 
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-blue-400">Data Prevista</label>
                  <input 
                    type="date"
                    value={tempDate}
                    onChange={e => setTempDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveCountdown} className="px-6 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase">Salvar</button>
                  <button onClick={() => setIsEditingCountdown(false)} className="px-6 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Contagem Regressiva</p>
                  <button 
                    onClick={() => setIsEditingCountdown(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-400 hover:text-white transition-opacity"
                    title="Editar Prova e Data"
                  >
                    ✏️
                  </button>
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase">{targetExamName}</h2>
                <p className="text-sm font-medium text-slate-400">Data prevista: <span className="text-slate-100 font-bold">{countdown.dateFormatted}</span></p>
              </>
            )}
         </div>

         <div className="relative z-10 flex items-center gap-6">
            <div className="text-center">
               <div className="text-6xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {countdown.days}
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">Dias Restantes</p>
            </div>
            <div className="h-16 w-px bg-slate-800"></div>
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 text-3xl shadow-inner">
               🎯
            </div>
         </div>
         
         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🚀 COMPACT STATUS BALLOONS - LADO A LADO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-600 p-4 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Status Global</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-xl font-black">{stats.percentGlobal}%</h3>
            <span className="text-[9px] opacity-60">Geral</span>
          </div>
          <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-1000" style={{ width: `${stats.percentGlobal}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
           <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1 truncate">{tabLabels['topics'] || 'Edital'}</p>
           <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">{stats.regular.percent}%</h3>
           <p className="text-[8px] text-gray-400 font-bold mt-1 uppercase truncate">{stats.regular.completed}/{stats.regular.total} Temas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
           <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest mb-1 truncate">{tabLabels['hot-topics'] || 'Quentes'}</p>
           <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">{stats.hot.percent}%</h3>
           <p className="text-[8px] text-gray-400 font-bold mt-1 uppercase truncate">{stats.hot.completed}/{stats.hot.total} Itens</p>
        </div>

        <div className="bg-slate-900 dark:bg-black p-4 rounded-3xl shadow-lg text-white">
           <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1 truncate">{tabLabels['exams'] || 'Simulados'}</p>
           <div className="flex items-baseline gap-1">
             <h3 className="text-xl font-black">{stats.simulations.count}</h3>
             <span className="text-[9px] text-blue-400 font-black">({stats.simulations.avg}%)</span>
           </div>
        </div>
      </div>

      {/* 📊 ASSUNTOS ESTUDADOS - JANELA MENOR E ALINHAMENTO TOTAL À ESQUERDA COM FONTE +50% */}
      <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Assuntos Estudados</h3>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Concluídos por grande área médica</p>
            </div>
            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700 text-[8px] font-black text-gray-500 uppercase">
               Resumo Evolutivo
            </div>
         </div>
         
         <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 170, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.03} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={<CustomYAxisTick />} 
                  width={170}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="v" radius={[0, 6, 6, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.color === 'blue' ? '#3b82f6' : 
                        entry.color === 'red' ? '#ef4444' : 
                        entry.color === 'pink' ? '#ec4899' : 
                        entry.color === 'green' ? '#10b981' : 
                        entry.color === 'indigo' ? '#6366f1' : '#f97316'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
