import React from 'react';
import CardBase from '../dashboard/CardBase';
import { communityPosts } from '../../utils/dummyData';

const CommunityFeed = () => {
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Community Feed</h3>
      <ul className="space-y-4">
        {communityPosts.map((post) => (
          <li key={post.id} className="flex items-start gap-3">
            <img
              src={post.avatar}
              alt={post.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{post.user}</p>
              <p className="text-sm text-gray-600 dark:text-gray-350">{post.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </CardBase>
  );
};

export default CommunityFeed;
