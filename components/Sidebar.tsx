import React from 'react';
import { BookOpen, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { Chapter } from '../types';

interface SidebarProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onSelectChapter: (id: string) => void;
  title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ chapters, currentChapterId, onSelectChapter, title }) => {
  return (
    <div className="w-64 bg-[#080B12] text-slate-300 flex flex-col h-full border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-white tracking-tight">ThesisForge</span>
        </div>
        <h2 className="text-xs font-medium text-slate-500 mt-2 line-clamp-2" title={title}>
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <h3 className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          Estrutura do TCC
        </h3>
        <nav className="space-y-0.5">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-colors ${currentChapterId === chapter.id
                  ? 'bg-indigo-500/10 text-indigo-400 border-r-2 border-indigo-500'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {chapter.isGenerated && chapter.content.length > 50 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate text-sm font-medium">{chapter.title}</span>
              </div>
              {currentChapterId === chapter.id && (
                <ChevronRight className="w-3 h-3 text-indigo-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 text-xs text-center text-slate-600">
        v1.0.0 • ThesisForge
      </div>
    </div>
  );
};

export default Sidebar;