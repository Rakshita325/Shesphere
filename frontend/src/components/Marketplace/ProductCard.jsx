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
      <div className="glass-card card-hover-3d rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 group">
        {/* Image Container */}
        <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer" onClick={() => navigate(`/marketplace/${product.id}`)}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />

          {/* Category Badge */}
          <span className="absolute top-3.5 left-3.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-pink-600 dark:text-pink-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs border border-pink-100 dark:border-pink-900/50">
            {product.category}
          </span>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-3.5 right-3.5 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Rating & Location */}
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-[var(--text-muted)] font-normal">({product.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--text-muted)] truncate max-w-[120px]">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                <span className="truncate">{product.sellerLocation || 'India'}</span>
              </div>
            </div>

            {/* Product Name */}
            <h3
              onClick={() => navigate(`/marketplace/${product.id}`)}
              className="text-base font-bold text-[var(--text-main)] group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1 cursor-pointer"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Seller & Price */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              {/* Seller */}
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={product.sellerAvatar}
                  alt={product.sellerName}
                  className="w-7 h-7 rounded-full object-cover border border-pink-300 dark:border-pink-900"
                />
                <span className="text-xs text-[var(--text-main)] font-semibold truncate">
                  {product.sellerName}
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-lg font-extrabold text-[var(--text-main)]">
                  ₹{product.price}
                </div>
                {product.originalPrice && (
                  <div className="text-[11px] text-[var(--text-muted)] line-through">
                    ₹{product.originalPrice}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/marketplace/${product.id}`)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--text-main)] text-xs font-bold rounded-2xl transition duration-150 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                View Details
              </button>

              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md transition duration-150 transform active:scale-95 cursor-pointer"
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
