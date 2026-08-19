import React, { useState, useCallback } from 'react';
import CardBase from '../components/dashboard/CardBase';
import JournalEditor from '../components/JournalEditor';
import JournalHistory from '../components/JournalHistory';

const Journal = () => {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    // Bump the key so JournalHistory refetches its list
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-poppins">
      {/* Calm Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-teal-500/10 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-teal-950/20 border border-pink-200/50 dark:border-purple-900/40 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-500">
            <span className="text-xl">✨</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)]">
            Your Space to Reflect ✨
          </h1>
        </div>
        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-xl">
          Write your thoughts, track your daily moods, and cultivate peace in your personal mental sanctuary.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section — Editor (≈70%) */}
        <div className="md:col-span-2">
          <JournalEditor
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
        {/* Right Section — History (≈30%) */}
        <div className="md:col-span-1">
          <JournalHistory
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
};

export default Journal;
