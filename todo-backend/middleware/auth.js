const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware for HTTP requests
const authenticateHTTP = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Authentication middleware for WebSocket connections
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.substring(7);
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    // Add user to socket object
    socket.user = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

// Extract user from token (utility function)
const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateHTTP,
  authenticateSocket,
  getUserFromToken
};
