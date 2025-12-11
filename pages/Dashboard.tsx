import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Clock, BookMarked, Loader2 } from 'lucide-react';
import { projectsService } from '../services/projects';
import { TCCProject } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<TCCProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await projectsService.delete(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Erro ao excluir projeto.');
      }
    }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Meus TCCs</h1>
            <p className="text-slate-400 mt-1">Gerencie e edite seus trabalhos acadêmicos.</p>
          </div>
          <Link
            to="/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo TCC
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#131926] rounded-xl border border-white/5 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <BookMarked className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Nenhum projeto ainda</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Comece sua jornada acadêmica criando um novo projeto. Nossa IA ajudará a estruturar e escrever seu TCC.
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Começar novo projeto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="group bg-[#131926] rounded-xl border border-white/5 p-5 cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_4px_20px_-12px_rgba(99,102,241,0.5)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir Projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 h-14 group-hover:text-indigo-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium mb-4">{project.course}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Editado em {formatDate(project.updatedAt)}
                  </span>
                  <span className="bg-white/5 px-2 py-1 rounded text-slate-400 font-medium">
                    {project.style}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;