import React, { useEffect, useState } from 'react';
import { Calendar, Smile, Frown, Meh } from 'lucide-react';
import journalService from '../services/journalService';

const moods = [
  { value: 'happy', label: '😊', Icon: Smile },
  { value: 'neutral', label: '😐', Icon: Meh },
  { value: 'sad', label: '☹️', Icon: Frown },
];

/**
 * JournalEditor — creates or updates a journal entry for the selected date.
 *
 * Props:
 *   selectedDate   — YYYY-MM-DD string
 *   onDateChange   — callback to update the parent's selectedDate
 *   onSaveSuccess  — callback invoked after a successful save
 */
const JournalEditor = ({ selectedDate, onDateChange, onSaveSuccess }) => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [content, setContent] = useState('');
  const [journalId, setJournalId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing entry when date changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const summaries = await journalService.getSummaries();
        const match = summaries.find((j) => j.date === selectedDate);
        if (cancelled) return;
        if (match) {
          const full = await journalService.getById(match._id);
          if (cancelled) return;
          setJournalId(full._id);
          setSelectedMood(full.mood);
          setContent(full.content || '');
        } else {
          setJournalId(null);
          setSelectedMood('happy');
          setContent('');
        }
      } catch (err) {
        console.error('Load error', err);
      }
    };
    if (selectedDate) load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      if (journalId) {
        await journalService.update(journalId, { mood: selectedMood, content });
        setMessage('Journal updated ✨');
      } else {
        const created = await journalService.upsert({ date: selectedDate, mood: selectedMood, content });
        setJournalId(created._id);
        setMessage('Journal saved ✨');
      }
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Save error', err);
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
    setContent('');
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 transition-all duration-300">
      {/* Date & Mood Selection Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        {/* Customized Date Selector Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-pink-50/80 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl shadow-2xs">
          <Calendar className="w-5 h-5 text-pink-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[var(--text-main)] focus:outline-none cursor-pointer"
          />
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] mr-1">Mood:</span>
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setSelectedMood(m.value)}
              className={`text-2xl p-2 rounded-2xl transition-all cursor-pointer ${
                selectedMood === m.value
                  ? 'bg-pink-100 dark:bg-pink-950/80 border-2 border-pink-400 scale-110 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
              }`}
              title={m.value}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Writing Space */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, feelings, or daily reflections..."
          className="w-full h-56 border border-gray-200/80 dark:border-gray-750 bg-gray-50/40 dark:bg-gray-850/40 text-[var(--text-main)] rounded-2xl p-4 text-sm md:text-base leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all resize-none"
        />
      </div>

      {/* Footer / Save Action */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-semibold text-pink-500">{message}</span>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="px-7 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save Entry ✨'}
        </button>
      </div>
    </div>
  );
};

export default JournalEditor;
