import React, { useState, useEffect, useRef, useCallback } from 'react';
import { memoryEmojis } from '../../utils/gamesData';
import { RotateCcw, Clock, MousePointerClick, Trophy, Sparkles } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, cols: 4, label: 'Easy' },
  medium: { pairs: 8, cols: 4, label: 'Medium' },
  hard: { pairs: 10, cols: 5, label: 'Hard' },
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const MemoryMatchGame = ({ onComplete }) => {
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const startGame = useCallback((diff) => {
    const config = DIFFICULTY_CONFIG[diff];
    const selected = memoryEmojis.slice(0, config.pairs);
    const pairs = selected.flatMap((emoji, i) => [
      { id: i * 2, pairId: i, emoji },
      { id: i * 2 + 1, pairId: i, emoji },
    ]);
    setCards(shuffle(pairs));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setTime(0);
    setRunning(true);
    setShowWin(false);
    setDifficulty(diff);
  }, []);

  const handleClick = useCallback((index) => {
    if (!running || flipped.length === 2 || matched.has(index) || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [i1, i2] = newFlipped;
      if (cards[i1].pairId === cards[i2].pairId) {
        const newMatched = new Set(matched);
        newMatched.add(i1);
        newMatched.add(i2);
        setMatched(newMatched);
        setFlipped([]);

        // Check win
        if (newMatched.size === cards.length) {
          setRunning(false);
          clearInterval(timerRef.current);
          setShowWin(true);
          // Score: lower is better — use moves as score (inverted for highscore tracking)
          const score = 1000 - (moves + 1) * 10 - time;
          const finalScore = Math.max(score, 1);
          if (onComplete) onComplete(finalScore);
          setBestScore((prev) => (prev === null || finalScore > prev ? finalScore : prev));
        }
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }, [running, flipped, matched, cards, moves, time, onComplete]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🧠</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memory Match</h2>
          <p className="text-gray-500">Flip cards and find all matching pairs!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => startGame(key)}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                key === 'easy'
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                  : key === 'medium'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-rose-400 to-red-500'
              }`}
            >
              <div className="text-lg">{config.label}</div>
              <div className="text-xs opacity-80">{config.pairs} pairs</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold text-pink-600">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2 bg-violet-50 px-3 py-1.5 rounded-lg">
            <MousePointerClick className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-600">{moves} moves</span>
          </div>
          {bestScore !== null && (
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600">Best: {bestScore}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => startGame(difficulty)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>
      </div>

      {/* Card Grid */}
      <div
        className="grid gap-3 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
          maxWidth: `${config.cols * 80}px`,
        }}
      >
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.has(idx);
          const isVisible = isFlipped || isMatched;

          return (
            <div
              key={card.id + '-' + idx}
              onClick={() => handleClick(idx)}
              className="aspect-square cursor-pointer"
              style={{ perspective: '600px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 ${
                  isVisible ? '' : '[transform:rotateY(180deg)]'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front — emoji */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl text-3xl sm:text-4xl font-bold shadow-sm transition-all duration-300 ${
                    isMatched
                      ? 'bg-green-100 border-2 border-green-300 scale-95'
                      : 'bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {card.emoji}
                </div>
                {/* Back — hidden */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-pink-300 shadow-md"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-white text-2xl font-bold">?</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Difficulty Switch */}
      <div className="mt-6 flex justify-center gap-2">
        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => startGame(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              key === difficulty
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Win Modal */}
      {showWin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-[bounceIn_0.5s_ease]">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 You Win!</h3>
            <div className="space-y-2 mb-6 text-gray-600">
              <p>Time: <span className="font-semibold text-pink-600">{formatTime(time)}</span></p>
              <p>Moves: <span className="font-semibold text-violet-600">{moves}</span></p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame(difficulty)}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => setDifficulty(null)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Change Difficulty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
