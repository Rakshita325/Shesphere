import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ArrowLeft,
  PackageCheck,
  ShoppingBag,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useMarketplace();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'purchases'

  const incomingOrders = orders.filter((o) => o.type === 'incoming');
  const myPurchases = orders.filter((o) => o.type === 'purchase');

  const displayedOrders = activeTab === 'incoming' ? incomingOrders : myPurchases;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Delivered / Completed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Back Link */}
      <button
        onClick={() => navigate('/marketplace')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 text-sm font-medium mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-100 dark:bg-pink-950/30 text-pink-600 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders & Purchases</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage incoming customer orders and track your handmade craft purchases.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 mt-6 border-b border-gray-100 dark:border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Incoming Orders ({incomingOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            My Purchases ({myPurchases.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No orders to display</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'incoming'
              ? 'You have no customer orders for your published products yet.'
              : 'You have not placed any craft purchases yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      ID: {order.id}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">• {order.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {order.productName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {activeTab === 'incoming'
                      ? `Buyer: ${order.buyerName}`
                      : `Seller: ${order.sellerName}`}
                    {' • '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Qty: {order.quantity}
                    </span>
                  </p>
                </div>
              </div>

              {/* Price & Status */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                <div className="text-left md:text-right">
                  <div className="text-base font-extrabold text-pink-600">
                    ₹{order.totalPrice}
                  </div>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>

                {/* Seller Action buttons for Incoming Orders */}
                {activeTab === 'incoming' && (
                  <div className="flex items-center gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Accepted')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
