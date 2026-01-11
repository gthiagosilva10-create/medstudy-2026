
import React, { useState, useEffect, useCallback } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabLabels: Record<string, string>;
  onUpdateLabel: (id: string, newLabel: string) => void;
  tabOrder: string[];
  onUpdateTabOrder: (newOrder: string[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  appName: string;
  appSubtitle: string;
  onUpdateAppName: (name: string) => void;
  onUpdateAppSubtitle: (subtitle: string) => void;
  primaryColor: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  tabLabels, 
  onUpdateLabel,
  tabOrder,
  onUpdateTabOrder,
  isCollapsed,
  onToggleCollapse,
  isDarkMode,
  appName,
  appSubtitle,
  onUpdateAppName,
  onUpdateAppSubtitle,
  primaryColor
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [focusedTabIndex, setFocusedTabIndex] = useState(-1);
  
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);

  const baseTabs = [
    { id: 'dashboard', icon: '📊' },
    { id: 'schedule', icon: '📅' },
    { id: 'hot-topics', icon: '🔥' },
    { id: 'topics', icon: '📚' },
    { id: 'flashcards', icon: '🃏' },
    { id: 'edital', icon: '📂' },
    { id: 'videos', icon: '📺' },
    { id: 'exams', icon: '🎯' },
    { id: 'summaries', icon: '📝' },
    { id: 'notes', icon: '📒' },
    { id: 'assistant', icon: '🤖' },
    { id: 'portal', icon: '🌐' },
  ];

  const sortedTabs = tabOrder.map(id => baseTabs.find(t => t.id === id)).filter(Boolean) as { id: string, icon: string }[];

  const handleMoveTab = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = tabOrder.indexOf(id);
    if (direction === 'up' && idx > 0) {
      const newOrder = [...tabOrder];
      [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
      onUpdateTabOrder(newOrder);
    } else if (direction === 'down' && idx < tabOrder.length - 1) {
      const newOrder = [...tabOrder];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      onUpdateTabOrder(newOrder);
    }
  }, [tabOrder, onUpdateTabOrder]);

  // Keyboard navigation for sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId || isEditingBrand || isEditingSubtitle) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedTabIndex(prev => (prev < sortedTabs.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedTabIndex(prev => (prev > 0 ? prev - 1 : sortedTabs.length - 1));
      } else if (e.key === ' ') {
        if (focusedTabIndex !== -1) {
          e.preventDefault();
          const tab = sortedTabs[focusedTabIndex];
          if (e.shiftKey && isOrderMode) {
            // No action needed here, handled by arrows
          } else {
            setActiveTab(tab.id);
          }
        }
      }

      // Reorder with Shift + Arrows
      if (isOrderMode && e.shiftKey && focusedTabIndex !== -1) {
        const tab = sortedTabs[focusedTabIndex];
        if (e.key === 'ArrowUp') {
          handleMoveTab(tab.id, 'up');
        } else if (e.key === 'ArrowDown') {
          handleMoveTab(tab.id, 'down');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTabIndex, sortedTabs, activeTab, editingId, isEditingBrand, isEditingSubtitle, isOrderMode, handleMoveTab, setActiveTab]);

  const startEditing = (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    setEditingId(id);
    setTempLabel(label);
  };

  const saveLabel = (id: string) => {
    if (tempLabel.trim()) {
      onUpdateLabel(id, tempLabel.trim());
    }
    setEditingId(null);
  };

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-gray-100 dark:border-slate-800 h-full hidden md:flex flex-col z-20 transition-all duration-300 ease-in-out`}>
      <div className={`p-6 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
        <div className="flex justify-between items-center mb-6 w-full">
           {!isCollapsed && (
             <button 
              onClick={() => setIsOrderMode(!isOrderMode)}
              className={`p-2 rounded-xl transition-all ${isOrderMode ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-orange-500'}`}
              title="Organizar Pastas (Atalho: Shift+Setas)"
             >
               ⚙️
             </button>
           )}
           <button 
            onClick={onToggleCollapse}
            className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-500 transition-all"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
           >
             {isCollapsed ? '➡️' : '⬅️'}
           </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="group relative">
              {isEditingBrand ? (
                <input 
                  autoFocus
                  className={`text-2xl font-bold text-${primaryColor}-600 dark:text-${primaryColor}-400 bg-gray-50 dark:bg-slate-800 outline-none w-full rounded-lg px-2`}
                  value={appName}
                  onChange={(e) => onUpdateAppName(e.target.value)}
                  onBlur={() => setIsEditingBrand(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingBrand(false)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className={`text-2xl font-black text-${primaryColor}-600 dark:text-${primaryColor}-400 flex items-center gap-2 truncate`}>
                    <span>🩺</span> {appName}
                  </h1>
                  <button 
                    onClick={() => setIsEditingBrand(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-blue-500 transition-opacity"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <div className="group relative mt-1">
              {isEditingSubtitle ? (
                <input 
                  autoFocus
                  className="text-xs text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 outline-none w-full rounded px-2"
                  value={appSubtitle}
                  onChange={(e) => onUpdateAppSubtitle(e.target.value)}
                  onBlur={() => setIsEditingSubtitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingSubtitle(false)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-widest font-black truncate">
                    {appSubtitle}
                  </p>
                  <button 
                    onClick={() => setIsEditingSubtitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-gray-600 transition-opacity"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <nav className={`flex-1 px-4 space-y-2 overflow-y-auto pb-6 scrollbar-hide`}>
        {sortedTabs.map((tab, idx) => (
          <div key={tab.id} className={`group relative flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            {isOrderMode && !isCollapsed && (
              <div className="flex flex-col gap-1 pr-2 animate-in slide-in-from-left-2">
                <button onClick={() => handleMoveTab(tab.id, 'up')} className="text-[10px] text-gray-300 hover:text-orange-500">▲</button>
                <button onClick={() => handleMoveTab(tab.id, 'down')} className="text-[10px] text-gray-300 hover:text-orange-500">▼</button>
              </div>
            )}

            {editingId === tab.id && !isCollapsed ? (
              <div className={`flex-1 flex items-center gap-2 px-4 py-3 bg-${primaryColor}-50 dark:bg-${primaryColor}-900/30 rounded-2xl`}>
                <span className="text-lg">{tab.icon}</span>
                <input 
                  autoFocus
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  onBlur={() => saveLabel(tab.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveLabel(tab.id)}
                  className={`bg-white dark:bg-slate-800 border-none focus:ring-1 focus:ring-${primaryColor}-400 rounded px-1 py-0.5 text-sm w-full font-medium dark:text-white`}
                />
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  setFocusedTabIndex(idx);
                }}
                onMouseEnter={() => setFocusedTabIndex(idx)}
                title={isCollapsed ? tabLabels[tab.id] : undefined}
                className={`flex items-center transition-all group ${
                  isCollapsed ? 'justify-center w-14 h-14' : 'flex-1 px-4 py-3.5'
                } ${
                  activeTab === tab.id
                    ? `bg-${primaryColor}-600 text-white shadow-xl shadow-${primaryColor}-200 dark:shadow-${primaryColor}-900/20 rounded-2xl`
                    : focusedTabIndex === idx 
                      ? `bg-${primaryColor}-50 dark:bg-${primaryColor}-900/10 ring-2 ring-${primaryColor}-500/50 rounded-2xl text-${primaryColor}-700 dark:text-${primaryColor}-300`
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white rounded-2xl'
                }`}
              >
                <span className={`${isCollapsed ? 'text-2xl' : 'text-lg mr-3'} shrink-0`}>{tab.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="text-left text-[13px] font-bold leading-tight flex-1 truncate">{tabLabels[tab.id] || tab.id}</span>
                    <button 
                      onClick={(e) => startEditing(e, tab.id, tabLabels[tab.id])}
                      className={`p-1 transition-opacity ${
                        activeTab === tab.id 
                        ? 'opacity-60 hover:opacity-100 text-white' 
                        : `opacity-0 group-hover:opacity-100 text-gray-300 hover:text-${primaryColor}-600 dark:hover:text-${primaryColor}-400`
                      }`}
                      title="Renomear"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30 transition-colors">
          <div className="bg-orange-50/80 dark:bg-orange-900/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30 shadow-inner text-center">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest mb-1">Dica de Teclado</p>
            <p className="text-[9px] font-bold text-gray-800 dark:text-slate-200 italic">Use Setas p/ Navegar e Espaço p/ Selecionar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
