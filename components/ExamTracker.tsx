
import React, { useState } from 'react';
import { ExamRecord } from '../types';

interface ExamTrackerProps {
  exams: ExamRecord[];
  onAddExam: (exam: ExamRecord) => void;
  onDeleteExam: (id: string) => void;
  onUpdateExam: (exam: ExamRecord) => void;
}

const ExamTracker: React.FC<ExamTrackerProps> = ({ exams, onAddExam, onDeleteExam, onUpdateExam }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    totalQuestions: 100,
    correctAnswers: 0,
    observations: ''
  });

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const editingExam = exams.find(e => e.id === editingExamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExamId) {
      const updatedExam: ExamRecord = {
        ...formData,
        id: editingExamId,
      };
      onUpdateExam(updatedExam);
      setEditingExamId(null);
    } else {
      const newExam: ExamRecord = {
        ...formData,
        id: Date.now().toString(),
      };
      onAddExam(newExam);
      setIsAdding(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      totalQuestions: 100,
      correctAnswers: 0,
      observations: ''
    });
  };

  const startEditing = (exam: ExamRecord) => {
    setFormData({
      name: exam.name,
      date: exam.date,
      totalQuestions: exam.totalQuestions,
      correctAnswers: exam.correctAnswers,
      observations: exam.observations
    });
    setEditingExamId(exam.id);
    setSelectedExamId(null);
  };

  const getPercentageColor = (percent: number) => {
    if (percent >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (percent >= 65) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Histórico de Simulados</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Acompanhe sua evolução e registre seus aprendizados</p>
        </div>
        <button
          onClick={() => { setIsAdding(!isAdding); resetForm(); }}
          className={`px-8 py-3 rounded-2xl text-sm font-black uppercase transition-all shadow-lg flex items-center gap-2 ${isAdding ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isAdding ? '✕ Cancelar' : '+ Novo Simulado'}
        </button>
      </div>

      {(isAdding || editingExamId) && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-500 space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl">📝</div>
             <div>
                <h4 className="text-xl font-black text-gray-800 dark:text-white">{editingExamId ? 'Editar Registro' : 'Registrar Novo Simulado'}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preencha os dados oficiais da prova</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Instituição / Prova</label>
              <input
                required
                type="text"
                placeholder="Ex: USP-SP 2024"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Data</label>
              <input
                required
                type="date"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Total de Questões</label>
              <input
                required
                type="number"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.totalQuestions}
                onChange={e => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Seus Acertos</label>
              <input
                required
                type="number"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.correctAnswers}
                onChange={e => setFormData({ ...formData, correctAnswers: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Considerações, Erros e Observações</label>
              <textarea
                placeholder="Descreva o que sentiu na prova, quais blocos foram mais difíceis..."
                className="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/20 h-40 resize-none leading-relaxed"
                value={formData.observations}
                onChange={e => setFormData({ ...formData, observations: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4">
             {editingExamId && (
               <button type="button" onClick={() => { setEditingExamId(null); resetForm(); }} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest">Descartar Alterações</button>
             )}
             <button type="submit" className="flex-[2] py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest hover:scale-[1.01] transition-all">
                {editingExamId ? 'Atualizar Histórico' : 'Salvar no Histórico'}
             </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.length === 0 ? (
          <div className="bg-white/40 dark:bg-slate-900/40 border-4 border-dashed border-gray-100 dark:border-slate-800 rounded-[3rem] p-24 text-center space-y-4">
            <span className="text-7xl block grayscale opacity-20">📊</span>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Nenhum simulado registrado</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Registre suas provas para visualizar o gráfico de evolução no Dashboard.</p>
          </div>
        ) : (
          exams.map(exam => {
            const percentage = Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
            const colorClass = getPercentageColor(percentage);
            
            return (
              <div 
                key={exam.id} 
                onClick={() => setSelectedExamId(exam.id)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row items-center gap-6"
              >
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0 ${colorClass}`}>
                   <span className="text-2xl font-black leading-none">{percentage}%</span>
                   <span className="text-[8px] font-black uppercase mt-1">Score</span>
                </div>

                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h4 className="text-lg font-black text-gray-800 dark:text-white truncate uppercase tracking-tight">{exam.name}</h4>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-400 text-[10px] font-black rounded-lg uppercase whitespace-nowrap">{new Date(exam.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {exam.correctAnswers} acertos de {exam.totalQuestions} questões • 
                    <span className="ml-1 italic">{exam.observations ? 'Contém considerações' : 'Sem notas'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEditing(exam); }}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 hover:text-blue-500 text-gray-400 transition-all"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este simulado do histórico?')) onDeleteExam(exam.id); }}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          }).reverse()
        )}
      </div>

      {/* MODAL DE DETALHES / CONSIDERAÇÕES */}
      {selectedExamId && selectedExam && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-start bg-gray-50 dark:bg-slate-900/50">
                 <div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{selectedExam.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Relatório Completo de Desempenho</p>
                 </div>
                 <button onClick={() => setSelectedExamId(null)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-xl font-bold transition-all dark:text-white">✕</button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl text-center border border-blue-100 dark:border-blue-900/30">
                       <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Acertos</p>
                       <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{selectedExam.correctAnswers}</p>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl text-center border dark:border-slate-700">
                       <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Total</p>
                       <p className="text-3xl font-black text-gray-800 dark:text-white">{selectedExam.totalQuestions}</p>
                    </div>
                    <div className={`p-6 rounded-3xl text-center border ${getPercentageColor(Math.round((selectedExam.correctAnswers / selectedExam.totalQuestions) * 100))}`}>
                       <p className="text-[9px] font-black uppercase mb-2">Score</p>
                       <p className="text-3xl font-black">{Math.round((selectedExam.correctAnswers / selectedExam.totalQuestions) * 100)}%</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">💡</div>
                       <h5 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Análise & Considerações</h5>
                    </div>
                    <div className="p-8 bg-gray-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 shadow-inner">
                       {selectedExam.observations ? (
                         <p className="text-base text-gray-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedExam.observations}
                         </p>
                       ) : (
                         <div className="py-10 text-center space-y-4">
                            <p className="text-gray-400 italic text-sm">Nenhuma consideração registrada para este simulado.</p>
                            <button onClick={() => startEditing(selectedExam)} className="text-[10px] font-black text-blue-600 uppercase underline decoration-2 underline-offset-4">Adicionar Notas agora</button>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex gap-4">
                 <button onClick={() => startEditing(selectedExam)} className="flex-1 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all">
                    Editar Dados
                 </button>
                 <button onClick={() => setSelectedExamId(null)} className="px-10 py-4 text-gray-400 font-black text-xs uppercase hover:text-gray-600">
                    Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExamTracker;
