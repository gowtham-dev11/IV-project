import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { OFFICIAL_STUDENTS } from './studentData';

// --- Neon PostgreSQL (Primary Source of Truth) ---
const neonUrl =
  import.meta.env.VITE_DATABASE_URL ||
  'postgresql://neondb_owner:npg_bgGmAJej68wl@ep-weathered-poetry-aziwvrb4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
export const sql = neon(neonUrl);

// --- Supabase client (kept for potential Realtime; not used as data store) ---
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://nnihbqxzssgmzlpuutld.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_GlczctFzltukwakvuw0MtA_2F6kkFgE';
export const supabase = createClient(supabaseUrl, supabaseKey);

// BroadcastChannel for same-origin cross-tab refresh notifications
export const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('pv_holidays_checkins')
    : null;

// NOTE: localStorage is NOT used as a data store.
// All reads/writes go to Neon PostgreSQL so that teacher (Device A)
// and student (Device B) share the same data without cross-device isolation.

/**
 * 1. Fetch all students from Neon DB.
 *    Falls back to static list with FAKE IDs only for UI display.
 *    NEVER pass fallback IDs to recordCheckin (FK violation).
 */
export async function getStudents() {
  try {
    const rows = await sql`
      SELECT id, roll_number, name, created_at
      FROM students
      ORDER BY roll_number ASC;
    `;
    if (rows && rows.length > 0) {
      return { data: rows, error: null };
    }
  } catch (e) {
    console.warn('[getStudents] Neon error:', e);
  }

  // Static fallback - IDs are fake, flagged so callers skip checkin writes
  const fallback = OFFICIAL_STUDENTS.map((s, idx) => ({
    id: `fallback-${s.roll_number}`,
    roll_number: s.roll_number,
    name: s.name,
    created_at: new Date(Date.now() - (53 - idx) * 60000).toISOString(),
    _isFallback: true
  }));
  return { data: fallback, error: null };
}

/**
 * 2. Get currently active session from Neon DB.
 */
export async function getActiveSession() {
  try {
    const rows = await sql`
      SELECT id, status, created_at, ended_at
      FROM sessions
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    return { data: rows[0] || null, error: null };
  } catch (e) {
    console.warn('[getActiveSession] Neon error:', e);
    return { data: null, error: e.message };
  }
}

/**
 * 3. Start a new session (closes any currently active one).
 */
export async function startNewSession() {
  const now = new Date().toISOString();
  try {
    await sql`
      UPDATE sessions SET status = 'completed', ended_at = ${now}
      WHERE status = 'active';
    `;
    const rows = await sql`
      INSERT INTO sessions (status, created_at)
      VALUES ('active', ${now})
      RETURNING id, status, created_at, ended_at;
    `;
    if (rows && rows.length > 0) {
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'SESSION_UPDATE' });
      return { data: rows[0], error: null };
    }
    return { data: null, error: 'Insert returned no rows' };
  } catch (e) {
    console.error('[startNewSession] Neon error:', e);
    return { data: null, error: e.message };
  }
}

/**
 * 4. End (complete) a session.
 */
export async function endSession(sessionId) {
  const now = new Date().toISOString();
  try {
    const rows = await sql`
      UPDATE sessions
      SET status = 'completed', ended_at = ${now}
      WHERE id = ${sessionId}
      RETURNING id, status, created_at, ended_at;
    `;
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'SESSION_UPDATE' });
    return { data: rows[0] || null, error: null };
  } catch (e) {
    console.error('[endSession] Neon error:', e);
    return { data: null, error: e.message };
  }
}

/**
 * 5. Fetch all check-ins for a given session.
 */
export async function getCheckinsForSession(sessionId) {
  if (!sessionId) return { data: [], error: null };
  try {
    const rows = await sql`
      SELECT id, session_id, student_id, checked_at
      FROM checkins
      WHERE session_id = ${sessionId}
      ORDER BY checked_at DESC;
    `;
    return { data: rows, error: null };
  } catch (e) {
    console.warn('[getCheckinsForSession] Neon error:', e);
    return { data: [], error: e.message };
  }
}

/**
 * 6. Record a student check-in directly in Neon DB.
 *
 *    studentId MUST be a real UUID from the students table.
 *    Uses ON CONFLICT DO NOTHING for idempotent duplicate handling.
 */
export async function recordCheckin(sessionId, studentId) {
  if (!sessionId || !studentId) {
    return { error: 'INVALID_PARAMS' };
  }

  // Guard against fake fallback IDs (would cause FK violation)
  if (String(studentId).startsWith('fallback-')) {
    return {
      error: 'DATABASE_UNAVAILABLE',
      message: 'Student database is unreachable. Please try again in a moment.'
    };
  }

  const now = new Date().toISOString();
  try {
    const rows = await sql`
      INSERT INTO checkins (session_id, student_id, checked_at)
      VALUES (${sessionId}, ${studentId}, ${now})
      ON CONFLICT (session_id, student_id) DO NOTHING
      RETURNING id, session_id, student_id, checked_at;
    `;
    if (rows && rows.length > 0) {
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'CHECKIN_UPDATE' });
      return { data: rows[0], error: null };
    }
    // ON CONFLICT returned 0 rows = already checked in
    return { error: 'DUPLICATE_CHECKIN' };
  } catch (e) {
    console.error('[recordCheckin] Neon error:', e);
    const msg = e.message || '';
    if (msg.includes('unique_session_student') || msg.includes('duplicate key')) {
      return { error: 'DUPLICATE_CHECKIN' };
    }
    return { error: 'DB_ERROR', message: msg };
  }
}

/**
 * 7. Get all sessions for History page.
 */
export async function getAllSessions() {
  try {
    const rows = await sql`
      SELECT id, status, created_at, ended_at
      FROM sessions
      ORDER BY created_at DESC;
    `;
    return { data: rows, error: null };
  } catch (e) {
    console.warn('[getAllSessions] Neon error:', e);
    return { data: [], error: e.message };
  }
}
