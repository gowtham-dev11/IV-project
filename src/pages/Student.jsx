import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveSession, getStudents, getCheckinsForSession, recordCheckin } from '../lib/supabase';
import { sanitizeRollNumber } from '../utils/validation';

export function Student() {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [statusState, setStatusState] = useState('IDLE'); // IDLE, NO_SESSION, INVALID_ROLL, ALREADY_CHECKED, SUCCESS
  const [matchedStudent, setMatchedStudent] = useState(null);

  const fetchSessionAndStudents = async () => {
    setLoading(true);
    try {
      const [sessionRes, studentsRes] = await Promise.all([
        getActiveSession(),
        getStudents()
      ]);

      const session = sessionRes.data;
      const allStudents = studentsRes.data || [];

      setActiveSession(session);
      setStudents(allStudents);

      if (!session) {
        setStatusState('NO_SESSION');
      } else {
        await getCheckinsForSession(session.id);
        setStatusState('IDLE');
      }
    } catch (err) {
      console.error('Error initializing student check-in:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanRoll = sanitizeRollNumber(rollNumber);
    if (!cleanRoll) return;

    setSubmitting(true);

    try {
      // 1. Check active session
      const { data: latestSession } = await getActiveSession();
      if (!latestSession || latestSession.status !== 'active') {
        setActiveSession(null);
        setStatusState('NO_SESSION');
        setSubmitting(false);
        return;
      }
      setActiveSession(latestSession);

      // 2. Validate roll number
      const foundStudent = students.find(
        (s) => String(s.roll_number).toLowerCase() === cleanRoll.toLowerCase()
      );

      if (!foundStudent) {
        setStatusState('INVALID_ROLL');
        setSubmitting(false);
        return;
      }

      setMatchedStudent(foundStudent);

      // 3. Check duplicate
      const { data: currentCheckins } = await getCheckinsForSession(latestSession.id);
      const isAlreadyChecked = (currentCheckins || []).some(
        (c) => c.student_id === foundStudent.id
      );

      if (isAlreadyChecked) {
        setStatusState('ALREADY_CHECKED');
        setSubmitting(false);
        return;
      }

      // 4. Record checkin
      const res = await recordCheckin(latestSession.id, foundStudent.id);
      if (res.error === 'DUPLICATE_CHECKIN') {
        setStatusState('ALREADY_CHECKED');
      } else if (res.data) {
        setStatusState('SUCCESS');
      } else {
        setStatusState('INVALID_ROLL');
      }
    } catch (err) {
      console.error('Checkin error:', err);
      setStatusState('INVALID_ROLL');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRollNumber('');
    setMatchedStudent(null);
    if (!activeSession) {
      setStatusState('NO_SESSION');
    } else {
      setStatusState('IDLE');
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

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-slate-800"
            >
              <div className="w-9 h-9 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-slate-400">Verifying session status...</p>
            </motion.div>
          ) : statusState === 'NO_SESSION' ? (
            /* NO ACTIVE SESSION */
            <motion.div
              key="no-session"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-amber-950/20 shadow-2xl"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shrink-0">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">No Active Check-In</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
                Please wait for your teacher to start a check-in session.
              </p>

              <button
                onClick={fetchSessionAndStudents}
                className="mt-6 w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                REFRESH STATUS
              </button>
            </motion.div>
          ) : statusState === 'INVALID_ROLL' ? (
            /* INVALID ROLL NUMBER */
            <motion.div
              key="invalid-roll"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-rose-500/30 bg-gradient-to-b from-slate-900/90 to-rose-950/20 shadow-2xl"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shrink-0">
                <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Invalid Roll Number</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
                We couldn't find this roll number. Please check and try again.
              </p>

              <button
                onClick={handleReset}
                className="mt-6 w-full min-h-[48px] py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-rose-600/30 transition-all"
              >
                TRY AGAIN
              </button>
            </motion.div>
          ) : statusState === 'ALREADY_CHECKED' ? (
            /* ALREADY CHECKED IN */
            <motion.div
              key="already-checked"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-amber-950/20 shadow-2xl"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shrink-0">
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Already Checked In</h2>

              <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-base sm:text-lg font-bold text-white leading-snug">{matchedStudent?.name}</p>
                <p className="text-xs font-mono font-semibold text-amber-400 mt-1">Roll No: {matchedStudent?.roll_number}</p>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                You are already recorded for this check-in.
              </p>

              <button
                onClick={handleReset}
                className="mt-6 w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase border border-slate-700 transition-all"
              >
                DONE
              </button>
            </motion.div>
          ) : statusState === 'SUCCESS' ? (
            /* SUCCESSFUL CHECK-IN */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-emerald-500/40 bg-gradient-to-b from-slate-900/95 via-slate-900 to-emerald-950/30 shadow-2xl shadow-emerald-950/50"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 animate-pulse shrink-0">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-tight flex items-center justify-center gap-2">
                ✓ You're Checked In
              </h2>

              <div className="my-4 sm:my-5 p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-inner">
                <p className="text-lg sm:text-xl font-black text-white leading-snug">{matchedStudent?.name}</p>
                <p className="text-xs font-mono font-bold text-emerald-400 tracking-wider mt-1">
                  Roll No: {matchedStudent?.roll_number}
                </p>
              </div>

              <p className="text-xs sm:text-sm font-bold text-emerald-300">
                Successfully recorded.
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                You can close this page.
              </p>

              <button
                onClick={handleReset}
                className="mt-6 w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/30 transition-all"
              >
                CHECK IN ANOTHER STUDENT
              </button>
            </motion.div>
          ) : (
            /* DEFAULT FORM STATE */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="glass-panel rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden"
            >
              <div className="mb-5 sm:mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20 inline-block mb-2">
                  Session Active
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Student Check-In</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Enter your Roll Number to record attendance.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="rollNumber" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Enter your Roll Number
                  </label>
                  <input
                    id="rollNumber"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 279005"
                    className="w-full min-h-[52px] px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-base sm:text-lg font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !rollNumber.trim()}
                  className="w-full min-h-[50px] py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      VERIFYING...
                    </>
                  ) : (
                    'CHECK IN'
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] text-slate-400 font-medium">
        Simple. Fast. Accounted. • PV HOLIDAYS
      </footer>
    </div>
  );
}
