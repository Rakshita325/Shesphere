import React from 'react';
import CardBase from '../dashboard/CardBase';

// Generic media card for video or article
const MediaCard = ({ title, image, description, type }) => {
  return (
    <CardBase className="flex flex-col h-full">
      <img src={image} alt={title} className="w-full h-40 object-cover rounded-md mb-3" />
      <h4 className="text-md font-semibold text-gray-800 mb-1">{title}</h4>
      {description && <p className="text-sm text-gray-500 flex-1">{description}</p>}
      <a
        href="#"
        className="mt-2 text-pink-500 hover:underline text-sm font-medium"
      >
        {type === 'video' ? 'Watch video' : 'Read article'}
      </a>
    </CardBase>
  );
};

export default MediaCard;
