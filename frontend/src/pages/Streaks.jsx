import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import CardBase from '../components/dashboard/CardBase';
import { Calendar } from 'lucide-react';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';

// Generate past 30 days dates and mark completed based on activeDates
const generateMonthlyData = (activeDates = []) => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const iso = date.toISOString().split('T')[0];
    days.push({
      date: iso,
      completed: activeDates.includes(iso),
    });
  }
  return days;
};

const milestones = [
  { days: 7, label: '7‑Day Learner' },
  { days: 30, label: '30‑Day Learner' },
  { days: 100, label: '100‑Day Learner' },
];

const Streaks = () => {
  const { userData, updateUserData } = useUser();
  const { searchQuery } = useSearch();
  const [streakInfo, setStreakInfo] = useState(null);

  // Fetch latest streak info from backend
  useEffect(() => {
    api.get('/streak')
      .then((res) => setStreakInfo(res.data))
      .catch((err) => console.error('Failed to fetch streak info', err));
  }, []);

  const currentStreak = streakInfo?.currentStreak ?? 0;
  const activeDates = streakInfo?.activeDates ?? [];
  const monthlyData = generateMonthlyData(activeDates);

  // Determine next milestone
  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1];
  const daysToNext = nextMilestone.days - currentStreak;

  // Weekly progress: last 7 days from monthlyData
  const weeklyData = monthlyData.slice(-7);

  const q = searchQuery.toLowerCase().trim();
  const filteredMilestones = q
    ? milestones.filter((m) => {
        const labelMatch = m.label.toLowerCase().includes(q);
        const daysMatch = `${m.days}`.includes(q) || `${m.days} day`.includes(q) || `${m.days}-day`.includes(q);
        const keywordMatch = q.includes('milestone') || q.includes('streak') || q.includes('learner') || q.includes('learning');
        return labelMatch || daysMatch || keywordMatch;
      })
    : milestones;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-poppins pb-12">
      {/* ── 3D Hero Streaks Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 tracking-wide text-white">
              <span>🔥 SheSphere Streak Tracker</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {currentStreak} Day Streak 🔥
            </h2>
            <p className="mt-2 text-pink-100 text-sm md:text-base max-w-lg">
              Keep your momentum going! Every day you log in, write, or learn brings you closer to your goals.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-center min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-100">Next Milestone</p>
            <p className="text-lg font-extrabold mt-1">{nextMilestone.label}</p>
            <p className="text-xs text-white/90 mt-1">
              {daysToNext > 0 ? `${daysToNext} days to go` : 'Milestone Unlocked! 🎉'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Weekly Progress Row ────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-main)]">Weekly Streak Progress</h3>
        <div className="grid grid-cols-7 gap-3">
          {weeklyData.map((d) => {
            const date = new Date(d.date);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                    d.completed
                      ? 'bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {d.completed ? '🔥' : '•'}
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Monthly Activity Grid ─────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-500" />
          <span>Monthly Activity</span>
        </h3>
        <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-semibold">
          {monthlyData.map((day) => {
            const dateObj = new Date(day.date);
            const dayNum = dateObj.getDate();
            const isToday = day.date === new Date().toISOString().split('T')[0];
            return (
              <div
                key={day.date}
                className={`py-3 rounded-xl transition-all ${
                  day.completed
                    ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60 font-bold'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-[var(--text-muted)] border border-gray-100 dark:border-gray-800'
                } ${isToday ? 'ring-2 ring-pink-500 scale-105 shadow-2xs' : ''}`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Milestones Grid ───────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-main)]">Achievement Milestones</h3>
        {filteredMilestones.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              No streak milestones found for '{searchQuery}'.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {filteredMilestones.map((m) => {
              const isUnlocked = currentStreak >= m.days;
              return (
                <div
                  key={m.days}
                  className={`p-6 rounded-2xl border transition-all text-center ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-purple-500/10 dark:from-amber-950/40 dark:via-pink-950/40 dark:to-purple-950/40 border-amber-300 dark:border-amber-900/60 shadow-sm'
                      : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="text-3xl mb-2">{isUnlocked ? '🏆' : '🔒'}</div>
                  <span className="font-bold text-sm text-[var(--text-main)] block">{m.label}</span>
                  <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{m.days} days required</p>
                  <span className={`inline-block mt-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Streaks;
