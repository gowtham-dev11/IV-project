-- ====================================================================
-- PV HOLIDAYS — IV TRIP ORGANIZER AGENT
-- Database Schema & RLS Policies
-- ====================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed'))
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    checked_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_session_student UNIQUE (session_id, student_id)
);

-- 2. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkins_session_id ON public.checkins(session_id);
CREATE INDEX IF NOT EXISTS idx_checkins_student_id ON public.checkins(student_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Students Table
-- Anyone can view students list for roll number validation
CREATE POLICY "Allow public read access to students"
    ON public.students FOR SELECT
    USING (true);

-- 5. RLS Policies for Sessions Table
-- Anyone can view active sessions
CREATE POLICY "Allow public read access to sessions"
    ON public.sessions FOR SELECT
    USING (true);

-- Public / Anon insert & update for sessions (managed by front-end app & teacher auth state)
CREATE POLICY "Allow write access to sessions"
    ON public.sessions FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. RLS Policies for Checkins Table
-- Anyone can read checkins for active session tracking
CREATE POLICY "Allow public read access to checkins"
    ON public.checkins FOR SELECT
    USING (true);

-- Anyone can insert checkins during active session
CREATE POLICY "Allow public insert to checkins"
    ON public.checkins FOR INSERT
    WITH CHECK (true);

-- 7. Realtime Configuration
-- Add checkins table to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'checkins'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;
  END IF;
END $$;
