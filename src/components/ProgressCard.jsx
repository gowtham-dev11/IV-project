import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function ProgressCard({ checkedIn, totalStudents, remaining }) {
  const percentage = totalStudents > 0 ? Math.min(100, Math.round((checkedIn / totalStudents) * 100)) : 0;
  const isComplete = totalStudents > 0 && checkedIn === totalStudents;

  return (
    <div className={`rounded-3xl p-6 sm:p-8 mb-8 border transition-all duration-300 shadow-2xl relative overflow-hidden ${
      isComplete 
        ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500/40 shadow-emerald-900/20' 
        : 'bg-gradient-to-r from-slate-900 via-[#131d33] to-slate-900 border-slate-800 shadow-blue-950/30'
    }`}>
      {/* Subtle background glow */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
        isComplete ? 'bg-emerald-500/10' : 'bg-blue-500/10'
      }`} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full inline-block mb-2">
              CURRENT CHECK-IN SESSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {isComplete ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <span>ALL STUDENTS ARE ACCOUNTED FOR</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-7 h-7 text-blue-400" />
                  <span>{checkedIn} / {totalStudents} <span className="text-slate-400 text-lg font-medium">Students Checked In</span></span>
                </>
              )}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            {isComplete ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm shadow-lg shadow-emerald-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                🟢 COMPLETE
              </span>
            ) : (
              <div className="inline-flex flex-col sm:items-end">
                <span className="text-3xl font-black text-white tracking-tight">{percentage}%</span>
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {remaining} STUDENTS REMAINING
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-5 bg-slate-950/80 rounded-full p-1 border border-slate-800 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500 shadow-lg shadow-emerald-500/50'
                : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 shadow-lg shadow-blue-500/40'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-3">
          <span>0 Students</span>
          <span className="text-slate-300 font-semibold">{checkedIn} of {totalStudents} Accounted</span>
          <span>{totalStudents} Students Total</span>
        </div>
      </div>
    </div>
  );
}
