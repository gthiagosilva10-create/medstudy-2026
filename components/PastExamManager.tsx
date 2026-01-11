
import React, { useState } from 'react';
import { PastExam, QuestionAnalysis } from '../types';

interface PastExamManagerProps {
  exams: PastExam[];
  onUpdateExams: (exams: PastExam[]) => void;
  primaryColor: string;
}

const PastExamManager: React.FC<PastExamManagerProps> = ({ exams, onUpdateExams, primaryColor }) => {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  
  const [newExam, setNewExam] = useState({ institution: '', year: '', specialty: '' });
  const [newQuestion, setNewQuestion] = useState<Omit<QuestionAnalysis, 'id'>>({
    questionNumber: '',
    topic: '',
    userAnswer: '',
    correctAnswer: '',
    isCorrect: false,
    rationale: '',
    distractorAnalysis: ''
  });

  const activeExam = exams.find(e => e.id === selectedExamId);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.institution || !newExam.year) return;

    const exam: PastExam = {
      id: Date.now().toString(),
      institution: newExam.institution,
      year: newExam.year,
      specialty: newExam.specialty || 'Geral',
      status: 'analyzing',
      questions: [],
      addedAt: new Date().toISOString()
    };

    onUpdateExams([...exams, exam]);
    setIsAddingExam(false);
    setNewExam({ institution: '', year: '', specialty: '' });
    setSelectedExamId(exam.id);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !newQuestion.questionNumber) return;

    const analysis: QuestionAnalysis = {
      id: Date.now().toString(),
      ...newQuestion,
      isCorrect: newQuestion.userAnswer.toUpperCase() === newQuestion.correctAnswer.toUpperCase()
    };

    const updated = exams.map(ex => 
      ex.id === selectedExamId 
        ? { ...ex, questions: [...ex.questions, analysis] } 
        : ex
    );

    onUpdateExams(updated);
    setIsAddingQuestion(false);
    setNewQuestion({
      questionNumber: '',
      topic: '',
      userAnswer: '',
      correctAnswer: '',
      isCorrect: false,
      rationale: '',
      distractorAnalysis: ''
    });
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Excluir esta prova e todas as suas análises?')) {
      onUpdateExams(exams.filter(e => e.id !== id));
      if (selectedExamId === id) setSelectedExamId(null);
    }
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!selectedExamId) return;
    const updated = exams.map(ex => 
      ex.id === selectedExamId 
        ? { ...ex, questions: ex.questions.filter(q => q.id !== qId) } 
        : ex
    );
    onUpdateExams(updated);
  };

  const calculateScore = (exam: PastExam) => {
    if (exam.questions.length === 0) return 0;
    const correct = exam.questions.filter(q => q.isCorrect).length;
    return Math.round((correct / exam.questions.length) * 100);
  };

  if (selectedExamId && activeExam) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedExamId(null)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200">❮</button>
            <div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{activeExam.institution} - {activeExam.year}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{activeExam.specialty} | {activeExam.questions.length} Questões Analisadas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Aproveitamento</p>
                <p className={`text-2xl font-black ${calculateScore(activeExam) >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{calculateScore(activeExam)}%</p>
             </div>
             <button 
              onClick={() => setIsAddingQuestion(true)}
              className={`px-6 py-3 bg-${primaryColor}-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg`}
             >
              + Analisar Questão
             </button>
          </div>
        </div>

        {isAddingQuestion && (
          <form onSubmit={handleAddQuestion} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Questão</label>
                <input required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" value={newQuestion.questionNumber} onChange={e => setNewQuestion({...newQuestion, questionNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tema</label>
                <input className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" placeholder="Ex: Nefrologia" value={newQuestion.topic} onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Resp.</label>
                <input required maxLength={1} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white text-center font-black uppercase" value={newQuestion.userAnswer} onChange={e => setNewQuestion({...newQuestion, userAnswer: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gabarito</label>
                <input required maxLength={1} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white text-center font-black uppercase" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Raciocínio / Por que acertei-errei?</label>
                <textarea className="w-full h-32 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none resize-none" value={newQuestion.rationale} onChange={e => setNewQuestion({...newQuestion, rationale: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Análise das Alternativas (Distratores)</label>
                <textarea className="w-full h-32 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none resize-none" placeholder="B estava errada por causa de..." value={newQuestion.distractorAnalysis} onChange={e => setNewQuestion({...newQuestion, distractorAnalysis: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-xs">Cancelar</button>
              <button type="submit" className={`px-10 py-3 bg-${primaryColor}-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl`}>Salvar Análise</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {activeExam.questions.map(q => (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 relative group">
              <button onClick={() => handleDeleteQuestion(q.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
              <div className="flex flex-col items-center justify-center min-w-[80px] border-r dark:border-slate-800 pr-6">
                 <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Ques.</span>
                 <span className="text-3xl font-black text-gray-900 dark:text-white">{q.questionNumber}</span>
                 <div className={`mt-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${q.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {q.isCorrect ? 'Acerto' : 'Erro'}
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Raciocínio & Estudo Reverso</h5>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed italic">"{q.rationale || 'Sem anotações de raciocínio.'}"</p>
                    <div className="mt-4 flex gap-4">
                       <div className="text-xs font-bold"><span className="text-gray-400">Sua:</span> <span className={q.isCorrect ? 'text-green-500' : 'text-red-500'}>{q.userAnswer}</span></div>
                       <div className="text-xs font-bold"><span className="text-gray-400">Gabarito:</span> <span className="text-green-500">{q.correctAnswer}</span></div>
                    </div>
                 </div>
                 <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Análise de Distratores</h5>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{q.distractorAnalysis || 'Nenhuma alternativa analisada.'}</p>
                 </div>
              </div>
            </div>
          ))}
          {activeExam.questions.length === 0 && (
            <div className="py-20 text-center text-gray-300">Nenhuma questão analisada ainda nesta prova.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Cofre de Provas</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Biblioteca de Provas Anteriores e Estudo Reverso</p>
        </div>
        <button 
          onClick={() => setIsAddingExam(true)}
          className={`px-6 py-3 bg-${primaryColor}-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg`}
        >
          + Adicionar Prova
        </button>
      </div>

      {isAddingExam && (
        <form onSubmit={handleCreateExam} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border dark:border-slate-800 space-y-6 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instituição</label>
              <input required className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" placeholder="Ex: USP-SP" value={newExam.institution} onChange={e => setNewExam({...newExam, institution: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ano</label>
              <input required className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" placeholder="Ex: 2024" value={newExam.year} onChange={e => setNewExam({...newExam, year: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Especialidade (Opcional)</label>
              <input className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none" placeholder="Ex: Clínica Médica" value={newExam.specialty} onChange={e => setNewExam({...newExam, specialty: e.target.value})} />
            </div>
          </div>
          <button type="submit" className={`w-full py-4 bg-${primaryColor}-600 text-white rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest`}>Criar Pasta de Prova</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} onClick={() => setSelectedExamId(exam.id)} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border dark:border-slate-800 shadow-xl group hover:shadow-2xl cursor-pointer transition-all relative overflow-hidden">
            <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-3xl mb-6">🎯</div>
            <h4 className="text-xl font-black text-gray-800 dark:text-white mb-1 uppercase tracking-tight">{exam.institution}</h4>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6">{exam.year} • {exam.specialty}</p>
            
            <div className="flex justify-between items-end border-t dark:border-slate-800 pt-6">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Questões</p>
                  <p className="text-lg font-black dark:text-white">{exam.questions.length}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Aproveitamento</p>
                  <p className={`text-xl font-black ${calculateScore(exam) >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{calculateScore(exam)}%</p>
               </div>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-4">
            <div className="text-7xl opacity-10">🎯</div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Cofre Vazio</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Comece a adicionar provas antigas e faça a análise detalhada de cada questão para evoluir no seu estudo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastExamManager;
