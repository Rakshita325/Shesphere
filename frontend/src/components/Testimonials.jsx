import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const testimonials = [
  {
    quote: "SheSphere completely transformed the way I approach learning. The community support is unparalleled, and the tailored courses are fantastic.",
    author: "Sarah Jenkins",
    role: "Freelance Designer",
    avatar: "https://i.pravatar.cc/150?img=47"
  },
  {
    quote: "I've never felt more motivated to build new skills. The daily streaks and progress tracking keep me accountable every single day.",
    author: "Emily Chen",
    role: "Software Developer",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    quote: "An elegant and empowering platform. I connected with so many amazing women while learning skills that directly helped my business.",
    author: "Maria Rodriguez",
    role: "Entrepreneur",
    avatar: "https://i.pravatar.cc/150?img=41"
  }
];

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonialsData = [
    {
      quote: t('landing.t1Quote'),
      author: "Sarah Jenkins",
      role: t('landing.t1Role'),
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
      quote: t('landing.t2Quote'),
      author: "Emily Chen",
      role: t('landing.t2Role'),
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      quote: t('landing.t3Quote'),
      author: "Maria Rodriguez",
      role: t('landing.t3Role'),
      avatar: "https://i.pravatar.cc/150?img=41"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F8F9FE]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('landing.testimonialsTitle')}</h2>
          <p className="text-gray-600 text-lg">{t('landing.testimonialsSubtext')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-pastel-lavender/40 relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-pastel-pink opacity-20" />
              <p className="text-gray-700 italic mb-8 relative z-10">"{item.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={item.avatar} alt={item.author} className="w-12 h-12 rounded-full border-2 border-pink-100" />
                <div>
                  <h4 className="font-semibold text-gray-900">{item.author}</h4>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
