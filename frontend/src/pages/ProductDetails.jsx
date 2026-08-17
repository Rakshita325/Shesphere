import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { marketplaceService } from '../services/marketplaceService';
import {
  ArrowLeft, Star, ShoppingBag, MapPin, MessageCircle,
  ShieldCheck, Loader2, AlertCircle, Send, X, PackageX
} from 'lucide-react';
import BuyModal from '../components/Marketplace/BuyModal';

const StarRating = ({ value, onChange, size = 'sm' }) => {
  const [hovered, setHovered] = useState(0);
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`${dim} ${
              star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            } transition`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId, buyProduct, showToast } = useMarketplace();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  // Reviews
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Contact modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const fetchProduct = async () => {
    setPageLoading(true);
    setPageError('');
    try {
      const data = await marketplaceService.getProductById(id);
      if (data.success) {
        setProduct(data.product);
        setSeller(data.seller);
        setReviews(data.reviews || []);
        setRelatedProducts(data.relatedProducts || []);
      } else {
        setPageError('Product not found.');
      }
    } catch (err) {
      setPageError('Failed to load product. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    setActiveImageIndex(0);
    setSelectedQty(1);
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await marketplaceService.addReview(id, {
        rating: reviewRating,
        comment: reviewText.trim()
      });
      if (res.success) {
        setReviews((prev) => [res.review, ...prev]);
        setReviewText('');
        setReviewRating(5);
        // Update product rating displayed
        if (res.productRating !== undefined) {
          setProduct((prev) => ({ ...prev, rating: res.productRating, reviewsCount: res.reviewsCount }));
        }
        showToast('✅ Review submitted!');
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleContactSend = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setIsContactOpen(false);
      setContactMessage('');
    }, 1500);
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-gray-400 dark:text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Loading product…</p>
      </div>
    );
  }

  if (pageError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-gray-500 dark:text-gray-400 p-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <p className="text-sm font-medium">{pageError || 'Product not found.'}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-pink-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://placehold.co/800x600?text=No+Image'];

  const isSeller = currentUserId && (
    product.seller?._id?.toString() === currentUserId ||
    product.seller?.toString() === currentUserId ||
    product.sellerId === currentUserId
  );
  const isOutOfStock = product.quantity <= 0 || !product.isAvailable;
  const canBuy = !isSeller && !isOutOfStock && product.isActive;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate('/marketplace')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 text-sm font-medium mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Main Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-inner relative group">
            <img
              src={images[activeImageIndex]}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=No+Image'; }}
            />
            <span className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-pink-700 dark:text-pink-400 text-xs font-bold px-3 py-1 rounded-full shadow">
              {product.category}
            </span>
            {isOutOfStock && (
              <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Out of Stock
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-pink-600 scale-95 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=?'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2">
              <StarRating value={Math.round(product.rating)} />
              <span>{product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 font-normal">
                ({product.reviewsCount || 0} reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.productName}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-pink-600">₹{product.price}</span>
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                  <PackageX className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                  {product.quantity} in stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
              {product.description}
            </p>

            {/* Seller Card */}
            {seller && (
              <div className="mt-6 bg-pink-50/60 dark:bg-pink-950/20 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={seller.profilePicture || 'https://placehold.co/48x48?text=A'}
                    alt={seller.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-pink-300 shadow-sm"
                    onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=A'; }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Artisan: {seller.fullName}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                      <span>{product.location || seller.location || 'India'}</span>
                    </div>
                  </div>
                </div>
                {!isSeller && (
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-pink-700 dark:text-pink-400 text-xs font-semibold rounded-xl border border-pink-200 dark:border-pink-800 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Contact
                  </button>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            {canBuy && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold flex items-center justify-center"
                  >–</button>
                  <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty((q) => Math.min(product.quantity, q + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {isSeller ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                You are the seller of this product. Visit My Products to manage it.
              </div>
            ) : isOutOfStock ? (
              <button disabled className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold text-sm rounded-xl cursor-not-allowed">
                <PackageX className="w-4 h-4" /> Out of Stock
              </button>
            ) : (
              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now — ₹{(product.price * selectedQty).toLocaleString('en-IN')}
              </button>
            )}

            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Direct Artisan Support • Verified Handmade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Customer Reviews ({reviews.length})
        </h3>

        {/* Add Review Form */}
        {!isSeller && (
          <form onSubmit={handleAddReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Write a Review:</label>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Rating:</span>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product…"
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
              >
                {reviewSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit
              </button>
            </div>
            {reviewError && <p className="text-xs text-red-500 mt-2">{reviewError}</p>}
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id || rev.id} className="p-4 bg-gray-50/60 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.user?.profilePicture || 'https://placehold.co/32x32?text=U'}
                      alt={rev.user?.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      onError={(e) => { e.target.src = 'https://placehold.co/32x32?text=U'; }}
                    />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{rev.user?.fullName || 'User'}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <StarRating value={rev.rating} />
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-2">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <button
                key={rp._id}
                onClick={() => navigate(`/marketplace/${rp._id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 text-left hover:shadow-md transition group"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100 dark:bg-gray-900">
                  <img
                    src={rp.images?.[0] || 'https://placehold.co/200x200?text=?'}
                    alt={rp.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=?'; }}
                  />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{rp.productName}</p>
                <p className="text-xs text-pink-600 font-semibold mt-0.5">₹{rp.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {isBuyModalOpen && (
        <BuyModal
          product={{ ...product, id: product._id, name: product.productName, images: product.images }}
          defaultQty={selectedQty}
          onClose={() => setIsBuyModalOpen(false)}
          onSuccess={() => {
            setIsBuyModalOpen(false);
            fetchProduct(); // Refresh stock
          }}
        />
      )}

      {/* Contact Seller Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Contact Artisan: {seller?.fullName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Send a query or customisation request about "{product.productName}".
            </p>
            {contactSent ? (
              <div className="text-center py-6 text-emerald-600 font-semibold text-sm">
                ✓ Message sent to seller!
              </div>
            ) : (
              <form onSubmit={handleContactSend} className="space-y-4">
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message here…"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-pink-600 text-white text-xs font-semibold rounded-xl shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
