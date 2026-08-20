import { useState, useEffect, useCallback, useRef } from 'react';
import { broadcastChannel, getActiveSession, getStudents, getCheckinsForSession } from '../lib/supabase';

const POLL_INTERVAL_MS = 3000; // Poll Neon DB every 3 seconds for live dashboard updates

export function useRealtimeCheckins(onNewCheckin) {
  const [activeSession, setActiveSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track previous checkin count to detect new arrivals for toast notifications
  const prevCheckinCountRef = useRef(0);
  // Track previous checkins to find the newest one
  const prevCheckinIdsRef = useRef(new Set());

  const refreshData = useCallback(async () => {
    try {
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

        // Detect newly arrived check-ins for toast notification
        if (currentCheckins.length > prevCheckinCountRef.current && prevCheckinCountRef.current > 0) {
          const prevIds = prevCheckinIdsRef.current;
          const newOnes = currentCheckins.filter(c => !prevIds.has(c.id));
          if (newOnes.length > 0 && onNewCheckin) {
            // Find the student record for the most recent new check-in
            const newest = newOnes[0];
            const student = allStudents.find(s => s.id === newest.student_id);
            if (student) onNewCheckin(student);
          }
        }
        prevCheckinCountRef.current = currentCheckins.length;
        prevCheckinIdsRef.current = new Set(currentCheckins.map(c => c.id));
      } else {
        setCheckins([]);
        prevCheckinCountRef.current = 0;
        prevCheckinIdsRef.current = new Set();
      }
    } catch (err) {
      console.error('[useRealtimeCheckins] refreshData error:', err);
      setError(err.message || 'Failed to fetch check-in status');
    } finally {
      setLoading(false);
    }
  }, [onNewCheckin]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Polling loop — fires every 3s while page is open
  useEffect(() => {
    const interval = setInterval(refreshData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshData]);

  // BroadcastChannel: get instant notification when something changes on same device
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleBroadcast = (event) => {
      const type = event.data?.type;
      if (type === 'CHECKIN_UPDATE' || type === 'SESSION_UPDATE') {
        refreshData();
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcast);
    return () => broadcastChannel.removeEventListener('message', handleBroadcast);
  }, [refreshData]);

  // Compute derived state
  const checkedInStudentIds = new Set(checkins.map(c => c.student_id));

  const checkedInStudents = students
    .filter(s => checkedInStudentIds.has(s.id))
    .map(s => {
      const c = checkins.find(item => item.student_id === s.id);
      return { ...s, checked_at: c ? c.checked_at : null };
    })
    .sort((a, b) => new Date(b.checked_at || 0) - new Date(a.checked_at || 0));

  const remainingStudents = students
    .filter(s => !checkedInStudentIds.has(s.id))
    .sort((a, b) => String(a.roll_number).localeCompare(String(b.roll_number)));

  return {
    activeSession,
    students,
    checkins,
    checkedInStudents,
    remainingStudents,
    totalCount: students.filter(s => !s._isFallback || true).length,
    checkedInCount: checkedInStudents.length,
    remainingCount: remainingStudents.length,
    loading,
    error,
    refreshData
  };
}
