require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const journalRoutes = require('./routes/journalRoutes');
const streakRoutes = require('./routes/streakRoutes');
const gameRoutes = require('./routes/gameRoutes');
const aiRoutes = require('./routes/aiRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 8008;

// Connect to MongoDB using config/db.js
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/marketplace/orders', orderRoutes);

// Health check endpoints
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Test Home Endpoint
app.get('/', (req, res) => {
    res.send('SheSphere Backend API is Running!');
});

// Start the Express Server
app.listen(PORT, () => {
    console.log(`🚀 SheSphere Server running on http://localhost:${PORT}`);
});