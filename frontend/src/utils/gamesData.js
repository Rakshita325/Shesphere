// src/utils/gamesData.js

export const quizzes = {
  cooking: [
    {
      id: 'c1',
      question: 'What temperature does water boil at sea level?',
      options: ['90°C', '100°C', '110°C', '120°C'],
      answer: '100°C',
    },
    {
      id: 'c2',
      question: 'Which ingredient helps dough rise?',
      options: ['Baking soda', 'Salt', 'Sugar', 'Oil'],
      answer: 'Baking soda',
    },
    {
      id: 'c3',
      question: 'What type of knife is best for chopping herbs?',
      options: ['Chef', 'Paring', 'Serrated', 'Boning'],
      answer: 'Paring',
    },
    {
      id: 'c4',
      question: 'Which grain is used to make risotto?',
      options: ['Basmati', 'Arborio', 'Jasmine', 'Brown'],
      answer: 'Arborio',
    },
    {
      id: 'c5',
      question: 'What is the main protein in tofu?',
      options: ['Soy', 'Wheat', 'Pea', 'Lentil'],
      answer: 'Soy',
    },
    {
      id: 'c6',
      question: 'Which spice gives a smoky flavor?',
      options: ['Paprika', 'Cumin', 'Turmeric', 'Cinnamon'],
      answer: 'Paprika',
    },
  ],
  gardening: [
    {
      id: 'g1',
      question: 'What plant needs the most sunlight?',
      options: ['Fern', 'Cactus', 'Hosta', 'Moss'],
      answer: 'Cactus',
    },
    {
      id: 'g2',
      question: 'Which soil amendment improves drainage?',
      options: ['Clay', 'Silt', 'Sand', 'Peat'],
      answer: 'Sand',
    },
    {
      id: 'g3',
      question: 'What is the ideal pH for most vegetable gardens?',
      options: ['5.0', '6.5', '8.0', '9.0'],
      answer: '6.5',
    },
    {
      id: 'g4',
      question: 'Which fruit is a berry?',
      options: ['Strawberry', 'Banana', 'Tomato', 'Apple'],
      answer: 'Tomato',
    },
    {
      id: 'g5',
      question: 'When should you prune roses?',
      options: ['Early spring', 'Mid summer', 'Late fall', 'Winter'],
      answer: 'Early spring',
    },
    {
      id: 'g6',
      question: 'Which insect is a beneficial pollinator?',
      options: ['Aphid', 'Bee', 'Caterpillar', 'Mite'],
      answer: 'Bee',
    },
  ],
  digital_skills: [
    {
      id: 'd1',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language', 'Hyper Transfer Markup Language'],
      answer: 'Hyper Text Markup Language',
    },
    {
      id: 'd2',
      question: 'Which language is primarily used for styling web pages?',
      options: ['JavaScript', 'CSS', 'HTML', 'Python'],
      answer: 'CSS',
    },
    {
      id: 'd3',
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Applied Programming Integration', 'Advanced Process Interaction', 'Applied Program Interface'],
      answer: 'Application Programming Interface',
    },
    {
      id: 'd4',
      question: 'Which of these is a version control system?',
      options: ['Docker', 'Git', 'Node', 'React'],
      answer: 'Git',
    },
    {
      id: 'd5',
      question: 'What symbol is used for comments in JavaScript?',
      options: ['//', '/*', '#', '--'],
      answer: '//',
    },
    {
      id: 'd6',
      question: 'Which protocol is used to securely browse the web?',
      options: ['HTTP', 'FTP', 'SSH', 'HTTPS'],
      answer: 'HTTPS',
    },
  ],
};

export const memoryCards = [
  { id: 0, color: "bg-pink-200" },
  { id: 1, color: "bg-purple-200" },
  { id: 2, color: "bg-teal-200" },
  { id: 3, color: "bg-orange-200" },
  { id: 4, color: "bg-yellow-200" },
  { id: 5, color: "bg-blue-200" },
  { id: 6, color: "bg-green-200" },
  { id: 7, color: "bg-indigo-200" },
];

export const dailyChallenges = {
  cooking: 'Prepare a three‑course meal using at least one seasonal vegetable.',
  gardening: 'Plant a seedling and document its growth over the next week.',
  digital_skills: 'Create a simple webpage that includes a heading, paragraph, and an image.',
};
