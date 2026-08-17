import React, { useState } from 'react';
import CardBase from '../dashboard/CardBase';
import { Upload } from 'lucide-react';

const CommunityUpload = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate upload delay
    setTimeout(() => {
      console.log('Community post submitted:', { content, image });
      setContent('');
      setImage(null);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <Upload className="w-5 h-5 text-pink-500 dark:text-pink-400" />
        Share to Community
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-850 dark:text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          rows={3}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="text-sm text-gray-600 dark:text-gray-300"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-pink-400 dark:bg-pink-500 text-white rounded-md hover:bg-pink-500 dark:hover:bg-pink-600 transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </CardBase>
  );
};

export default CommunityUpload;
