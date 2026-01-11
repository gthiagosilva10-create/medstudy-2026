
import React, { useState, useRef } from 'react';
import { Area, VideoLesson } from '../types';

interface VideoLibraryProps {
  areas: Area[];
  videos: VideoLesson[];
  onUpdateVideos: (videos: VideoLesson[]) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ areas, videos, onUpdateVideos }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedArea, setSelectedArea] = useState('all');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', areaId: areas[0].id });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title) return;
    
    const video: VideoLesson = {
      id: Date.now().toString(),
      title: newVideo.title,
      areaId: newVideo.areaId,
      isWatched: false,
      addedAt: new Date().toISOString()
    };
    
    onUpdateVideos([...videos, video]);
    setIsAdding(false);
    setNewVideo({ title: '', areaId: areas[0].id });
  };

  const handleToggleWatched = (id: string) => {
    const updated = videos.map(v => v.id === id ? { ...v, isWatched: !v.isWatched } : v);
    onUpdateVideos(updated);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Remover esta videoaula da sua biblioteca?')) {
      onUpdateVideos(videos.filter(v => v.id !== id));
    }
  };

  const handlePlayVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setActiveVideoUrl(url);
    }
  };

  const filteredVideos = selectedArea === 'all' 
    ? videos 
    : videos.filter(v => v.areaId === selectedArea);

  return (
    <div className="space-y-6">
      {/* Player Area */}
      {activeVideoUrl && (
        <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl aspect-video relative group animate-in zoom-in-95 duration-500">
          <video 
            src={activeVideoUrl} 
            controls 
            autoPlay 
            className="w-full h-full"
          />
          <button 
            onClick={() => setActiveVideoUrl(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
          >
            ✕ Fechar Player
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/30 shadow-sm">
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
          <button 
            onClick={() => setSelectedArea('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${selectedArea === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
          >
            Todos
          </button>
          {areas.map(area => (
            <button 
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-2 ${selectedArea === area.id ? `bg-${area.color}-600 text-white shadow-lg` : 'bg-white text-gray-500 border border-gray-100'}`}
            >
              <span>{area.icon}</span> {area.name}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          {isAdding ? 'Cancelar' : '+ Indexar Aula'}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddVideo} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 animate-in slide-in-from-top-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título da Videoaula</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Glomerulopatias I - Nefrologia"
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-100 outline-none"
                value={newVideo.title}
                onChange={e => setNewVideo({...newVideo, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Área Médica</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-100 outline-none"
                value={newVideo.areaId}
                onChange={e => setNewVideo({...newVideo, areaId: e.target.value})}
              >
                {areas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all">
            Salvar na Biblioteca
          </button>
        </form>
      )}

      {/* Grid de Vídeos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredVideos.map(video => {
          const area = areas.find(a => a.id === video.areaId);
          return (
            <div 
              key={video.id} 
              className={`bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 border transition-all group hover:shadow-2xl flex flex-col ${video.isWatched ? 'opacity-60 grayscale-[0.5]' : 'border-white/20 shadow-xl'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-${area?.color}-50 text-xl`}>
                  {area?.icon || '🎬'}
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleToggleWatched(video.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${video.isWatched ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-green-50'}`}
                    title={video.isWatched ? 'Marcar como não assistido' : 'Marcar como assistido'}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase tracking-widest text-${area?.color}-600 mb-1`}>
                  {area?.name}
                </p>
                <h5 className="text-lg font-black text-gray-900 leading-tight mb-4">
                  {video.title}
                </h5>
              </div>

              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                accept="video/*"
                onChange={handlePlayVideo}
              />

              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${video.isWatched ? 'bg-gray-100 text-gray-500' : `bg-${area?.color}-600 text-white shadow-lg shadow-${area?.color}-100 hover:scale-[1.02]`}`}
              >
                ▶ Reproduzir Arquivo
              </button>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-6xl grayscale opacity-30">📺</div>
            <div className="max-w-xs mx-auto">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sua biblioteca está vazia</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">Indexe os vídeos que você baixou para organizar sua rotina e assisti-los por aqui.</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input for Universal Player */}
      <input 
        type="file" 
        id="video-selector" 
        className="hidden" 
        accept="video/*" 
        onChange={handlePlayVideo} 
      />
    </div>
  );
};

export default VideoLibrary;
