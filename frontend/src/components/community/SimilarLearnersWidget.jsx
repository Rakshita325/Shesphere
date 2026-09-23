import React, { useState, useEffect } from 'react';
import { Users, Sparkles, UserCheck } from 'lucide-react';
import communityService from '../../services/communityService';

const SimilarLearnersWidget = ({ communityId }) => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (communityId) {
      fetchSimilarLearners();
    }
  }, [communityId]);

  const fetchSimilarLearners = async () => {
    try {
      setLoading(true);
      const res = await communityService.getSimilarLearners(communityId);
      if (res && res.success) {
        setLearners(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch similar learners:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || learners.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-pink-50/70 dark:from-gray-800/80 dark:via-purple-950/30 dark:to-gray-800/80 border border-pink-100 dark:border-gray-700/80 rounded-3xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          People with Similar Learning Interests
        </h4>
        <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950 px-2 py-0.5 rounded-full">
          Cluster Match
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {learners.map((learner) => (
          <div
            key={learner._id}
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2 rounded-2xl shrink-0 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-400 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {learner.profilePicture ? (
                <img src={learner.profilePicture} alt={learner.fullName} className="w-full h-full object-cover" />
              ) : (
                (learner.fullName || 'U').charAt(0)
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {learner.fullName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                {learner.dailyFreeTime || learner.occupation || 'Learner'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarLearnersWidget;
