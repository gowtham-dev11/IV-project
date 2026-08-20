import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, ShieldCheck, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function TeacherLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginTeacher } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginTeacher(username, password);
      if (res.success) {
        navigate('/teacher/dashboard');
      } else {
        setError(res.message || 'Incorrect username or password.');
      }
    } catch (err) {
      setError('Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col justify-between p-3.5 sm:p-6 selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wider leading-none">PV HOLIDAYS</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wider">IV TRIP ORGANIZER AGENT</p>
          </div>
        </Link>

        <Link
          to="/"
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors active:scale-95"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
        <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3.5 shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-cyan-400">PV HOLIDAYS</h2>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">Teacher Access</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Log in to manage student check-in sessions.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-base font-semibold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full min-h-[48px] pl-10 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-base font-semibold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full min-h-[48px] mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] text-slate-400 font-medium">
        Simple. Fast. Accounted. • PV HOLIDAYS
      </footer>
    </div>
  );
}
