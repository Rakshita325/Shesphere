import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Flame, Target } from 'lucide-react';

const featuresData = [
  {
    title: 'Personalized Learning',
    description: 'Tailored courses and resources that adapt to your unique pace and goals.',
    icon: <BookOpen className="h-6 w-6 text-pink-500" />,
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Community Support',
    description: 'Connect, share, and grow with a vibrant network of inspiring women.',
    icon: <Users className="h-6 w-6 text-purple-500" />,
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Daily Streaks',
    description: 'Build consistency and stay motivated with engaging daily challenges.',
    icon: <Flame className="h-6 w-6 text-orange-400" />,
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Skill Tracking',
    description: 'Monitor your progress visually and celebrate every milestone achieved.',
    icon: <Target className="h-6 w-6 text-teal-500" />,
    bgColor: 'bg-teal-50',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 text-lg">
            Our platform provides the perfect blend of resources, community, and motivation to help you reach your full potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
