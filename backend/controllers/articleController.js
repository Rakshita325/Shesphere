const Article = require('../models/Article');
const ArticleLike = require('../models/ArticleLike');
const ArticleComment = require('../models/ArticleComment');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const INTEREST_TO_CATEGORY_MAP = {
  'cooking': 'Cooking',
  'Cooking': 'Cooking',
  'arts_crafts': 'Arts & Crafts',
  'art_craft': 'Arts & Crafts',
  'Arts & Crafts': 'Arts & Crafts',
  'Art & Craft': 'Arts & Crafts',
  'gardening': 'Gardening',
  'Gardening': 'Gardening',
  'sewing_fashion': 'Sewing & Fashion',
  'Sewing & Fashion': 'Sewing & Fashion',
  'digital_skills': 'Digital Skills',
  'digital_design': 'Digital Skills',
  'Digital Skills': 'Digital Skills',
  'Digital Design': 'Digital Skills',
  'health_fitness': 'Health & Fitness',
  'Health & Fitness': 'Health & Fitness',
  'music_instruments': 'Music & Instruments',
  'Music & Instruments': 'Music & Instruments',
  'skincare': 'Skincare',
  'skin_care': 'Skincare',
  'Skincare': 'Skincare',
  'Skin Care': 'Skincare'
};

