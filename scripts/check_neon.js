import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function main() {
  // Check table schemas
  const cols = await sql`
    SELECT table_name, column_name, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name IN ('sessions', 'students', 'checkins')
    ORDER BY table_name, ordinal_position;
  `;
  console.log('Schema:');
  cols.forEach(c => console.log(`  ${c.table_name}.${c.column_name} default=${c.column_default} nullable=${c.is_nullable}`));

  // Check active sessions
  const sessions = await sql`SELECT id, status, created_at FROM sessions ORDER BY created_at DESC LIMIT 5;`;
  console.log('\nRecent sessions:', sessions);

  // Check student count
  const studentCount = await sql`SELECT COUNT(*) FROM students;`;
  console.log('\nStudent count:', studentCount[0].count);

  // Check checkin count
  const checkinCount = await sql`SELECT COUNT(*) FROM checkins;`;
  console.log('Checkin count:', checkinCount[0].count);
}

main().catch(e => { console.error(e.message); process.exit(1); });
