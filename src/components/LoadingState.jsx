import React from 'react';

export function LoadingState({ message = 'Loading dashboard...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-400 tracking-wide">{message}</p>
    </div>
  );
}
