
import { GoogleGenAI } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// and use process.env.API_KEY directly.

export async function getStudyTips(topicName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um mentor especialista em provas de residência médica no Brasil. 
      Forneça 3 "Pérolas de Prova" (conhecimentos essenciais que sempre caem) para o seguinte tema: ${topicName}. 
      Seja conciso, direto e focado no que é cobrado nas grandes bancas (USP, UNICAMP, SUS-SP, ENARE). 
      Formate como uma lista curta em Markdown.`,
    });
    // Access response.text directly (it's a property, not a method)
    return response.text;
  } catch (error) {
    console.error("Error fetching study tips:", error);
    return "Desculpe, não consegui obter dicas para este tema no momento.";
  }
}

export async function askQuestion(question: string, context: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um assistente acadêmico para estudantes de medicina preparando para a residência.
      Tema de estudo atual: ${context}.
      Pergunta do aluno: ${question}
      
      Responda de forma didática, citando diretrizes brasileiras quando aplicável.`,
    });
    // Access response.text directly
    return response.text;
  } catch (error) {
    console.error("Error asking Gemini:", error);
    return "Ocorreu um erro ao processar sua pergunta.";
  }
}
