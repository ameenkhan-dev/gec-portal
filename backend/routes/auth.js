/**
 * Auth Routes
 * Authentication endpoints for registration, login, profile and logout
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
