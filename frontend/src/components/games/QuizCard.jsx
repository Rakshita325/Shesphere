import React, { useState } from 'react';
import CardBase from '../dashboard/CardBase';

const QuizCard = ({ questionData, onCorrect }) => {
  const { question, options, answer } = questionData;
  const [selected, setSelected] = useState(null);
  const [tested, setTested] = useState(false);

  const handleSelect = (opt) => {
    if (tested) return;
    setSelected(opt);
  };

  const handleCheck = () => {
    if (tested || selected === null) return;
    const isCorrect = selected === answer;
    if (isCorrect) onCorrect();
    setTested(true);
  };

  return (
    <CardBase className="p-4">
      <h3 className="font-semibold mb-2">{question}</h3>
      <div className="space-y-2 mb-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            className={`w-full text-left px-3 py-2 rounded-md border 
              ${selected === opt ? 'border-pink-400 bg-pink-50' : 'border-gray-200'}
              ${tested && opt === answer ? 'bg-green-100 border-green-400' : ''}
              ${tested && selected === opt && opt !== answer ? 'bg-red-100 border-red-400' : ''}`}
            disabled={tested}
          >
            {opt}
          </button>
        ))}
      </div>
      {!tested && (
        <button
          onClick={handleCheck}
          className="bg-pink-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={selected === null}
        >
          Check
        </button>
      )}
      {tested && (
        <p className="mt-2 font-medium">
          {selected === answer ? 'Correct! 🎉' : `Incorrect. Correct answer: ${answer}`}
        </p>
      )}
    </CardBase>
  );
};

export default QuizCard;
