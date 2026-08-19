import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, CheckCircle, PlusCircle, Clock, Sparkles } from 'lucide-react';

// ─── Sudoku Generator ────────────────────────────────────────────────
const EMPTY = 0;

const isValid = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
};

const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === EMPTY) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = EMPTY;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const generatePuzzle = (clues) => {
  // Generate a complete solved board
  const solution = Array.from({ length: 9 }, () => Array(9).fill(EMPTY));
  solveSudoku(solution);

  // Clone and remove cells
  const puzzle = solution.map((row) => [...row]);
  const totalCells = 81;
  const cellsToRemove = totalCells - clues;
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break;
    puzzle[r][c] = EMPTY;
    removed++;
  }

  return { puzzle, solution };
};

const DIFFICULTY_CONFIG = {
  easy: { clues: 38, label: 'Easy' },
  medium: { clues: 30, label: 'Medium' },
  hard: { clues: 25, label: 'Hard' },
};

const SudokuGame = ({ onComplete }) => {
  const [difficulty, setDifficulty] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [board, setBoard] = useState(null);
  const [initial, setInitial] = useState(null); // tracks which cells are pre-filled
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const startGame = useCallback((diff) => {
    const config = DIFFICULTY_CONFIG[diff];
    const { puzzle: p, solution: s } = generatePuzzle(config.clues);
    setPuzzle(p);
    setSolution(s);
    setBoard(p.map((row) => [...row]));
    setInitial(p.map((row) => row.map((cell) => cell !== EMPTY)));
    setSelected(null);
    setErrors(new Set());
    setTime(0);
    setRunning(true);
    setShowWin(false);
    setMessage('');
    setDifficulty(diff);
  }, []);

  const handleCellClick = (row, col) => {
    if (initial && initial[row][col]) return;
    setSelected({ row, col });
  };

  const handleInput = useCallback(
    (num) => {
      if (!selected || !board || !initial) return;
      const { row, col } = selected;
      if (initial[row][col]) return;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;
      setBoard(newBoard);

      // Validate
      const newErrors = new Set();
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] !== EMPTY && !initial[r][c]) {
            if (!isValid(
              newBoard.map((row, ri) =>
                row.map((cell, ci) => (ri === r && ci === c ? EMPTY : cell))
              ),
              r, c, newBoard[r][c]
            )) {
              newErrors.add(`${r}-${c}`);
            }
          }
        }
      }
      setErrors(newErrors);

      // Check if complete
      const isFilled = newBoard.every((row) => row.every((cell) => cell !== EMPTY));
      if (isFilled) {
        const isCorrect = newBoard.every((row, r) =>
          row.every((cell, c) => cell === solution[r][c])
        );
        if (isCorrect) {
          setRunning(false);
          clearInterval(timerRef.current);
          setShowWin(true);
          const score = Math.max(1, 3600 - time);
          if (onComplete) onComplete(score);
        } else {
          // Highlight incorrect entries
          const solErrors = new Set();
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (!initial[r][c] && newBoard[r][c] !== solution[r][c]) {
                solErrors.add(`${r}-${c}`);
              }
            }
          }
          setErrors(solErrors);
          setMessage('Some entries are incorrect! Check highlighted cells in red.');
          setTimeout(() => setMessage(''), 4000);
        }
      }
    },
    [selected, board, initial, solution, time, onComplete]
  );

  const checkSolution = () => {
    if (!board || !solution) return;
    const newErrors = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!initial[r][c] && board[r][c] !== EMPTY && board[r][c] !== solution[r][c]) {
          newErrors.add(`${r}-${c}`);
        }
      }
    }
    setErrors(newErrors);
    if (newErrors.size === 0) {
      setMessage('Looking good so far! ✨');
    } else {
      setMessage(`Found ${newErrors.size} error${newErrors.size > 1 ? 's' : ''} — highlighted in red.`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // Keyboard input
  useEffect(() => {
    const handler = (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) handleInput(num);
      if (e.key === 'Backspace' || e.key === 'Delete') handleInput(EMPTY);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Difficulty selection
  if (!difficulty) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔢</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sudoku</h2>
          <p className="text-gray-500">Fill the grid so every row, column and 3×3 box has 1–9</p>
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
              <div className="text-xs opacity-80">{config.clues} clues</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-violet-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-600">{formatTime(time)}</span>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkSolution}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Check
          </button>
          <button
            onClick={() => startGame(difficulty)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button
            onClick={() => setDifficulty(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center mb-3">
          <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">
            {message}
          </span>
        </div>
      )}

      {/* Sudoku Grid */}
      <div className="flex justify-center mb-4">
        <div
          className="grid border-2 border-gray-800 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(9, 1fr)', width: 'min(100%, 400px)' }}
        >
          {board && board.map((row, r) =>
            row.map((cell, c) => {
              const isInitial = initial[r][c];
              const isSelected = selected?.row === r && selected?.col === c;
              const isError = errors.has(`${r}-${c}`);
              const isSameRow = selected?.row === r;
              const isSameCol = selected?.col === c;
              const isSameBox =
                selected &&
                Math.floor(selected.row / 3) === Math.floor(r / 3) &&
                Math.floor(selected.col / 3) === Math.floor(c / 3);
              const isHighlighted = isSameRow || isSameCol || isSameBox;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    flex items-center justify-center aspect-square text-sm sm:text-lg font-semibold cursor-pointer transition-all duration-150
                    ${c % 3 === 2 && c < 8 ? 'border-r-2 border-r-gray-800' : 'border-r border-r-gray-300'}
                    ${r % 3 === 2 && r < 8 ? 'border-b-2 border-b-gray-800' : 'border-b border-b-gray-300'}
                    ${isSelected ? 'bg-violet-200' : isHighlighted ? 'bg-violet-50' : 'bg-white'}
                    ${isError ? 'text-red-500 bg-red-50' : isInitial ? 'text-gray-800' : 'text-violet-600'}
                    ${!isInitial ? 'hover:bg-violet-100' : ''}
                  `}
                >
                  {cell !== EMPTY ? cell : ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Number Pad */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleInput(num)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold text-lg transition-all active:scale-90"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleInput(EMPTY)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-sm transition-all active:scale-90"
        >
          ✕
        </button>
      </div>

      {/* Difficulty Switch */}
      <div className="mt-4 flex justify-center gap-2">
        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => startGame(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              key === difficulty
                ? 'bg-violet-500 text-white'
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
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Puzzle Solved!</h3>
            <p className="text-gray-600 mb-4">
              Time: <span className="font-semibold text-violet-600">{formatTime(time)}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame(difficulty)}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
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

export default SudokuGame;
