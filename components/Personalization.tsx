
import React, { useRef } from 'react';

interface PersonalizationProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  primaryColor: string;
  setPrimaryColor: (val: string) => void;
  bgImage: string;
  setBgImage: (val: string) => void;
  bgOpacity: number;
  setBgOpacity: (val: number) => void;
}

const Personalization: React.FC<PersonalizationProps> = ({
  darkMode,
  setDarkMode,
  primaryColor,
  setPrimaryColor,
  bgImage,
  setBgImage,
  bgOpacity,
  setBgOpacity
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colorPalettes = [
    { id: 'blue', label: 'Safira', color: 'bg-blue-600' },
    { id: 'emerald', label: 'Esmeralda', color: 'bg-emerald-600' },
    { id: 'rose', label: 'Rosa Choque', color: 'bg-rose-600' },
    { id: 'violet', label: 'Ametista', color: 'bg-violet-600' },
    { id: 'amber', label: 'Âmbar', color: 'bg-amber-600' },
    { id: 'slate', label: 'Ardósia', color: 'bg-slate-600' },
    { id: 'indigo', label: 'Índigo', color: 'bg-indigo-600' },
    { id: 'cyan', label: 'Ciano', color: 'bg-cyan-600' },
    { id: 'orange', label: 'Fogo', color: 'bg-orange-600' },
    { id: 'teal', label: 'Maré', color: 'bg-teal-600' },
    { id: 'fuchsia', label: 'Orquídea', color: 'bg-fuchsia-600' },
    { id: 'zinc', label: 'Metal', color: 'bg-zinc-600' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBgImage = () => {
    setBgImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-12">
        
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner">🎨</div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Personalização</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Ajuste o ambiente ao seu estilo de aprendizado</p>
          </div>
        </div>

        {/* MODO NOTURNO */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Experiência Visual</h3>
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border dark:border-slate-800">
            <div>
              <h4 className="font-black text-gray-800 dark:text-white">Modo Noturno</h4>
              <p className="text-xs text-gray-500">Otimize o contraste para estudos prolongados à noite.</p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-16 h-8 rounded-full transition-all relative ${darkMode ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${darkMode ? 'left-9' : 'left-1'}`}></div>
            </button>
          </div>
        </section>

        {/* PALETA DE CORES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paleta de Cores Primária</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {colorPalettes.map((palette) => (
              <button
                key={palette.id}
                onClick={() => setPrimaryColor(palette.id)}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 group ${
                  primaryColor === palette.id 
                    ? `border-${palette.id}-500 bg-${palette.id}-50 dark:bg-${palette.id}-900/20 shadow-lg scale-105` 
                    : 'border-transparent bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl ${palette.color} shadow-lg shadow-${palette.id}-200 dark:shadow-none`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${primaryColor === palette.id ? `text-${palette.id}-600` : 'text-gray-400'}`}>
                  {palette.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* WALLPAPER */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-rose-600 rounded-full"></div>
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Papel de Parede (Wallpaper)</h3>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border dark:border-slate-800 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-64 h-44 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group shadow-inner">
                {bgImage ? (
                  <>
                    <img src={bgImage} alt="Wallpaper Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={clearBgImage}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] uppercase backdrop-blur-sm"
                    >
                      Remover Imagem
                    </button>
                  </>
                ) : (
                  <span className="text-gray-300 font-black text-[10px] uppercase">Nenhum Wallpaper</span>
                )}
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h4 className="font-black text-gray-800 dark:text-white text-sm">Upload de Imagem</h4>
                  <p className="text-xs text-gray-400">Transforme o dashboard em um painel motivacional.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:border-blue-500 transition-all shadow-sm"
                  >
                    Selecionar Arquivo
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-gray-800 dark:text-white text-sm">Transparência do Fundo</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{Math.round(bgOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-[9px] text-gray-400 italic">Uma opacidade entre 5% e 15% garante a melhor legibilidade dos cards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t dark:border-slate-800">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] flex items-center gap-4 border border-blue-100 dark:border-blue-900/20">
            <span className="text-2xl animate-pulse">🧠</span>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Psicologia do Aprendizado:</strong> Um ambiente organizado e esteticamente agradável reduz o cortisol (estresse) e favorece o estado de "Flow" durante as sessões de estudo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personalization;
