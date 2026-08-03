import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { GAME_DEFINITIONS } from '../utils/gamesData';
import gameService from '../services/gameService';
import MemoryMatchGame from '../components/games/MemoryMatchGame';
import WordleGame from '../components/games/WordleGame';
import SudokuGame from '../components/games/SudokuGame';
import Game2048 from '../components/games/Game2048';
import FlipLearnGame from '../components/games/FlipLearnGame';
import { ArrowLeft, Trophy, Gamepad2, Lock } from 'lucide-react';

const GAME_COMPONENTS = {
  memory_match: MemoryMatchGame,
  wordle: WordleGame,
  sudoku: SudokuGame,
  '2048': Game2048,
  flip_learn: FlipLearnGame,
};

const Games = () => {
  const { userData } = useUser();
  const [selectedGame, setSelectedGame] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await gameService.getProgress();
        setProgress(data || {});
      } catch (err) {
        console.error('Failed to fetch game progress:', err);
        setError('Failed to load game data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const handleGameComplete = async (gameId, score) => {
    try {
      const result = await gameService.saveProgress({ gameId, score });
      if (!result.alreadyPlayed) {
        setProgress((prev) => ({
          ...prev,
          [gameId]: {
            ...result.progress,
          },
        }));
      }
      return result;
    } catch (err) {
      console.error('Failed to save game progress:', err);
      return null;
    }
  };

  const handleBack = () => setSelectedGame(null);

  // Render selected game
  if (selectedGame) {
    const GameComponent = GAME_COMPONENTS[selectedGame];
    const gameDef = GAME_DEFINITIONS.find((g) => g.id === selectedGame);
    return (
      <div className="min-h-screen font-poppins">
        {/* Game Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-pink-500 hover:border-pink-200 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Games</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{gameDef?.icon}</span>
            <h2 className="text-xl font-bold text-gray-800">{gameDef?.name}</h2>
          </div>
        </div>
        <GameComponent
          onComplete={(score) => handleGameComplete(selectedGame, score)}
          interest={userData.interest || 'cooking'}
        />
      </div>
    );
  }

  // Render game cards grid
  return (
    <div className="min-h-screen font-poppins space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Games Arena</h1>
        </div>
        <p className="text-pink-100 text-sm">
          Play daily games to keep your streak alive and sharpen your mind!
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading games…</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Games Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAME_DEFINITIONS.map((game) => {
            const gameProgress = progress[game.id];
            const isPlayedToday = gameProgress?.completedToday === true;
            const highScore = gameProgress?.highScore || 0;
            const totalPlayed = gameProgress?.totalGamesPlayed || 0;

            return (
              <div
                key={game.id}
                className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isPlayedToday ? 'opacity-80' : ''
                  }`}
              >
                {/* Color gradient header */}
                <div className={`bg-gradient-to-r ${game.color} p-5 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                  <span className="text-5xl relative z-10 block">{game.icon}</span>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{game.description}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                    <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                      {game.difficulty}
                    </span>
                    {highScore > 0 && (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Best: {highScore}
                      </span>
                    )}
                    {totalPlayed > 0 && (
                      <span>Played: {totalPlayed}×</span>
                    )}
                  </div>

                  {/* Play / Locked button */}
                  {isPlayedToday ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                        Completed Today
                      </button>
                      <p className="text-xs text-center text-gray-400">
                        You've already played today's game. Come back tomorrow!
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedGame(game.id)}
                      className={`w-full px-4 py-2.5 bg-gradient-to-r ${game.color} text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      ▶ Play Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Games;
