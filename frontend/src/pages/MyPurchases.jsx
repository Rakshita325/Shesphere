import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import MarketplaceHeader from '../components/Marketplace/MarketplaceHeader';
import OrderChat from '../components/Marketplace/OrderChat';
import {
  ShoppingCart, PackageCheck, Clock, Truck, CheckCircle2,
  XCircle, AlertCircle, Loader2, ArrowRight, X, CreditCard, MessageCircle
} from 'lucide-react';

// ─── Decode JWT to extract userId without an external lib ────────────────────
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id || payload?.userId || payload?.sub || null;
  } catch {
    return null;
  }
};

// ─── Messaging eligibility: only Shipped or Delivered ────────────────────────
const canChat = (status) => ['Shipped', 'Delivered'].includes(status);

const MyPurchases = () => {
  const navigate = useNavigate();
  const {
    purchases, purchasesLoading, loadPurchases,
    sellerOrders, sellerOrdersLoading, loadSellerOrders,
    cancelOrder, updateOrderStatus
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'sellerOrders'
  const [cancellingId, setCancellingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [chatOrder, setChatOrder] = useState(null); // order currently open in chat

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadPurchases();
    loadSellerOrders();
  }, [loadPurchases, loadSellerOrders]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } catch (err) {
      // Toast handled by context
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      // Toast handled by context
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const displayedOrders = activeTab === 'purchases' ? purchases : sellerOrders;
  const isLoading = activeTab === 'purchases' ? purchasesLoading : sellerOrdersLoading;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Top Banner Nav */}
      <MarketplaceHeader />

      {/* Role View Switcher */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders &amp; Purchases</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track items you've bought as a Buyer or manage customer orders received as a Seller.
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'purchases'
                  ? 'bg-white dark:bg-gray-800 text-pink-600 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              My Purchases ({purchases.length})
            </button>

            <button
              onClick={() => setActiveTab('sellerOrders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'sellerOrders'
                  ? 'bg-white dark:bg-gray-800 text-pink-600 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Seller Orders ({sellerOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <p className="text-sm font-medium">Loading orders…</p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">
            {activeTab === 'purchases' ? "You haven't purchased any products yet" : 'No customer orders received yet'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'purchases'
              ? 'Browse the marketplace to discover beautiful handmade crafts by women artisans!'
              : 'List more handmade products to start receiving customer orders.'}
          </p>
          {activeTab === 'purchases' && (
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-6 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Product info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={order.productImage || 'https://placehold.co/64x64?text=?'}
                  alt={order.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">Order #{order.id?.slice(-6)}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">• {order.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{order.productName}</h4>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {activeTab === 'purchases' ? (
                      <>Seller: <strong className="text-gray-700 dark:text-gray-300">{order.sellerName}</strong></>
                    ) : (
                      <>Buyer: <strong className="text-gray-700 dark:text-gray-300">{order.buyerName}</strong> ({order.buyerEmail})</>
                    )}
                    {' • '}
                    <span>Qty: <strong>{order.quantity}</strong></span>
                  </p>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                <div className="text-left md:text-right">
                  <div className="text-base font-extrabold text-pink-600">
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 justify-start md:justify-end flex-wrap">
                    {getStatusBadge(order.status)}
                    {order.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-full">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 text-xs font-medium rounded-full">
                        Unpaid
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Buyer actions ── */}
                {activeTab === 'purchases' && (
                  <div className="flex items-center gap-2">
                    {order.status === 'Pending' ? (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Cancel Order
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/marketplace/${order.productId}`)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
                      >
                        View Craft <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Contact Artisan — only when Shipped or Delivered */}
                    {canChat(order.status) && (
                      <button
                        onClick={() => setChatOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-semibold rounded-xl transition"
                        title="Message the artisan about this order"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Contact Artisan
                      </button>
                    )}
                  </div>
                )}

                {/* ── Seller status update actions ── */}
                {activeTab === 'sellerOrders' && (
                  <div className="flex items-center gap-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                        disabled={updatingId === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
                      >
                        {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        Mark Shipped
                      </button>
                    )}

                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        disabled={updatingId === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
                      >
                        {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Mark Delivered
                      </button>
                    )}

                    {/* Message Buyer — only when Shipped or Delivered */}
                    {canChat(order.status) && (
                      <button
                        onClick={() => setChatOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-semibold rounded-xl transition"
                        title="Message the buyer about this order"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Message Buyer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OrderChat modal — rendered at page root level to avoid stacking issues */}
      {chatOrder && (
        <OrderChat
          order={chatOrder}
          currentUserId={currentUserId}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};

export default MyPurchases;
