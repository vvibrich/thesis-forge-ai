import { GoogleGenAI, Type } from "@google/genai";
import { FormattingStyle, TCCProject, Chapter } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const cleanResponseText = (text: string): string => {
  return text.replace(/^```(?:html|json)?\s*/i, '').replace(/\s*```$/, '').trim();
};

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
    - "title": string (O título acadêmico da seção em Português)
    - "description": string (Uma breve instrução do que este capítulo deve conter, em Português)
    
    A estrutura DEVE seguir rigorosamente esta ordem lógica:
    1. Introdução (Contextualização, Problema, Justificativa, Objetivos Geral e Específicos, Metodologia resumida)
    2. Fundamentação Teórica (Conceitos organizados por tópicos, autores modernos + clássicos)
    3. Metodologia (Passo a passo, técnica usada, ferramentas)
    4. Desenvolvimento / Resultados (O que foi implementado/analisado, evidências concretas)
    5. Conclusão (Retomada dos objetivos, o que foi atingido, limitações, trabalhos futuros)
    6. Referências (Formato ABNT impecável)

    Garanta que os títulos sejam adequados ao tema (ex: em vez de "Desenvolvimento", use algo mais específico se aplicável, mas mantendo a função da seção).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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

    const text = cleanResponseText(response.text || "[]");
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
    
    DIRETRIZES ESTRITAS DE QUALIDADE (NOTA 10):
    1. **Linguagem Impessoal e Formal:** JAMAIS use "eu", "nós", "a gente". Use voz passiva ou impessoal (ex: "Foi desenvolvido...", "Observa-se que...", "O objetivo deste trabalho é..."). Seja objetivo e direto.
    2. **Fundamentação Científica:** Use referências de verdade (artigos científicos, livros, IEEE, Scielo, ACM). Evite blogs ou fontes genéricas.
    3. **Formatação ABNT:** Siga as normas de citação (NBR 10520) e referências (NBR 6023) rigorosamente.
    4. **Estrutura do Texto:** Use parágrafos bem estruturados, com conectivos lógicos.
    
    CONTEÚDO ESPECÍFICO POR TIPO DE CAPÍTULO:
    - **Introdução:** Contextualize, apresente o problema, justificativa e objetivos claros.
    - **Fundamentação Teórica:** Organize por conceitos, cite autores clássicos e modernos.
    - **Metodologia:** Descreva o passo a passo, técnicas e ferramentas.
    - **Resultados:** Apresente evidências concretas, dados, análises.
    - **Conclusão:** Retome os objetivos, mostre o que foi atingido e sugira trabalhos futuros.
    - **Referências:** Liste apenas o que foi citado, em formato ABNT perfeito.

    REQUISITOS TÉCNICOS:
    - O idioma deve ser PORTUGUÊS DO BRASIL (pt-BR).
    - RETORNE O TEXTO FORMATADO EM HTML.
    - Use tags como <p>, <b>, <i>, <ul>, <li>, <h3>, <h4>.
    - NÃO repita o título do capítulo no início.
    - NÃO use Markdown (**, #, etc), apenas HTML.
    
    Tamanho: Abrangente e detalhado (aprox. 800-1500 palavras).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return cleanResponseText(response.text || "");
  } catch (error) {
    console.error("Erro ao gerar capítulo:", error);
    throw new Error("Falha ao gerar o conteúdo do capítulo.");
  }
};

export const improveText = async (text: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `texto_original: ${text}\n\ninstrução: ${instruction}\n\nsaída: Retorne apenas o texto reescrito em Português do Brasil com formatação HTML (<p>, <b>, etc), sem explicações.`
    });
    return cleanResponseText(response.text || text);
  } catch (e) {
    return text;
  }
};