import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PenTool, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Tag 
} from 'lucide-react';
import articleService from '../services/articleService';
import { useUser } from '../context/UserContext';

const VALID_CATEGORIES = [
  'Cooking',
  'Arts & Crafts',
  'Gardening',
  'Sewing & Fashion',
  'Digital Skills',
  'Health & Fitness',
  'Music & Instruments',
  'Skincare',
  'General'
];

const WriteArticle = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const removeCoverPreview = () => {
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an article title.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please enter article content.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('content', content.trim());

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      } else if (coverImageUrl.trim()) {
        formData.append('coverImage', coverImageUrl.trim());
      }

      const res = await articleService.createArticle(formData);
      if (res && res.success) {
        navigate(`/dashboard/articles/${res.data._id}`);
      } else {
        setErrorMsg(res?.message || 'Failed to publish article.');
      }
    } catch (err) {
      console.error('Failed to publish article:', err);
      setErrorMsg('Server error while publishing article. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-md space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold mb-2">
            <PenTool className="w-3.5 h-3.5" />
            <span>Publish Article</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Write Article
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Share your knowledge, tutorials, recipes, or personal stories with the SheSphere community.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 5 Easy Homemade Evening Snacks for Beginners"
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40"
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Selection (Upload or Image URL) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Cover Image
            </label>

            {coverImagePreview ? (
              <div className="relative rounded-2xl overflow-hidden max-h-64 bg-black/10 border border-gray-200 dark:border-gray-700">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-full max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverPreview}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/40">
                  <Upload className="w-8 h-8 text-pink-500 mb-2" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Click to Upload Cover Image
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                  <span>OR paste image URL</span>
                  <span className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                </div>

                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-2.5 text-xs border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40"
                />
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Article Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here... You can use paragraphs, step-by-step points, or bullet lists."
              rows={12}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40 resize-y leading-relaxed"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Article
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteArticle;
