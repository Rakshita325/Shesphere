import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import ProductCard from './ProductCard';
import { Lightbulb } from 'lucide-react';

const RecommendedProducts = () => {
  const { products } = useMarketplace();
  const recommended = products.filter((p) => p.isRecommended).slice(0, 4);

  if (recommended.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
        </div>

        {/* Required note display */}
        <span className="text-xs font-medium text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full w-fit">
          Recommended based on your learning interests.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
