import React from 'react';
import { formatTime } from '../utils/validation';
import { CheckCircle2, UserX } from 'lucide-react';

export function StudentStatusCard({ student, isCheckedIn }) {
  if (isCheckedIn) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 hover:border-emerald-500/50 transition-all duration-200 shadow-md group relative overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {student.roll_number}
          </span>
        </div>

        <h4 className="font-bold text-white text-sm sm:text-base leading-snug tracking-tight group-hover:text-emerald-300 transition-colors line-clamp-1">
          {student.name}
        </h4>

        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-emerald-400/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Checked in {formatTime(student.checked_at)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4 border border-rose-500/30 bg-gradient-to-b from-slate-900/90 to-rose-950/20 hover:border-rose-500/50 transition-all duration-200 shadow-md group relative overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
          {student.roll_number}
        </span>
      </div>

      <h4 className="font-bold text-white text-sm sm:text-base leading-snug tracking-tight group-hover:text-rose-300 transition-colors line-clamp-1">
        {student.name}
      </h4>

      <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-rose-400/90">
        <UserX className="w-3.5 h-3.5 text-rose-400" />
        <span>Not checked in</span>
      </div>
    </div>
  );
}
