import React, { useState, useEffect } from 'react';
import CardBase from '../dashboard/CardBase';
import MediaCard from '../dashboard/MediaCard';
import api from '../../services/api';

const RecommendedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos/recommendations');
        
        if (response.data && response.data.success) {
          setVideos(response.data.data);
        } else {
          setError('Failed to load videos.');
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Please log in to view your personalized recommendations.');
        } else {
          setError('Error connecting to the server.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Videos</h3>
        <p>Loading videos...</p>
      </CardBase>
    );
  }

  if (error) {
    return (
      <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Videos</h3>
        <p className="text-red-500">{error}</p>
      </CardBase>
    );
  }

  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-96 overflow-y-auto">
        {videos.map((v) => (
          <MediaCard
            key={v._id}
            title={v.title}
            image={v.thumbnail}
            description={v.category}
            type="video"
            link={`https://www.youtube.com/watch?v=${v.youtubeId}`}
          />
        ))}
      </div>
    </CardBase>
  );
};

export default RecommendedVideos;
