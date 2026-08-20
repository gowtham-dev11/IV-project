import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const TEACHER_USER = 'prabu';
// SHA-256 hash of 'prabu:pv123:pv_holidays_2026'
const TEACHER_AUTH_HASH = 'dcec7afe41b75e50f8cd0cef10ebae97ad8556d099ee26d5061723125398be09';

async function hashCredentials(username, password) {
  const text = `${username.toLowerCase().trim()}:${password.trim()}:${'pv_holidays_2026'}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pv_teacher_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const loginTeacher = async (username, password) => {
    const cleanUser = (username || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    if (cleanUser !== TEACHER_USER) {
      return { success: false, message: 'Incorrect username or password.' };
    }

    // 1. Direct local hash check (Primary MVP auth)
    const inputHash = await hashCredentials(cleanUser, cleanPass);
    if (inputHash === TEACHER_AUTH_HASH) {
      const teacherObj = { username: cleanUser, name: 'Prabu', role: 'teacher' };
      setTeacher(teacherObj);
      sessionStorage.setItem('pv_teacher_session', JSON.stringify(teacherObj));
      return { success: true };
    }

    // 2. Fallback Supabase auth check if configured in Supabase Auth dashboard
    try {
      const email = `${cleanUser}@pvholidays.com`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: cleanPass });
      if (!error && data?.user) {
        const teacherObj = { username: cleanUser, name: 'Prabu', role: 'teacher', token: data.session?.access_token };
        setTeacher(teacherObj);
        sessionStorage.setItem('pv_teacher_session', JSON.stringify(teacherObj));
        return { success: true };
      }
    } catch (e) {}

    return { success: false, message: 'Incorrect username or password.' };
  };

  const logoutTeacher = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setTeacher(null);
    sessionStorage.removeItem('pv_teacher_session');
  };

  return (
    <AuthContext.Provider value={{ teacher, isAuthenticated: !!teacher, loginTeacher, logoutTeacher }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
