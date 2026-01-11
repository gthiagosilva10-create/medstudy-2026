
import React, { useState } from 'react';
import { ExamRecord } from '../types';

interface ExamTrackerProps {
  exams: ExamRecord[];
  onAddExam: (exam: ExamRecord) => void;
  onDeleteExam: (id: string) => void;
}

const ExamTracker: React.FC<ExamTrackerProps> = ({ exams, onAddExam, onDeleteExam }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    totalQuestions: 100,
    correctAnswers: 0,
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: ExamRecord = {
      ...formData,
      id: Date.now().toString(),
    };
    onAddExam(newExam);
    setIsAdding(false);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      totalQuestions: 100,
      correctAnswers: 0,
      observations: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Histórico de Simulados</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {isAdding ? 'Cancelar' : '+ Registrar Prova'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome da Prova / Instituição</label>
              <input
                required
                type="text"
                placeholder="Ex: USP-SP 2024"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Data de Realização</label>
              <input
                required
                type="date"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Total de Questões</label>
              <input
                required
                type="number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.totalQuestions}
                onChange={e => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Acertos</label>
              <input
                required
                type="number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.correctAnswers}
                onChange={e => setFormData({ ...formData, correctAnswers: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Observações / Pontos de Atenção</label>
              <textarea
                placeholder="Onde mais errei? O que preciso revisar?"
                className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.observations}
                onChange={e => setFormData({ ...formData, observations: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-shadow">
            Salvar Resultado
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
            <span className="text-4xl mb-2 block">📋</span>
            Nenhum simulado registrado ainda. Comece a treinar!
          </div>
        ) : (
          exams.map(exam => {
            const percentage = Math.round((exam.correctAnswers / exam.totalQuestions) * 100);
            return (
              <div key={exam.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-gray-800">{exam.name}</h4>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{exam.date}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{exam.correctAnswers} acertos de {exam.totalQuestions} questões</p>
                    {exam.observations && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg text-xs text-amber-800 italic">
                        "{exam.observations}"
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Aproveitamento</p>
                      <div className={`text-2xl font-black ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {percentage}%
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          }).reverse()
        )}
      </div>
    </div>
  );
};

export default ExamTracker;
