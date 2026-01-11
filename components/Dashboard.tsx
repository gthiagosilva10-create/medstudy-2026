
import React, { useMemo } from 'react';
import { Area, StudyStatus } from '../types';
import { HotTopic } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  areas: Area[];
  hotTopics: HotTopic[];
  hotTopicChecks: Record<string, boolean>;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ areas, hotTopics, hotTopicChecks, onExport, onImport }) => {
  const stats = useMemo(() => {
    let totalRegular = 0;
    let completedRegular = 0;
    let inProgressRegular = 0;

    areas.forEach(area => {
      area.topics.forEach(topic => {
        totalRegular++;
        if (topic.status === StudyStatus.COMPLETED || topic.status === StudyStatus.REVIEWED) completedRegular++;
        if (topic.status === StudyStatus.IN_PROGRESS) inProgressRegular++;
      });
    });

    const totalHot = hotTopics.length;
    const completedHot = Object.values(hotTopicChecks).filter(Boolean).length;

    const totalGlobal = totalRegular + totalHot;
    const completedGlobal = completedRegular + completedHot;

    return { 
      total: totalGlobal, 
      completed: completedGlobal,
      percentGlobal: totalGlobal > 0 ? Math.round((completedGlobal / totalGlobal) * 100) : 0,
      regular: { 
        total: totalRegular, 
        completed: completedRegular,
        percent: totalRegular > 0 ? Math.round((completedRegular / totalRegular) * 100) : 0
      },
      hot: { 
        total: totalHot, 
        completed: completedHot,
        percent: totalHot > 0 ? Math.round((completedHot / totalHot) * 100) : 0
      }
    };
  }, [areas, hotTopics, hotTopicChecks]);

  const chartData = useMemo(() => {
    const data = areas.map(area => ({
      name: area.name.toUpperCase(),
      v: area.topics.filter(t => t.status === StudyStatus.COMPLETED || t.status === StudyStatus.REVIEWED).length,
      total: area.topics.length,
      color: area.color
    }));

    data.push({
      name: 'TEMAS QUENTES',
      v: stats.hot.completed,
      total: stats.hot.total,
      color: 'orange'
    });

    return data;
  }, [areas, stats.hot]);

  const pieData = [
    { name: 'Edital Vertical', value: stats.regular.completed, color: '#3b82f6' },
    { name: 'Temas Quentes', value: stats.hot.completed, color: '#f97316' },
    { name: 'Pendente', value: stats.total - stats.completed, color: '#94a3b8' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl">
          <p className="text-xs font-bold dark:text-white uppercase mb-1">{label || payload[0].name}</p>
          <p className="text-lg font-black text-blue-600 dark:text-blue-400">{payload[0].value} Temas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: PROGRESSO GLOBAL */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex items-center justify-between transition-all group hover:scale-[1.02]">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">Progresso Global</p>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stats.percentGlobal}%</h3>
            <div className="w-24 h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.percentGlobal}%` }} />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold border border-indigo-100 dark:border-indigo-800">
            📊
          </div>
        </div>

        {/* CARD 2: EDITAL VERTICALIZADO */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex items-center justify-between transition-all group hover:scale-[1.02]">
          <div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">Edital Verticalizado</p>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              {stats.regular.completed} 
              <span className="text-sm text-gray-400 dark:text-slate-500 font-bold ml-1">/ {stats.regular.total}</span>
            </h3>
            <div className="w-24 h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.regular.percent}%` }} />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold border border-blue-100 dark:border-blue-800">
            📚
          </div>
        </div>

        {/* CARD 3: TEMAS QUENTES */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex items-center justify-between transition-all group hover:scale-[1.02]">
          <div>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest mb-1">Temas Quentes CERMAM</p>
            <h3 className="text-4xl font-black text-orange-600 dark:text-orange-400 tracking-tighter">
              {stats.hot.completed}
              <span className="text-sm text-gray-400 dark:text-slate-500 font-bold ml-1">/ {stats.hot.total}</span>
            </h3>
            <div className="w-24 h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${stats.hot.percent}%` }} />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-2xl font-bold border border-orange-100 dark:border-orange-800">
            🔥
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 h-[450px] transition-all">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Desempenho por Segmento</h4>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Progresso Real</span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: '900' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="v" radius={[0, 12, 12, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color === 'blue' ? '#3b82f6' : entry.color === 'red' ? '#ef4444' : entry.color === 'pink' ? '#ec4899' : entry.color === 'green' ? '#10b981' : entry.color === 'indigo' ? '#6366f1' : entry.color === 'orange' ? '#f97316' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CARD GESTÃO DE DADOS */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 flex flex-col transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-2xl">💾</div>
            <div>
               <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Gestão de Dados e Arquivos</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Garanta que seu progresso esteja seguro</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
             <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Seus dados são salvos localmente no seu navegador. Para maior segurança, exporte um backup físico regularmente. Use o backup para restaurar seu progresso em outro dispositivo.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                    onClick={onExport}
                    className="flex-1 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                   >
                     📥 Exportar Backup (.json)
                   </button>
                   
                   <label className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-3 cursor-pointer">
                     📂 Importar Backup
                     <input type="file" accept=".json" onChange={onImport} className="hidden" />
                   </label>
                </div>
             </div>

             <div className="p-5 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-r-3xl text-xs text-amber-800 dark:text-amber-400">
                <strong>Atenção:</strong> Arquivos pesados (como PDFs e Vídeos) são salvos como referências. Ao restaurar um backup, certifique-se de que os arquivos originais ainda existam nas pastas do seu dispositivo.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
