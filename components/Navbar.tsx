import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-[#0B0F19] border-b border-white/10 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
        <GraduationCap className="w-6 h-6" />
        <span className="font-bold text-lg tracking-tight text-white">ThesisForge</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Meus Projetos
        </Link>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/30 transition-colors">
                <UserIcon className="w-4 h-4" />
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#131926] border border-white/10 rounded-lg shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-xs text-slate-500">Logado como</p>
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;