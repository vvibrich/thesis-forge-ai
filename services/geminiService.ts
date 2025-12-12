import { GoogleGenAI, Type } from "@google/genai";
import { FormattingStyle, TCCProject, Chapter, ReviewResult } from "../types";

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
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-pro-preview',
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
      model: 'gemini-3-pro-preview',
      contents: `texto_original: ${text}\n\ninstrução: ${instruction}\n\nsaída: Retorne apenas o texto reescrito em Português do Brasil com formatação HTML (<p>, <b>, etc), sem explicações.`
    });
    return cleanResponseText(response.text || text);
  } catch (e) {
    return text;
  }
};

export const refineSelectedText = async (
  selectedText: string,
  project: TCCProject,
  instruction?: string
): Promise<string> => {
  const projectContext = `
    Título do TCC: ${project.title}
    Curso: ${project.course}
    Estilo: ${project.style}
  `;

  const prompt = `
    Você é um assistente acadêmico especialista.
    
    CONTEXTO DO PROJETO:
    ${projectContext}

    TEXTO SELECIONADO PELO USUÁRIO:
    "${selectedText}"

    INSTRUÇÃO DO USUÁRIO:
    ${instruction || "Melhore a escrita acadêmica, corrija gramática e torne o texto mais formal e impessoal."}

    DIRETRIZES:
    1. Mantenha o sentido original, mas eleve o nível acadêmico.
    2. Use voz passiva ou impessoal.
    3. Retorne APENAS o novo texto reescrito, formatado em HTML simples (<p>, <b>, <i>).
    4. NÃO adicione explicações antes ou depois.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return cleanResponseText(response.text || selectedText);
  } catch (error) {
    console.error("Erro ao refinar texto:", error);
    throw new Error("Falha ao refinar o texto selecionado.");
  }
};

export const reviewProject = async (project: TCCProject): Promise<ReviewResult> => {
  const fullContent = project.chapters
    .map(ch => `CAPÍTULO: ${ch.title}\n\n${ch.content.replace(/<[^>]*>/g, '')}`)
    .join('\n\n-------------------\n\n');

  const prompt = `
    Atue como um examinador rigoroso de banca de TCC.
    
    DADOS DO PROJETO:
    Título: ${project.title}
    Curso: ${project.course}
    Estilo: ${project.style}

    CONTEÚDO COMPLETO DO TRABALHO:
    ${fullContent}

    TAREFA:
    Analise o trabalho acima e forneça um feedback estruturado.
    
    CRITÉRIOS DE AVALIAÇÃO:
    1. Coerência e Coesão Textual.
    2. Estrutura Lógica e Argumentação.
    3. Adequação à Linguagem Acadêmica (Impessoalidade, Formalidade).
    4. Clareza dos Objetivos e Resultados.

    SAÍDA ESPERADA (JSON):
    {
      "grade": number (Nota de 0 a 10, com uma casa decimal),
      "feedback": string (Comentário geral sobre o trabalho, tom construtivo),
      "strengths": string[] (Lista de 3 a 5 pontos fortes),
      "improvements": string[] (Lista de 3 a 5 pontos de melhoria específicos e acionáveis)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['grade', 'feedback', 'strengths', 'improvements']
        }
      }
    });

    const text = cleanResponseText(response.text || "{}");
    const result = JSON.parse(text);

    return {
      ...result,
      reviewedAt: Date.now()
    };
  } catch (error) {
    console.error("Erro ao revisar projeto:", error);
    throw new Error("Falha ao realizar a revisão do TCC.");
  }
};

export const applyCorrections = async (content: string, instructions: string): Promise<string> => {
  const prompt = `
    Você é um editor de texto experiente.
    
    TAREFA:
    Reescreva o texto abaixo aplicando as seguintes melhorias: "${instructions}".
    
    REGRA CRÍTICA DE FORMATAÇÃO (TRACK CHANGES):
    1. Para cada alteração (palavra ou frase mudada), envolva o NOVO texto em:
       <span class="ai-correction" data-original="TEXTO_ORIGINAL_AQUI" style="background-color: #fef08a; cursor: pointer; border-bottom: 2px solid #eab308;" title="Clique para aceitar ou recusar">NOVO_TEXTO</span>
    
    2. Se for apenas uma correção ortográfica ou gramatical, faça a substituição usando a tag acima.
    
    3. Mantenha o restante do HTML original (<p>, <b>, etc) intacto.
    
    TEXTO ORIGINAL:
    ${content}
    
    SAÍDA:
    Retorne apenas o HTML final com as tags de correção aplicadas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return cleanResponseText(response.text || content);
  } catch (error) {
    console.error("Erro ao aplicar correções:", error);
    throw new Error("Falha ao aplicar as correções sugeridas.");
  }
};