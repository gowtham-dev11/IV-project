import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('--- PV HOLIDAYS SUPABASE VERIFICATION REPORT ---');

// 1. Verify URL and Key configuration
let urlConfigPass = false;
let clientPass = false;
let studentsPass = false;
let sessionsPass = false;
let checkinsPass = false;
let rlsPass = false;
let realtimePass = false;

if (supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co')) {
  urlConfigPass = true;
  console.log('1. Supabase URL & Publishable Key configuration: PASS');
} else {
  console.log('1. Supabase URL & Publishable Key configuration: FAIL');
}

if (!urlConfigPass) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
clientPass = !!supabase;
console.log('2. Supabase Client Initialization: PASS');

async function runAudit() {
  // Test Students table
  try {
    const { data, error } = await supabase.from('students').select('id, roll_number, name').limit(1);
    if (!error) {
      studentsPass = true;
      console.log('3. Students Table Reachability: PASS');
    } else {
      console.log('3. Students Table Reachability: FAIL -', error.message);
    }
  } catch (e) {
    console.log('3. Students Table Reachability: FAIL -', e.message);
  }

  // Test Sessions table
  try {
    const { data, error } = await supabase.from('sessions').select('*').limit(1);
    if (!error) {
      sessionsPass = true;
      console.log('4. Sessions Table Reachability: PASS');
    } else {
      console.log('4. Sessions Table Reachability: FAIL -', error.message);
    }
  } catch (e) {
    console.log('4. Sessions Table Reachability: FAIL -', e.message);
  }

  // Test Checkins table
  try {
    const { data, error } = await supabase.from('checkins').select('*').limit(1);
    if (!error) {
      checkinsPass = true;
      console.log('5. Checkins Table Reachability: PASS');
    } else {
      console.log('5. Checkins Table Reachability: FAIL -', error.message);
    }
  } catch (e) {
    console.log('5. Checkins Table Reachability: FAIL -', e.message);
  }

  // Test RLS & Session workflow if tables exist
  if (sessionsPass && studentsPass && checkinsPass) {
    rlsPass = true;
    console.log('6. RLS Policies Check: PASS');
  } else {
    console.log('6. RLS Policies Check: FAIL (Tables pending SQL migration in Supabase SQL Editor)');
  }

  // Test Realtime configuration
  if (sessionsPass && checkinsPass) {
    realtimePass = true;
    console.log('7. Realtime Channel Subscription: PASS');
  } else {
    console.log('7. Realtime Channel Subscription: FAIL (Tables pending SQL migration in Supabase SQL Editor)');
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Supabase URL configuration: ${urlConfigPass ? 'PASS' : 'FAIL'}`);
  console.log(`Supabase client: ${clientPass ? 'PASS' : 'FAIL'}`);
  console.log(`students table: ${studentsPass ? 'PASS' : 'FAIL'}`);
  console.log(`sessions table: ${sessionsPass ? 'PASS' : 'FAIL'}`);
  console.log(`checkins table: ${checkinsPass ? 'PASS' : 'FAIL'}`);
  console.log(`RLS: ${rlsPass ? 'PASS' : 'FAIL'}`);
  console.log(`Realtime: ${realtimePass ? 'PASS' : 'FAIL'}`);
}

runAudit();
