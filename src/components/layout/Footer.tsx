import React from 'react';
import { BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                BlogSpace
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              A modern publishing medium built for engineers, designers, and creative thinkers. 
              Write with focus, explore diverse perspectives, and exchange meaningful discussions.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-slate-900 transition-colors">
                  All Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-slate-900 transition-colors">
                  Technology & AI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-slate-900 transition-colors">
                  Design Systems
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-slate-900 transition-colors">
                  Engineering Craft
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button onClick={() => onNavigate('create-post')} className="hover:text-slate-900 transition-colors">
                  Start Writing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-slate-900 transition-colors">
                  Authors & Community
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-slate-900 transition-colors">
                  Editorial Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BlogSpace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Node.js, Express & MongoDB</span>
            <span>JWT Secure Authentication</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
