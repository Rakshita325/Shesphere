import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero_illustration.png';
import { useNavigate } from "react-router-dom";

const Hero = () => {
   const navigate = useNavigate();
  return (
    <section id="home" className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FFF5F7] to-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-600 font-semibold text-sm mb-6 shadow-sm">
            Welcome to SheSphere
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Empowering Women <br className="hidden lg:block" />
            <span className="text-pink-400">Through Smart Learning</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Learn new skills, connect with like-minded women, and make productive use of your free time through personalized learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
  onClick={() => navigate("/signup")}
  className="w-full sm:w-auto bg-pink-400 hover:bg-pink-500 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
>
  Get Started
</button>
            
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-purple-100 rounded-full blur-3xl opacity-30 -z-10 transform scale-90"></div>
          <img 
            src={heroImage} 
            alt="Women engaging in various activities" 
            className="w-full max-w-lg mx-auto lg:max-w-xl drop-shadow-2xl rounded-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
