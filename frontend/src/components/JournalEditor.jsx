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
    <div className="bg-white rounded-lg shadow p-4">
      {/* Date & Mood Row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <Calendar className="w-5 h-5 text-pink-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange && onDateChange(e.target.value)}
          className="border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <div className="flex items-center gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setSelectedMood(m.value)}
              className={`text-2xl p-1 rounded-md transition-colors ${selectedMood === m.value ? 'bg-pink-100 ring-2 ring-pink-300' : ''
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts…"
        className="w-full h-48 border border-gray-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">{message}</span>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="px-5 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
};

export default JournalEditor;
