import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Eye, MapPin } from 'lucide-react';
import BuyModal from './BuyModal';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group">
        {/* Image Container */}
        <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer" onClick={() => navigate(`/marketplace/${product.id}`)}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-pink-700 dark:text-pink-400 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Rating & Location */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 dark:text-gray-500 font-normal">({product.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{product.sellerLocation || 'India'}</span>
              </div>
            </div>

            {/* Product Name */}
            <h3
              onClick={() => navigate(`/marketplace/${product.id}`)}
              className="text-base font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1 cursor-pointer"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Seller & Price */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              {/* Seller */}
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={product.sellerAvatar}
                  alt={product.sellerName}
                  className="w-6 h-6 rounded-full object-cover border border-pink-200 dark:border-pink-900"
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                  {product.sellerName}
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-base font-extrabold text-gray-900 dark:text-white">
                  ₹{product.price}
                </div>
                {product.originalPrice && (
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/marketplace/${product.id}`)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                View Details
              </button>

              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-sm transition duration-150 transform active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {isBuyModalOpen && (
        <BuyModal product={product} onClose={() => setIsBuyModalOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;
