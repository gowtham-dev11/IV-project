import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, UserCheck, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-white selection:bg-blue-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex flex-col justify-center">
        {/* Top Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-extrabold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            PV HOLIDAYS • IV TRIP ORGANIZER AGENT
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Student Check-In,<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Made Simple.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 mt-4 max-w-2xl mx-auto font-normal leading-relaxed">
            A fast and reliable way to keep every student accounted for.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-10 sm:mt-14 max-w-4xl mx-auto w-full">
          {/* STUDENT ROLE CARD */}
          <Link to="/student" className="group focus:outline-none">
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 hover:border-blue-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-blue-950/20 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />

              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Student</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-xs text-slate-400 font-semibold">Quick Check-In</span>
                </div>

                <h3 className="text-2xl font-extrabold text-white mt-1 group-hover:text-blue-300 transition-colors">
                  Enter Roll Number
                </h3>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  Check-In Now
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* TEACHER ROLE CARD */}
          <Link to="/teacher/dashboard" className="group focus:outline-none">
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 hover:border-cyan-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-teal-950/20 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Teacher</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-xs text-slate-400 font-semibold">Management Dashboard</span>
                </div>

                <h3 className="text-2xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  Manage Check-Ins
                </h3>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  Access Dashboard
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center transition-all shadow-md">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center mt-16 pt-8 border-t border-slate-800/60">
          <p className="text-sm font-extrabold tracking-widest uppercase text-slate-400">
            Simple. Fast. Accounted.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Official IV Trip Accountability Platform • Powered by PV HOLIDAYS
          </p>
        </div>
      </main>
    </div>
  );
}
