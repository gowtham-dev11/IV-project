import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_bgGmAJej68wl@ep-weathered-poetry-aziwvrb4-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

const OFFICIAL_STUDENTS = [
  { roll_number: '279001', name: 'Abiramasundari S' },
  { roll_number: '279002', name: 'Akhil Shaan R' },
  { roll_number: '279003', name: 'Akilan N' },
  { roll_number: '279004', name: 'Ameena Beevi B' },
  { roll_number: '279005', name: 'Anbu Raja S' },
  { roll_number: '279006', name: 'Angelin Suzan EC' },
  { roll_number: '279007', name: 'Anisha S' },
  { roll_number: '279008', name: 'Arunthadhi R' },
  { roll_number: '279009', name: 'Darshan R' },
  { roll_number: '279011', name: 'Garcia Zenrin J' },
  { roll_number: '279013', name: 'HariHaran K' },
  { roll_number: '279017', name: 'Harini KJ' },
  { roll_number: '279018', name: 'Harini P' },
  { roll_number: '279019', name: 'Harshini Murugesan' },
  { roll_number: '279020', name: 'Jeevan Kumar G K A' },
  { roll_number: '279021', name: 'Jerrimiah Evangelin A' },
  { roll_number: '279022', name: 'Joshua Tony A' },
  { roll_number: '279023', name: 'Karthick akash A' },
  { roll_number: '279024', name: 'Kaviya RN' },
  { roll_number: '279025', name: 'Mohammed Aathif S' },
  { roll_number: '279026', name: 'Mridhulla S' },
  { roll_number: '279027', name: 'Mugunthan J' },
  { roll_number: '279028', name: 'Muthuvel E' },
  { roll_number: '279029', name: 'Nethra M' },
  { roll_number: '279031', name: 'Nitin A Harshavardhan' },
  { roll_number: '279032', name: 'Nivetha S' },
  { roll_number: '279033', name: 'Pranavadhithya T R' },
  { roll_number: '279034', name: 'Rakshana V' },
  { roll_number: '279035', name: 'Ramvarsan M' },
  { roll_number: '279036', name: 'RAMYA DEVI P T' },
  { roll_number: '279037', name: 'Ruthra B' },
  { roll_number: '279038', name: 'Sakthi pranav vignesh ARS' },
  { roll_number: '279039', name: 'Santhiya M' },
  { roll_number: '279040', name: 'Sathana Sri T' },
  { roll_number: '279041', name: 'Senthil Parkavi K' },
  { roll_number: '279042', name: 'Sivadharshini S' },
  { roll_number: '279045', name: 'Subhendran G' },
  { roll_number: '279046', name: 'Suganya S' },
  { roll_number: '279047', name: 'Sujithra S' },
  { roll_number: '279048', name: 'Surya Prakash C' },
  { roll_number: '279049', name: 'Sweatha S P' },
  { roll_number: '279050', name: 'Swetha S' },
  { roll_number: '279052', name: 'Thejaswini MG' },
  { roll_number: '279053', name: 'Thennithish S' },
  { roll_number: '279054', name: 'Thilaikarasi D' },
  { roll_number: '279055', name: 'Uma Maheswari S' },
  { roll_number: '279056', name: 'Varsha R' },
  { roll_number: '279057', name: 'VIGNESH RAHUL M' },
  { roll_number: '279058', name: 'Vinoth kumar.p' },
  { roll_number: '279059', name: 'Vishali R' },
  { roll_number: '279060', name: 'Vivin Raj V' },
  { roll_number: '279061', name: 'Yogesh R' },
  { roll_number: '279062', name: 'Yuvasree L' }
];

async function main() {
  console.log('Connecting to Neon PostgreSQL...');
  try {
    // 1. Create pgcrypto extension for gen_random_uuid()
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    // 2. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        roll_number VARCHAR(50) UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT now(),
        ended_at TIMESTAMPTZ,
        status TEXT NOT NULL CHECK (status IN ('active', 'completed'))
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        checked_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_session_student UNIQUE (session_id, student_id)
      );
    `;

    console.log('Tables created successfully on Neon DB!');

    // 3. Seed students
    for (const student of OFFICIAL_STUDENTS) {
      await sql`
        INSERT INTO students (roll_number, name)
        VALUES (${student.roll_number}, ${student.name})
        ON CONFLICT (roll_number) DO UPDATE SET name = EXCLUDED.name;
      `;
    }

    console.log(`Successfully seeded ${OFFICIAL_STUDENTS.length} students into Neon DB!`);

    const result = await sql`SELECT COUNT(*) FROM students;`;
    console.log(`Verified total students in Neon DB: ${result[0].count}`);
  } catch (err) {
    console.error('Error setting up Neon database:', err);
  }
}

main();
