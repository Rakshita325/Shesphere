/**
 * Dynamically loads the Razorpay Checkout script from Razorpay's CDN.
 * Returns a promise that resolves to true when window.Razorpay is ready.
 * Safe to call multiple times — script is only injected once.
 */
const loadRazorpay = () =>
  new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay Checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });

export default loadRazorpay;
