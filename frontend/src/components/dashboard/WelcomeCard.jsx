import React from 'react';
import { useUser } from '../../context/UserContext';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeCard = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const name = userData.fullName || 'Shrilakshmi';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 dark:from-pink-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 border border-pink-200/60 dark:border-pink-900/40 p-6 md:p-8 shadow-sm transition-all duration-300">
      {/* Decorative background sparkle shapes */}
      <div className="absolute top-4 right-8 opacity-20 dark:opacity-30 pointer-events-none">
        <Sparkles className="w-24 h-24 text-pink-400" />
      </div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/80 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back to SheSphere</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            Hi, {name} ✨
          </h2>
          <p className="mt-1.5 text-sm md:text-base text-[var(--text-muted)] max-w-xl">
            Continue your journey and explore today. Discover new skills, reflect in your journal, or play engaging games.
          </p>
        </div>

       
      </div>
    </div>
  );
};

export default WelcomeCard;
