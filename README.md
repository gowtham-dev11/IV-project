# PV HOLIDAYS — IV TRIP ORGANIZER AGENT
> **Simple. Fast. Accounted.**

A real-time student check-in and accountability web application developed by **PV HOLIDAYS** for managing approximately 53 students during educational and industrial visits.

---

## 🌟 Key Features

- **Instant Teacher Dashboard**: Live green (Checked In) and red (Not Checked In) student cards updated in real-time without page refresh.
- **Mobile-First Student Check-In**: Students enter their Roll Number in under 10 seconds. Auto-identifies student name without requiring duplicate input.
- **53 Official Enrolled Students**: Pre-populated with official student records from Saranathan College of Engineering CSBS Department. Sensitive phone numbers and parent details excluded.
- **Database Concurrency & Security**: PostgreSQL `UNIQUE(session_id, student_id)` constraint prevents duplicate check-ins under simultaneous requests.
- **Teacher Authentication**: Protected routing for teacher management controls (`prabu` / `pv123`) using SHA-256 salted hashes and Supabase Auth session tokens.
- **Session Archive**: Complete check-in history log with individual session breakdowns.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + Vite
- **Styling & Aesthetics**: Tailwind CSS v4 + Vanilla CSS Design System (Deep Navy, Electric Blue, Cyan, Emerald, Rose)
- **Database & Realtime**: Supabase PostgreSQL + Supabase Realtime
- **Icons & Animations**: Lucide React + Framer Motion
- **Deployment Target**: Vercel

---

## 🚀 Environment Variables

Create a `.env` file in the root directory (excluded from git):

```env
VITE_SUPABASE_URL=https://nnihbqxzssgmzlpuutld.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GlczctFzltukwakvuw0MtA_2F6kkFgE
```

---

## 🗄️ Database Setup (Supabase)

1. Open your **Supabase Dashboard**: [https://nnihbqxzssgmzlpuutld.supabase.co](https://nnihbqxzssgmzlpuutld.supabase.co)
2. Go to **SQL Editor**.
3. Run `supabase/schema.sql` to create tables (`students`, `sessions`, `checkins`), set up RLS policies, and enable Supabase Realtime.
4. Run `supabase/seed.sql` to seed the 53 official student records.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## ☁️ Vercel Deployment

1. Connect your repository to Vercel.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**.

---

## 🔐 Credentials (MVP)

- **Teacher Username**: `prabu`
- **Teacher Password**: `pv123`
