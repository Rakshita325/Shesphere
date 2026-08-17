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
    <CardBase className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-lg transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">My Journal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </CardBase>
  );
};

export default Journal;
