import React, { useState } from 'react';
import CardBase from '../components/dashboard/CardBase';
import { Calendar, Smile, Frown, Meh } from 'lucide-react';

// Simple emoji mood options
const moods = [
  { value: 'happy', label: '😊', Icon: Smile },
  { value: 'neutral', label: '😐', Icon: Meh },
  { value: 'sad', label: '☹️', Icon: Frown },
];

const Journal = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMood, setSelectedMood] = useState('happy');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState([]);

  const handleSave = () => {
    if (!content.trim()) return;
    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      mood: selectedMood,
      text: content.trim(),
    };
    setEntries([newEntry, ...entries]);
    setContent('');
  };

  return (
    <CardBase className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Journal</h2>

      {/* Date & Mood Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
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

      {/* Editor */}
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

      {/* Previous Entries */}
      {entries.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Entries</h3>
          <ul className="space-y-4">
            {entries.map((e) => (
              <li key={e.id} className="border-l-4 border-pink-300 pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" /> {e.date}
                  <span>{moods.find((m) => m.value === e.mood)?.label}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{e.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </CardBase>
  );
};

export default Journal;
