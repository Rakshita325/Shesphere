import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../services/marketplaceService';

const MarketplaceContext = createContext();

// Decode JWT payload to get current userId without a library
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
};

// Map raw API product to normalized frontend shape
const mapProduct = (p) => ({
  id: p._id || p.id,
  name: p.productName || p.name,
  category: p.category,
  sellerId: p.seller?._id || p.seller,
  sellerName: p.seller?.fullName || 'Artisan',
  sellerAvatar: p.seller?.profilePicture || '',
  sellerLocation: p.location || p.seller?.location || 'India',
  price: p.price,
  originalPrice: Math.round(p.price * 1.25),
  rating: p.rating || 0,
  reviewCount: p.reviewsCount || 0,
  quantity: p.quantity ?? 0,
  description: p.description,
  images: p.images && p.images.length > 0 ? p.images : [],
  isFeatured: p.isFeatured || false,
  isRecommended: p.isRecommended || false,
  isAvailable: p.isAvailable !== false,
  isActive: p.isActive !== false,
  orderStats: p.orderStats || null,
  createdAt: p.createdAt
});

// Map raw API order to normalized frontend shape
const mapOrder = (o, type) => ({
  id: o._id || o.id,
  productId: o.product?._id || o.product,
  productName: o.product?.productName || 'Product',
  productImage: o.product?.images?.[0] || '',
  buyerId: o.buyer?._id || o.buyer,
  buyerName: o.buyer?.fullName || 'Customer',
  buyerEmail: o.buyer?.email || '',
  sellerId: o.seller?._id || o.seller,
  sellerName: o.seller?.fullName || 'Artisan',
  sellerEmail: o.seller?.email || '',
  quantity: o.quantity,
  priceAtPurchase: o.priceAtPurchase || o.totalAmount / (o.quantity || 1),
  totalPrice: o.totalAmount,
  status: o.status,
  shippingAddress: o.shippingAddress || {},
  invoiceAddress: o.invoiceAddress || {},
  date: new Date(o.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  }),
  type
});

export const MarketplaceProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myProductsLoading, setMyProductsLoading] = useState(false);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const [draftProduct, setDraftProduct] = useState(() => {
    try {
      const saved = localStorage.getItem('shesphere_marketplace_draft');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [notification, setNotification] = useState(null);
  const currentUserId = getCurrentUserId();

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Load marketplace products (own excluded by backend) ───────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.searchProducts({
        q: searchQuery,
        category: selectedCategory,
        sort: sortBy
      });
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products.map((p) => mapProduct(p)));
      }
    } catch (err) {
      console.warn('⚠️ API product fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  // ── Load seller's own products ─────────────────────────────────────────────
  const loadMyProducts = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setMyProductsLoading(true);
    try {
      const data = await marketplaceService.getMyProducts();
      if (data.success && Array.isArray(data.products)) {
        setMyProducts(data.products.map((p) => mapProduct(p)));
      }
    } catch (err) {
      console.warn('⚠️ My products fetch warning:', err.message);
    } finally {
      setMyProductsLoading(false);
    }
  }, []);

  // ── Load buyer's purchases ─────────────────────────────────────────────────
  const loadPurchases = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setPurchasesLoading(true);
    try {
      const data = await marketplaceService.getUserPurchases();
      if (data.success && Array.isArray(data.orders)) {
        setPurchases(data.orders.map((o) => mapOrder(o, 'purchase')));
      }
    } catch (err) {
      console.warn('⚠️ Purchases fetch warning:', err.message);
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  // ── Load seller's incoming orders ─────────────────────────────────────────
  const loadSellerOrders = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setSellerOrdersLoading(true);
    try {
      const data = await marketplaceService.getSellerSales();
      if (data.success && Array.isArray(data.orders)) {
        setSellerOrders(data.orders.map((o) => mapOrder(o, 'incoming')));
      }
    } catch (err) {
      console.warn('⚠️ Seller orders fetch warning:', err.message);
    } finally {
      setSellerOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (draftProduct) {
      localStorage.setItem('shesphere_marketplace_draft', JSON.stringify(draftProduct));
    } else {
      localStorage.removeItem('shesphere_marketplace_draft');
    }
  }, [draftProduct]);

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const addProduct = async (productData) => {
    try {
      const res = await marketplaceService.createProduct(productData);
      if (res.success && res.product) {
        const newProduct = mapProduct(res.product);
        setMyProducts((prev) => [newProduct, ...prev]);
        setDraftProduct(null);
        showToast(`🎉 "${newProduct.name}" published successfully!`);
        return newProduct.id;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish product';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      const res = await marketplaceService.updateProduct(id, formData);
      if (res.success && res.product) {
        const updated = mapProduct(res.product);
        setMyProducts((prev) => prev.map((p) => (p.id === id ? { ...updated, orderStats: p.orderStats } : p)));
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showToast('✅ Product updated successfully!');
        return updated;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await marketplaceService.deleteProduct(id);
      if (res.success) {
        setMyProducts((prev) => prev.filter((p) => p.id !== id));
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(res.softDeleted ? '🗑️ Product deactivated (orders preserved).' : '🗑️ Product deleted.');
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete product';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const toggleAvailability = async (id, isAvailable) => {
    try {
      const res = await marketplaceService.toggleAvailability(id, isAvailable);
      if (res.success) {
        setMyProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAvailable: res.isAvailable } : p))
        );
        showToast(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update availability';
      showToast(msg, 'error');
    }
  };

  // ── Buying ────────────────────────────────────────────────────────────────
  const buyProduct = async (product, qty = 1, addressData = {}) => {
    try {
      const res = await marketplaceService.createOrder({
        productId: product.id,
        quantity: qty,
        shippingAddress: addressData.shippingAddress || {},
        invoiceAddress: addressData.invoiceAddress || {}
      });
      if (res.success && res.order) {
        const newOrder = mapOrder(res.order, 'purchase');
        setPurchases((prev) => [newOrder, ...prev]);
        // Refresh product list to show updated stock
        loadProducts();
        showToast(`🛒 Order placed for ${qty}× "${product.name}"!`);
        return newOrder;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  // ── Order Management ──────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await marketplaceService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setSellerOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to ${newStatus}`);
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await marketplaceService.cancelOrder(orderId);
      if (res.success) {
        setPurchases((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
        );
        loadProducts(); // refresh stock
        showToast('✅ Order cancelled. Stock restored.');
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  // Draft management
  const saveDraft = (draftData) => {
    setDraftProduct(draftData);
    showToast('💾 Draft saved!');
  };

  // Legacy: combined orders (for backward compat with any component using orders)
  const orders = [...purchases, ...sellerOrders];

  return (
    <MarketplaceContext.Provider
      value={{
        // Products
        products,
        myProducts,
        loading,
        myProductsLoading,
        // Orders
        orders,
        purchases,
        sellerOrders,
        purchasesLoading,
        sellerOrdersLoading,
        // Filters
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        // Auth
        currentUserId,
        // Product actions
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        // Draft
        draftProduct,
        saveDraft,
        // Buy
        buyProduct,
        // Order actions
        updateOrderStatus,
        cancelOrder,
        // Loaders
        loadProducts,
        loadMyProducts,
        loadPurchases,
        loadSellerOrders,
        // Toast
        notification,
        showToast
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error('useMarketplace must be used within a MarketplaceProvider');
  return context;
};
