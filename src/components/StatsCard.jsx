import React from 'react';
import { Users, CheckCircle2, UserX } from 'lucide-react';

export function StatsCard({ totalStudents, checkedIn, remaining }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {/* 1. TOTAL STUDENTS */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-900/40 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between sm:block">
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">{totalStudents}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">Full Enrolled Roster</p>
        </div>
      </div>

      {/* 2. CHECKED IN (GREEN) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-emerald-950/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Checked In
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between sm:block">
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight leading-none">{checkedIn}</p>
          <p className="text-[10px] sm:text-[11px] text-emerald-400/80 mt-1 font-medium">Accounted & Present</p>
        </div>
      </div>

      {/* 3. REMAINING (RED) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-rose-500/20 bg-gradient-to-br from-slate-900/90 to-rose-950/20 relative overflow-hidden group hover:border-rose-500/40 transition-all shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Remaining
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between sm:block">
          <p className="text-3xl sm:text-4xl font-extrabold text-rose-400 tracking-tight leading-none">{remaining}</p>
          <p className="text-[10px] sm:text-[11px] text-rose-400/80 mt-1 font-medium">Pending Check-In</p>
        </div>
      </div>
    </div>
  );
}
