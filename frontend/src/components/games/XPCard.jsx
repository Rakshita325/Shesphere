// src/components/games/XPCard.jsx
import React from 'react';
import CardBase from '../dashboard/CardBase';
import { useUser } from '../../context/UserContext';

const XPCard = () => {
  const { userData } = useUser();
  const xp = userData.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  return (
    <CardBase className="p-5">
      <h2 className="text-lg font-semibold mb-2">XP & Level</h2>
      <p className="text-2xl font-bold text-pink-500">{xp} XP</p>
      <p className="mt-1 text-gray-600">Level {level}</p>
    </CardBase>
  );
};

export default XPCard;