// Seed default articles if collection is empty
const seedDefaultArticles = async () => {
  try {
    const count = await Article.countDocuments();
    if (count === 0) {
      const defaultUser = await User.findOne({});
      const authorId = defaultUser ? defaultUser._id : null;

      if (!authorId) return;

      const starterArticles = [
        {
          title: '5 Easy Evening Snacks & Quick Baking Recipes',
          coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
          content: `Cooking nutritious and delicious evening snacks doesn't have to take hours. Here are 5 quick, crowd-pleasing recipes:

1. **Crispy Eggless Vegetable Cutlets**: Mash boiled potatoes, carrots, and peas with spices, shape into patties, roll in breadcrumbs, and shallow fry.
2. **Baked Herb Garlic Breadsticks**: Roll dough, brush with garlic butter and parsley, bake till golden.
3. **Paneer Tikka Skewers**: Marinate paneer cubes in spiced yogurt, roast on a pan.
4. **Sweet Corn Chaat**: Toss steamed corn with butter, lemon juice, chaat masala, and cilantro.
5. **Instant Oats & Banana Muffins**: Blend oats, ripe bananas, milk, and dark chocolate chips. Bake for 15 minutes!`,
          category: 'Cooking',
          author: authorId,
          source: 'SheSphere Culinary Hub',
          publishedAt: new Date()
        },
        {
          title: 'Beginner DIY Handmade Home Decor Crafts',
          coverImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
          content: `Transforming your living space with handmade art is satisfying and eco-friendly.

### Simple Craft Ideas:
- **Macrame Wall Hanging**: Use cotton cord and a wooden branch to knot an intricate wall hanging.
- **Upcycled Glass Jar Vases**: Paint old pasta sauce jars with pastel acrylics and wrap jute twine around the neck.
- **Hand-Poured Soy Candles**: Melt natural soy wax, add essential oils like lavender or vanilla, and pour into ceramic teacups.`,
          category: 'Arts & Crafts',
          author: authorId,
          source: 'Craft & Design Studio',
          publishedAt: new Date()
        },
        {
          title: '5 Tips for Sustainable Terrace & Indoor Gardening',
          coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
          content: `Sustainable gardening works with nature to create thriving plants:

1. **Compost Organic Kitchen Scraps**: Turn vegetable peels and coffee grounds into rich soil nutrients.
2. **Mulching for Moisture Retention**: Layer dry leaves or straw to preserve water during hot afternoons.
3. **Rainwater Harvesting**: Collect rainwater for chlorine-free plant watering.
4. **Native Pollinator Plants**: Grow marigolds and basil to attract bees and butterflies naturally.`,
          category: 'Gardening',
          author: authorId,
          source: 'SheSphere Wellness Team',
          publishedAt: new Date()
        },
        {
          title: 'Building Your First Simple Dress & Tailoring Essentials',
          coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
          content: `Sewing your own custom clothing is an empowering creative skill.

### Step-by-Step Shift Dress Guide:
1. **Take Accurate Bust & Hip Measurements**.
2. **Cut Front & Back Fabric Panels** with 1.5cm seam allowances.
3. **Stitch Shoulder & Side Seams** cleanly using a straight stitch.
4. **Hem Neckline & Bottom Edges** twice for a refined finish.`,
          category: 'Sewing & Fashion',
          author: authorId,
          source: 'Craft & Couture Guild',
          publishedAt: new Date()
        },
        {
          title: 'Digital Safety, UPI & Smartphone Masterclass for Women',
          coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
          content: `Empower yourself with daily digital safety essentials:

1. **Never Share UPI PIN When Receiving Money**: You only enter a PIN when paying out.
2. **Enable Two-Factor Authentication (2FA)** on all banking and email logins.
3. **Recognize Phishing Links**: Avoid clicking suspicious SMS or WhatsApp payment links.`,
          category: 'Digital Skills',
          author: authorId,
          source: 'Digital Literacy Initiative',
          publishedAt: new Date()
        },
        {
          title: 'Gentle Morning Yoga Routine & Daily Home Fitness',
          coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
          content: `A 15-minute daily yoga stretch improves flexibility, posture, and mental peace:

- **Cat-Cow Stretch**: Gently warm up your spine and relieve back stiffness.
- **Downward Facing Dog**: Stretch hamstrings and energize your whole body.
- **Child's Pose**: Restorative posture for deep breathing and stress relief.`,
          category: 'Health & Fitness',
          author: authorId,
          source: 'SheSphere Holistic Health',
          publishedAt: new Date()
        },
        {
          title: 'Beginner Harmonium & Vocal Practice Essentials',
          coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
          content: `Mastering basic musical notes (Swaras) improves vocal clarity and instrumental expression:

- **Sa Re Ga Ma Pa Dha Ni Sa**: Practice slow long-sustained notes with steady breathing.
- **Finger Alignment**: Keep wrists soft and relaxed on the harmonium keyboard.`,
          category: 'Music & Instruments',
          author: authorId,
          source: 'Harmonious Melodies Guild',
          publishedAt: new Date()
        },
        {
          title: 'Natural Glowing Skincare & DIY Home Remedies',
          coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
          content: `Nourish your skin using gentle, kitchen-fresh ingredients:

- **Turmeric & Ubtan Face Pack**: Mix Gram Flour (Besan), pinch of turmeric, and raw milk for radiant skin.
- **Aloe Vera Hydration**: Apply fresh aloe gel to soothe sun exposure and lock in moisture.`,
          category: 'Skincare',
          author: authorId,
          source: 'Natural Glow Beauty Team',
          publishedAt: new Date()
        }
      ];

      await Article.insertMany(starterArticles);
      console.log('✅ Seeded 8 starter articles for all categories in MongoDB');
    }
  } catch (error) {
    console.error('❌ Error seeding starter articles:', error.message);
  }
};

/**
 * @desc    Get articles strictly filtered by user's current selected interest
 * @route   GET /api/articles
 * @access  Public / Private
 */
const getArticles = async (req, res) => {
  try {
    await seedDefaultArticles();

    let query = {};
    let userInterest = '';
    let targetCategory = null;

    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user && user.interest) {
        userInterest = user.interest;
        targetCategory = INTEREST_TO_CATEGORY_MAP[userInterest] || userInterest;
        if (targetCategory) {
          query = { category: targetCategory };
        }
      }
    }

    const articles = await Article.find(query)
      .populate('author', 'fullName profilePicture email')
      .sort({ createdAt: -1 });

    let likedArticleIds = new Set();
    if (req.user && req.user.id) {
      const userLikes = await ArticleLike.find({
        user: req.user.id,
        article: { $in: articles.map(a => a._id) }
      });
      likedArticleIds = new Set(userLikes.map(l => l.article.toString()));
    }

    const formatted = articles.map(article => {
      const a = article.toObject();
      return {
        ...a,
        isLiked: likedArticleIds.has(a._id.toString())
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      userInterest: userInterest || 'None selected',
      matchedCategory: targetCategory || 'All',
      data: formatted
    });
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching articles'
    });
  }
};

