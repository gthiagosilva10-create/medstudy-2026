
import React, { useState } from 'react';
import { Area } from '../types';
import { jsPDF } from 'jspdf';

interface SummariesProps {
  areas: Area[];
  onUpdateSummary: (areaId: string, summary: string) => void;
}

const Summaries: React.FC<SummariesProps> = ({ areas, onUpdateSummary }) => {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0].id);
  const activeArea = areas.find(a => a.id === selectedAreaId);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateSummary(selectedAreaId, e.target.value);
  };

  const handleDownloadPDF = () => {
    if (!activeArea || !activeArea.summary) {
      alert('Escreva algo no resumo antes de baixar!');
      return;
    }

    const doc = new jsPDF();
    
    // Configurações de estilo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(`Resumo MedStudy: ${activeArea.name}`, 10, 20);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 25, 200, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    
    // Dividir o texto para caber na largura da página (A4 tem 210mm)
    const splitText = doc.splitTextToSize(activeArea.summary, 180);
    doc.text(splitText, 10, 35);
    
    doc.save(`Resumo_${activeArea.name.replace(/\s+/g, '_')}_MedStudy.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Seletor de Área */}
      <div className="lg:w-1/4 space-y-2">
        <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Resumos por Bloco</h3>
        {areas.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedAreaId(area.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
              selectedAreaId === area.id
                ? `bg-${area.color}-50 border-${area.color}-200 text-${area.color}-700 font-bold shadow-sm`
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{area.icon}</span>
              <span className="text-sm">{area.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Área de Texto */}
      <div className="lg:flex-1 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-16rem)] overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">{activeArea?.icon}</span>
              Caderno de Resumos: {activeArea?.name}
            </h4>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white px-2 py-1 rounded border">Auto-save ativo</span>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                📥 Baixar PDF
              </button>
            </div>
          </div>
          <textarea
            value={activeArea?.summary || ''}
            onChange={handleTextChange}
            placeholder={`Escreva aqui seus principais tópicos de ${activeArea?.name}... \n\nEx: \n- Critérios de Jones para Febre Reumática...\n- Tratamento de Crise Hipertensiva...`}
            className="flex-1 p-6 text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-0 bg-transparent text-lg"
          />
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-xs text-blue-800 leading-tight">
            <strong>Dica Pro:</strong> Use este espaço para consolidar o que você mais erra nos simulados de {activeArea?.name}. Revisar resumos próprios é 2x mais eficiente que ler materiais prontos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summaries;
