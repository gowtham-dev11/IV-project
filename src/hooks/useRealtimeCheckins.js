import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, getActiveSession, getStudents, getCheckinsForSession, broadcastChannel } from '../lib/supabase';

export function useRealtimeCheckins(onNewCheckin) {
  const [activeSession, setActiveSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevCheckinsLengthRef = useRef(0);

  // Load initial dataset
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionRes, studentsRes] = await Promise.all([
        getActiveSession(),
        getStudents()
      ]);

      const session = sessionRes.data;
      const allStudents = studentsRes.data || [];

      setActiveSession(session);
      setStudents(allStudents);

      if (session) {
        const checkinsRes = await getCheckinsForSession(session.id);
        const currentCheckins = checkinsRes.data || [];
        setCheckins(currentCheckins);

        // Notify if new checkin detected
        if (currentCheckins.length > prevCheckinsLengthRef.current && prevCheckinsLengthRef.current > 0) {
          const newest = currentCheckins[0];
          const student = allStudents.find(s => s.id === newest.student_id);
          if (student && onNewCheckin) {
            onNewCheckin(student);
          }
        }
        prevCheckinsLengthRef.current = currentCheckins.length;
      } else {
        setCheckins([]);
        prevCheckinsLengthRef.current = 0;
      }
    } catch (err) {
      console.error('Error refreshing check-in data:', err);
      setError(err.message || 'Failed to fetch check-in status');
    } finally {
      setLoading(false);
    }
  }, [onNewCheckin]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Subscribe to Supabase Realtime & BroadcastChannel
  useEffect(() => {
    if (!activeSession) return;

    // 1. Supabase Realtime Channel
    const channel = supabase
      .channel(`public:checkins:${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          const newCheckin = payload.new;
          setCheckins((prev) => {
            if (prev.some((c) => c.id === newCheckin.id || c.student_id === newCheckin.student_id)) {
              return prev;
            }
            const updated = [newCheckin, ...prev];
            const student = students.find((s) => s.id === newCheckin.student_id);
            if (student && onNewCheckin) {
              onNewCheckin(student);
            }
            return updated;
          });
        }
      )
      .subscribe();

    // 2. BroadcastChannel tab listener
    const handleBroadcast = (event) => {
      if (event.data?.type === 'CHECKIN_UPDATE' || event.data?.type === 'SESSION_UPDATE') {
        refreshData();
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    // 3. Storage event listener for cross-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'pv_holidays_checkins_v1' || e.key === 'pv_holidays_sessions_v1') {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeSession, students, onNewCheckin, refreshData]);

  // Compute derived state: Checked In vs Remaining Students
  const checkedInStudentIds = new Set(checkins.map((c) => c.student_id));
  
  const checkedInStudents = students
    .filter((s) => checkedInStudentIds.has(s.id))
    .map((s) => {
      const c = checkins.find((item) => item.student_id === s.id);
      return {
        ...s,
        checked_at: c ? c.checked_at : null
      };
    })
    .sort((a, b) => new Date(b.checked_at || 0) - new Date(a.checked_at || 0));

  const remainingStudents = students
    .filter((s) => !checkedInStudentIds.has(s.id))
    .sort((a, b) => a.roll_number.localeCompare(b.roll_number));

  return {
    activeSession,
    students,
    checkins,
    checkedInStudents,
    remainingStudents,
    totalCount: students.length,
    checkedInCount: checkedInStudents.length,
    remainingCount: remainingStudents.length,
    loading,
    error,
    refreshData
  };
}
