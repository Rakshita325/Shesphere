import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Palette, 
  Leaf, 
  Scissors, 
  Laptop, 
  Dumbbell, 
  Music, 
  Sparkles, 
  Users, 
  Check, 
  ArrowRight,
  Star
} from 'lucide-react';
import CardBase from '../dashboard/CardBase';

const iconMap = {
  ChefHat,
  Palette,
  Leaf,
  Scissors,
  Laptop,
  Dumbbell,
  Music,
  Sparkles,
  Users
};

const CommunityCard = ({ community, onJoinToggle, isActionLoading }) => {
  const navigate = useNavigate();

  const IconComponent = iconMap[community.icon] || Users;
  const isJoined = community.isJoined;
  const isRecommended = community.isRecommended;

  const handleCardClick = (e) => {
    // Prevent triggering card click when clicking action button
    if (e.target.closest('.action-btn')) return;
    navigate(`/dashboard/community/${community._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-6 bg-white dark:bg-gray-850 hover:shadow-xl hover:-translate-y-1 ${
        isRecommended
          ? 'border-pink-400 dark:border-pink-500 ring-2 ring-pink-300/40 dark:ring-pink-900/30'
          : 'border-gray-200/80 dark:border-gray-700/80 hover:border-pink-300 dark:hover:border-pink-800'
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${community.bannerColor || 'from-pink-400 to-purple-500'} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity pointer-events-none`} />

      <div>
        {/* Header Row: Icon + Recommendation Pill */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${community.bannerColor || 'from-pink-500 to-purple-500'} text-white shadow-md group-hover:scale-105 transition-transform`}>
            <IconComponent className="w-7 h-7" />
          </div>

          {isRecommended && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 border border-pink-300/50 dark:border-pink-800/50">
              <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
              Recommended for You
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
          {community.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-350 line-clamp-2 mb-4 leading-relaxed">
          {community.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 text-pink-400" />
          <span>{community.memberCount || 0} {community.memberCount === 1 ? 'member' : 'members'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Join / Joined Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onJoinToggle(community);
            }}
            disabled={isActionLoading}
            className={`action-btn px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              isJoined
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xs hover:shadow-md'
            }`}
          >
            {isJoined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Joined
              </>
            ) : (
              'Join'
            )}
          </button>

          {/* Open Community Link */}
          <button
            type="button"
            onClick={handleCardClick}
            className="p-1.5 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
            title="View Community"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
