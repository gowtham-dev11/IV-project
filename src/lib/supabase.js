import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_STUDENTS } from './studentData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nnihbqxzssgmzlpuutld.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_GlczctFzltukwakvuw0MtA_2F6kkFgE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback Channel for local tab synchronization if Supabase Realtime table is pending SQL migration
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('pv_holidays_checkins')
  : null;

// Local storage key constants
const STORAGE_SESSIONS_KEY = 'pv_holidays_sessions_v1';
const STORAGE_CHECKINS_KEY = 'pv_holidays_checkins_v1';

// Helper to get local sessions
const getLocalSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Helper to save local sessions
const saveLocalSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'SESSION_UPDATE' });
  } catch (e) {}
};

// Helper to get local checkins
const getLocalCheckins = () => {
  try {
    const raw = localStorage.getItem(STORAGE_CHECKINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Helper to save local checkins
const saveLocalCheckins = (checkins) => {
  try {
    localStorage.setItem(STORAGE_CHECKINS_KEY, JSON.stringify(checkins));
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'CHECKIN_UPDATE' });
  } catch (e) {}
};

/**
 * 1. Fetch Students
 */
export async function getStudents() {
  try {
    const { data, error } = await supabase.from('students').select('*').order('roll_number');
    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch (e) {}

  // Fallback to official 53 student list with generated UUIDs
  const fallbackStudents = OFFICIAL_STUDENTS.map((s, idx) => ({
    id: `student-uuid-${s.roll_number}`,
    roll_number: s.roll_number,
    name: s.name,
    created_at: new Date(Date.now() - (53 - idx) * 60000).toISOString()
  }));

  return { data: fallbackStudents, error: null };
}

/**
 * 2. Get Active Session
 */
export async function getActiveSession() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data) {
      return { data: data[0] || null, error: null };
    }
  } catch (e) {}

  // Fallback local storage
  const sessions = getLocalSessions();
  const active = sessions.find(s => s.status === 'active');
  return { data: active || null, error: null };
}

/**
 * 3. Start New Session
 */
export async function startNewSession() {
  const newSessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
  const now = new Date().toISOString();

  // First end any existing active session
  try {
    await supabase.from('sessions').update({ status: 'completed', ended_at: now }).eq('status', 'active');
  } catch (e) {}

  // Update local sessions
  const localSessions = getLocalSessions().map(s => s.status === 'active' ? { ...s, status: 'completed', ended_at: now } : s);
  const newSession = {
    id: newSessionId,
    created_at: now,
    ended_at: null,
    status: 'active'
  };

  saveLocalSessions([newSession, ...localSessions]);

  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ id: newSessionId, status: 'active', created_at: now }])
      .select()
      .single();

    if (!error && data) {
      return { data, error: null };
    }
  } catch (e) {}

  return { data: newSession, error: null };
}

/**
 * 4. End Session
 */
export async function endSession(sessionId) {
  const now = new Date().toISOString();

  // Local storage update
  const localSessions = getLocalSessions().map(s => s.id === sessionId ? { ...s, status: 'completed', ended_at: now } : s);
  saveLocalSessions(localSessions);

  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'completed', ended_at: now })
      .eq('id', sessionId)
      .select()
      .single();

    if (!error && data) {
      return { data, error: null };
    }
  } catch (e) {}

  const updatedSession = localSessions.find(s => s.id === sessionId);
  return { data: updatedSession, error: null };
}

/**
 * 5. Get Checkins for Session
 */
export async function getCheckinsForSession(sessionId) {
  if (!sessionId) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('session_id', sessionId)
      .order('checked_at', { ascending: false });

    if (!error && data) {
      return { data, error: null };
    }
  } catch (e) {}

  // Local storage fallback
  const localCheckins = getLocalCheckins().filter(c => c.session_id === sessionId);
  return { data: localCheckins, error: null };
}

/**
 * 6. Record Student Check-In
 */
export async function recordCheckin(sessionId, studentId) {
  if (!sessionId || !studentId) return { error: 'Invalid parameters' };

  // Check duplicate locally first
  const localCheckins = getLocalCheckins();
  const existing = localCheckins.find(c => c.session_id === sessionId && c.student_id === studentId);
  if (existing) {
    return { error: 'DUPLICATE_CHECKIN', data: existing };
  }

  const now = new Date().toISOString();
  const checkinId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `checkin-${Date.now()}`;
  const newCheckin = {
    id: checkinId,
    session_id: sessionId,
    student_id: studentId,
    checked_at: now
  };

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('checkins')
      .insert([{ id: checkinId, session_id: sessionId, student_id: studentId, checked_at: now }])
      .select()
      .single();

    if (!error && data) {
      // Also sync to local
      saveLocalCheckins([data, ...localCheckins]);
      return { data, error: null };
    }

    if (error && error.code === '23505') {
      return { error: 'DUPLICATE_CHECKIN' };
    }
  } catch (e) {}

  // Save to local storage
  saveLocalCheckins([newCheckin, ...localCheckins]);
  return { data: newCheckin, error: null };
}

/**
 * 7. Get All Sessions (History)
 */
export async function getAllSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch (e) {}

  const localSessions = getLocalSessions();
  return { data: localSessions, error: null };
}

export { broadcastChannel };
