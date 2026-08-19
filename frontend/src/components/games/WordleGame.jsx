import React, { useState, useEffect, useCallback } from 'react';
import { wordleWordList } from '../../utils/gamesData';
import { RotateCcw, Sparkles, Delete } from 'lucide-react';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const getRandomWord = () => {
  const index = Math.floor(Math.random() * wordleWordList.length);
  return wordleWordList[index].toUpperCase();
};

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const WordleGame = ({ onComplete }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [letterStates, setLetterStates] = useState({});

  useEffect(() => {
    setTargetWord(getRandomWord());
  }, []);

  const showMessage = (msg, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const getLetterState = useCallback(
    (letter, index, word) => {
      if (!targetWord || !word) return 'empty';
      const targetArr = targetWord.split('');
      const wordArr = word.split('');

      if (wordArr[index] === targetArr[index]) return 'correct';
      if (!targetArr.includes(letter)) return 'absent';

      let targetCount = 0;
      targetArr.forEach((tChar, i) => {
        if (tChar === letter && wordArr[i] !== letter) {
          targetCount++;
        }
      });

      let precedingPresentCount = 0;
      for (let i = 0; i < index; i++) {
        if (wordArr[i] === letter && wordArr[i] !== targetArr[i]) {
          precedingPresentCount++;
        }
      }

      return precedingPresentCount < targetCount ? 'present' : 'absent';
    },
    [targetWord]
  );

  const updateLetterStates = useCallback(
    (guess) => {
      setLetterStates((prev) => {
        const updated = { ...prev };
        guess.split('').forEach((letter, i) => {
          const state = getLetterState(letter, i, guess);
          const priority = { correct: 3, present: 2, absent: 1, empty: 0 };
          if (priority[state] > (priority[updated[letter]] || 0)) {
            updated[letter] = state;
          }
        });
        return updated;
      });
    },
    [getLetterState]
  );

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMessage('Not enough letters');
      return;
    }

    const guess = currentGuess.toUpperCase();
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    updateLetterStates(guess);
    setCurrentGuess('');

    if (guess === targetWord) {
      setWon(true);
      setGameOver(true);
      const score = (MAX_GUESSES - newGuesses.length + 1) * 100;
      if (onComplete) onComplete(score);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      showMessage(`The word was ${targetWord}`, 5000);
      if (onComplete) onComplete(0);
    }
  }, [currentGuess, guesses, targetWord, updateLetterStates, onComplete]);

  const handleKey = useCallback(
    (key) => {
      if (gameOver) return;
      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACK' || key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameOver, currentGuess, submitGuess]
  );

  // Physical keyboard
  useEffect(() => {
    const handler = (e) => {
      handleKey(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const resetGame = () => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setLetterStates({});
    setMessage('');
  };

  const stateColors = {
    correct: 'bg-emerald-500 text-white border-emerald-500',
    present: 'bg-amber-400 text-white border-amber-400',
    absent: 'bg-gray-500 text-white border-gray-500',
    empty: 'bg-white border-gray-300',
    tbd: 'bg-white border-gray-400',
  };

  const keyboardColors = {
    correct: 'bg-emerald-500 text-white',
    present: 'bg-amber-400 text-white',
    absent: 'bg-gray-400 text-white',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Wordle</h2>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Word
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium animate-[fadeIn_0.3s_ease]">
            {message}
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;

          return (
            <div
              key={rowIndex}
              className={`flex gap-1.5 ${isCurrentRow && shake ? 'animate-[shake_0.5s_ease]' : ''}`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = '';
                let state = 'empty';

                if (guess) {
                  letter = guess[colIndex];
                  state = getLetterState(letter, colIndex, guess);
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || '';
                  state = letter ? 'tbd' : 'empty';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${
                      stateColors[state]
                    } ${guess ? 'animate-[flipIn_0.5s_ease]' : ''}`}
                    style={guess ? { animationDelay: `${colIndex * 100}ms` } : {}}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* On-screen Keyboard */}
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 sm:gap-1.5">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'BACK';
              const keyState = letterStates[key];

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`${
                    isSpecial ? 'px-2 sm:px-4 text-xs' : 'w-8 sm:w-10'
                  } h-10 sm:h-12 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    keyState
                      ? keyboardColors[keyState]
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key === 'BACK' ? <Delete className="w-4 h-4 mx-auto" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Win/Lose Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            {won ? (
              <>
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Brilliant!</h3>
                <p className="text-gray-600 mb-1">You guessed the word!</p>
                <p className="text-2xl font-bold text-emerald-500 mb-4">{targetWord}</p>
                <p className="text-sm text-gray-500 mb-6">
                  Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Game Over</h3>
                <p className="text-gray-600 mb-1">The word was:</p>
                <p className="text-2xl font-bold text-rose-500 mb-6">{targetWord}</p>
              </>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordleGame;
