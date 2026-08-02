const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, phoneNumber, password, confirmPassword } = req.body;

    // Resolve phone number field (handles both 'phoneNumber' and frontend 'mobile')
    const userPhone = phoneNumber || mobile;

    // 1. Required fields validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
        field: 'fullName'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    if (!userPhone || !userPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        field: 'mobile'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        field: 'password'
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm your password',
        field: 'confirmPassword'
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    // 3. Phone number format validation
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(userPhone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number',
        field: 'mobile'
      });
    }

    // 4. Password minimum 8 characters validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
        field: 'password'
      });
    }

    // 5. Confirm Password matching validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        field: 'confirmPassword'
      });
    }

    // 6. Check existing email
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        field: 'email'
      });
    }

    // 7. Check existing phone number
    const existingPhone = await User.findOne({ phoneNumber: userPhone.trim() });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists',
        field: 'mobile'
      });
    }

    // 8. Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 9. Create and save new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: userPhone.trim(),
      password: hashedPassword
    });

    await newUser.save();

    // 10. Generate JWT Token using JWT_SECRET from .env
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 11. Return response without password
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token
    });

  } catch (error) {
    console.error('❌ Signup Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during signup. Please try again later.'
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        field: 'email'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        field: 'password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
        field: 'email'
      });
    }

    // Compare password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
        field: 'password'
      });
    }

    // Generate JWT Token using JWT_SECRET from .env
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login. Please try again later.'
    });
  }
};

/**
 * @desc    Update user profile & interests
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, interest, language, education, age, occupation, dailyFreeTime, profilePicture } = req.body;
    console.log("Request Body:", req.body);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (interest !== undefined) user.interest = interest;
    if (language !== undefined) user.language = language;
    if (education !== undefined) user.education = education;
    if (age !== undefined) user.age = age;
    if (occupation !== undefined) user.occupation = occupation;
    if (dailyFreeTime !== undefined) user.dailyFreeTime = dailyFreeTime;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        language: user.language,
        education: user.education,
        interest: user.interest,
        age: user.age,
        occupation: user.occupation,
        dailyFreeTime: user.dailyFreeTime,
        profilePicture: user.profilePicture

      }
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
  getProfile
};
