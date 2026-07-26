// src/components/games/MemoryMatch.jsx
import React, { useState, useEffect } from 'react';
import CardBase from '../dashboard/CardBase';
import { memoryCards } from '../../utils/gamesData';

// Helper to shuffle array
const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indexes of flipped cards
  const [matched, setMatched] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Create pairs
    const pairs = memoryCards.map((c) => ({ ...c, pairId: c.id }));
    const duplicated = [...pairs, ...pairs];
    setCards(shuffle(duplicated));
  }, []);

  const handleClick = (index) => {
    if (flipped.length === 2 || matched.includes(index) || flipped.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      const [i1, i2] = newFlipped;
      if (cards[i1].pairId === cards[i2].pairId) {
        // match
        setMatched((prev) => [...prev, i1, i2]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setCompleted(true);
        }
      } else {
        // no match, flip back after delay
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <CardBase className="p-4">
      <h2 className="text-xl font-semibold mb-2">Memory Match</h2>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-md cursor-pointer flex items-center justify-center transition-transform ${
                isFlipped ? 'transform rotate-0' : 'transform rotate-180'
              } ${card.color} ${matched.includes(idx) ? 'opacity-70' : ''}`}
            >
              {isFlipped ? <span className="text-lg font-bold">{card.pairId + 1}</span> : null}
            </div>
          );
        })}
      </div>
      {completed && (
        <p className="mt-3 text-green-600 font-medium">Congratulations! You've completed the game.</p>
      )}
    </CardBase>
  );
};

export default MemoryMatch;
