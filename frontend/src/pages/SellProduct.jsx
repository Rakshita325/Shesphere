import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ArrowLeft, Upload, Save, Sparkles, ImageIcon, MapPin, Tag, Package, Loader2, X, CheckCircle2, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Handicrafts', 'Embroidery', 'Paintings', 'Candles', 'Soaps',
  'Jewellery', 'Clothing', 'Baked Goods', 'Pickles', 'Decor', 'Others'
];

const SellProduct = () => {
  const navigate = useNavigate();
  const { addProduct, saveDraft, draftProduct, showToast } = useMarketplace();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Handicrafts',
    price: '',
    description: '',
    location: '',
    quantity: '1'
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // File objects
  const [previewUrls, setPreviewUrls] = useState([]);     // Local object URLs
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Restore draft (form fields only, not files)
  useEffect(() => {
    if (draftProduct) {
      setFormData({
        name: draftProduct.name || '',
        category: draftProduct.category || 'Handicrafts',
        price: draftProduct.price || '',
        description: draftProduct.description || '',
        location: draftProduct.location || '',
        quantity: draftProduct.quantity || '1'
      });
    }
  }, [draftProduct]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    const invalidCount = files.length - validFiles.length;
    if (invalidCount > 0) showToast(`${invalidCount} non-image file(s) were skipped.`, 'error');

    const oversized = validFiles.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      showToast('Some images exceed 5MB and were skipped.', 'error');
    }
    const okFiles = validFiles.filter((f) => f.size <= 5 * 1024 * 1024);

    const combined = [...selectedFiles, ...okFiles].slice(0, 5);
    setSelectedFiles(combined);

    const newPreviews = combined.map((f) => URL.createObjectURL(f));
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(newPreviews);
    if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) err.price = 'Enter a valid price greater than 0';
    if (!formData.description.trim()) err.description = 'Description is required';
    if (!formData.location.trim()) err.location = 'Location is required';
    if (Number(formData.quantity) < 0) err.quantity = 'Quantity cannot be negative';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setApiError('You must be logged in to publish a product. Please log in first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('productName', formData.name.trim());
      fd.append('category', formData.category);
      fd.append('price', formData.price);
      fd.append('description', formData.description.trim());
      fd.append('location', formData.location.trim());
      fd.append('quantity', formData.quantity || '1');

      for (const file of selectedFiles) {
        fd.append('images', file);
      }

      await addProduct(fd);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/marketplace/my-products');
      }, 1200);
    } catch (err) {
      console.error('❌ Publish product error:', err);
      setApiError(err.message || 'Failed to publish product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraft({ ...formData });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 font-medium text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">List a New Product</span>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white">
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-pink-100 mb-1">
            <Sparkles className="w-4 h-4" /> List Your Handmade Craft
          </div>
          <h1 className="text-2xl font-bold">Sell Product</h1>
          <p className="text-pink-100 text-sm mt-1">
            Fill in the details below to publish your handmade creation to thousands of buyers on SheSphere.
          </p>
        </div>

        {/* Success State */}
        {submitSuccess && (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-emerald-600">
            <CheckCircle2 className="w-14 h-14" />
            <h3 className="text-lg font-bold">Product Published!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to My Products…</p>
          </div>
        )}

        {!submitSuccess && (
          <form onSubmit={handlePublish} className="p-6 sm:p-8 space-y-6">
            {/* Global API Error Alert */}
            {apiError && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-400 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Hand-Embroidered Kashmiri Shawl"
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-400" /> Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 1499"
                  min="1"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Quantity & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-400" /> Available Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> Location (City, State) *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Jaipur, Rajasthan"
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                    errors.location ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your craft, materials used, technique, care instructions..."
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-gray-400" /> Product Images
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                  {selectedFiles.length}/5 images • Max 5MB each
                </span>
              </label>

              {/* Drop Zone / File Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/40 dark:hover:bg-pink-950/10 transition group"
              >
                <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-pink-400 mx-auto mb-2 transition" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">
                  Click to choose photos from your device
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPEG, PNG, WEBP — up to 5 images, 5MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-20 h-20 group">
                      <img
                        src={url}
                        alt="preview"
                        className="w-full h-full object-cover rounded-xl border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow hover:bg-rose-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-pink-600 text-white px-1.5 rounded font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-md transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Publish Product</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellProduct;
