import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardBase from './CardBase';
import articleService from '../../services/articleService';
import { useUser } from '../../context/UserContext';
import { ChevronLeft, ChevronRight, PenTool, BookOpen, Clock } from 'lucide-react';

import { useSearch } from '../../context/SearchContext';

const RecommendedArticles = () => {
  const { userData } = useUser();
  const { searchQuery } = useSearch();
  const [articlesList, setArticlesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const CARDS_PER_SET = 3;

  useEffect(() => {
    fetchArticles();
  }, [userData.interest]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setCurrentIndex(0);
      const res = await articleService.getArticles();
      if (res && res.success) {
        setArticlesList(res.data);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = searchQuery.trim()
    ? articlesList.filter((a) => {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = a.title?.toLowerCase().includes(q);
        const catMatch = a.category?.toLowerCase().includes(q);
        const contentMatch = a.content?.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(a.tags)
          ? a.tags.some((t) => t.toLowerCase().includes(q))
          : a.tags?.toLowerCase().includes(q);
        return titleMatch || catMatch || contentMatch || tagsMatch;
      })
    : articlesList;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - CARDS_PER_SET));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(filteredArticles.length - CARDS_PER_SET, prev + CARDS_PER_SET)
    );
  };

  const currentSet = filteredArticles.slice(currentIndex, currentIndex + CARDS_PER_SET);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex + CARDS_PER_SET >= filteredArticles.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <CardBase className="w-full">
      {/* Header Row with Prev/Next Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" />
            Recommended Articles
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Inspiring guides and stories for <span className="font-bold text-pink-500">{userData.interest || 'All'}</span>
          </p>
        </div>

        {/* Set Navigation Controls */}
        {filteredArticles.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isPrevDisabled || loading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title="Previous Articles"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
              {`${Math.floor(currentIndex / CARDS_PER_SET) + 1} / ${Math.ceil(filteredArticles.length / CARDS_PER_SET)}`}
            </span>
            <button
              onClick={handleNext}
              disabled={isNextDisabled || loading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title="Next Articles"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grid: Exactly 3 compact cards per row on desktop */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse my-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-52 w-full" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {searchQuery.trim()
              ? `No articles found for '${searchQuery}'.`
              : 'No articles available for your selected interest yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {currentSet.map((article) => (
            <div
              key={article._id}
              onClick={() => navigate(`/dashboard/articles/${article._id}`)}
              className="group cursor-pointer bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/70 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Fixed Height Image */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={article.coverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white">
                    {article.category || 'General'}
                  </span>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {article.content ? article.content.replace(/[*#]/g, '') : ''}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="p-3.5 pt-0 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 mt-2 text-xs font-medium">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(article.createdAt || article.publishedAt)}
                </span>
                <span className="text-pink-500 group-hover:underline font-semibold text-xs">
                  Read More →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Write Article Section */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Have insights, recipes, or tutorials to share with women across SheSphere?
        </p>
        <button
          onClick={() => navigate('/dashboard/articles/write')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <PenTool className="w-3.5 h-3.5" />
          Write Article
        </button>
      </div>
    </CardBase>
  );
};

export default RecommendedArticles;
