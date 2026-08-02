const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes and verify JWT token
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ success: false, message: 'JWT Secret missing in environment configuration' });
      }

      const decoded = jwt.verify(token, jwtSecret);

      // Attach decoded user info to request
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('❌ Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = {
  protect
};
