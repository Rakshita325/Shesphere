import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Features />
      <Testimonials />
    </div>
  );
};

export default Home;
