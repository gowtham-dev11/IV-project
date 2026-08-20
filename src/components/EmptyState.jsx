import React from 'react';
import { Plus, ShieldAlert } from 'lucide-react';

export function EmptyState({ onStartNewSession }) {
  return (
    <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 border border-slate-800 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-extrabold text-white tracking-tight">No Active Check-In</h3>
      <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
        Start a new check-in when you're ready to account for students.
      </p>

      {onStartNewSession && (
        <button
          onClick={onStartNewSession}
          className="mt-6 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          + NEW CHECK-IN
        </button>
      )}
    </div>
  );
}
