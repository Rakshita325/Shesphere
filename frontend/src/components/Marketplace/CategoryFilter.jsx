import React from 'react';
import { CATEGORIES } from '../../data/marketplaceData';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useLanguage } from '../../context/LanguageContext';

const CategoryFilter = () => {
  const { selectedCategory, setSelectedCategory } = useMarketplace();
  const { t } = useLanguage();

  const getCategoryLabel = (cat) => {
    return t(`marketplace.categories.${cat}`, {}, cat);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {t('marketplace.categoriesLabel')}
        </h2>
        <span className="text-xs text-gray-400">
          {t('marketplace.showingItems', { category: getCategoryLabel(selectedCategory) })}
        </span>
      </div>

      {/* Category Pills - Scrollable horizontally */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-200 transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
