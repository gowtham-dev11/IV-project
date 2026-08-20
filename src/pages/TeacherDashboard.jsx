import React, { useState, useCallback } from 'react';
import { Plus, StopCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { StatsCard } from '../components/StatsCard';
import { ProgressCard } from '../components/ProgressCard';
import { StudentStatusCard } from '../components/StudentStatusCard';
import { SessionModal } from '../components/SessionModal';
import { Toast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useRealtimeCheckins } from '../hooks/useRealtimeCheckins';
import { startNewSession, endSession } from '../lib/supabase';

export function TeacherDashboard() {
  const [toast, setToast] = useState(null);
  const [modalType, setModalType] = useState(null); // 'start' | 'end' | null
  const [modalLoading, setModalLoading] = useState(false);

  // Realtime callback for toast notification
  const handleNewCheckin = useCallback((student) => {
    setToast(student);
  }, []);

  const {
    activeSession,
    students,
    checkedInStudents,
    remainingStudents,
    totalCount,
    checkedInCount,
    remainingCount,
    loading,
    refreshData
  } = useRealtimeCheckins(handleNewCheckin);

  // Handle Start New Session
  const handleConfirmStartSession = async () => {
    setModalLoading(true);
    try {
      await startNewSession();
      await refreshData();
      setModalType(null);
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle End Session
  const handleConfirmEndSession = async () => {
    if (!activeSession) return;
    setModalLoading(true);
    try {
      await endSession(activeSession.id);
      await refreshData();
      setModalType(null);
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-8 py-6 sm:py-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-400">MANAGEMENT DASHBOARD</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
              Student Check-In
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={refreshData}
              title="Refresh Data"
              className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeSession ? (
              <button
                onClick={() => setModalType('end')}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-3 min-h-[44px] rounded-2xl bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 border border-rose-500/30"
              >
                <StopCircle className="w-4 h-4" />
                <span className="truncate">END CHECK-IN</span>
              </button>
            ) : null}

            <button
              onClick={() => setModalType('start')}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 min-h-[44px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="truncate">+ NEW CHECK-IN</span>
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Connecting to Supabase Realtime..." />
        ) : !activeSession ? (
          <EmptyState onStartNewSession={() => setModalType('start')} />
        ) : (
          <div>
            {/* Top 3 Statistic Cards */}
            <StatsCard
              totalStudents={totalCount}
              checkedIn={checkedInCount}
              remaining={remainingCount}
            />

            {/* Main Progress Status Card */}
            <ProgressCard
              checkedIn={checkedInCount}
              totalStudents={totalCount}
              remaining={remainingCount}
            />

            {/* Split Grids: Checked In vs Remaining */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              {/* 🟢 CHECKED IN SECTION */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                      🟢 CHECKED IN
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {checkedInCount}
                      </span>
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Live Feed</span>
                </div>

                {checkedInStudents.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 text-slate-500">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No students have checked in yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] sm:max-h-[500px] lg:max-h-[540px] overflow-y-auto pr-1 overscroll-contain">
                    {checkedInStudents.map((student) => (
                      <StudentStatusCard
                        key={student.id}
                        student={student}
                        isCheckedIn={true}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* 🔴 NOT CHECKED IN SECTION */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                      🔴 NOT CHECKED IN
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {remainingCount}
                      </span>
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Pending</span>
                </div>

                {remainingStudents.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 text-emerald-400">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-emerald-400 animate-bounce" />
                    <p className="text-xs sm:text-sm font-extrabold">All {totalCount} students are checked in!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] sm:max-h-[500px] lg:max-h-[540px] overflow-y-auto pr-1 overscroll-contain">
                    {remainingStudents.map((student) => (
                      <StudentStatusCard
                        key={student.id}
                        student={student}
                        isCheckedIn={false}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modals */}
      <SessionModal
        isOpen={modalType !== null}
        type={modalType}
        totalStudents={totalCount}
        checkedInCount={checkedInCount}
        remainingCount={remainingCount}
        loading={modalLoading}
        onClose={() => setModalType(null)}
        onConfirm={modalType === 'start' ? handleConfirmStartSession : handleConfirmEndSession}
      />

      {/* Realtime Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
