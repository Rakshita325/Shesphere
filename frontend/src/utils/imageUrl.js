// Base URL for backend API / uploaded static files
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8008/api';
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Returns a valid full URL for profile pictures and media assets.
 * Converts relative paths like "/uploads/xxx.jpg" to full backend URLs.
 * Prevents returning empty strings ("") to avoid <img src="" /> DOM warnings.
 */
export const getImageUrl = (url, fallback = null) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();

  // If already absolute or base64 or blob URL, return as-is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Handle local uploaded paths served by backend
  if (trimmed.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${BACKEND_ORIGIN}/${trimmed}`;
  }

  return trimmed;
};

/**
 * Returns a robust YouTube thumbnail URL.
 * Converts unreliable high-res custom thumbnail URLs (hq720_custom_1.jpg, hq720.jpg)
 * to guaranteed hqdefault.jpg URLs to prevent 404 console errors.
 */
export const getYouTubeThumbnail = (thumbnail, youtubeId) => {
  if (!thumbnail || typeof thumbnail !== 'string' || !thumbnail.trim()) {
    if (youtubeId) return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    return 'https://placehold.co/400x225?text=SheSphere+Video';
  }

  const trimmed = thumbnail.trim();

  // Replace unreliable hq720 custom variants with standard hqdefault
  if (trimmed.includes('hq720_custom_') || trimmed.includes('hq720.jpg')) {
    if (youtubeId) {
      return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return trimmed.replace(/hq720(_custom_\d+)?\.jpg/, 'hqdefault.jpg');
  }

  return trimmed;
};
