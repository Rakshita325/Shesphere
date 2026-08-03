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

// ─── Game Definitions ────────────────────────────────────────────────
export const GAME_DEFINITIONS = [
  {
    id: 'memory_match',
    name: 'Memory Match',
    icon: '🧠',
    description: 'Flip cards and find matching pairs before time runs out!',
    difficulty: 'Easy–Hard',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
  },
  {
    id: 'wordle',
    name: 'Wordle',
    icon: '🔤',
    description: 'Guess the hidden 5-letter word in 6 tries or fewer.',
    difficulty: 'Medium',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    icon: '🔢',
    description: 'Fill the 9×9 grid so every row, column and box has 1–9.',
    difficulty: 'Easy–Hard',
    color: 'from-violet-400 to-purple-500',
    bgLight: 'bg-violet-50',
  },
  {
    id: '2048',
    name: '2048',
    icon: '🎯',
    description: 'Slide and merge tiles to reach the 2048 tile!',
    difficulty: 'Medium',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
  },
  {
    id: 'flip_learn',
    name: 'Flip & Learn',
    icon: '📚',
    description: 'Flashcards based on your interests — flip to learn!',
    difficulty: 'Easy',
    color: 'from-sky-400 to-blue-500',
    bgLight: 'bg-sky-50',
  },
];

// ─── Memory Match Emojis ─────────────────────────────────────────────
export const memoryEmojis = [
  '🌸', '🦋', '🌺', '🍀', '🌈', '⭐', '🎀', '💎',
  '🌻', '🍓', '🦄', '🌙', '🎭', '🎪', '🧁', '🎨',
];

// ─── Wordle Word List ────────────────────────────────────────────────
export const wordleWordList = [
  'HAPPY','SMILE','BRAVE','DREAM','GRACE','HEART','LEARN','FOCUS',
  'MUSIC','DANCE','POWER','PEACE','SHINE','BLOOM','LIGHT','SPARK',
  'CLOUD','SWEET','FRESH','GREEN','PLANT','OCEAN','BEACH','VIVID',
  'LUCKY','FLAME','CRISP','TOWER','MANGO','LEMON','APPLE','GRAPE',
  'BREAD','PASTA','SPICE','SUGAR','WATER','JUICE','CREAM','BLEND',
  'CRAFT','PAINT','BRUSH','COLOR','FRAME','CLOTH','STICH','KNEAD',
  'STORY','NOVEL','WRITE','THINK','BUILD','STEAM','DRIVE','QUEST',
  'MAGIC','FROST','STONE','RIVER','MOUNT','FLUTE','PIANO','VIOLA',
  'CORAL','PEARL','AMBER','IVORY','OLIVE','MAUVE','BLUSH','IVORY',
  'FIELD','TRACK','TRAIL','GROVE','FERNS','PETAL','ROOTS','SEEDS',
  'UNITY','VALOR','HONOR','FAITH','TRUST','GLORY','REIGN','REIGN',
  'CHESS','PIXEL','BYTES','CLOUD','FIBER','SOLAR','LUNAR','TERRA',
  'CHARM','JOLLY','MERRY','WITTY','NOBLE','EAGER','CRISP','ADORE',
];

