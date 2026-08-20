import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getAllSessions, getCheckinsForSession, getStudents } from '../lib/supabase';
import { formatDateTime, formatTime } from '../utils/validation';
import { LoadingState } from '../components/LoadingState';
import { History as HistoryIcon, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Users } from 'lucide-react';

export function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState({});

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const [sessionsRes, studentsRes] = await Promise.all([
          getAllSessions(),
          getStudents()
        ]);

        const allSessions = sessionsRes.data || [];
        const allStudents = studentsRes.data || [];

        // Fetch checkins for each session to build metrics
        const detailsMap = {};
        for (const s of allSessions) {
          const checkinsRes = await getCheckinsForSession(s.id);
          const checkins = checkinsRes.data || [];
          const checkedInSet = new Set(checkins.map(c => c.student_id));
          
          detailsMap[s.id] = {
            total: allStudents.length,
            checkedInCount: checkins.length,
            remainingCount: allStudents.length - checkins.length,
            checkedInList: allStudents.filter(st => checkedInSet.has(st.id)),
            remainingList: allStudents.filter(st => !checkedInSet.has(st.id))
          };
        }

        setSessions(allSessions);
        setSessionDetails(detailsMap);
      } catch (e) {
        console.error('Error fetching session history:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">SESSION ARCHIVE</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Check-In History</h1>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading check-in history..." />
        ) : sessions.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-slate-800 my-8">
            <p className="text-base text-slate-400 font-semibold">No check-in session history available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => {
              const details = sessionDetails[session.id] || { total: 53, checkedInCount: 0, remainingCount: 53, checkedInList: [], remainingList: [] };
              const isExpanded = expandedSessionId === session.id;
              const isComplete = details.checkedInCount === details.total;
              const sessionNum = sessions.length - idx;

              return (
                <div
                  key={session.id}
                  className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all duration-200 shadow-lg hover:border-slate-700"
                >
                  <button
                    onClick={() => toggleExpand(session.id)}
                    className="w-full p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                        session.status === 'active'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : isComplete
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        #{sessionNum < 10 ? `0${sessionNum}` : sessionNum}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-base">Check-In #{sessionNum < 10 ? `0${sessionNum}` : sessionNum}</h3>
                          {session.status === 'active' ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              ACTIVE NOW
                            </span>
                          ) : isComplete ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> COMPLETE
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {details.remainingCount} LEFT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          Created {formatDateTime(session.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-black text-white leading-none">
                          {details.checkedInCount} / {details.total}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">Students Accounted</p>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Session Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-800 bg-slate-950/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                        {/* Checked In */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Checked In ({details.checkedInCount})
                          </h4>
                          {details.checkedInList.length === 0 ? (
                            <p className="text-xs text-slate-500">None</p>
                          ) : (
                            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                              {details.checkedInList.map(st => (
                                <div key={st.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between text-xs">
                                  <span className="font-bold text-white">{st.name}</span>
                                  <span className="font-mono text-emerald-400">{st.roll_number}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Remaining */}
                        <div>
                          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            Remaining ({details.remainingCount})
                          </h4>
                          {details.remainingList.length === 0 ? (
                            <p className="text-xs text-emerald-400 font-semibold">All students checked in!</p>
                          ) : (
                            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                              {details.remainingList.map(st => (
                                <div key={st.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between text-xs">
                                  <span className="font-bold text-white">{st.name}</span>
                                  <span className="font-mono text-rose-400">{st.roll_number}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
