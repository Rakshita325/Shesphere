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
const profileRoutes = require('./routes/profileRoutes');
const communityRoutes = require('./routes/communityRoutes');
const articleRoutes = require('./routes/articleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { seedCommunities } = require('./controllers/communityController');
const { trainAndClusterUsers } = require('./services/ml/kmeansService');
const { createNotification } = require('./services/notificationService');
const { getFormattedDate, getYesterdayDate } = require('./utils/updateStreak');

const app = express();
const PORT = process.env.PORT || 8008;

// Connect to MongoDB using config/db.js
connectDB().then(() => {
    seedCommunities();

    // ─── Auto K-Means Clustering Scheduler ────────────────────────────────────
    // Run once at startup (after 5s delay so all models are loaded) then every 24h.
    // Gracefully no-ops when fewer than 3 users exist (cold-start phase).
    const runKMeans = async () => {
        console.log('🔄 [Scheduler] Running K-Means clustering update...');
        const result = await trainAndClusterUsers();
        if (result.success) {
            console.log(`✅ [Scheduler] K-Means: ${result.userCount} users → ${result.k} clusters`);
        } else {
            console.log(`ℹ️ [Scheduler] K-Means skipped: ${result.message}`);
        }
    };

    // Initial run after 5 seconds
    setTimeout(runKMeans, 5000);

    // Repeat every 24 hours
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(runKMeans, TWENTY_FOUR_HOURS);

    // ─── Streak At-Risk Reminder Scheduler ────────────────────────────────────
    const checkStreakReminders = async () => {
        try {
            const today = getFormattedDate();
            const yesterday = getYesterdayDate();

            const atRiskUsers = await User.find({
                streak: { $gt: 0 },
                lastActiveDate: yesterday
            });

            for (const user of atRiskUsers) {
                const alreadyNotified = await Notification.findOne({
                    userId: user._id,
                    type: 'STREAK',
                    'metadata.reminderDate': today
                });

                if (!alreadyNotified) {
                    await createNotification({
                        userId: user._id,
                        type: 'STREAK',
                        title: "Don't Lose Your Streak! 🔥",
                        message: `You are on a ${user.streak}-day streak! Complete an activity today to keep it going.`,
                        metadata: { reminderDate: today }
                    });
                }
            }
        } catch (err) {
            console.error('❌ [Streak Reminder Scheduler] Error:', err.message);
        }
    };

    setTimeout(checkStreakReminders, 10000);
    setInterval(checkStreakReminders, 60 * 60 * 1000);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/marketplace/payment', paymentRoutes);  // Must be before /orders to avoid route collision
app.use('/api/marketplace/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/recommendations', recommendationRoutes);

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
