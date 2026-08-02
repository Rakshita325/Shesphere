import React, { useEffect, useState } from 'react';
import { Calendar, Smile, Frown, Meh } from 'lucide-react';
import api from '../services/api';

const moods = [
  { value: 'happy', label: '😊', Icon: Smile },
  { value: 'neutral', label: '😐', Icon: Meh },
  { value: 'sad', label: '☹️', Icon: Frown },
];

/**
 * JournalEditor component handles creating/updating a journal entry for the selected date.
 * It loads an existing entry if present, otherwise starts with a blank editor.
 */
const JournalEditor = ({ selectedDate, onSaveSuccess }) => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [content, setContent] = useState('');
  const [journalId, setJournalId] = useState(null);

  // Load existing journal for the date when component mounts or date changes
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const { data } = await api.get('/journal');
        const entry = data.data.find((j) => j.date === selectedDate);
        if (entry) {
          const full = await api.get(`/journal/${entry._id}`);
          setJournalId(full.data.data._id);
          setSelectedMood(full.data.data.mood);
          setContent(full.data.data.content || '');
        } else {
          setJournalId(null);
          setSelectedMood('happy');
          setContent('');
        }
      } catch (err) {
        console.error('Failed to load journal', err);
      }
    };
    fetchJournal();
  }, [selectedDate]);

  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      if (journalId) {
        // Update existing entry
        await api.put(`/journal/${journalId}`, { mood: selectedMood, content });
      } else {
        // Create new entry
        await api.post('/journal', { date: selectedDate, mood: selectedMood, content });
      }
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-4 mb-4">
        <Calendar className="w-5 h-5 text-pink-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            // parent component should handle date change; placeholder here
          }}
          className="border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
          disabled
        />
        <div className="flex items-center gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setSelectedMood(m.value)}
              className={`text-2xl p-1 rounded-md transition-colors ${selectedMood === m.value ? 'bg-pink-100' : ''}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts..."
        className="w-full h-48 border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 transition-colors"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default JournalEditor;
