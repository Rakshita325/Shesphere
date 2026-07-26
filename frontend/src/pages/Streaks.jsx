// src/pages/Streaks.jsx
import React from 'react';
import { useUser } from '../context/UserContext';
import CardBase from '../components/dashboard/CardBase';
import { Calendar } from 'lucide-react';

// Dummy data for the past 30 days (true = completed learning day)
const generateMonthlyData = () => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      completed: Math.random() > 0.3, // 70% chance completed
    });
  }
  return days;
};

const monthlyData = generateMonthlyData();

const milestones = [
  { days: 7, label: '7‑Day Learner' },
  { days: 30, label: '30‑Day Learner' },
  { days: 100, label: '100‑Day Learner' },
];

const Streaks = () => {
  const { userData, updateUserData } = useUser();
  const streak = userData.streak || 0; // number of consecutive learning days

  // Ensure streak is at least 1 for demo if not set
  const currentStreak = streak > 0 ? streak : 5;

  // Determine next milestone
  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1];
  const daysToNext = nextMilestone.days - currentStreak;

  // Weekly progress: last 7 days from monthlyData
  const weeklyData = monthlyData.slice(-7);

  return (
    <div className="p-6 space-y-6 font-poppins bg-gradient-to-b from-pastel-pink/5 to-white min-h-screen">
      {/* Current Streak */}
      <CardBase className="bg-pink-50 border-pink-200 p-6">
        <h2 className="text-2xl font-bold text-pink-600 flex items-center">
          <span role="img" aria-label="fire">🔥</span> Current Streak
        </h2>
        <p className="text-4xl font-extrabold text-pink-500 mt-2">{currentStreak} days</p>
        <p className="mt-2 text-gray-600">Keep the momentum going! Every day counts.</p>
      </CardBase>

      {/* Monthly Activity Calendar */}
      <CardBase className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-pink-500" /> Monthly Activity
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {monthlyData.map((day) => {
            const dateObj = new Date(day.date);
            const dayNum = dateObj.getDate();
            const isToday = day.date === new Date().toISOString().split('T')[0];
            return (
              <div
                key={day.date}
                className={`p-2 rounded ${day.completed ? 'bg-pink-200' : 'bg-gray-100'} ${isToday ? 'ring-2 ring-pink-500' : ''}`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </CardBase>

      {/* Weekly Progress */}
      <CardBase className="p-6">
        <h3 className="text-xl font-semibold mb-4">Weekly Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weeklyData.map((d) => {
            const date = new Date(d.date);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={d.date} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${d.completed ? 'bg-pink-500' : 'bg-gray-200'}`} />
                <span className="mt-1 text-xs text-gray-600">{label}</span>
              </div>
            );
          })}
        </div>
      </CardBase>

      {/* Milestones */}
      <CardBase className="p-6">
        <h3 className="text-xl font-semibold mb-4">Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-4 rounded-xl text-center ${currentStreak >= m.days ? 'bg-pink-200' : 'bg-gray-100'} `}
            >
              <span className="text-pink-600 font-medium">{m.label}</span>
              <p className="mt-1 text-sm text-gray-700">{m.days} days</p>
            </div>
          ))}
        </div>
      </CardBase>

      {/* Next Goal */}
      <CardBase className="bg-pink-50 border-pink-200 p-6">
        <h3 className="text-xl font-semibold mb-2">Next Goal</h3>
        <p className="text-gray-700">
          {daysToNext > 0
            ? `${daysToNext} day${daysToNext > 1 ? 's' : ''} left to become a ${nextMilestone.label}`
            : `Congratulations! You've reached the ${nextMilestone.label}`}
        </p>
      </CardBase>
    </div>
  );
};

export default Streaks;
