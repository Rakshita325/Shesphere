import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────
const GRID_SIZE = 4;

const createEmptyGrid = () =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const addRandomTile = (grid) => {
  const empties = [];
  grid.forEach((row, r) =>
    row.forEach((val, c) => { if (!val) empties.push([r, c]); })
  );
  if (!empties.length) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const newGrid = grid.map((row) => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const initGrid = () => addRandomTile(addRandomTile(createEmptyGrid()));

// Slide a single row/col left, returning { merged, score }
const slideLeft = (line) => {
  const filtered = line.filter((v) => v !== 0);
  let score = 0;
  const merged = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { merged, score };
};

// Column helpers
const getCol = (grid, c) => grid.map((row) => row[c]);
const setCol = (grid, c, colArr) => {
  colArr.forEach((val, r) => {
    grid[r][c] = val;
  });
};

const moveLeft = (grid) => {
  let totalScore = 0;
  const newGrid = grid.map((row) => {
    const { merged, score } = slideLeft(row);
    totalScore += score;
    return merged;
  });
  return { grid: newGrid, score: totalScore };
};

const moveRight = (grid) => {
  let totalScore = 0;
  const newGrid = grid.map((row) => {
    const rev = [...row].reverse();
    const { merged, score } = slideLeft(rev);
    totalScore += score;
    return merged.reverse();
  });
  return { grid: newGrid, score: totalScore };
};

const moveUp = (grid) => {
  let totalScore = 0;
  const newGrid = createEmptyGrid();
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = getCol(grid, c);
    const { merged, score } = slideLeft(col);
    totalScore += score;
    setCol(newGrid, c, merged);
  }
  return { grid: newGrid, score: totalScore };
};

const moveDown = (grid) => {
  let totalScore = 0;
  const newGrid = createEmptyGrid();
  for (let c = 0; c < GRID_SIZE; c++) {
    const col = getCol(grid, c).reverse();
    const { merged, score } = slideLeft(col);
    totalScore += score;
    setCol(newGrid, c, merged.reverse());
  }
  return { grid: newGrid, score: totalScore };
};

const gridsEqual = (a, b) =>
  a.every((row, r) => row.every((val, c) => val === b[r][c]));

const hasWon = (grid) => grid.some((row) => row.some((v) => v === 2048));

const isGameOver = (grid) => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return false;
      if (c + 1 < GRID_SIZE && grid[r][c] === grid[r][c + 1]) return false;
      if (r + 1 < GRID_SIZE && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
};

// ─── Tile styling ─────────────────────────────────────────────────────
const TILE_STYLES = {
  0:    'bg-gray-100 text-transparent',
  2:    'bg-pink-100 text-pink-700',
  4:    'bg-pink-200 text-pink-700',
  8:    'bg-rose-300 text-white',
  16:   'bg-rose-400 text-white',
  32:   'bg-pink-400 text-white',
  64:   'bg-pink-500 text-white',
  128:  'bg-fuchsia-400 text-white',
  256:  'bg-fuchsia-500 text-white',
  512:  'bg-violet-400 text-white',
  1024: 'bg-violet-500 text-white',
  2048: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200',
};

const getTileStyle = (val) => TILE_STYLES[val] ?? 'bg-gray-700 text-white';

const getTileFontSize = (val) => {
  if (val >= 1024) return 'text-base sm:text-lg font-black';
  if (val >= 128)  return 'text-lg sm:text-xl font-black';
  return 'text-xl sm:text-2xl font-black';
};

// ─── Component ────────────────────────────────────────────────────────
const Game2048 = ({ onComplete }) => {
  const [grid, setGrid]             = useState(initGrid);
  const [score, setScore]           = useState(0);
  const [bestScore, setBestScore]   = useState(0);
  const [gameOver, setGameOver]     = useState(false);
  const [won, setWon]               = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [savedToday, setSavedToday] = useState(false);

  // Swipe support
  const touchStart = useRef(null);

  // Load best score from localStorage as fast fallback
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('2048_best') || '0', 10);
    setBestScore(stored);
  }, []);

  const updateBest = useCallback((s) => {
    setBestScore((prev) => {
      if (s > prev) {
        localStorage.setItem('2048_best', String(s));
        return s;
      }
      return prev;
    });
  }, []);

  const handleMove = useCallback(
    (direction) => {
      if (gameOver || (won && !winDismissed)) return;
      const moves = { ArrowLeft: moveLeft, ArrowRight: moveRight, ArrowUp: moveUp, ArrowDown: moveDown };
      const fn = moves[direction];
      if (!fn) return;

      setGrid((prev) => {
        const { grid: next, score: gained } = fn(prev);
        if (gridsEqual(prev, next)) return prev;        // nothing moved
        const withNew = addRandomTile(next);

        setScore((s) => {
          const ns = s + gained;
          updateBest(ns);
          return ns;
        });

        if (hasWon(withNew)) setWon(true);
        else if (isGameOver(withNew)) setGameOver(true);

        return withNew;
      });
    },
    [gameOver, won, winDismissed, updateBest]
  );

  // Keyboard handler
  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  // Touch handlers
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
      handleMove(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    touchStart.current = null;
  };

  // Save progress when game ends
  useEffect(() => {
    if ((gameOver || won) && !savedToday && score > 0) {
      setSavedToday(true);
      if (onComplete) onComplete(score);
    }
  }, [gameOver, won, score, savedToday, onComplete]);

  const restart = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setWinDismissed(false);
    setSavedToday(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 max-w-sm mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <h2 className="text-xl font-bold text-gray-800">2048</h2>
        </div>
        <button
          onClick={restart}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </div>

      {/* Score Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-pink-50 border border-pink-100 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-pink-400 font-medium uppercase tracking-wide">Score</p>
          <p className="text-xl font-black text-pink-600">{score}</p>
        </div>
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Trophy className="w-3 h-3 text-amber-500" />
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wide">Best</p>
          </div>
          <p className="text-xl font-black text-amber-600">{bestScore}</p>
        </div>
      </div>

      {/* Grid */}
      <div
        className="bg-pink-100 rounded-xl p-2 sm:p-3 touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-100 ${getTileStyle(val)} ${getTileFontSize(val)}`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        Use arrow keys or swipe to move tiles
      </p>

      {/* Win Modal */}
      {won && !winDismissed && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">You reached 2048! 🎉</h3>
            <p className="text-gray-500 text-sm mb-2">Score: <span className="font-bold text-pink-600">{score}</span></p>
            <p className="text-gray-500 text-sm mb-5">Amazing! Keep going for a higher score!</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setWinDismissed(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all"
              >
                Keep Playing
              </button>
              <button
                onClick={restart}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl">
            <span className="text-5xl block mb-3">😔</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">Game Over</h3>
            <p className="text-gray-500 text-sm mb-1">Score: <span className="font-bold text-pink-600">{score}</span></p>
            <p className="text-gray-500 text-sm mb-5">Best: <span className="font-bold text-amber-600">{bestScore}</span></p>
            <button
              onClick={restart}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game2048;
