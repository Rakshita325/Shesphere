import React from 'react';
import CardBase from '../dashboard/CardBase';
import MediaCard from '../dashboard/MediaCard';
import { articles } from '../../utils/dummyData';

const RecommendedArticles = () => {
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Articles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <MediaCard
            key={a.id}
            title={a.title}
            image={a.image}
            description={a.excerpt}
            type="article"
          />
        ))}
      </div>
    </CardBase>
  );
};

export default RecommendedArticles;
