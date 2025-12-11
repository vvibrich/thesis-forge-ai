import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, Save, Wand2, Download, FileText, ChevronLeft, X, ShieldCheck, AlertTriangle, CheckCircle, ExternalLink,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Quote, Type, Upload, PlusCircle
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import FileSaver from 'file-saver';
import { Editor as WysiwygEditor, EditorProvider } from 'react-simple-wysiwyg';

import Sidebar from '../components/Sidebar';
import { TCCProject, Chapter, PlagiarismResult } from '../types';
import { projectsService } from '../services/projects';
import { generateChapterContent } from '../services/geminiService';
import { checkPlagiarism } from '../services/plagiarismService';

// --- Local Toolbar Components ---
const Toolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rsw-toolbar">{children}</div>
);

const Btn: React.FC<{ command: string; arg?: string; title?: string; children: React.ReactNode }> = ({ command, arg, title, children }) => {
  return (
    <button
      className="rsw-btn"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus loss from editor
        document.execCommand(command, false, arg);
      }}
      type="button"
    >
      {children}
    </button>
  );
};

const Separator: React.FC = () => <div className="rsw-separator" />;
// --------------------------------

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<TCCProject | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);

  // Plagiarism State
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace' | 'new'>('append');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const importInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, navigate]);

  const loadProject = async (projectId: string) => {
    try {
      const found = await projectsService.getById(projectId);
      if (found) {
        setProject(found);
        if (found.chapters.length > 0) {
          setActiveChapterId(found.chapters[0].id);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/dashboard');
    }
  };

  const activeChapter = project?.chapters.find(c => c.id === activeChapterId);

  // Auto-hide empty state if content is long enough
  // Reset empty state when changing chapters
  useEffect(() => {
    if (activeChapter?.content && activeChapter.content.replace(/<[^>]*>/g, '').trim().length > 0) {
      setShowEmptyState(false);
    } else {
      setShowEmptyState(true);
    }
  }, [activeChapterId]);

  const handleUpdateContent = (e: any) => {
    const newContent = e.target.value;
    if (!project || !activeChapterId) return;

    const updatedChapters = project.chapters.map(ch =>
      ch.id === activeChapterId ? { ...ch, content: newContent } : ch
    );

    setProject({ ...project, chapters: updatedChapters });

    // Hide overlay immediately when user types
    if (showEmptyState) {
      setShowEmptyState(false);
    }
  };

  const handleSave = async () => {
    if (project) {
      setIsSaving(true);
      try {
        await projectsService.update(project.id, project);
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Erro ao salvar projeto.');
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  };

  const handleGenerateChapter = async () => {
    if (!project || !activeChapter) return;

    setIsGenerating(true);
    setShowEmptyState(false);

    try {
      const generatedContent = await generateChapterContent(project, activeChapter);

      const updatedChapters = project.chapters.map(ch =>
        ch.id === activeChapter.id ? { ...ch, content: generatedContent, isGenerated: true } : ch
      );

      const updatedProject = { ...project, chapters: updatedChapters };
      setProject(updatedProject);
      await projectsService.update(updatedProject.id, updatedProject);
    } catch (error) {
      alert("Erro ao gerar conteúdo. Verifique sua conexão ou chave de API.");
      setShowEmptyState(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    if (!activeChapter?.content || activeChapter.content.length < 50) {
      alert("O conteúdo é muito curto para verificar plágio.");
      return;
    }

    setIsCheckingPlagiarism(true);
    try {
      const result = await checkPlagiarism(activeChapter.content);
      setPlagiarismResult(result);
      setShowPlagiarismModal(true);
    } catch (error) {
      alert("Erro ao verificar plágio. Tente novamente.");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const handleProcessImport = async () => {
    if (!project || !importContent.trim()) {
      setShowImportModal(false);
      return;
    }

    let updatedChapters = [...project.chapters];
    let newActiveId = activeChapterId;

    if (importMode === 'new') {
      if (!newChapterTitle.trim()) {
        alert("Por favor, digite um título para o novo capítulo.");
        return;
      }

      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        title: newChapterTitle,
        content: importContent,
        isGenerated: false,
        order: project.chapters.length
      };

      updatedChapters.push(newChapter);
      newActiveId = newChapter.id;
    } else {
      if (!activeChapterId) return;

      updatedChapters = updatedChapters.map(ch => {
        if (ch.id === activeChapterId) {
          const newContent = importMode === 'replace'
            ? importContent
            : ch.content + "<br/><br/>" + importContent;
          return { ...ch, content: newContent };
        }
        return ch;
      });
    }

    const updatedProject = { ...project, chapters: updatedChapters };
    setProject(updatedProject);
    await projectsService.update(updatedProject.id, updatedProject);

    if (newActiveId) {
      setActiveChapterId(newActiveId);
    }

    // Reset and Close
    setImportContent('');
    setNewChapterTitle('');
    setShowImportModal(false);
    if (importInputRef.current) importInputRef.current.innerHTML = '';
  };

  // Improved HTML Parser to handle alignment and new tags
  const parseHtmlToDocx = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    const paragraphs: Paragraph[] = [];

    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const text = el.textContent || '';

        let headingLevel: any = undefined;
        if (el.tagName === 'H1') headingLevel = HeadingLevel.HEADING_1;
        if (el.tagName === 'H2') headingLevel = HeadingLevel.HEADING_2;
        if (el.tagName === 'H3') headingLevel = HeadingLevel.HEADING_3;
        if (el.tagName === 'H4') headingLevel = HeadingLevel.HEADING_4;

        // Handle Alignment from styles (generated by execCommand)
        let alignment: any = AlignmentType.JUSTIFIED; // Default for ABNT
        const textAlign = el.style.textAlign;
        if (textAlign === 'center' || el.getAttribute('align') === 'center') alignment = AlignmentType.CENTER;
        if (textAlign === 'right' || el.getAttribute('align') === 'right') alignment = AlignmentType.RIGHT;
        if (textAlign === 'left' || el.getAttribute('align') === 'left') alignment = AlignmentType.LEFT;
        if (textAlign === 'justify' || el.getAttribute('align') === 'justify') alignment = AlignmentType.JUSTIFIED;

        let children: TextRun[] = [];

        if (el.childNodes.length > 0) {
          children = Array.from(el.childNodes).map(child => {
            const childEl = child as HTMLElement;
            const childText = child.textContent || '';
            if (!childText) return new TextRun("");

            return new TextRun({
              text: childText,
              bold: childEl.tagName === 'B' || childEl.tagName === 'STRONG' || el.tagName.startsWith('H'),
              italics: childEl.tagName === 'I' || childEl.tagName === 'EM',
              strike: childEl.tagName === 'S' || childEl.tagName === 'STRIKE',
              underline: {
                type: (childEl.tagName === 'U') ? "single" : undefined
              }
            });
          });
        } else {
          children = [new TextRun({ text, bold: !!headingLevel })];
        }

        // List handling (basic)
        if (el.tagName === 'UL') {
          Array.from(el.children).forEach(li => {
            paragraphs.push(new Paragraph({
              text: li.textContent || '',
              bullet: { level: 0 }
            }));
          });
        } else if (el.tagName === 'OL') {
          Array.from(el.children).forEach(li => {
            paragraphs.push(new Paragraph({
              text: li.textContent || '',
              numbering: { reference: "decimal-numbering", level: 0 }
            }));
          });
        } else if (el.tagName === 'BLOCKQUOTE') {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({
                text: text,
                italics: true
              })
            ],
            indent: { left: 720 }, // Indent
            spacing: { after: 120 }
          }));
        } else {
          if (text.trim() || children.length > 0) {
            paragraphs.push(new Paragraph({
              children,
              heading: headingLevel,
              alignment,
              spacing: { after: 120, line: 360 }
            }));
          }
        }
      }
    });

    return paragraphs;
  };

  const handleExportDocx = async () => {
    if (!project) return;

    try {
      const titleParagraph = new Paragraph({
        text: project.title.toUpperCase(),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 4000, after: 400 }
      });

      const courseParagraph = new Paragraph({
        text: project.course,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      });

      const docSections: Paragraph[] = [titleParagraph, courseParagraph];

      project.chapters.forEach(chapter => {
        docSections.push(new Paragraph({
          text: chapter.title.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
          spacing: { after: 300 }
        }));

        const chapterParagraphs = parseHtmlToDocx(chapter.content);
        docSections.push(...chapterParagraphs);
      });

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: "Times New Roman",
                size: 24,
              },
              paragraph: {
                spacing: { line: 360 },
              },
            },
          },
        },
        numbering: {
          config: [
            {
              reference: "decimal-numbering",
              levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 260 } } } }],
            },
          ],
        },
        sections: [{ properties: {}, children: docSections }]
      });

      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `${project.title.replace(/\s+/g, '_')}_TCC.docx`);
    } catch (e) {
      console.error("Error creating DOCX:", e);
      alert("Erro ao exportar DOCX.");
    }
  };

  const handleExportPDF = () => {
    if (!project) return;

    const doc = new jsPDF();
    let yPos = 10;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(project.title.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(12);
    doc.text(project.course, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    project.chapters.forEach(ch => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(ch.title.toUpperCase(), margin, yPos);
      yPos += 15;

      doc.setFont("times", "normal");
      doc.setFontSize(12);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ch.content;
      const plainText = tempDiv.innerText || tempDiv.textContent || "";

      const lines = doc.splitTextToSize(plainText, contentWidth);

      lines.forEach((line: string) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 7;
      });

      yPos += 15;
    });

    doc.save(`${project.title.replace(/\s+/g, '_')}_TCC.pdf`);
  };

  if (!project) return <div className="flex justify-center items-center h-screen bg-[#0B0F19]"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex h-screen bg-[#0B0F19] overflow-hidden text-slate-300">
      <Sidebar
        chapters={project.chapters}
        currentChapterId={activeChapterId}
        onSelectChapter={setActiveChapterId}
        title={project.title}
      />

      <div className="flex-1 flex flex-col h-full w-full">
        {/* Toolbar */}
        <header className="h-16 bg-[#0B0F19] border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Voltar ao Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white truncate max-w-md" title={activeChapter?.title}>{activeChapter?.title}</h2>
            {activeChapter?.isGenerated && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1">
                Gerado por IA
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors text-sm font-medium border border-indigo-500/20"
              title="Importar Conteúdo Externo"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Importar</span>
            </button>

            <button
              onClick={handleCheckPlagiarism}
              disabled={isCheckingPlagiarism}
              className="flex items-center gap-2 px-3 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors text-sm font-medium border border-indigo-500/20 mr-2"
              title="Verificar Originalidade"
            >
              {isCheckingPlagiarism ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span className="hidden lg:inline">Verificar Plágio</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>

            <div className="flex items-center bg-[#131926] border border-white/10 rounded-lg p-1">
              <button
                onClick={handleExportDocx}
                className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-all text-sm font-medium"
                title="Exportar DOCX"
              >
                <FileText className="w-4 h-4" />
                DOCX
              </button>
              <div className="w-px h-4 bg-white/10 mx-1"></div>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-all text-sm font-medium"
                title="Exportar PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>

            <button
              onClick={handleGenerateChapter}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none ml-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Escrevendo...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  {activeChapter?.content && activeChapter.content.length > 50 ? 'Regenerar' : 'Gerar com IA'}
                </>
              )}
            </button>
          </div>
        </header>

        {/* Editor Area - WYSIWYG */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-[#1e2330]">
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="max-w-[210mm] w-full bg-white shadow-2xl min-h-[297mm] transition-all duration-300">
              <EditorProvider>
                <WysiwygEditor
                  value={activeChapter?.content || ''}
                  onChange={handleUpdateContent}
                  placeholder="Comece a escrever aqui..."
                  containerProps={{ style: { height: '100%', minHeight: '297mm' } }}
                >
                  <Toolbar>
                    {/* History */}
                    <Btn command="undo" title="Desfazer">
                      <Undo size={16} />
                    </Btn>
                    <Btn command="redo" title="Refazer">
                      <Redo size={16} />
                    </Btn>
                    <Separator />

                    {/* Headings */}
                    <Btn command="formatBlock" arg="p" title="Parágrafo Normal">
                      <Type size={16} />
                    </Btn>
                    <Btn command="formatBlock" arg="h1" title="Título 1">
                      <Heading1 size={16} />
                    </Btn>
                    <Btn command="formatBlock" arg="h2" title="Título 2">
                      <Heading2 size={16} />
                    </Btn>
                    <Btn command="formatBlock" arg="h3" title="Título 3">
                      <Heading3 size={16} />
                    </Btn>
                    <Separator />

                    {/* Formatting */}
                    <Btn command="bold" title="Negrito">
                      <Bold size={16} />
                    </Btn>
                    <Btn command="italic" title="Itálico">
                      <Italic size={16} />
                    </Btn>
                    <Btn command="underline" title="Sublinhado">
                      <Underline size={16} />
                    </Btn>
                    <Btn command="strikeThrough" title="Tachado">
                      <Strikethrough size={16} />
                    </Btn>
                    <Separator />

                    {/* Alignment */}
                    <Btn command="justifyLeft" title="Alinhar à Esquerda">
                      <AlignLeft size={16} />
                    </Btn>
                    <Btn command="justifyCenter" title="Centralizar">
                      <AlignCenter size={16} />
                    </Btn>
                    <Btn command="justifyRight" title="Alinhar à Direita">
                      <AlignRight size={16} />
                    </Btn>
                    <Btn command="justifyFull" title="Justificar">
                      <AlignJustify size={16} />
                    </Btn>
                    <Separator />

                    {/* Lists */}
                    <Btn command="insertOrderedList" title="Lista Numerada">
                      <ListOrdered size={16} />
                    </Btn>
                    <Btn command="insertUnorderedList" title="Lista com Marcadores">
                      <List size={16} />
                    </Btn>
                    <Btn command="formatBlock" arg="blockquote" title="Citação">
                      <Quote size={16} />
                    </Btn>
                  </Toolbar>
                </WysiwygEditor>
              </EditorProvider>
            </div>
          </div>

          {/* Empty State / Instruction Overlay */}
          {showEmptyState && !isGenerating && (
            <div className="absolute top-100 left-1/2 -translate-x-1/2 z-20">
              <div className="relative text-center p-6 bg-[#131926] shadow-2xl rounded-xl border border-white/10 max-w-md animate-in fade-in slide-in-from-bottom-4">
                <button
                  onClick={() => setShowEmptyState(false)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                  title="Fechar dica"
                >
                  <X className="w-4 h-4" />
                </button>
                <Wand2 className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Pronto para escrever?</h3>
                <p className="text-slate-400 mb-0">
                  Clique no botão "Gerar com IA" para rascunhar este capítulo ou comece a digitar diretamente no papel.
                </p>
              </div>
            </div>
          )}

          {/* Import Content Modal */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-[#131926] rounded-xl border border-white/10 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Importar Conteúdo</h3>
                  </div>
                  <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <p className="text-slate-400 mb-4 text-sm">
                    Cole abaixo o texto (Word, Docs, etc) que deseja importar. A formatação básica (negrito, itálico, listas) será preservada.
                  </p>

                  <div
                    ref={importInputRef}
                    className="w-full h-48 bg-white text-black p-4 rounded-lg overflow-y-auto mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    contentEditable={true}
                    onInput={(e) => setImportContent(e.currentTarget.innerHTML)}
                  />

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-white block mb-2">Destino da Importação:</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${importMode === 'append' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-[#0B0F19] border-white/10 hover:border-white/20'}`}>
                        <input
                          type="radio"
                          name="importMode"
                          className="mt-1"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                        />
                        <div>
                          <span className="block text-white font-medium">Adicionar ao final</span>
                          <span className="text-xs text-slate-400">Mantém o conteúdo atual e adiciona o novo texto abaixo.</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${importMode === 'replace' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-[#0B0F19] border-white/10 hover:border-white/20'}`}>
                        <input
                          type="radio"
                          name="importMode"
                          className="mt-1"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                        />
                        <div>
                          <span className="block text-white font-medium">Substituir Capítulo</span>
                          <span className="text-xs text-slate-400">Apaga todo o conteúdo atual deste capítulo e insere o novo.</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${importMode === 'new' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-[#0B0F19] border-white/10 hover:border-white/20'}`}>
                        <input
                          type="radio"
                          name="importMode"
                          className="mt-1"
                          checked={importMode === 'new'}
                          onChange={() => setImportMode('new')}
                        />
                        <div>
                          <span className="block text-white font-medium">Criar Novo Capítulo</span>
                          <span className="text-xs text-slate-400">Cria um novo capítulo no final do TCC com este conteúdo.</span>
                        </div>
                      </label>
                    </div>

                    {importMode === 'new' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm text-slate-300 mb-1">Título do Novo Capítulo</label>
                        <div className="flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-indigo-400" />
                          <input
                            type="text"
                            className="flex-1 bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Ex: Análise de Dados"
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0B0F19] rounded-b-xl flex justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProcessImport}
                    disabled={!importContent.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Confirmar Importação
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Plagiarism Report Modal */}
          {showPlagiarismModal && plagiarismResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-[#131926] rounded-xl border border-white/10 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${plagiarismResult.score < 10 ? 'bg-emerald-500/10 text-emerald-500' :
                      plagiarismResult.score < 30 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Relatório de Originalidade</h3>
                      <p className="text-sm text-slate-400">Verificado em {new Date(plagiarismResult.scannedAt).toLocaleDateString()} às {new Date(plagiarismResult.scannedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPlagiarismModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#0B0F19] p-4 rounded-lg border border-white/5 text-center">
                      <div className={`text-3xl font-bold mb-1 ${plagiarismResult.score < 10 ? 'text-emerald-500' :
                        plagiarismResult.score < 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                        {plagiarismResult.score}%
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Similaridade Total</div>
                    </div>
                    <div className="bg-[#0B0F19] p-4 rounded-lg border border-white/5 text-center">
                      <div className="text-3xl font-bold text-white mb-1">{plagiarismResult.matches.length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trechos Suspeitos</div>
                    </div>
                    <div className="bg-[#0B0F19] p-4 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center">
                      {plagiarismResult.score < 10 ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                          <span className="text-emerald-500 font-medium text-sm">Texto Seguro</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-1" />
                          <span className="text-yellow-500 font-medium text-sm">Revisão Necessária</span>
                        </>
                      )}
                    </div>
                  </div>

                  {plagiarismResult.matches.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Trechos Detectados</h4>
                      {plagiarismResult.matches.map((match, index) => (
                        <div key={index} className="bg-[#0B0F19] border border-white/5 rounded-lg p-4">
                          <p className="text-slate-300 mb-3 italic border-l-2 border-red-500 pl-3">"{match.text}"</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 font-bold">{match.similarity}% similar</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-indigo-400 font-medium flex items-center gap-1">
                                Fonte: {match.source}
                                {match.url && <ExternalLink className="w-3 h-3" />}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhum plágio detectado. Seu texto parece original!</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0B0F19] rounded-b-xl flex justify-end">
                  <button
                    onClick={() => setShowPlagiarismModal(false)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Editor;