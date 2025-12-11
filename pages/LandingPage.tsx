import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, BookOpen, FileText, CheckCircle2, ArrowRight, Zap, ShieldCheck, Layout } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white font-sans">
      {/* Navbar Overlay */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-xl tracking-tight">ThesisForge</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" />
            NOVO: Geração com Inteligencia Artificial
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Sua pesquisa acadêmica. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">
              Pronta em instantes.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            O ThesisForge conecta suas ideias à inteligência artificial para estruturar, escrever e formatar seu TCC nas normas da ABNT automaticamente.
          </p>

          {/* Interactive Mock Input */}
          <div className="max-w-2xl mx-auto mb-12 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#131926] rounded-xl p-2 border border-white/10 shadow-2xl">
              <div className="pl-4 pr-3 text-slate-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Sobre o que você quer escrever? Ex: Impacto da IA na medicina..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-lg py-2"
                disabled
              />
              <Link to="/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all ml-2 whitespace-nowrap">
                Gerar TCC
              </Link>
            </div>
            <div className="flex gap-4 mt-4 justify-center text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> ABNT Automática</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Citações Reais</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Exportação DOCX</span>
            </div>
          </div>

          {/* Floating UI Mockup */}
          <div className="relative mx-auto max-w-5xl mt-16 rounded-xl bg-[#131926] border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0F19]/90 z-10 pointer-events-none" />

            {/* Mock Header */}
            <div className="h-10 border-b border-white/5 bg-[#1A202C] flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="ml-4 h-6 w-64 bg-white/5 rounded-md"></div>
            </div>

            {/* Mock Body */}
            <div className="p-8 grid grid-cols-12 gap-6 opacity-80">
              <div className="col-span-3 space-y-3">
                <div className="h-8 w-full bg-indigo-500/20 rounded mb-4 border border-indigo-500/30"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
              </div>
              <div className="col-span-9 space-y-4">
                <div className="h-8 w-1/3 bg-white/10 rounded mb-6"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                <div className="h-32 w-full bg-white/5 rounded border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-sm">
                  Conteúdo Gerado pela IA...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0B0F19] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Poder acadêmico ilimitado</h2>
            <p className="text-slate-400">Ferramentas projetadas para eliminar o bloqueio criativo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-indigo-400" />}
              title="Estrutura Completa"
              description="Do resumo à conclusão, o ThesisForge cria o esqueleto lógico do seu trabalho em segundos."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title="Escrita Instantânea"
              description="Gere parágrafos, justificativas e metodologias com vocabulário acadêmico preciso."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Normas ABNT"
              description="Esqueça a formatação manual. Margens, citações e referências já saem no padrão correto."
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-purple-400" />}
              title="Exportação DOCX/PDF"
              description="Baixe seu trabalho pronto para entregar ou editar no Word com apenas um clique."
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-blue-400" />}
              title="Referências Inteligentes"
              description="A IA sugere referências bibliográficas contextualizadas com o seu tema."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-pink-400" />}
              title="Melhoria de Texto"
              description="Reescreva trechos confusos e melhore a coesão textual automaticamente."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-[#0B0F19]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Pronto para terminar seu TCC?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Junte-se a milhares de estudantes que aceleraram sua aprovação com o ThesisForge.
          </p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 bg-white text-[#0B0F19] px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all shadow-xl hover:scale-105"
          >
            Criar meu TCC Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">Sem cartão de crédito necessário para testar.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#080B12]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-slate-600" />
            <span className="font-bold text-lg text-slate-500">ThesisForge</span>
          </div>
          <div className="text-slate-600 text-sm">
            © 2025 ThesisForge AI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-[#131926] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1A202C] transition-all group">
    <div className="w-12 h-12 rounded-lg bg-[#0B0F19] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </div>
);

export default LandingPage;