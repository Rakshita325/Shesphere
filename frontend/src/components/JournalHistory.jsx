import React, { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen } from 'lucide-react';
import journalService from '../services/journalService';

const moodEmoji = {
  happy: '😊',
  neutral: '😐',
  sad: '☹️',
};

/**
 * JournalHistory — right-side panel showing a searchable, scrollable list
 * of past journal entries (date + mood only, no content).
 *
 * Props:
 *   selectedDate  — the currently selected date (YYYY-MM-DD)
 *   onSelectDate  — callback when user clicks a history item
 *   refreshKey    — increment to force a re-fetch after saving
 */
const JournalHistory = ({ selectedDate, onSelectDate, refreshKey }) => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await journalService.getSummaries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal history', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever refreshKey changes (i.e., after a save)
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshKey]);

  // Filter entries by search term (matches date string)
  const filtered = entries.filter((e) =>
    e.date.includes(search.trim())
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col" style={{ maxHeight: '520px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-pink-400" />
        <h3 className="text-lg font-semibold text-gray-800">Journal History</h3>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by date (e.g. 2026-08)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
        {loading && (
          <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No journal entries yet.</p>
        )}

        {!loading &&
          filtered.map((entry) => {
            const isActive = entry.date === selectedDate;
            return (
              <button
                key={entry._id}
                onClick={() => onSelectDate && onSelectDate(entry.date)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 ${
                  isActive
                    ? 'bg-pink-50 border-pink-300 shadow-sm'
                    : 'bg-gray-50 border-transparent hover:bg-pink-50/60 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isActive ? 'text-pink-600' : 'text-gray-700'}`}>
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-xl" title={entry.mood}>
                    {moodEmoji[entry.mood] || '📝'}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default JournalHistory;
