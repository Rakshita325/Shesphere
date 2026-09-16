import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Check, 
  LogOut, 
  Plus, 
  ChefHat, 
  Palette, 
  Leaf, 
  Scissors, 
  Laptop, 
  Dumbbell, 
  Music, 
  Sparkles,
  Star
} from 'lucide-react';

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

const CommunityHeader = ({ community, onJoinToggle, isActionLoading }) => {
  const navigate = useNavigate();

  if (!community) return null;

  const IconComponent = iconMap[community.icon] || Users;
  const isJoined = community.isJoined;
  const isRecommended = community.isRecommended;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 shadow-md mb-8">
      {/* Top Ambient Banner */}
      <div className={`h-32 sm:h-40 w-full bg-gradient-to-r ${community.bannerColor || 'from-pink-500 via-purple-500 to-indigo-500'} relative p-6 flex flex-col justify-between`}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/community')}
          className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </button>

        {isRecommended && (
          <span className="self-end inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            Recommended Interest
          </span>
        )}
      </div>

      {/* Main Header Content */}
      <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        {/* Avatar & Title Row */}
        <div className="flex items-end gap-4 sm:gap-6 -mt-10 sm:-mt-12">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center bg-gradient-to-tr ${community.bannerColor || 'from-pink-500 to-purple-500'} text-white shadow-xl ring-4 ring-white dark:ring-gray-850 shrink-0`}>
            <IconComponent className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {community.name}
              </h1>
              {isJoined && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Check className="w-3 h-3" /> Joined Member
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-pink-500" />
              <span>{community.memberCount || 0} active members</span>
            </p>
          </div>
        </div>

        {/* Action Button: Join / Leave */}
        <div className="shrink-0 flex items-center gap-3">
          {isJoined ? (
            <button
              onClick={onJoinToggle}
              disabled={isActionLoading}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Leave Community
            </button>
          ) : (
            <button
              onClick={onJoinToggle}
              disabled={isActionLoading}
              className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Join Community
            </button>
          )}
        </div>
      </div>

      {/* Description Bar */}
      <div className="px-6 sm:px-8 pb-6 border-t border-gray-100 dark:border-gray-800/60 pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-350 leading-relaxed">
          {community.description}
        </p>
      </div>
    </div>
  );
};

export default CommunityHeader;
