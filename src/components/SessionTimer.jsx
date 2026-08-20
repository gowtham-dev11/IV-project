import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function SessionTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!createdAt) return;

    const startTime = new Date(createdAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const pad = (n) => String(n).padStart(2, '0');

      if (hours > 0) {
        setElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setElapsed(`${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wider">
      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
      <span>CHECK-IN ACTIVE • {elapsed}</span>
    </div>
  );
}
