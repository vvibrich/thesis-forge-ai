import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { FormattingStyle } from '../types';
import { projectsService } from '../services/projects';
import { generateThesisOutline } from '../services/geminiService';

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    style: FormattingStyle.ABNT,
    researchProblem: '',
    objectives: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.course) return;

    setLoading(true);
    try {
      // 1. Generate Outline using AI
      const outline = await generateThesisOutline(
        formData.title,
        formData.course,
        formData.style,
        `Problema de Pesquisa: ${formData.researchProblem}. Objetivos: ${formData.objectives}`
      );

      // 2. Create Project Object
      // We don't need to generate ID or timestamps, Supabase/Service handles it.
      // We pass the data to the service.
      const newProject = await projectsService.create({
        title: formData.title,
        course: formData.course,
        style: formData.style,
        researchProblem: formData.researchProblem,
        objectives: formData.objectives,
        chapters: outline.map(ch => ({ ...ch, content: '', isGenerated: false })) as any[]
      });

      // 3. Redirect
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      alert("Falha ao gerar estrutura do TCC. Por favor, tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Novo Projeto de TCC</h1>
          <p className="text-slate-400">
            Conte-nos sobre sua pesquisa e a IA gerará automaticamente uma estrutura acadêmica completa para você.
          </p>
        </div>

        <div className="bg-[#131926] rounded-xl border border-white/5 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tema / Título do TCC <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: O Impacto da IA na Saúde Pública Brasileira"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Curso Acadêmico <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Ex: Ciência da Computação"
                  value={formData.course}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Estilo de Formatação
                </label>
                <select
                  name="style"
                  className="w-full px-4 py-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={formData.style}
                  onChange={handleChange}
                >
                  {Object.values(FormattingStyle).map((style) => (
                    <option key={style} value={style} className="bg-[#0B0F19]">{style}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Problema de Pesquisa (Opcional)
              </label>
              <textarea
                name="researchProblem"
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Descreva brevemente o problema principal que seu TCC aborda..."
                value={formData.researchProblem}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Objetivos Principais (Opcional)
              </label>
              <textarea
                name="objectives"
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Liste seus objetivos gerais e específicos..."
                value={formData.objectives}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-lg hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Estrutura...
                  </>
                ) : (
                  <>
                    Criar Projeto de TCC
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewProject;