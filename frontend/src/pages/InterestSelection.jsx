import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChefHat, Palette, Leaf, Scissors, Laptop, Dumbbell, Music, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const interestsList = [
  { id: 'cooking', label: 'Cooking', icon: ChefHat, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { id: 'arts_crafts', label: 'Arts & Crafts', icon: Palette, color: 'text-pink-500', bgColor: 'bg-pink-50' },
  { id: 'gardening', label: 'Gardening', icon: Leaf, color: 'text-green-500', bgColor: 'bg-green-50' },
  { id: 'sewing_fashion', label: 'Sewing & Fashion', icon: Scissors, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { id: 'digital_skills', label: 'Digital Skills', icon: Laptop, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 'health_fitness', label: 'Health & Fitness', icon: Dumbbell, color: 'text-red-500', bgColor: 'bg-red-50' },
  { id: 'music_instruments', label: 'Music & Instruments', icon: Music, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  { id: 'skincare', label: 'Skincare', icon: Sparkles, color: 'text-teal-500', bgColor: 'bg-teal-50' },
];

const InterestSelection = () => {
  const { userData, updateUserData } = useUser();
  const navigate = useNavigate();
  const [selectedInterest, setSelectedInterest] = useState(userData.interest || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    if (!selectedInterest) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      updateUserData({ interest: selectedInterest });
      console.log("Interest Selected:", selectedInterest);
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-pink/10 to-white flex flex-col font-poppins pb-12">
      <div className="w-full bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-center mb-8 sticky top-0 z-10 border-b border-pastel-lavender/50">
        <div className="flex items-center gap-2">
          <Layers className="h-8 w-8 text-pink-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-400 bg-clip-text text-transparent">
            SheSphere
          </span>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What do you want to learn?</h1>
          <p className="text-gray-500 text-lg">Select your primary interest to tailor a personalized learning path.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {interestsList.map((interest, index) => {
            const Icon = interest.icon;
            const isSelected = selectedInterest === interest.id;
            
            return (
              <motion.div
                key={interest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedInterest(interest.id)}
                className={`relative cursor-pointer rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 ${
                  isSelected 
                    ? 'border-2 border-pink-400 shadow-[0_8px_30px_rgb(244,114,182,0.2)] bg-white transform -translate-y-1' 
                    : 'border border-gray-100 bg-white hover:border-pink-200 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 rounded-full bg-pink-400 ring-4 ring-pink-100" />
                  </div>
                )}
                
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 ${interest.bgColor} ${interest.color} transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <span className={`font-semibold sm:text-lg ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                  {interest.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedInterest || isSubmitting}
            isLoading={isSubmitting}
            className={`max-w-md w-full py-3.5 text-lg shadow-lg ${!selectedInterest ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterestSelection;
