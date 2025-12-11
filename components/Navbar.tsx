import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#0B0F19] border-b border-white/10 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
        <GraduationCap className="w-6 h-6" />
        <span className="font-bold text-lg tracking-tight text-white">ThesisForge</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Meus Projetos
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;