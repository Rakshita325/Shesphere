import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, Loader2, CheckCircle2, AlertCircle, CreditCard, Lock } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { marketplaceService } from '../../services/marketplaceService';
import loadRazorpay from '../../utils/loadRazorpay';

const BuyModal = ({ product, defaultQty = 1, onClose, onSuccess }) => {
  const { loadPurchases, loadProducts, showToast } = useMarketplace();

  const [step, setStep] = useState(1); // 1 = Address & Checkout, 2 = Payment Success Screen
  const [qty, setQty] = useState(defaultQty);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

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

  const handleProceedToPayment = async () => {
    setError('');
    if (!address.name.trim() || !address.phone.trim() || !address.addressLine.trim() ||
        !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setError('Please fill in all shipping address fields.');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Dynamically load Razorpay SDK script
      const sdkReady = await loadRazorpay();
      if (!sdkReady) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 2. Create Razorpay Test Order + SheSphere Order on backend
      const res = await marketplaceService.createRazorpayOrder({
        productId: product.id || product._id,
        quantity: qty,
        shippingAddress: address,
        invoiceAddress: address
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize payment order.');
      }

      const { orderId, razorpayOrderId, amount, currency, keyId, user } = res;

      // 3. Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount, // in paise
        currency: currency || 'INR',
        name: 'SheSphere Marketplace',
        description: `Payment for ${product.name || product.productName}`,
        image: product.images?.[0] || 'https://placehold.co/128x128?text=SheSphere',
        order_id: razorpayOrderId,
        handler: async (response) => {
          // Triggered on successful payment completion in Razorpay Checkout modal
          try {
            setIsLoading(true);
            const verifyRes = await marketplaceService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            });

            if (verifyRes.success) {
              setPaymentInfo({
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                orderId: orderId,
                amountPaid: (amount / 100).toLocaleString('en-IN')
              });
              setStep(2);
              loadPurchases();
              loadProducts();
              showToast('🎉 Payment Successful! Order confirmed.');
            } else {
              setError(verifyRes.message || 'Payment verification failed on server.');
            }
          } catch (verifyErr) {
            console.error('❌ Verification Error:', verifyErr);
            setError(verifyErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: address.name,
          email: user?.email || '',
          contact: address.phone
        },
        notes: {
          sheSphereOrderId: orderId
        },
        theme: {
          color: '#ec4899' // SheSphere Pink
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setError('Payment was cancelled. You can retry payment anytime.');
          }
        }
      };

      // 4. Launch Razorpay Checkout Modal
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setIsLoading(false);
        setError(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('❌ Razorpay Setup Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to launch checkout.');
      setIsLoading(false);
    }
  };

  const unitPrice = product.price || 0;
  const totalPriceFormatted = (unitPrice * qty).toLocaleString('en-IN');

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
                {step === 2 ? 'Payment Successful! 🎉' : 'Checkout & Payment'}
              </h2>
              <p className="text-pink-100 text-xs mt-0.5">
                {step === 2 ? 'Thank you for supporting women artisans.' : 'Secure Razorpay Test Mode Payment.'}
              </p>
            </div>
          </div>
        </div>

        {step === 2 ? (
          /* Step 2: Success State */
          <div className="p-6 space-y-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Order Confirmed & Paid!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your payment was processed securely via Razorpay Test Mode.
              </p>
            </div>

            {/* Payment receipt box */}
            <div className="w-full bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Payment Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Paid (Test Mode)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Razorpay Payment ID:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">{paymentInfo?.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">{paymentInfo?.orderId}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-700 dark:text-gray-300">Amount Paid:</span>
                <span className="font-extrabold text-pink-600 dark:text-pink-400 text-sm">₹{paymentInfo?.amountPaid}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md transition"
            >
              Done & View Purchases
            </button>
          </div>
        ) : (
          /* Step 1: Product summary + Shipping address + Razorpay button */
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">₹{unitPrice.toLocaleString('en-IN')} per item</p>
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
                  { name: 'pincode', placeholder: 'Pincode (6 digits)', colSpan: 1 },
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

            {/* Total Amount */}
            <div className="flex items-center justify-between p-3.5 bg-pink-50 dark:bg-pink-950/30 rounded-xl border border-pink-100 dark:border-pink-900/30">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Amount</span>
                <span className="text-xl font-extrabold text-pink-600 dark:text-pink-400">₹{totalPriceFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-100 dark:bg-pink-900/50 rounded-lg text-pink-700 dark:text-pink-300 text-xs font-bold">
                <CreditCard className="w-4 h-4" /> Razorpay Test Mode
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>256-bit SSL Encrypted • Test Cards Accepted</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={isLoading}
                className="flex-2 flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/25 transition disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Payment…</>
                ) : (
                  <><Lock className="w-4 h-4" /> Pay ₹{totalPriceFormatted}</>
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
