import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, CheckCircle, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { flashcardData } from '../../utils/gamesData';
import { useUser } from '../../context/UserContext';

// ─── Helpers ──────────────────────────────────────────────────────────
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Normalise the interest key stored in User doc (e.g. "Digital Skills" → "digital_skills")
const normaliseInterest = (interest = '') =>
  interest.toLowerCase().replace(/\s+/g, '_');

// ─── Component ────────────────────────────────────────────────────────
const FlipLearnGame = ({ onComplete, interest: interestProp }) => {
  const { userData } = useUser();

  // Resolve interest from prop or user context
  const rawInterest = interestProp || userData?.interest || 'cooking';
  const interestKey = normaliseInterest(rawInterest);
  const cards = flashcardData[interestKey] || flashcardData['cooking'];

  const [deck, setDeck]         = useState(() => shuffleArray(cards));
  const [index, setIndex]       = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [learned, setLearned]   = useState(new Set());
  const [finished, setFinished] = useState(false);
  const [savedScore, setSavedScore] = useState(false);

  const total   = deck.length;
  const current = deck[index];
  const learnedCount = learned.size;

  // When all are learned → trigger completion
  useEffect(() => {
    if (learnedCount === total && total > 0 && !savedScore) {
      setFinished(true);
      setSavedScore(true);
      const score = total * 10;
      if (onComplete) onComplete(score);
    }
  }, [learnedCount, total, savedScore, onComplete]);

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 150);
  }, [total]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  }, []);

  const handleShuffle = () => {
    setDeck(shuffleArray(cards));
    setIndex(0);
    setFlipped(false);
    setLearned(new Set());
    setFinished(false);
    setSavedScore(false);
  };

  const markLearned = () => {
    setLearned((prev) => new Set([...prev, current.term]));
    if (index < total - 1) goNext();
  };

  const restart = () => {
    setDeck(shuffleArray(cards));
    setIndex(0);
    setFlipped(false);
    setLearned(new Set());
    setFinished(false);
    setSavedScore(false);
  };

  const isCurrentLearned = learned.has(current?.term);

  // Interest display label
  const interestLabel = rawInterest
    ? rawInterest.charAt(0).toUpperCase() + rawInterest.slice(1).replace(/_/g, ' ')
    : 'Cooking';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-gray-800">Flip &amp; Learn</h2>
          </div>
          <span className="text-xs text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-full">
            {interestLabel}
          </span>
        </div>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Card {index + 1} of {total}</span>
          <span className="text-emerald-500 font-medium">{learnedCount} learned ✓</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        {/* Learned indicator dots */}
        <div className="flex flex-wrap gap-1 mt-2">
          {deck.map((card, i) => (
            <div
              key={card.term}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                learned.has(card.term)
                  ? 'bg-emerald-400'
                  : i === index
                  ? 'bg-sky-400'
                  : 'bg-gray-200'
              }`}
              title={card.term}
            />
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer mb-5"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '200px',
          }}
        >
          {/* Front – Term */}
          <div
            className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 border-2 ${
              isCurrentLearned
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {isCurrentLearned && (
              <CheckCircle className="w-5 h-5 text-emerald-400 absolute top-3 right-3" />
            )}
            <p className="text-xs text-sky-400 font-semibold uppercase tracking-widest mb-3">
              Term
            </p>
            <p className="text-2xl font-bold text-gray-800 text-center leading-tight">
              {current?.term}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal answer</p>
          </div>

          {/* Back – Definition */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest mb-3">
              Definition
            </p>
            <p className="text-sm sm:text-base text-gray-700 text-center leading-relaxed">
              {current?.definition}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to flip back</p>
          </div>
        </div>
      </div>

      {/* Navigation + Actions */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={markLearned}
          disabled={isCurrentLearned}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
            isCurrentLearned
              ? 'bg-emerald-50 text-emerald-400 border border-emerald-200 cursor-default'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {isCurrentLearned ? 'Learned ✓' : 'Mark as Learned'}
        </button>

        <button
          onClick={goNext}
          disabled={index === total - 1}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Restart */}
      <button
        onClick={restart}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restart deck
      </button>

      {/* Completion Modal */}
      {finished && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              🎉 Deck Complete!
            </h3>
            <p className="text-gray-500 text-sm mb-1">
              You learned all <span className="font-bold text-sky-600">{total}</span> cards!
            </p>
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-5">
              <Trophy className="w-4 h-4" />
              <span className="font-bold text-sm">{total * 10} XP earned</span>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={restart}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                onClick={handleShuffle}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Shuffle &amp; Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipLearnGame;
