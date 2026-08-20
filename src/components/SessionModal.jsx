import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Play, X } from 'lucide-react';

export function SessionModal({ isOpen, type, totalStudents, checkedInCount, remainingCount, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  const isStart = type === 'start';
  const isComplete = totalStudents > 0 && checkedInCount === totalStudents;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-[calc(100%-1rem)] max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[90vh] flex flex-col justify-between"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {isStart ? (
            /* START CHECK-IN MODAL */
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shrink-0">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Start New Check-In?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
                <strong className="text-blue-400">{totalStudents} students</strong> will be available for this new check-in session.
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                This will reset active status and allow all students to record their roll number.
              </p>

              <div className="flex items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-xl border border-slate-700 font-semibold text-xs text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'STARTING...' : 'START CHECK-IN'}
                </button>
              </div>
            </div>
          ) : (
            /* END CHECK-IN MODAL */
            <div>
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3.5 sm:mb-4 border ${
                isComplete 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {isComplete ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>

              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">CHECK-IN SUMMARY</h3>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">End Check-In Session?</h2>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4 my-3.5 sm:my-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Enrolled:</span>
                  <span className="text-white">{totalStudents} Students</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Checked In:</span>
                  <span className="text-emerald-400 font-extrabold">{checkedInCount} Students</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-400">Remaining:</span>
                  <span className="text-rose-400 font-extrabold">{remainingCount} Students</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  {isComplete ? (
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>✓ {totalStudents} / {totalStudents} ALL STUDENTS ACCOUNTED FOR</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>⚠ {remainingCount} STUDENTS NOT CHECKED IN</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Are you sure you want to end this check-in? Students will no longer be able to check in.
              </p>

              <div className="flex items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-xl border border-slate-700 font-semibold text-xs text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'ENDING...' : 'END CHECK-IN'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
