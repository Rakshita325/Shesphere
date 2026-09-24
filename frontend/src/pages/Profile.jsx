import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateUserProfile, getProfileStats, uploadProfilePicture } from '../services/userService';
import {
  Camera,
  CheckCircle,
  Pencil,
  Trophy,
  Star,
  Video,
  BookOpen,
  Gamepad2,
  MessageSquare,
  Zap,
  Clock,
  Sparkles,
  Globe,
  GraduationCap,
  Sparkle,
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { useSearch } from '../context/SearchContext';

const Profile = () => {
  const { userData, updateUserData } = useUser();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    profilePicture,
    language,
    education,
    interest,
    email,
    fullName,
    streak,
  } = userData || {};

  const displayName = fullName || 'Shrilakshmi Hegde';
  const displayEmail = email || 'shrilakshmi.hegde@shesphere.com';
  const displayLanguage = language || 'English';
  const displayEducation = education || 'Degree';
  const displayInterest = interest || 'Digital Skills';
  const displayStreak = streak !== undefined ? `${streak} days` : '2 days';

  // Fetch backend statistics & evaluation for current user
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfileStats();
      if (data && data.success) {
        setProfileStats(data);
      } else {
        throw new Error(data?.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('❌ Error loading profile statistics:', err);
      setError(err.message || 'Unable to load progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle profile image upload from camera icon click
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('\n================ [PROFILE PHOTO FRONTEND] ================');
    console.log('Selected file:', file.name, file.type, file.size, 'bytes');

    const tempUrl = URL.createObjectURL(file);
    updateUserData({ profilePicture: tempUrl });

    try {
      const uploadRes = await uploadProfilePicture(file);
      console.log('Upload response:', uploadRes);
      if (uploadRes && uploadRes.success && uploadRes.profilePicture) {
        console.log('Saved profilePicture:', uploadRes.profilePicture.startsWith('data:') ? `${uploadRes.profilePicture.substring(0, 50)}... [Base64]` : uploadRes.profilePicture);
        if (uploadRes.user) {
          updateUserData(uploadRes.user);
          console.log('Current user profilePicture:', uploadRes.user.profilePicture.startsWith('data:') ? `${uploadRes.user.profilePicture.substring(0, 50)}... [Base64]` : uploadRes.user.profilePicture);
        } else {
          updateUserData({ profilePicture: uploadRes.profilePicture });
        }
      }
    } catch (err) {
      console.error('❌ [PROFILE PHOTO FRONTEND] Failed to upload profile picture:', err);
    } finally {
      console.log('========================================================\n');
    }
  };

  // Preset configuration for badge visual themes
  const badgeThemeMap = {
    beginner: {
      unlockedBg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50',
      unlockedIconColor: 'text-pink-500',
      unlockedStarColor: 'text-pink-400',
    },
    learner: {
      unlockedBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50',
      unlockedIconColor: 'text-purple-500',
      unlockedStarColor: 'text-purple-400',
    },
    expert: {
      unlockedBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
      unlockedIconColor: 'text-emerald-500',
      unlockedStarColor: 'text-emerald-400',
    },
    consistent: {
      unlockedBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
      unlockedIconColor: 'text-amber-500',
      unlockedStarColor: 'text-amber-400',
    },
  };

  const backendAchievements = profileStats?.achievements || [
    { id: 'beginner', name: 'Beginner', unlocked: false, progressText: '0 / 1 activity' },
    { id: 'learner', name: 'Learner', unlocked: false, progressText: '0 / 5 activities' },
    { id: 'expert', name: 'Expert', unlocked: false, progressText: '0 / 10 activities' },
    { id: 'consistent', name: 'Consistent', unlocked: false, progressText: '0 / 7 days' },
  ];

  const unlockedBadgeCount = backendAchievements.filter((a) => a.unlocked).length;

  const progressItems = [
    {
      label: 'Videos Watched',
      value: profileStats?.videosWatched ?? (loading ? '—' : 0),
      icon: Video,
      badgeColor: 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300',
    },
    {
      label: 'Journal Entries',
      value: profileStats?.journalEntries ?? (loading ? '—' : 0),
      icon: BookOpen,
      badgeColor: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300',
    },
    {
      label: 'Games Completed',
      value: profileStats?.gamesCompleted ?? (loading ? '—' : 0),
      icon: Gamepad2,
      badgeColor: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    {
      label: 'Community Discussions',
      value: profileStats?.communityDiscussions ?? (loading ? '—' : 0),
      icon: MessageSquare,
      badgeColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      label: 'Current Streak',
      value: profileStats?.currentStreak !== undefined ? `${profileStats.currentStreak} days` : displayStreak,
      icon: Zap,
      badgeColor: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      label: 'Learning Time',
      value: profileStats?.learningTime !== undefined ? `${profileStats.learningTime} ${profileStats.learningTimeUnit || 'hrs'}` : (loading ? '—' : '0 hrs'),
      icon: Clock,
      badgeColor: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300',
    },
  ];

  const q = searchQuery.toLowerCase().trim();

  const filteredAchievements = q
    ? backendAchievements.filter((a) => {
        const nameMatch = a.name?.toLowerCase().includes(q);
        const descMatch = a.description?.toLowerCase().includes(q);
        const progMatch = a.progressText?.toLowerCase().includes(q);
        const keywordMatch = q.includes('achievement') || q.includes('badge');
        return nameMatch || descMatch || progMatch || keywordMatch;
      })
    : backendAchievements;

  const filteredProgressItems = q
    ? progressItems.filter((item) => {
        const labelMatch = item.label?.toLowerCase().includes(q);
        const keywordMatch = q.includes('progress') || q.includes('activity');
        return labelMatch || keywordMatch;
      })
    : progressItems;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-poppins text-gray-800 dark:text-gray-100 pb-8">
      {/* Hidden file input for picture upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ── 1. Profile Header Card ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100/90 via-purple-100/70 to-pink-50/90 dark:from-gray-800 dark:via-purple-950/40 dark:to-gray-900 border border-pink-200/60 dark:border-gray-800 p-6 md:p-8 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md bg-white dark:bg-gray-800 flex items-center justify-center">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              onClick={handleCameraClick}
              title="Change Profile Picture"
              className="absolute bottom-1 right-1 p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md transition-transform transform hover:scale-110 cursor-pointer border-2 border-white dark:border-gray-800"
              aria-label="Upload profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Info Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </h1>
                  <span title="Verified User" className="inline-flex items-center text-sky-500">
                    <CheckCircle className="w-5 h-5 fill-sky-500 text-white" />
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mt-0.5">
                  {displayEmail}
                </p>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => navigate('/dashboard/edit-profile')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-full shadow-md transition-all hover:shadow-lg transform active:scale-95 cursor-pointer shrink-0"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Badges / Details Grid */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center justify-center md:justify-start gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-pink-100/80 dark:border-gray-700/60">
                <Globe className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400 block">Language</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{displayLanguage}</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-pink-100/80 dark:border-gray-700/60">
                <GraduationCap className="w-4 h-4 text-purple-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400 block">Education</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{displayEducation}</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-pink-100/80 dark:border-gray-700/60">
                <Sparkle className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400 block">Current Interest</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{displayInterest}</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-pink-100/80 dark:border-gray-700/60">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400 block">Current Streak</span>
                  <span className="font-semibold text-pink-600 dark:text-pink-400">
                    {profileStats?.currentStreak !== undefined ? `${profileStats.currentStreak} days` : displayStreak}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Error Banner if API fails ───────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-1 px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ── 2. Lower Grid: Achievements & Your Progress ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* ── Achievements Card (Matched Height to Your Progress) ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm transition-colors flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h2>
            </div>
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/50 px-3.5 py-1.5 rounded-full shadow-2xs">
              {loading ? '...' : `${unlockedBadgeCount} Badges Earned`}
            </span>
          </div>

          {/* 2 x 2 Large Spacious Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {filteredAchievements.length === 0 ? (
              <div className="col-span-2 py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  No achievements found for '{searchQuery}'.
                </p>
              </div>
            ) : (
              filteredAchievements.map((badge) => {
                const badgeKey = (badge.id || badge.name || '').toLowerCase();
                const theme = badgeThemeMap[badgeKey] || badgeThemeMap.beginner;
                const isUnlocked = badge.unlocked;

                return (
                  <div
                    key={badge.id || badge.name}
                    className={`flex flex-col justify-between p-4.5 rounded-2xl border transition-all ${
                      isUnlocked
                        ? `${theme.unlockedBg} shadow-sm hover:-translate-y-0.5`
                        : 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-800/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-2xl shrink-0 ${
                          isUnlocked
                            ? 'bg-white/90 dark:bg-gray-800/90 shadow-2xs'
                            : 'bg-gray-200/70 dark:bg-gray-700/60 text-gray-400'
                        }`}
                      >
                        <Trophy
                          className={`w-6 h-6 ${
                            isUnlocked ? theme.unlockedIconColor : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      </div>
                      <div
                        className={`p-1.5 rounded-full shrink-0 ${
                          isUnlocked
                            ? 'bg-white/80 dark:bg-gray-800/80 shadow-2xs'
                            : 'bg-gray-200/60 dark:bg-gray-700/60'
                        }`}
                      >
                        {isUnlocked ? (
                          <Star className={`w-4 h-4 ${theme.unlockedStarColor} fill-current`} />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        {badge.description || (isUnlocked ? 'Milestone achieved' : 'In progress')}
                      </p>
                      
                      <div className="mt-3 pt-2.5 border-t border-gray-200/40 dark:border-gray-700/40 flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isUnlocked ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isUnlocked ? 'Unlocked' : badge.progressText || 'Locked'}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/50">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Your Progress Card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm transition-colors flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Overall Activity
            </span>
          </div>

          {/* Progress Rows */}
          <div className="space-y-3 flex-1 flex flex-col justify-around">
            {filteredProgressItems.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  No progress items found for '{searchQuery}'.
                </p>
              </div>
            ) : (
              filteredProgressItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-pink-50/70 dark:bg-gray-800 text-pink-500 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {item.label}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${item.badgeColor}`}>
                      {loading ? (
                        <span className="inline-block w-6 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        item.value
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
