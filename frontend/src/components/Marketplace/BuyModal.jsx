import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

const BuyModal = ({ product, defaultQty = 1, onClose, onSuccess }) => {
  const { buyProduct } = useMarketplace();

  const [step, setStep] = useState(1); // 1 = qty+address, 2 = success
  const [qty, setQty] = useState(defaultQty);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    setError('');
    if (!address.name.trim() || !address.phone.trim() || !address.addressLine.trim() ||
        !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setError('Please fill in all shipping address fields.');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsLoading(true);
    try {
      await buyProduct(product, qty, {
        shippingAddress: address,
        invoiceAddress: address
      });
      setStep(2);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (product.price * qty).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                {step === 2 ? 'Order Placed! 🎉' : 'Confirm Your Order'}
              </h2>
              <p className="text-pink-100 text-xs mt-0.5">
                {step === 2 ? 'Thank you for supporting women artisans.' : 'Review and confirm your purchase.'}
              </p>
            </div>
          </div>
        </div>

        {step === 2 ? (
          /* Success State */
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Confirmed!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your order for <strong>{product.name || product.productName}</strong> has been placed.
              Track it in <strong>My Purchases</strong>.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Product summary */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              <img
                src={product.images?.[0] || 'https://placehold.co/64x64?text=?'}
                alt={product.name || product.productName}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name || product.productName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">₹{product.price?.toLocaleString('en-IN')} per item</p>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center transition"
                >–</button>
                <span className="w-10 text-center text-sm font-extrabold text-gray-900 dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity || 99, q + 1))}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center transition"
                >+</button>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  ({product.quantity} available)
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipping Address</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'name', placeholder: 'Full Name', colSpan: 2 },
                  { name: 'phone', placeholder: 'Phone Number', colSpan: 1 },
                  { name: 'pincode', placeholder: 'Pincode', colSpan: 1 },
                  { name: 'addressLine', placeholder: 'Address Line (House, Street, Area)', colSpan: 2 },
                  { name: 'city', placeholder: 'City', colSpan: 1 },
                  { name: 'state', placeholder: 'State', colSpan: 1 }
                ].map(({ name, placeholder, colSpan }) => (
                  <input
                    key={name}
                    name={name}
                    value={address[name]}
                    onChange={handleAddressChange}
                    placeholder={placeholder}
                    className={`px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      colSpan === 2 ? 'col-span-2' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl border border-pink-100 dark:border-pink-900/30">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
              <span className="text-xl font-extrabold text-pink-600">₹{totalPrice}</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Secure purchase • Artisan verified • Handmade guaranteed</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Place Order</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyModal;
