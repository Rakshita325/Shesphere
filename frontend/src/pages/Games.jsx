import React from 'react';
import { useUser } from '../context/UserContext';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import QuizSection from '../components/games/QuizSection';
import MemoryMatch from '../components/games/MemoryMatch';
import DailyChallenge from '../components/games/DailyChallenge';
import XPCard from '../components/games/XPCard';
import ProgressTracker from '../components/games/ProgressTracker';
import AchievementBadges from '../components/games/AchievementBadges';

const Games = () => {
  const { userData } = useUser();
  const interest = userData.interest || 'Your interest';

  return (
    <div className="p-6 space-y-6 font-poppins bg-gradient-to-b from-pastel-pink/5 to-white min-h-screen">
      {/* Welcome Card */}
      <WelcomeCard title="Welcome back!" subtitle={`Let’s continue your ${interest} journey.`} />

      {/* XP and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XPCard />
        <ProgressTracker />
      </div>

      {/* Quiz Section */}
      <QuizSection />

      {/* Memory Match Game */}
      <MemoryMatch />

      {/* Daily Challenge */}
      <DailyChallenge />

      {/* Achievement Badges */}
      <AchievementBadges />
    </div>
  );
};

export default Games;
