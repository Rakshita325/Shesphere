import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Flame, Target, Compass, Sparkles, Heart, Rocket } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const featuresData = [
  {
    title: 'Personalized Learning',
    description: 'Tailored courses and resources that adapt to your unique pace and goals.',
    icon: <BookOpen className="h-7 w-7 text-pink-500" />,
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100',
    accentColor: 'text-pink-500'
  },
  {
    title: 'Community Support',
    description: 'Connect, share, and grow with a vibrant network of inspiring women.',
    icon: <Users className="h-7 w-7 text-purple-500" />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    accentColor: 'text-purple-500'
  },
  {
    title: 'Daily Streaks',
    description: 'Build consistency and stay motivated with engaging daily challenges.',
    icon: <Flame className="h-7 w-7 text-orange-400" />,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100',
    accentColor: 'text-orange-500'
  },
  {
    title: 'Skill Tracking',
    description: 'Monitor your progress visually and celebrate every milestone achieved.',
    icon: <Target className="h-7 w-7 text-teal-500" />,
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100',
    accentColor: 'text-teal-500'
  },
];

const Features = () => {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-pink-50/20 to-purple-50/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-semibold tracking-wider text-pink-500 uppercase bg-pink-100/70 px-4 py-1.5 rounded-full inline-block mb-3">
            About SheSphere
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Empowering Women Everyday</h2>
          <p className="text-gray-600 text-lg">
            Explore our vision, mission, and core features designed to accelerate your personal growth.
          </p>
        </div>

        <div className="relative swiper-pastel-container">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            grabCursor={true}
            className="rounded-3xl pb-16 pt-4"
          >
            {/* Slide 1: Our Vision */}
            <SwiperSlide>
              <div className="bg-gradient-to-br from-pink-50/80 via-white to-purple-50/80 border border-pink-200 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 min-h-[420px]">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full md:w-1/2 text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mb-6 shadow-sm">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                    To create an intelligent learning ecosystem where every homemaker can continuously learn new skills, improve productivity, and achieve personal growth.
                  </p>
                  <div className="flex items-center gap-2 text-pink-500 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" /> Continuous Growth & Lifelong Learning
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full md:w-5/12 flex items-center justify-center"
                >
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-pink-200 to-purple-200 p-4 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-6 text-center shadow-inner">
                      <Heart className="w-16 h-16 text-pink-400 mb-3 animate-pulse" />
                      <span className="font-bold text-gray-800 text-lg">Intelligent Ecosystem</span>
                      <span className="text-xs text-gray-500 mt-1">For Homemakers Worldwide</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Slide 2: Our Mission */}
            <SwiperSlide>
              <div className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 border border-purple-200 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 min-h-[420px]">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full md:w-1/2 text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center mb-6 shadow-sm">
                    <Rocket className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                    To provide personalized learning experiences using AI-powered recommendations, encourage community collaboration, and help women utilize their free time productively.
                  </p>
                  <div className="flex items-center gap-2 text-purple-500 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" /> AI Personalized & Community Driven
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full md:w-5/12 flex items-center justify-center"
                >
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-tr from-purple-200 to-pink-200 p-4 shadow-lg flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                    <div className="w-full h-full rounded-2xl bg-white flex flex-col items-center justify-center p-6 text-center shadow-inner">
                      <Rocket className="w-16 h-16 text-purple-400 mb-3" />
                      <span className="font-bold text-gray-800 text-lg">AI Recommendations</span>
                      <span className="text-xs text-gray-500 mt-1">Productive Time Utilization</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Feature Slides 3-6: Each feature as a separate slide */}
            {featuresData.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className={`bg-gradient-to-br from-green-50/80 via-white to-pink-50/80 border border-green-200 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 min-h-[420px]">`}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-1/2 text-left"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 shadow-sm`}>
                      {feature.icon}
                    </div>
                   
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className={`flex items-center gap-2 ${feature.accentColor} font-semibold text-sm`}>
                      <Sparkles className="w-4 h-4" /> Key SheSphere Capability
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full md:w-5/12 flex items-center justify-center"
                  >
                    <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl ${feature.bgColor} p-6 shadow-lg flex items-center justify-center border ${feature.borderColor}`}>
                      <div className="w-full h-full rounded-2xl bg-white flex flex-col items-center justify-center p-6 text-center shadow-inner">
                        <div className="mb-4 transform hover:scale-110 transition-transform">
                          {React.cloneElement(feature.icon, { className: 'w-16 h-16' })}
                        </div>
                        <span className="font-bold text-gray-800 text-lg">{feature.title}</span>
                        <span className="text-xs text-gray-500 mt-2">SheSphere Core Feature</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        .swiper-pastel-container .swiper-pagination-bullet {
          background: #cbd5e1;
          opacity: 1;
          width: 10px;
          height: 10px;
          transition: all 0.3s ease;
        }
        .swiper-pastel-container .swiper-pagination-bullet-active {
          background: #ec4899;
          width: 24px;
          border-radius: 6px;
        }
        .swiper-pastel-container .swiper-button-next,
        .swiper-pastel-container .swiper-button-prev {
          color: #f472b6;
          background: rgba(252, 238, 238, 0.9);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #fbcfe8;
        }
        .swiper-pastel-container .swiper-button-next:after,
        .swiper-pastel-container .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        .swiper-pastel-container .swiper-button-next:hover,
        .swiper-pastel-container .swiper-button-prev:hover {
          background: #f8cfe5;
          color: #db2777;
        }
      `}</style>
    </section>
  );
};

export default Features;
