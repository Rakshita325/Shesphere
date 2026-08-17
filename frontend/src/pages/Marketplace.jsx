import React, { useState } from 'react';
import MarketplaceHeader from '../components/Marketplace/MarketplaceHeader';
import SearchFilter from '../components/Marketplace/SearchFilter';
import CategoryFilter from '../components/Marketplace/CategoryFilter';
import FeaturedProducts from '../components/Marketplace/FeaturedProducts';
import RecommendedProducts from '../components/Marketplace/RecommendedProducts';
import ProductGrid from '../components/Marketplace/ProductGrid';
import { useMarketplace } from '../context/MarketplaceContext';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const Marketplace = () => {
  const { notification } = useMarketplace();
  const [loadMoreCount, setLoadMoreCount] = useState(12);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 dark:bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp border border-gray-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* 1. Header */}
      <MarketplaceHeader />

      {/* 2. Search & Category Filters */}
      <SearchFilter />
      <CategoryFilter />

      {/* 3. Featured Products */}
      <FeaturedProducts />

      {/* 4. Recommended Products */}
      <RecommendedProducts />

      {/* 5. Main Product Grid */}
      <ProductGrid />

      {/* 6. Footer / Load More */}
      <div className="mt-8 text-center pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setLoadMoreCount((prev) => prev + 6)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span>Load More Products</span>
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Empowering women artisans • 100% Verified Handmade
        </p>
      </div>
    </div>
  );
};

export default Marketplace;
