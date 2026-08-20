import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, LogOut, History, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { teacher, isAuthenticated, logoutTeacher } = useAuth();
  const location = useLocation();

  const isTeacherPage = location.pathname.startsWith('/teacher');

  return (
    <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800/80 px-3.5 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Subtitle */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-0.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-extrabold tracking-wider text-white text-sm sm:text-lg truncate">PV HOLIDAYS</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                Agent
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
              IV TRIP ORGANIZER AGENT
            </p>
          </div>
        </Link>

        {/* Right Navigation / Teacher Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {isAuthenticated && isTeacherPage ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
                <Link
                  to="/teacher/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/teacher/dashboard'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <Link
                  to="/teacher/history"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/teacher/history'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </Link>
              </nav>

              <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">{teacher.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Teacher</p>
                </div>
                <button
                  onClick={logoutTeacher}
                  title="Logout"
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all focus:outline-none active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            !isTeacherPage && (
              <Link
                to="/teacher/login"
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/40 text-xs font-semibold transition-all active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Teacher Access</span>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