// ─── Flashcard Data ──────────────────────────────────────────────────
export const flashcardData = {
  cooking: [
    { term: 'Julienne', definition: 'A knife cut where food is sliced into thin, uniform matchstick-shaped strips about 3mm × 3mm × 6cm.' },
    { term: 'Blanching', definition: 'Briefly boiling food then plunging it into ice water to stop cooking. Used to preserve color and texture.' },
    { term: 'Deglazing', definition: 'Adding liquid to a hot pan after searing to loosen caramelized bits (fond) from the bottom for a flavorful sauce.' },
    { term: 'Mise en Place', definition: 'A French term meaning "everything in its place" — preparing and organizing all ingredients before cooking.' },
    { term: 'Emulsification', definition: 'Combining two immiscible liquids (like oil and vinegar) into a stable mixture, as in mayonnaise or vinaigrette.' },
    { term: 'Braising', definition: 'A slow-cooking method that first sears food at high heat, then finishes it in a covered pot with liquid at low heat.' },
    { term: 'Caramelization', definition: 'The browning of sugar when heated, creating complex flavors and aromas. Occurs at 160°C (320°F) and above.' },
    { term: 'Al Dente', definition: 'Italian for "to the tooth" — pasta or vegetables cooked firm to the bite, not soft or overcooked.' },
    { term: 'Reduction', definition: 'Simmering a liquid to evaporate water, concentrating flavors and thickening the consistency of sauces.' },
    { term: 'Tempering', definition: 'Gradually raising the temperature of a cold ingredient (like eggs) by slowly adding hot liquid to prevent curdling.' },
    { term: 'Roux', definition: 'A mixture of equal parts fat and flour cooked together, used as a thickening agent for sauces, soups, and stews.' },
    { term: 'Sautéing', definition: 'Cooking food quickly in a small amount of oil over high heat while stirring or tossing frequently.' },
  ],
  gardening: [
    { term: 'Composting', definition: 'The natural process of recycling organic matter (food scraps, leaves) into rich soil amendment called compost.' },
    { term: 'Mulching', definition: 'Covering soil with organic material to retain moisture, suppress weeds, and regulate soil temperature.' },
    { term: 'Pruning', definition: 'Selectively removing plant parts (branches, buds, roots) to improve structure, health, and fruit production.' },
    { term: 'Deadheading', definition: 'Removing spent flowers to encourage new blooms and prevent the plant from putting energy into seed production.' },
    { term: 'Companion Planting', definition: 'Growing certain plants together for mutual benefits — pest control, pollination, or maximizing garden space.' },
    { term: 'Hardening Off', definition: 'Gradually exposing indoor-grown seedlings to outdoor conditions before transplanting to prevent shock.' },
    { term: 'Soil pH', definition: 'A measure of soil acidity/alkalinity (0–14 scale). Most vegetables thrive in slightly acidic soil (pH 6.0–7.0).' },
    { term: 'Perennial vs Annual', definition: 'Perennials live for 3+ years and regrow each spring. Annuals complete their life cycle in one growing season.' },
    { term: 'Bolting', definition: 'When a plant prematurely produces flowers and seeds, usually due to heat stress. Common in lettuce and spinach.' },
    { term: 'Succession Planting', definition: 'Staggering plantings every few weeks to ensure a continuous harvest throughout the growing season.' },
    { term: 'Germination', definition: 'The process by which a seed develops into a new plant. Requires proper moisture, temperature, and sometimes light.' },
    { term: 'Transplanting', definition: 'Moving a plant from one growing location to another, typically from a pot or seedbed into garden soil.' },
  ],
  digital_skills: [
    { term: 'HTML', definition: 'HyperText Markup Language — the standard language for creating web page structure using elements like headings, paragraphs, and links.' },
    { term: 'CSS', definition: 'Cascading Style Sheets — a language that controls the visual presentation of HTML elements (colors, fonts, layouts).' },
    { term: 'JavaScript', definition: 'A programming language that makes web pages interactive. Runs in the browser and can manipulate page content dynamically.' },
    { term: 'API', definition: 'Application Programming Interface — a set of rules allowing different software applications to communicate with each other.' },
    { term: 'Responsive Design', definition: 'An approach to web design that makes pages look good on all devices by using flexible layouts and media queries.' },
    { term: 'Version Control (Git)', definition: 'A system that tracks changes to files over time. Git is the most popular, allowing collaboration and history tracking.' },
    { term: 'Database', definition: 'An organized collection of data stored electronically. SQL databases use tables; NoSQL databases use documents or key-value pairs.' },
    { term: 'Cloud Computing', definition: 'Delivering computing services (servers, storage, databases) over the internet instead of using local hardware.' },
    { term: 'Cybersecurity', definition: 'The practice of protecting systems, networks, and data from digital attacks, unauthorized access, and damage.' },
    { term: 'SEO', definition: 'Search Engine Optimization — techniques to improve a website\'s visibility and ranking in search engine results pages.' },
    { term: 'DNS', definition: 'Domain Name System — translates human-readable domain names (google.com) into IP addresses that computers use to identify each other.' },
    { term: 'HTTPS', definition: 'HTTP Secure — an encrypted version of HTTP that uses SSL/TLS to secure communication between browser and server.' },
  ],
};
