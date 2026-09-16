import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBase from './CardBase';
import videoService from '../../services/videoService';
import { useUser } from '../../context/UserContext';
import { Play, Flame, Sparkles, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const ContinueLearningSection = () => {
  const { userData } = useUser();
  const [learningList, setLearningList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchContinueLearning();
  }, [userData.interest]);

  const fetchContinueLearning = async () => {
    try {
      setLoading(true);
      const res = await videoService.getContinueLearning();
      if (res && res.success) {
        setLearningList(res.data);
      }
    } catch (err) {
      console.error('Failed to load continue learning:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <CardBase className="w-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">CONTINUE LEARNING</h3>
        <div className="flex gap-4 overflow-hidden animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-52 w-64 shrink-0" />
          ))}
        </div>
      </CardBase>
    );
  }

  if (learningList.length === 0) {
    return (
      <CardBase className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-500 fill-pink-500/20" />
            Continue Learning
          </h3>
        </div>
        <div className="py-6 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            No more content available for your selected interest yet.
          </p>
        </div>
      </CardBase>
    );
  }

  return (
    <CardBase className="w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-500 fill-pink-500/20" />
            Continue Learning
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pick up where you left off and discover something new in <span className="font-bold text-pink-500">{userData.interest || 'All'}</span>.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container for Continue Learning */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {learningList.map((item) => {
          const isContinue = item.type === 'continue' && item.progressPercentage > 0;

          return (
            <div
              key={item._id}
              onClick={() => navigate(`/dashboard/videos/${item._id}`)}
              className="snap-start shrink-0 w-60 sm:w-64 md:w-70 group cursor-pointer bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/70 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* 16:9 Thumbnail Box */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Badge: In Progress vs Recommendation */}
                  <div className="absolute top-2 left-2">
                    {isContinue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-600 text-white shadow-xs">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-xs text-white shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        Recommended
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Category */}
                <div className="p-3">
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 dark:text-pink-400 mb-1">
                    <Tag className="w-3 h-3" />
                    <span>{item.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Bottom Row: Progress Bar ONLY for partially watched, else simple metadata */}
              <div className="p-3 pt-0">
                {isContinue ? (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      <span>{item.progressPercentage}% completed</span>
                      <span className="text-pink-500 group-hover:underline">Resume →</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                    <span>{item.views ? `${item.views.toLocaleString()} views` : 'New'}</span>
                    <span className="font-semibold text-pink-500 group-hover:underline">
                      Watch →
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CardBase>
  );
};

export default ContinueLearningSection;
