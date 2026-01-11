
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import TopicList from './components/TopicList';
import Summaries from './components/Summaries';
import ExamTracker from './components/ExamTracker';
import GeminiAssistant from './components/GeminiAssistant';
import HotTopics from './components/HotTopics';
import StudyPortal from './components/StudyPortal';
import VideoLibrary from './components/VideoLibrary';
import GeneralNotes from './components/GeneralNotes';
import EditalManager from './components/EditalManager';
import Flashcards from './components/Flashcards';
import { CURRICULUM_DATA, HOT_TOPICS_LIST, HotTopic } from './constants';
import { Area, StudyStatus, ExamRecord, WeeklySchedule, MonthlyPlans, VideoLesson, CurriculumDoc, Flashcard, Topic } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [areas, setAreas] = useState<Area[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [hotTopicChecks, setHotTopicChecks] = useState<Record<string, boolean>>({});
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [docs, setDocs] = useState<CurriculumDoc[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  const [monthSchedules, setMonthSchedules] = useState<Record<string, WeeklySchedule>>({});
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlans>({});
  
  const [orderedMonthIds, setOrderedMonthIds] = useState<string[]>([]);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  
  const [tabOrder, setTabOrder] = useState<string[]>(['dashboard', 'schedule', 'hot-topics', 'topics', 'flashcards', 'edital', 'videos', 'exams', 'summaries', 'notes', 'assistant', 'portal']);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [generalNotes, setGeneralNotes] = useState('');
  
  const [selectedMonthId, setSelectedMonthId] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [tabLabels, setTabLabels] = useState<Record<string, string>>({
    dashboard: 'Dashboard',
    schedule: 'Cronograma',
    'hot-topics': 'Temas Quentes CERMAM',
    topics: 'Edital Verticalizado',
    flashcards: 'Flashcards',
    exams: 'Simulados',
    summaries: 'Meus Resumos',
    assistant: 'Mentor IA',
    portal: 'Portal de Estudos',
    videos: 'Videoaulas Baixadas',
    notes: 'Diário de Bordo',
    edital: 'Editais e Currículo'
  });

  const [appName, setAppName] = useState('MedStudy');
  const [appSubtitle, setAppSubtitle] = useState('Residência 2025');
  const [userName, setUserName] = useState('DR');
  const [primaryColor, setPrimaryColor] = useState('blue');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bgImage, setBgImage] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [bgBrightness, setBgBrightness] = useState<number>(100);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [targetExam, setTargetExam] = useState({
    name: 'CERMAM 2025',
    date: new Date(new Date().getFullYear() + 1, 10, 15).toISOString().split('T')[0]
  });

  const calculateDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(targetExam.date);
    examDate.setHours(0, 0, 0, 0);
    const diff = examDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const savedAreas = localStorage.getItem('medstudy_progress');
    const savedHot = localStorage.getItem('medstudy_custom_hot_topics');
    const savedHotChecks = localStorage.getItem('medstudy_hot_checked');
    const savedExams = localStorage.getItem('medstudy_exams');
    const savedVideos = localStorage.getItem('medstudy_videos');
    const savedDocs = localStorage.getItem('medstudy_docs');
    const savedFlash = localStorage.getItem('medstudy_flashcards');
    const savedMonthSchedules = localStorage.getItem('medstudy_month_schedules');
    const savedTargetExam = localStorage.getItem('medstudy_target_exam');
    const savedMonthlyPlans = localStorage.getItem('medstudy_monthly_plans');
    const savedMonthOrder = localStorage.getItem('medstudy_month_order');
    const savedCollapsed = localStorage.getItem('medstudy_month_collapsed');
    const savedTabOrder = localStorage.getItem('medstudy_tab_order');
    const savedSidebarCollapsed = localStorage.getItem('medstudy_sidebar_collapsed');
    const savedGeneralNotes = localStorage.getItem('medstudy_general_notes');
    const savedColor = localStorage.getItem('medstudy_primary_color');
    const savedUserName = localStorage.getItem('medstudy_user_name');
    const savedAppName = localStorage.getItem('medstudy_app_name');
    const savedAppSubtitle = localStorage.getItem('medstudy_app_subtitle');
    const savedBg = localStorage.getItem('medstudy_bg');
    const savedBgOpacity = localStorage.getItem('medstudy_bg_opacity');
    const savedBgBrightness = localStorage.getItem('medstudy_bg_brightness');
    const savedDark = localStorage.getItem('medstudy_dark_mode');
    const savedTabLabels = localStorage.getItem('medstudy_tab_labels');
    
    if (savedAppName) setAppName(savedAppName);
    if (savedAppSubtitle) setAppSubtitle(savedAppSubtitle);
    if (savedUserName) setUserName(savedUserName);
    if (savedColor) setPrimaryColor(savedColor);
    if (savedBg) setBgImage(savedBg);
    if (savedBgOpacity) setBgOpacity(parseInt(savedBgOpacity));
    if (savedBgBrightness) setBgBrightness(parseInt(savedBgBrightness));
    if (savedDark) setIsDarkMode(savedDark === 'true');

    if (savedAreas) setAreas(JSON.parse(savedAreas));
    else setAreas(CURRICULUM_DATA);

    if (savedHot) setHotTopics(JSON.parse(savedHot));
    else setHotTopics(HOT_TOPICS_LIST);

    if (savedHotChecks) setHotTopicChecks(JSON.parse(savedHotChecks));

    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedVideos) setVideos(JSON.parse(savedVideos));
    if (savedDocs) setDocs(JSON.parse(savedDocs));
    if (savedFlash) setFlashcards(JSON.parse(savedFlash));
    if (savedMonthSchedules) setMonthSchedules(JSON.parse(savedMonthSchedules));
    if (savedTargetExam) setTargetExam(JSON.parse(savedTargetExam));
    if (savedMonthlyPlans) setMonthlyPlans(JSON.parse(savedMonthlyPlans));
    if (savedMonthOrder) setOrderedMonthIds(JSON.parse(savedMonthOrder));
    if (savedCollapsed) setCollapsedMonths(JSON.parse(savedCollapsed));
    if (savedTabOrder) setTabOrder(JSON.parse(savedTabOrder));
    if (savedSidebarCollapsed) setIsSidebarCollapsed(savedSidebarCollapsed === 'true');
    if (savedGeneralNotes) setGeneralNotes(savedGeneralNotes);

    if (savedTabLabels) {
      setTabLabels(JSON.parse(savedTabLabels));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('medstudy_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleManualSave = useCallback(() => {
    setIsSaving(true);
    // Embora o salvamento seja contínuo, aqui forçamos uma atualização limpa e feedback visual
    localStorage.setItem('medstudy_progress', JSON.stringify(areas));
    localStorage.setItem('medstudy_docs', JSON.stringify(docs));
    localStorage.setItem('medstudy_videos', JSON.stringify(videos));
    localStorage.setItem('medstudy_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('medstudy_month_schedules', JSON.stringify(monthSchedules));
    localStorage.setItem('medstudy_monthly_plans', JSON.stringify(monthlyPlans));
    localStorage.setItem('medstudy_general_notes', generalNotes);
    localStorage.setItem('medstudy_exams', JSON.stringify(exams));
    localStorage.setItem('medstudy_hot_checked', JSON.stringify(hotTopicChecks));
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2500);
    }, 600);
  }, [areas, docs, videos, flashcards, monthSchedules, monthlyPlans, generalNotes, exams, hotTopicChecks]);

  const handleUpdatePrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('medstudy_primary_color', color);
  };

  const handleUpdateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('medstudy_user_name', name);
  };

  const handleUpdateGeneralNotes = (notes: string) => {
    setGeneralNotes(notes);
    localStorage.setItem('medstudy_general_notes', notes);
  };

  const handleUpdateAppName = (name: string) => {
    setAppName(name);
    localStorage.setItem('medstudy_app_name', name);
  };

  const handleUpdateAppSubtitle = (subtitle: string) => {
    setAppSubtitle(subtitle);
    localStorage.setItem('medstudy_app_subtitle', subtitle);
  };

  const handleUpdateTabLabel = (id: string, newLabel: string) => {
    const updatedLabels = { ...tabLabels, [id]: newLabel };
    setTabLabels(updatedLabels);
    localStorage.setItem('medstudy_tab_labels', JSON.stringify(updatedLabels));
  };

  const handleUpdateTabOrder = (newOrder: string[]) => {
    setTabOrder(newOrder);
    localStorage.setItem('medstudy_tab_order', JSON.stringify(newOrder));
  };

  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('medstudy_sidebar_collapsed', String(newState));
  };

  const handleToggleTopicStatus = (topicId: string) => {
    if (topicId.startsWith('hot_')) {
      const index = parseInt(topicId.split('_')[1]);
      const topicName = hotTopics[index].name;
      const newChecks = { ...hotTopicChecks, [topicName]: !hotTopicChecks[topicName] };
      setHotTopicChecks(newChecks);
      localStorage.setItem('medstudy_hot_checked', JSON.stringify(newChecks));
    } else {
      const newAreas = areas.map(area => ({
        ...area,
        topics: area.topics.map(t => {
          if (t.id === topicId) {
            const newStatus = t.status === StudyStatus.COMPLETED ? StudyStatus.NOT_STARTED : StudyStatus.COMPLETED;
            return { ...t, status: newStatus };
          }
          return t;
        })
      }));
      setAreas(newAreas);
      localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
    }
  };

  const handleAddTopic = (areaId: string, name: string, subArea?: string) => {
    const newTopic: Topic = {
      id: `custom-${Date.now()}`,
      name,
      subArea,
      status: StudyStatus.NOT_STARTED
    };
    const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: [...a.topics, newTopic] } : a);
    setAreas(newAreas);
    localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
  };

  const handleDeleteTopic = (areaId: string, topicId: string) => {
    const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.filter(t => t.id !== topicId) } : a);
    setAreas(newAreas);
    localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
  };

  const handleUpdateFlashcards = (updated: Flashcard[]) => {
    setFlashcards(updated);
    localStorage.setItem('medstudy_flashcards', JSON.stringify(updated));
  };

  const handleUpdateDocs = (updated: CurriculumDoc[]) => {
    setDocs(updated);
    localStorage.setItem('medstudy_docs', JSON.stringify(updated));
  };

  const handleExportBackup = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      areas,
      hotTopics,
      hotTopicChecks,
      exams,
      videos,
      docs,
      flashcards,
      monthSchedules,
      monthlyPlans,
      tabOrder,
      tabLabels,
      generalNotes,
      appName,
      appSubtitle,
      userName,
      primaryColor,
      isDarkMode,
      targetExam
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedStudy_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleManualSave();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (confirm("Isso irá substituir todos os dados atuais pelos dados do backup. Continuar?")) {
          if (data.areas) setAreas(data.areas);
          if (data.hotTopics) setHotTopics(data.hotTopics);
          if (data.hotTopicChecks) setHotTopicChecks(data.hotTopicChecks);
          if (data.exams) setExams(data.exams);
          if (data.videos) setVideos(data.videos);
          if (data.docs) setDocs(data.docs);
          if (data.flashcards) setFlashcards(data.flashcards);
          if (data.monthSchedules) setMonthSchedules(data.monthSchedules);
          if (data.monthlyPlans) setMonthlyPlans(data.monthlyPlans);
          if (data.tabOrder) setTabOrder(data.tabOrder);
          if (data.tabLabels) setTabLabels(data.tabLabels);
          if (data.generalNotes) setGeneralNotes(data.generalNotes);
          if (data.appName) setAppName(data.appName);
          if (data.appSubtitle) setAppSubtitle(data.appSubtitle);
          if (data.userName) setUserName(data.userName);
          if (data.primaryColor) setPrimaryColor(data.primaryColor);
          if (data.isDarkMode) setIsDarkMode(data.isDarkMode);
          if (data.targetExam) setTargetExam(data.targetExam);
          
          alert("Backup importado com sucesso! Recarregando configurações...");
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao ler arquivo de backup. Certifique-se de que é um arquivo .json válido do MedStudy.");
      }
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return (
        <Dashboard 
          areas={areas} 
          hotTopics={hotTopics} 
          hotTopicChecks={hotTopicChecks} 
          onExport={handleExportBackup}
          onImport={handleImportBackup}
        />
      );
      case 'schedule': return (
        <Schedule 
          areas={areas} 
          hotTopics={hotTopics}
          hotTopicChecks={hotTopicChecks}
          activeMonthId={selectedMonthId}
          onMonthChange={setSelectedMonthId}
          weeklySchedule={monthSchedules[selectedMonthId] || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }} 
          monthSchedules={monthSchedules}
          monthlyPlans={monthlyPlans}
          orderedMonthIds={orderedMonthIds}
          collapsedMonths={collapsedMonths}
          targetExamDate={targetExam.date}
          onToggleTopicStatus={handleToggleTopicStatus}
          onUpdateSchedule={(day, topics) => {
            const current = monthSchedules[selectedMonthId] || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            const updated = { ...current, [day]: topics };
            const newSchedules = { ...monthSchedules, [selectedMonthId]: updated };
            setMonthSchedules(newSchedules);
            localStorage.setItem('medstudy_month_schedules', JSON.stringify(newSchedules));
          }} 
          onUpdateMonthlyPlan={(monthId, content) => {
            const newPlans = { ...monthlyPlans, [monthId]: content };
            setMonthlyPlans(newPlans);
            localStorage.setItem('medstudy_monthly_plans', JSON.stringify(newPlans));
          }}
          onUpdateMonthOrder={(newOrder) => {
            setOrderedMonthIds(newOrder);
            localStorage.setItem('medstudy_month_order', JSON.stringify(newOrder));
          }}
          onToggleMonthCollapse={(monthId) => {
            const updated = { ...collapsedMonths, [monthId]: !collapsedMonths[monthId] };
            setCollapsedMonths(updated);
            localStorage.setItem('medstudy_month_collapsed', JSON.stringify(updated));
          }}
        />
      );
      case 'hot-topics': return <HotTopics />;
      case 'topics': return (
        <TopicList 
          areas={areas} 
          onStatusChange={(areaId, topicId, status) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.map(t => t.id === topicId ? { ...t, status } : t) } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }} 
          onTopicNameChange={(areaId, topicId, name) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.map(t => t.id === topicId ? { ...t, name } : t) } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }}
          onTopicObservationChange={(areaId, topicId, observations) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.map(t => t.id === topicId ? { ...t, observations } : t) } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }}
          onAddSubTopic={(areaId, topicId, sub) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.map(t => t.id === topicId ? { ...t, subTopics: [...(t.subTopics || []), sub] } : t) } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }}
          onRemoveSubTopic={(areaId, topicId, idx) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, topics: a.topics.map(t => t.id === topicId ? { ...t, subTopics: (t.subTopics || []).filter((_, i) => i !== idx) } : t) } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }}
          onAddTopic={handleAddTopic}
          onDeleteTopic={handleDeleteTopic}
        />
      );
      case 'flashcards': return <Flashcards areas={areas} flashcards={flashcards} onUpdateFlashcards={handleUpdateFlashcards} primaryColor={primaryColor} />;
      case 'exams': return (
        <ExamTracker 
          exams={exams} 
          onAddExam={(e) => {
            const newExams = [...exams, e];
            setExams(newExams);
            localStorage.setItem('medstudy_exams', JSON.stringify(newExams));
          }} 
          onDeleteExam={(id) => {
            const newExams = exams.filter(ex => ex.id !== id);
            setExams(newExams);
            localStorage.setItem('medstudy_exams', JSON.stringify(newExams));
          }} 
        />
      );
      case 'summaries': return (
        <Summaries 
          areas={areas} 
          onUpdateSummary={(areaId, summary) => {
            const newAreas = areas.map(a => a.id === areaId ? { ...a, summary } : a);
            setAreas(newAreas);
            localStorage.setItem('medstudy_progress', JSON.stringify(newAreas));
          }} 
        />
      );
      case 'assistant': return <GeminiAssistant />;
      case 'portal': return <StudyPortal />;
      case 'videos': return <VideoLibrary areas={areas} videos={videos} onUpdateVideos={(v) => { setVideos(v); localStorage.setItem('medstudy_videos', JSON.stringify(v)); }} />;
      case 'notes': return <GeneralNotes notes={generalNotes} onUpdateNotes={handleUpdateGeneralNotes} />;
      case 'edital': return <EditalManager docs={docs} onUpdateDocs={handleUpdateDocs} primaryColor={primaryColor} />;
      default: return <Dashboard areas={areas} hotTopics={hotTopics} hotTopicChecks={hotTopicChecks} onExport={handleExportBackup} onImport={handleImportBackup} />;
    }
  };

  const colorPalettes = [
    { id: 'blue', label: 'Safira', hex: '#2563eb' },
    { id: 'emerald', label: 'Esmeralda', hex: '#059669' },
    { id: 'purple', label: 'Ametista', hex: '#7c3aed' },
    { id: 'rose', label: 'Rubi', hex: '#e11d48' },
    { id: 'amber', label: 'Âmbar', hex: '#d97706' },
    { id: 'slate', label: 'Ardósia', hex: '#475569' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {bgImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{ 
              backgroundImage: `url(${bgImage})`,
              opacity: bgOpacity / 100,
              filter: `brightness(${bgBrightness}%) blur(0px) contrast(100%)`
            }}
          />
        )}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? 'bg-slate-950/40 opacity-100' : 'opacity-0'}`} />
      </div>
      
      <div className="relative z-10 flex w-full h-full bg-slate-50/10 dark:bg-slate-950/10 backdrop-blur-[1px]">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabLabels={tabLabels} 
          onUpdateLabel={handleUpdateTabLabel}
          tabOrder={tabOrder}
          onUpdateTabOrder={handleUpdateTabOrder}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isDarkMode={isDarkMode}
          appName={appName}
          appSubtitle={appSubtitle}
          onUpdateAppName={handleUpdateAppName}
          onUpdateAppSubtitle={handleUpdateAppSubtitle}
          primaryColor={primaryColor}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm transition-colors flex items-center gap-4">
                <div className="flex-1">
                   <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                      {tabLabels[activeTab]}
                   </h2>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-gray-500 dark:text-slate-400 font-medium text-xs md:text-sm">
                       {calculateDaysRemaining() > 0 
                         ? `Faltam ${calculateDaysRemaining()} dias para a prova` 
                         : `Foco total na prova!`}
                     </p>
                   </div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-slate-700 mx-1 md:mx-2" />
                <button 
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[10px] md:text-xs font-black uppercase tracking-widest text-${primaryColor}-600 dark:text-${primaryColor}-400 hover:shadow-lg transition-all active:scale-95 group overflow-hidden relative ${isSaving ? 'opacity-50' : ''}`}
                >
                   {isSaving ? (
                     <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sincronizando...
                     </span>
                   ) : (
                     <span className="flex items-center gap-2">
                        <span className="group-hover:animate-bounce">💾</span> Salvar Agora
                     </span>
                   )}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white dark:border-slate-800 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-all text-xl"
                  title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button 
                  onClick={() => setIsStyleOpen(true)}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white dark:border-slate-800 shadow-sm hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2 text-sm font-bold transition-all text-gray-800 dark:text-white"
                >
                  🎨 <span className="hidden sm:inline">Estilo</span>
                </button>
                <div 
                  onClick={() => setIsStyleOpen(true)}
                  className={`h-10 px-3 rounded-xl bg-${primaryColor}-600 border border-${primaryColor}-500 flex items-center justify-center font-bold text-white shadow-lg uppercase text-sm tracking-wider min-w-[2.5rem] cursor-pointer hover:scale-110 active:scale-95 transition-all group relative`}
                  title="Clique para mudar seu nome"
                >
                  {userName}
                </div>
              </div>
            </header>

            {/* Toast de Salvamento Manual */}
            {showSaveToast && (
              <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="bg-gray-900/90 dark:bg-slate-800/90 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border border-white/10 backdrop-blur-md">
                   <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                   Progresso Sincronizado com Sucesso
                </div>
              </div>
            )}

            {isStyleOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col transition-colors">
                  <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Estúdio de Estilo</h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Personalize sua interface</p>
                    </div>
                    <button onClick={() => setIsStyleOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-xl font-bold transition-all dark:text-white">✕</button>
                  </div>
                  
                  <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          👤 Seu Nome ou Iniciais (Avatar do Topo)
                        </label>
                        <input 
                          type="text"
                          value={userName}
                          maxLength={10}
                          onChange={(e) => handleUpdateUserName(e.target.value)}
                          className={`w-full px-5 py-4 rounded-2xl border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-${primaryColor}-500 uppercase font-black text-lg`}
                          placeholder="Ex: DR / JOÃO / MED"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Nome do App</label>
                          <input 
                            type="text"
                            value={appName}
                            onChange={(e) => handleUpdateAppName(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-${primaryColor}-100`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Subtítulo</label>
                          <input 
                            type="text"
                            value={appSubtitle}
                            onChange={(e) => handleUpdateAppSubtitle(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-${primaryColor}-100`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">🎨 Paleta de Cores</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {colorPalettes.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleUpdatePrimaryColor(p.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${primaryColor === p.id ? `border-${p.id}-500 bg-${p.id}-50 dark:bg-${p.id}-900/20` : 'border-transparent bg-gray-50 dark:bg-slate-800'}`}
                          >
                            <div className={`w-8 h-8 rounded-full bg-${p.id}-600`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-8 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex gap-4">
                    <button onClick={() => { handleManualSave(); setIsStyleOpen(false); }} className={`flex-1 py-4 bg-gray-900 dark:bg-${primaryColor}-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all`}>
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
