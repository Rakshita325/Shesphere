import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';

const FeaturedProducts = () => {
  const { products } = useMarketplace();
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <div className="mb-10 bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white p-6 rounded-2xl border border-pink-100/80 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-400 text-gray-900 rounded-lg shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            Featured Handmade Creations
          </h2>
          <p className="text-xs text-gray-500">
            Handpicked highlights from master craftswomen across India
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
