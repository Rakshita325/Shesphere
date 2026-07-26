import React from 'react';
import CardBase from '../dashboard/CardBase';
import MediaCard from '../dashboard/MediaCard';
import { videos } from '../../utils/dummyData';

const RecommendedVideos = () => {
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <MediaCard
            key={v.id}
            title={v.title}
            image={v.thumbnail}
            description={v.description}
            type="video"
          />
        ))}
      </div>
    </CardBase>
  );
};

export default RecommendedVideos;
