import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import MarketplaceHeader from '../components/Marketplace/MarketplaceHeader';
import {
  PackageCheck, ShoppingBag, Eye, Edit3, Trash2,
  AlertCircle, CheckCircle2, Clock, Truck, XCircle, Loader2, Sparkles, AlertTriangle
} from 'lucide-react';

const MyProducts = () => {
  const navigate = useNavigate();
  const {
    myProducts, myProductsLoading, loadMyProducts,
    deleteProduct, toggleAvailability, showToast
  } = useMarketplace();

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null); // product object to delete

  useEffect(() => {
    loadMyProducts();
  }, [loadMyProducts]);

  const handleToggleStock = async (product) => {
    await toggleAvailability(product.id, !product.isAvailable);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteModal) return;
    setDeletingId(confirmDeleteModal.id);
    try {
      await deleteProduct(confirmDeleteModal.id);
      setConfirmDeleteModal(null);
    } catch (err) {
      // Toast handled by context
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Marketplace Top Banner Nav */}
      <MarketplaceHeader />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-pink-600" /> My Products & Listings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage your published crafts, update stock status, monitor sales and order counts.
          </p>
        </div>

        <button
          onClick={() => navigate('/marketplace/sell')}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow transition shrink-0"
        >
          + Add New Product
        </button>
      </div>

      {/* Loading State */}
      {myProductsLoading ? (
        <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <p className="text-sm font-medium">Loading your products…</p>
        </div>
      ) : myProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">You haven't listed any products yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            Share your handmade crafts with the SheSphere community. Start earning by listing your first item!
          </p>
          <button
            onClick={() => navigate('/marketplace/sell')}
            className="mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            List Your First Craft
          </button>
        </div>
      ) : (
        /* Products List */
        <div className="space-y-6">
          {myProducts.map((product) => {
            const stats = product.orderStats || {
              pending: 0, shipped: 0, delivered: 0, cancelled: 0,
              totalOrders: 0, unitsSold: 0, revenue: 0
            };
            const isOutOfStock = product.quantity <= 0 || !product.isAvailable;

            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-gray-800 rounded-3xl border ${
                  !product.isActive ? 'border-gray-200 dark:border-gray-700 opacity-60 bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700'
                } p-6 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/200x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image'; }}
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-pink-700 shadow">
                      {product.category}
                    </span>
                    {!product.isActive && (
                      <span className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center">
                        Deactivated
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{product.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xl font-extrabold text-pink-600">
                            ₹{product.price?.toLocaleString('en-IN')}
                          </span>
                          <div className="mt-1">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                                In Stock ({product.quantity})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Metrics Summary Bar */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Total Orders</span>
                          <span className="font-bold text-gray-800 dark:text-white">{stats.totalOrders}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Units Sold</span>
                          <span className="font-bold text-gray-800 dark:text-white">{stats.unitsSold}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Revenue</span>
                          <span className="font-bold text-emerald-600">₹{stats.revenue?.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Rating</span>
                          <span className="font-bold text-amber-500">★ {product.rating || '5.0'}</span>
                        </div>
                      </div>

                      {/* Status breakdown badges */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          Pending: {stats.pending}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          Shipped: {stats.shipped}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Delivered: {stats.delivered}
                        </span>
                        {stats.cancelled > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            Cancelled: {stats.cancelled}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            product.isAvailable
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {product.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/marketplace/${product.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        <button
                          onClick={() => setConfirmDeleteModal(product)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-xl transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold dark:text-white">Delete Listing?</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete <strong>"{confirmDeleteModal.name}"</strong>?
              <br />
              If this product has existing historical orders, it will be <em>deactivated</em> to preserve buyer purchase history.
            </p>

            <div className="flex gap-3 pt-2 justify-end">
              <button
                onClick={() => setConfirmDeleteModal(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmDeleteModal.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
              >
                {deletingId === confirmDeleteModal.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
