import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CATEGORIES } from '../../data/marketplaceData';

const SearchFilter = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy
  } = useMarketplace();

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
      {/* Search Input Bar */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search handmade products, artisans, crafts..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        {/* Category Dropdown (for quick select on smaller viewports) */}
        <div className="relative flex-1 md:w-48">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">
            ▼
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-1 md:w-48">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 appearance-none cursor-pointer"
          >
            <option value="Newest">Sort: Newest</option>
            <option value="Price Low → High">Sort: Price Low → High</option>
            <option value="Price High → Low">Sort: Price High → Low</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
