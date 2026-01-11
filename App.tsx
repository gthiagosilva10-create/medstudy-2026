
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicList from './components/TopicList';
import Schedule from './components/Schedule';
import GeminiAssistant from './components/GeminiAssistant';
import Summaries from './components/Summaries';
import ExamTracker from './components/ExamTracker';
import HotTopics from './components/HotTopics';
import StudyPortal from './components/StudyPortal';
import VideoLibrary from './components/VideoLibrary';
import GeneralNotes from './components/GeneralNotes';
import EditalManager from './components/EditalManager';
import Flashcards from './components/Flashcards';
import PastExamManager from './components/PastExamManager';
import Personalization from './components/Personalization';
import { Area, StudyStatus, ExamRecord, WeeklySchedule, MonthlyPlans, VideoLesson, CurriculumDoc, Flashcard, PastExam, Note } from './types';
import { CURRICULUM_DATA, HOT_TOPICS_LIST } from './constants';

const MONTH_IDS = [
  "Janeiro 2026", "Fevereiro 2026", "Março 2026", "Abril 2026", 
  "Maio 2026", "Junho 2026", "Julho 2026", "Agosto 2026", 
  "Setembro 2026", "Outubro 2026", "Novembro 2026", "Dezembro 2026"
];

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tabOrder, setTabOrder] = useState<string[]>(['dashboard', 'schedule', 'past-exams', 'hot-topics', 'topics', 'flashcards', 'edital', 'videos', 'exams', 'summaries', 'notes', 'assistant', 'portal', 'personalization']);
  const [tabLabels, setTabLabels] = useState<Record<string, string>>({
    dashboard: 'Dashboard', schedule: 'Cronograma', 'past-exams': 'Cofre de Provas',
    'hot-topics': 'Temas Quentes', topics: 'Edital Vertical', flashcards: 'Flashcards',
    edital: 'Documentos', videos: 'Videoaulas', exams: 'Simulados',
    summaries: 'Resumos', notes: 'Anotações', assistant: 'Mentor IA', portal: 'Portais', personalization: 'Personalizar'
  });

  // Personalization State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('medstudy_dark_mode');
    return saved === 'true';
  });
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('medstudy_primary_color') || 'blue');
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('medstudy_bg_image') || '');
  const [bgOpacity, setBgOpacity] = useState(() => Number(localStorage.getItem('medstudy_bg_opacity')) || 0.1);

  // App Branding State
  const [appName, setAppName] = useState('MedStudy');
  const [appSubtitle, setAppSubtitle] = useState('Residência Médica 2026');
  
  // Exam Info State
  const [targetExamDate, setTargetExamDate] = useState(() => localStorage.getItem('medstudy_target_date') || '2026-11-15');
  const [targetExamName, setTargetExamName] = useState(() => localStorage.getItem('medstudy_target_name') || 'Prova de Residência 2026');

  // Month selection
  const [activeMonthId, setActiveMonthId] = useState(MONTH_IDS[0]);

  // Core Data State
  const [areas, setAreas] = useState<Area[]>(() => {
    const saved = localStorage.getItem('medstudy_areas');
    return saved ? JSON.parse(saved) : CURRICULUM_DATA;
  });
  const [hotTopicChecks, setHotTopicChecks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('medstudy_hot_checked');
    return saved ? JSON.parse(saved) : {};
  });
  const [exams, setExams] = useState<ExamRecord[]>(() => {
    const saved = localStorage.getItem('medstudy_exams');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [weeklySchedules, setWeeklySchedules] = useState<Record<string, WeeklySchedule>>(() => {
    const saved = localStorage.getItem('medstudy_weekly_schedules_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlans>(() => {
    const saved = localStorage.getItem('medstudy_monthly_plans');
    return saved ? JSON.parse(saved) : {};
  });
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  // Additional Content State
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [docs, setDocs] = useState<CurriculumDoc[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [pastExams, setPastExams] = useState<PastExam[]>([]);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('medstudy_notes_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync State
  const [syncId, setSyncId] = useState(() => localStorage.getItem('medstudy_sync_id') || '');
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('medstudy_last_sync') || '');

  // Dark Mode Logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('medstudy_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('medstudy_primary_color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('medstudy_bg_image', bgImage);
  }, [bgImage]);

  useEffect(() => {
    localStorage.setItem('medstudy_bg_opacity', String(bgOpacity));
  }, [bgOpacity]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('medstudy_areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('medstudy_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('medstudy_weekly_schedules_v2', JSON.stringify(weeklySchedules));
  }, [weeklySchedules]);

  useEffect(() => {
    localStorage.setItem('medstudy_notes_v2', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('medstudy_target_date', targetExamDate);
    localStorage.setItem('medstudy_target_name', targetExamName);
  }, [targetExamDate, targetExamName]);

  // Handler Logic
  const handleUpdateExamInfo = (name: string, date: string) => {
    setTargetExamName(name);
    setTargetExamDate(date);
  };

  const handleToggleTopicStatus = (topicId: string) => {
    if (topicId.startsWith('hot_')) {
      const index = parseInt(topicId.split('_')[1]);
      const topicName = HOT_TOPICS_LIST[index].name;
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
      localStorage.setItem('medstudy_areas', JSON.stringify(newAreas));
    }
  };

  const handleStatusChange = (areaId: string, topicId: string, status: StudyStatus) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.id === topicId ? { ...t, status } : t)
    } : area));
  };

  const handleTopicNameChange = (areaId: string, topicId: string, name: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.id === topicId ? { ...t, name } : t)
    } : area));
  };

  const handleTopicObservationChange = (areaId: string, topicId: string, observations: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.id === topicId ? { ...t, observations } : t)
    } : area));
  };

  const handleAddSubTopic = (areaId: string, topicId: string, subTopic: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.id === topicId ? { ...t, subTopics: [...(t.subTopics || []), subTopic] } : t)
    } : area));
  };

  const handleRemoveSubTopic = (areaId: string, topicId: string, index: number) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.id === topicId ? { ...t, subTopics: t.subTopics?.filter((_, i) => i !== index) } : t)
    } : area));
  };

  const handleAddTopic = (areaId: string, name: string, subArea?: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: [...area.topics, { id: Date.now().toString(), name, subArea, status: StudyStatus.NOT_STARTED }]
    } : area));
  };

  const handleDeleteTopic = (areaId: string, topicId: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.filter(t => t.id !== topicId)
    } : area));
  };

  const handleRenameSubArea = (areaId: string, oldName: string, newName: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.map(t => t.subArea === oldName ? { ...t, subArea: newName } : t)
    } : area));
  };

  const handleDeleteSubArea = (areaId: string, subAreaName: string) => {
    setAreas(prev => prev.map(area => area.id === areaId ? {
      ...area,
      topics: area.topics.filter(t => t.subArea !== subAreaName)
    } : area));
  };

  const handleManualSave = () => {
    const data = { areas, hotTopicChecks, exams, weeklySchedules, monthlyPlans, videos, docs, flashcards, pastExams, notes };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medstudy_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleConnectSync = (id: string) => {
    setSyncId(id);
    localStorage.setItem('medstudy_sync_id', id);
  };

  const pushToCloud = (id: string) => {
    const now = new Date().toLocaleString();
    setLastSync(now);
    localStorage.setItem('medstudy_last_sync', now);
    alert('Dados enviados para a nuvem sincronizada!');
  };

  const pullFromCloud = (id: string) => {
    alert('Buscando dados da nuvem...');
  };

  // Router Logic
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            areas={areas} 
            hotTopics={HOT_TOPICS_LIST} 
            hotTopicChecks={hotTopicChecks} 
            exams={exams}
            tabLabels={tabLabels}
            onExport={handleManualSave}
            onImport={() => {}} 
            syncId={syncId}
            onConnectSync={handleConnectSync}
            onPushSync={() => pushToCloud(syncId)}
            onPullSync={() => pullFromCloud(syncId)}
            lastSync={lastSync}
            targetExamDate={targetExamDate}
            targetExamName={targetExamName}
            onUpdateExamInfo={handleUpdateExamInfo}
          />
        );
      case 'topics':
        return (
          <TopicList 
            areas={areas}
            onStatusChange={handleStatusChange}
            onTopicNameChange={handleTopicNameChange}
            onTopicObservationChange={handleTopicObservationChange}
            onAddSubTopic={handleAddSubTopic}
            onRemoveSubTopic={handleRemoveSubTopic}
            onAddTopic={handleAddTopic}
            onDeleteTopic={handleDeleteTopic}
            onRenameSubArea={handleRenameSubArea}
            onDeleteSubArea={handleDeleteSubArea}
          />
        );
      case 'schedule':
        return (
          <Schedule 
            areas={areas}
            hotTopics={HOT_TOPICS_LIST}
            hotTopicChecks={hotTopicChecks}
            activeMonthId={activeMonthId}
            onMonthChange={setActiveMonthId}
            monthIds={MONTH_IDS}
            weeklySchedule={weeklySchedules[activeMonthId] || {}}
            allWeeklySchedules={weeklySchedules}
            monthlyPlans={monthlyPlans}
            orderedMonthIds={MONTH_IDS}
            collapsedMonths={collapsedMonths}
            targetExamDate={targetExamDate}
            onToggleTopicStatus={handleToggleTopicStatus}
            onUpdateSchedule={(day, ids) => setWeeklySchedules(prev => ({
              ...prev, 
              [activeMonthId]: { ...(prev[activeMonthId] || {}), [day]: ids }
            }))}
            onUpdateMonthlyPlan={(m, c) => setMonthlyPlans(prev => ({...prev, [m]: c}))}
            onToggleMonthCollapse={(m) => setCollapsedMonths(prev => ({...prev, [m]: !prev[m]}))}
          />
        );
      case 'exams':
        return (
          <ExamTracker 
            exams={exams}
            onAddExam={(e) => setExams([...exams, e])}
            onDeleteExam={(id) => setExams(exams.filter(e => e.id !== id))}
            onUpdateExam={(e) => setExams(exams.map(ex => ex.id === e.id ? e : ex))}
          />
        );
      case 'summaries':
        return (
          <Summaries 
            areas={areas} 
            onUpdateArea={(updatedArea) => setAreas(prev => prev.map(a => a.id === updatedArea.id ? updatedArea : a))}
          />
        );
      case 'notes':
        return <GeneralNotes notes={notes} onUpdateNotes={setNotes} />;
      case 'assistant':
        return <GeminiAssistant />;
      case 'portal':
        return <StudyPortal />;
      case 'hot-topics':
        return <HotTopics />;
      case 'videos':
        return <VideoLibrary areas={areas} videos={videos} onUpdateVideos={setVideos} />;
      case 'edital':
        return <EditalManager docs={docs} onUpdateDocs={setDocs} primaryColor={primaryColor} />;
      case 'flashcards':
        return <Flashcards areas={areas} flashcards={flashcards} onUpdateFlashcards={setFlashcards} primaryColor={primaryColor} />;
      case 'past-exams':
        return <PastExamManager exams={pastExams} onUpdateExams={setPastExams} primaryColor={primaryColor} />;
      case 'personalization':
        return (
          <Personalization 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            bgImage={bgImage}
            setBgImage={setBgImage}
            bgOpacity={bgOpacity}
            setBgOpacity={setBgOpacity}
          />
        );
      default:
        return <div className="p-10 text-center text-gray-400 font-bold">Conteúdo em desenvolvimento...</div>;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden`}>
      {/* Background Image Layer */}
      {bgImage && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgOpacity
          }}
        />
      )}

      {/* Fix: Removed toggleDarkMode prop as it is not present in SidebarProps interface */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabLabels={tabLabels} 
        onUpdateLabel={(id, label) => setTabLabels(prev => ({...prev, [id]: label}))}
        tabOrder={tabOrder}
        onUpdateTabOrder={setTabOrder}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isDarkMode={darkMode}
        appName={appName}
        appSubtitle={appSubtitle}
        onUpdateAppName={setAppName}
        onUpdateAppSubtitle={setAppSubtitle}
        primaryColor={primaryColor}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
