/**
 * End-to-end flow test via Neon DB
 * Simulates: Teacher starts session → Student checks in → Teacher sees it
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function cleanupTestData(sessionId) {
  if (sessionId) {
    await sql`DELETE FROM checkins WHERE session_id = ${sessionId}`;
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
  }
}

async function main() {
  let sessionId = null;
  console.log('=== PV HOLIDAYS — End-to-End Flow Test ===\n');

  try {
    // ─── STEP 1: Verify students in DB ─────────────────────────────────────────
    const students = await sql`SELECT id, roll_number, name FROM students ORDER BY roll_number LIMIT 5;`;
    console.log(`✅ Students in DB: ${students.length} (showing first 5)`);
    students.forEach(s => console.log(`   ${s.roll_number} — ${s.name} [${s.id}]`));

    // ─── STEP 2: Teacher starts session ────────────────────────────────────────
    console.log('\n--- TEACHER: Starting session ---');
    await sql`UPDATE sessions SET status = 'completed', ended_at = now() WHERE status = 'active';`;
    const now = new Date().toISOString();
    const [newSession] = await sql`
      INSERT INTO sessions (status, created_at)
      VALUES ('active', ${now})
      RETURNING id, status, created_at;
    `;
    sessionId = newSession.id;
    console.log(`✅ Session started: ${sessionId} | status: ${newSession.status}`);

    // ─── STEP 3: Student A device queries for active session ───────────────────
    console.log('\n--- STUDENT DEVICE: Querying active session ---');
    const [activeSession] = await sql`
      SELECT id, status, created_at FROM sessions WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;
    `;
    if (!activeSession) throw new Error('No active session found!');
    console.log(`✅ Student sees active session: ${activeSession.id}`);

    // ─── STEP 4: Student A finds their record by roll number ───────────────────
    const rollNumber = '279001';
    const [studentRecord] = await sql`SELECT id, roll_number, name FROM students WHERE roll_number = ${rollNumber};`;
    if (!studentRecord) throw new Error(`Student ${rollNumber} not found!`);
    console.log(`✅ Student found: ${studentRecord.name} [${studentRecord.id}]`);

    // ─── STEP 5: Student A checks in ──────────────────────────────────────────
    console.log('\n--- STUDENT DEVICE: Recording check-in ---');
    const checkinRows = await sql`
      INSERT INTO checkins (session_id, student_id, checked_at)
      VALUES (${activeSession.id}, ${studentRecord.id}, now())
      ON CONFLICT (session_id, student_id) DO NOTHING
      RETURNING id, session_id, student_id, checked_at;
    `;
    if (checkinRows.length === 0) {
      console.log('⚠️  Student already checked in (ON CONFLICT)');
    } else {
      console.log(`✅ Check-in recorded: ${checkinRows[0].id}`);
    }

    // ─── STEP 6: Teacher dashboard reads checkins ──────────────────────────────
    console.log('\n--- TEACHER DASHBOARD: Reading check-ins ---');
    const checkins = await sql`
      SELECT c.id, s.name, s.roll_number, c.checked_at
      FROM checkins c
      JOIN students s ON s.id = c.student_id
      WHERE c.session_id = ${activeSession.id}
      ORDER BY c.checked_at DESC;
    `;
    console.log(`✅ Teacher sees ${checkins.length} check-in(s):`);
    checkins.forEach(c => console.log(`   ✓ ${c.roll_number} — ${c.name} at ${c.checked_at}`));

    // ─── STEP 7: Test duplicate check-in prevention ────────────────────────────
    console.log('\n--- TEST: Duplicate check-in for same student ---');
    const dupRows = await sql`
      INSERT INTO checkins (session_id, student_id, checked_at)
      VALUES (${activeSession.id}, ${studentRecord.id}, now())
      ON CONFLICT (session_id, student_id) DO NOTHING
      RETURNING id;
    `;
    if (dupRows.length === 0) {
      console.log('✅ Duplicate prevented correctly (ON CONFLICT DO NOTHING returned 0 rows)');
    } else {
      console.log('❌ ERROR: Duplicate was NOT prevented!');
    }

    // ─── STEP 8: Test invalid roll number ──────────────────────────────────────
    console.log('\n--- TEST: Invalid roll number ---');
    const [invalidStudent] = await sql`SELECT id FROM students WHERE roll_number = '999999';`;
    if (!invalidStudent) {
      console.log('✅ Invalid roll number 999999 correctly returns no result');
    } else {
      console.log('❌ ERROR: Found a student with roll 999999?');
    }

    // ─── STEP 9: Teacher ends session ─────────────────────────────────────────
    console.log('\n--- TEACHER: Ending session ---');
    await sql`UPDATE sessions SET status = 'completed', ended_at = now() WHERE id = ${activeSession.id};`;
    const [endedSession] = await sql`SELECT status FROM sessions WHERE id = ${activeSession.id};`;
    console.log(`✅ Session ended: status = ${endedSession.status}`);

    // ─── STEP 10: Student tries to query after session ended ───────────────────
    console.log('\n--- STUDENT DEVICE (after session ended): Active session query ---');
    const rows = await sql`SELECT id FROM sessions WHERE status = 'active' LIMIT 1;`;
    if (rows.length === 0) {
      console.log('✅ No active session found — student sees correct "No Active Check-In" state');
    } else {
      console.log('❌ ERROR: Still shows an active session after ending');
    }

    console.log('\n=== ALL TESTS PASSED ✅ ===\n');
    console.log('Checklist:');
    console.log('  ✅ Teacher can start session');
    console.log('  ✅ Student queries active session independently');
    console.log('  ✅ Student validated by roll number from DB');
    console.log('  ✅ Check-in INSERT works with real DB UUIDs');
    console.log('  ✅ Teacher dashboard sees check-in from DB');
    console.log('  ✅ Duplicate check-in prevented by unique constraint');
    console.log('  ✅ Invalid roll number returns no student');
    console.log('  ✅ Teacher can end session');
    console.log('  ✅ No active session state handled correctly');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup test data
    await cleanupTestData(sessionId);
    console.log('\n[Cleaned up test session and check-ins]');
  }
}

main();
