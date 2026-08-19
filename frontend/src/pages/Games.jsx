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
  const [searchQuery, setSearchQuery] = useState('');

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
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-900/50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Games</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{gameDef?.icon}</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{gameDef?.name}</h2>
          </div>
        </div>
        <GameComponent
          onComplete={(score) => handleGameComplete(selectedGame, score)}
          interest={userData?.interest || 'cooking'}
        />
      </div>
    );
  }

  const filteredGames = GAME_DEFINITIONS.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render game cards grid
  return (
    <div className="relative min-h-screen font-poppins space-y-8 pb-12">
      {/* Ambient 3D Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pink-400/30 blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-purple-400/30 blur-3xl animate-blob-delayed" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-indigo-400/30 blur-3xl animate-blob-reverse" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Page Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Play. Learn. Grow. 🎮
                </h1>
              </div>
              <p className="text-pink-100 text-sm md:text-base max-w-xl">
                Play daily games to keep your streak alive, unlock achievements, and sharpen your mind!
              </p>
            </div>

            {/* Search Bar for Games */}
            <div className="w-full md:w-72 relative flex items-center">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-4 rounded-xl border border-white/30 bg-white/15 backdrop-blur-md text-white placeholder:text-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading games…</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => {
              const gameProgress = progress[game.id];
              const isPlayedToday = gameProgress?.completedToday === true;
              const highScore = gameProgress?.highScore || 0;
              const totalPlayed = gameProgress?.totalGamesPlayed || 0;

              return (
                <div
                  key={game.id}
                  className={`glass-card card-hover-3d rounded-3xl overflow-hidden transition-all duration-300 ${
                    isPlayedToday ? 'opacity-85' : ''
                  }`}
                >
                  {/* Color gradient header */}
                  <div className={`bg-gradient-to-r ${game.color} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/15 rounded-full translate-y-6 -translate-x-6" />
                    <span className="text-5xl relative z-10 block drop-shadow-md">{game.icon}</span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{game.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{game.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 pt-1 text-xs font-medium text-[var(--text-muted)]">
                      <span className="bg-pink-50 dark:bg-gray-800 text-pink-600 dark:text-pink-300 px-3 py-1 rounded-full border border-pink-100 dark:border-gray-700">
                        {game.difficulty}
                      </span>
                      {highScore > 0 && (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          Best: {highScore}
                        </span>
                      )}
                      {totalPlayed > 0 && <span>Played: {totalPlayed}×</span>}
                    </div>

                    {/* Play / Replay button */}
                    <div className="pt-2">
                      {isPlayedToday ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                            <Trophy className="w-3.5 h-3.5" /> Completed Today
                          </div>
                          <button
                            onClick={() => setSelectedGame(game.id)}
                            className={`w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700 hover:text-pink-600 dark:hover:text-pink-400 rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer`}
                          >
                            ▶ Replay Game
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedGame(game.id)}
                          className={`w-full py-3 bg-gradient-to-r ${game.color} text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform active:scale-98`}
                        >
                          ▶ Play Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
