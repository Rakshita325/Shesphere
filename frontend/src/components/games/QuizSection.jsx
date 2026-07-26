// src/components/games/QuizSection.jsx
import React, { useState } from 'react';
import QuizCard from './QuizCard';
import { quizzes } from '../../utils/gamesData';
import { useUser } from '../../context/UserContext';
import CardBase from '../dashboard/CardBase';

const QuizSection = () => {
  const { userData, updateUserData } = useUser();
  const selected = userData.interest || 'cooking'; // fallback
  const interestQuizzes = quizzes[selected] || quizzes['cooking'];
  const [correctCount, setCorrectCount] = useState(0);

  const handleCorrect = () => {
    const newXp = (userData.xp || 0) + 10;
    updateUserData({ xp: newXp });
    setCorrectCount((c) => c + 1);
  };

  return (
    <CardBase className="space-y-4 p-6">
      <h2 className="text-xl font-semibold mb-2">Quiz</h2>
      <p className="text-sm text-gray-600 mb-4">
        Answer the questions below. Each correct answer awards 10 XP.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {interestQuizzes.slice(0, 6).map((q) => (
          <QuizCard key={q.id} questionData={q} onCorrect={handleCorrect} />
        ))}
      </div>
      <p className="mt-4 font-medium">
        Correct Answers: {correctCount} / 6
      </p>
    </CardBase>
  );
};

export default QuizSection;