/**
 * @desc    Get single article by ID
 * @route   GET /api/articles/:articleId
 * @access  Public / Private
 */
const getArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId).populate('author', 'fullName profilePicture email');
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    let isLiked = false;
    if (req.user && req.user.id) {
      const existingLike = await ArticleLike.findOne({ user: req.user.id, article: articleId });
      isLiked = !!existingLike;
    }

    const likesCount = await ArticleLike.countDocuments({ article: articleId });
    const commentsCount = await ArticleComment.countDocuments({ article: articleId });

    return res.status(200).json({
      success: true,
      data: {
        ...article.toObject(),
        isLiked,
        likesCount,
        commentsCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching article:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching article'
    });
  }
};

/**
 * @desc    Create a new article
 * @route   POST /api/articles
 * @access  Private
 */
const createArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, category, source, coverImage } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Article title is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Article content is required'
      });
    }

    let finalCoverImage = coverImage || '';
    let additionalImages = [];

    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      finalCoverImage = await uploadToCloudinary(
        req.files.coverImage[0].buffer,
        'shesphere_articles',
        req.files.coverImage[0].mimetype
      );
    }

    if (req.files && req.files.additionalImages) {
      for (const file of req.files.additionalImages) {
        const url = await uploadToCloudinary(
          file.buffer,
          'shesphere_articles',
          file.mimetype
        );
        additionalImages.push(url);
      }
    }

    const article = await Article.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      coverImage: finalCoverImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
      images: additionalImages,
      author: userId,
      source: source || ''
    });

    await article.populate('author', 'fullName profilePicture email');

    await User.findByIdAndUpdate(userId, { $inc: { xp: 25 } });

    return res.status(201).json({
      success: true,
      message: 'Article published successfully',
      data: article
    });
  } catch (error) {
    console.error('❌ Error creating article:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating article'
    });
  }
};

/**
 * @desc    Toggle like / unlike on an article
 * @route   POST /api/articles/:articleId/like
 * @access  Private
 */
const toggleArticleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const existingLike = await ArticleLike.findOne({ user: userId, article: articleId });
    let isLiked = false;

    if (existingLike) {
      await ArticleLike.findOneAndDelete({ user: userId, article: articleId });
      article.likesCount = Math.max(0, article.likesCount - 1);
      await article.save();
    } else {
      await ArticleLike.create({ user: userId, article: articleId });
      article.likesCount += 1;
      await article.save();
      isLiked = true;
    }

    const likesCount = await ArticleLike.countDocuments({ article: articleId });

    return res.status(200).json({
      success: true,
      data: {
        articleId: article._id,
        likesCount,
        isLiked
      }
    });
  } catch (error) {
    console.error('❌ Error toggling article like:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while liking article'
    });
  }
};

/**
 * @desc    Get comments for an article
 * @route   GET /api/articles/:articleId/comments
 * @access  Public / Private
 */
const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;

    const comments = await ArticleComment.find({ article: articleId })
      .populate('user', 'fullName profilePicture email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('❌ Error fetching article comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching article comments'
    });
  }
};

/**
 * @desc    Add a comment to an article
 * @route   POST /api/articles/:articleId/comments
 * @access  Private
 */
const addArticleComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const comment = await ArticleComment.create({
      user: userId,
      article: articleId,
      content: content.trim()
    });

    article.commentsCount += 1;
    await article.save();

    await comment.populate('user', 'fullName profilePicture email');

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment
    });
  } catch (error) {
    console.error('❌ Error adding article comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding article comment'
    });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  toggleArticleLike,
  getArticleComments,
  addArticleComment
};
