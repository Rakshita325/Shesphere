import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBase from './CardBase';
import videoService from '../../services/videoService';
import { useUser } from '../../context/UserContext';
import { Play, Eye, Tag, ChevronLeft, ChevronRight, Video, Clock, Sparkles } from 'lucide-react';

import { useSearch } from '../../context/SearchContext';

const RecommendedVideos = () => {
  const { userData } = useUser();
  const { searchQuery } = useSearch();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, [userData.interest, userData.dailyFreeTime]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoService.getRecommendedVideos();
      if (response && response.success) {
        setVideos(response.data);

        if (response.data && response.data.length > 0) {
          const firstVid = response.data[0];
          const isCollab = !!(firstVid.cfScore > 0 || firstVid.isCollaborative || firstVid.recommendationSource === 'collaborative');
          console.log('\n[COLLAB TEST] Frontend:');
          console.log('Video displayed at index:', 0);
          console.log('Video Title:', firstVid.title);
          console.log('Video ID:', firstVid._id);
          console.log('IsCollaborative:', isCollab);
          console.log('PinkBorder:', isCollab);
          console.log('CollaborativeScore:', firstVid.cfScore || 0);
          console.log('FinalHybridScore:', (firstVid.matchScore ? firstVid.matchScore / 100 : 0).toFixed(2));
          console.log('--------------------------------------------------\n');
        }
      } else {
        setError('Failed to load recommended videos.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Please log in to view your personalized recommendations.');
      } else {
        setError('Error connecting to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = searchQuery.trim()
    ? videos.filter((v) => {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = v.title?.toLowerCase().includes(q);
        const catMatch = v.category?.toLowerCase().includes(q);
        const subcatMatch = v.subcategory?.toLowerCase().includes(q);
        const descMatch = v.description?.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(v.tags)
          ? v.tags.some((t) => t.toLowerCase().includes(q))
          : v.tags?.toLowerCase().includes(q);
        return titleMatch || catMatch || subcatMatch || descMatch || tagsMatch;
      })
    : videos;

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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">RECOMMENDED VIDEOS</h3>
        <div className="flex gap-4 overflow-hidden animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-52 w-64 shrink-0" />
          ))}
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
            <Video className="w-5 h-5 text-pink-500" />
            Recommended Videos
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Handpicked videos for your interest: <span className="font-bold text-pink-500">{userData.interest || 'All'}</span>
          </p>
        </div>

        {/* Scroll Controls */}
        {filteredVideos.length > 0 && (
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
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 py-4">{error}</p>
      ) : filteredVideos.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {searchQuery.trim()
              ? `No videos found for '${searchQuery}'.`
              : 'No content available for your selected interest yet.'}
          </p>
        </div>
      ) : (
        /* User-Controlled Horizontal Scroll Container */
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredVideos.map((v) => {
            const isCollab = !!(v.cfScore > 0 || v.isCollaborative || v.recommendationSource === 'collaborative');

            return (
              <div
                key={v._id}
                onClick={() => navigate(`/dashboard/videos/${v._id}`)}
                className={`snap-start shrink-0 w-60 sm:w-64 md:w-70 group cursor-pointer bg-white dark:bg-gray-800/80 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${isCollab
                    ? 'border-2 border-pink-300 ring-2 ring-pink-200 dark:border-pink-500/80 dark:ring-pink-500/30'
                    : 'border border-gray-100 dark:border-gray-700/70'
                  }`}
              >
                <div>
                  {/* Aspect Ratio 16:9 Thumbnail Box */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {v.duration > 0 && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-medium text-white flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {Math.ceil(v.duration / 60)}m
                      </div>
                    )}

                    {/* Collaborative Recommendation Badge */}
                    {isCollab ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-md flex items-center gap-1 z-10">
                        <Sparkles className="w-3 h-3 fill-white" />
                        <span>Collaborative Recommendation</span>
                      </div>
                    ) : (
                      v.fitsInTime && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-semibold text-white shadow-sm">
                          Fits {userData.dailyFreeTime || 'Time'}
                        </div>
                      )
                    )}

                    {/* ML Match Score Badge */}
                    {v.matchScore > 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-pink-600/90 text-[10px] font-bold text-white shadow-sm">
                        {v.matchScore}% match
                      </div>
                    )}
                  </div>

                  {/* Video Title & Category */}
                  <div className="p-3">
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 dark:text-pink-400 mb-1">
                      <Tag className="w-3 h-3" />
                      <span>{v.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {v.title}
                    </h4>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="px-3 pb-3 pt-0 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {v.views ? v.views.toLocaleString() : '0'} views
                  </span>
                  <span className="font-semibold text-pink-500 hover:underline">
                    Watch →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardBase>
  );
};

export default RecommendedVideos;
