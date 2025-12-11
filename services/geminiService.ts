import { GoogleGenAI, Type } from "@google/genai";
import { FormattingStyle, TCCProject, Chapter } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateThesisOutline = async (
  topic: string, 
  course: string, 
  style: FormattingStyle,
  context?: string
): Promise<Partial<Chapter>[]> => {
  
  // Prompt translated to Portuguese to ensure output is in PT-BR
  const prompt = `
    Atue como um orientador acadêmico especialista em bancas de TCC no Brasil. 
    Crie uma estrutura de capítulos (outline) para um Trabalho de Conclusão de Curso (TCC) sobre o tema: "${topic}" para o curso de "${course}".
    Estilo de Formatação: ${style} (foco em ABNT se for padrão brasileiro).
    Contexto Adicional: ${context || 'Nenhum'}.

    Retorne APENAS um array JSON de objetos representando os capítulos.
    Cada objeto deve ter:
    - "title": string (O título acadêmico da seção em Português, ex: "Introdução", "Fundamentação Teórica", "Metodologia", etc.)
    - "description": string (Uma breve instrução do que este capítulo deve conter, em Português)
    
    Inclua as seções acadêmicas padrão: Introdução, Justificativa, Objetivos (Geral e Específicos), Metodologia, Fundamentação Teórica (com subtópicos relevantes ao tema), Resultados Esperados (ou obtidos), Discussão, Conclusão e Referências.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description']
          }
        }
      }
    });

    const text = response.text || "[]";
    const rawChapters = JSON.parse(text);

    return rawChapters.map((ch: any, index: number) => ({
      id: crypto.randomUUID(),
      title: ch.title,
      content: `<p><em><!-- Instruções: ${ch.description} --></em></p><p><br></p>`,
      isGenerated: false,
      order: index
    }));
  } catch (error) {
    console.error("Erro ao gerar estrutura:", error);
    throw new Error("Falha ao gerar a estrutura do TCC.");
  }
};

export const generateChapterContent = async (
  project: TCCProject,
  chapter: Chapter
): Promise<string> => {
  
  const projectContext = `
    Título do TCC: ${project.title}
    Curso: ${project.course}
    Estilo de Formatação: ${project.style}
    Problema de Pesquisa: ${project.researchProblem || 'N/A'}
    Objetivos: ${project.objectives || 'N/A'}
  `;

  const prompt = `
    Você é um escritor acadêmico especialista auxiliando na redação de um TCC (Trabalho de Conclusão de Curso).
    
    CONTEXTO DO PROJETO:
    ${projectContext}

    TAREFA:
    Escreva o conteúdo completo para o capítulo intitulado: "${chapter.title}".
    
    REQUISITOS:
    - O idioma deve ser PORTUGUÊS DO BRASIL (pt-BR).
    - Utilize tom acadêmico formal, impessoal e objetivo (padrão ABNT).
    - Seja coerente, coeso e detalhado.
    - Utilize vocabulário acadêmico adequado.
    - Se este for o capítulo de "Referências", gere referências bibliográficas fictícias mas plausíveis e relevantes academicamente, formatadas segundo a norma ${project.style} (ABNT NBR 6023 para ABNT).
    - NÃO repita o título do capítulo no início do texto, apenas o conteúdo do corpo.
    - RETORNE O TEXTO FORMATADO EM HTML.
    - Use tags como <p>, <b>, <i>, <ul>, <li>, <h3>, <h4>.
    - NÃO use Markdown (**, #, etc), apenas HTML.
    
    Tamanho: Abrangente para uma seção final de TCC (aprox. 500-1000 palavras dependendo do tipo de seção).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erro ao gerar capítulo:", error);
    throw new Error("Falha ao gerar o conteúdo do capítulo.");
  }
};

export const improveText = async (text: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `texto_original: ${text}\n\ninstrução: ${instruction}\n\nsaída: Retorne apenas o texto reescrito em Português do Brasil com formatação HTML (<p>, <b>, etc), sem explicações.`
    });
    return response.text || text;
  } catch (e) {
    return text;
  }
};