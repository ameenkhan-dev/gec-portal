/**
 * Setup script for GEC Portal Authentication System
 * Run with: node setup-auth.js
 * 
 * This script creates enhanced authentication files for the GEC Event Portal.
 * It will create directories if they don't exist and overwrite existing auth files.
 */
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

console.log('🔐 GEC Event Portal - Auth System Setup\n');

// Create directories
const dirs = [
    'backend/controllers',
    'backend/routes',
    'frontend/src',
    'frontend/src/context',
    'frontend/src/pages',
    'frontend/src/pages/auth',
    'frontend/src/components',
    'frontend/src/utils'
];

console.log('📁 Creating directories...');
dirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  Created: ${dir}`);
    } else {
        console.log(`  Exists: ${dir}`);
    }
});

// ============================================
// BACKEND FILES
// ============================================

// Auth Controller
const authController = `/**
 * Auth Controller
 * Handles user registration, login, and profile management
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db.config');

// Email validation helper
const isValidCollegeEmail = (email) => {
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'gec.ac.in';
    if (!allowedDomain || allowedDomain === '*') return true;
    
    const emailDomain = email.split('@')[1]?.toLowerCase();
    return emailDomain === allowedDomain.toLowerCase();
};

// Password validation helper
const isValidPassword = (password) => {
    const hasMinLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasLetter && hasNumber;
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'student' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (!isValidCollegeEmail(email)) {
            const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'gec.ac.in';
            return res.status(400).json({
                success: false,
                message: \`Only emails from @\${allowedDomain} domain are allowed\`
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters and contain both letters and numbers'
            });
        }

        const allowedRoles = ['student', 'club_admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be student or club_admin'
            });
        }

        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await query(
            \`INSERT INTO users (name, email, password, role, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())\`,
            [name.trim(), email.toLowerCase(), hashedPassword, role]
        );

        const userId = result.insertId || result[0]?.id;

        const user = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase(),
            role
        };
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: userId,
                    name: name.trim(),
                    email: email.toLowerCase(),
                    role
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const users = await query(
            'SELECT id, name, email, password, role, profile_image, department, year FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);
        delete user.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await query(
            'SELECT id, name, email, role, profile_image, department, year, phone, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user: users[0] }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, department, year, profile_image } = req.body;

        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name.trim());
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }
        if (year !== undefined) {
            updates.push('year = ?');
            values.push(year);
        }
        if (profile_image !== undefined) {
            updates.push('profile_image = ?');
            values.push(profile_image);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updates.push('updated_at = NOW()');
        values.push(userId);

        await query(
            \`UPDATE users SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );

        const users = await query(
            'SELECT id, name, email, role, profile_image, department, year, phone, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: users[0] }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
`;

// Auth Routes
const authRoutes = `/**
 * Auth Routes
 * Authentication endpoints for user registration, login, and profile management
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
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
`;

// ============================================
// FRONTEND FILES
// ============================================

// API Utility
const apiUtil = `/**
 * API Utility
 * Axios instance with interceptors for JWT token handling
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API functions
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};
`;

// Auth Context
const authContext = `/**
 * Auth Context
 * Provides authentication state and functions to the entire app
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getProfile();
                    setUser(response.data.data.user);
                } catch (err) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.login({ email, password });
            const { user: userData, token } = response.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            return { success: true, user: userData };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.register(userData);
            const { user: newUser, token } = response.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            
            return { success: true, user: newUser };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    }, []);

    const updateProfile = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.updateProfile(data);
            const updatedUser = response.data.data.user;
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            return { success: true, user: updatedUser };
        } catch (err) {
            const message = err.response?.data?.message || 'Update failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
`;

// Login Page
const loginPage = `/**
 * Login Page
 * User authentication with email and password
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Divider
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = location.state?.from?.pathname || getDashboardPath(user.role);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const getDashboardPath = (role) => {
        switch (role) {
            case 'admin':
                return '/admin';
            case 'club_admin':
                return '/club';
            default:
                return '/dashboard';
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        const result = await login(formData.email, formData.password);
        setIsSubmitting(false);
        
        if (result.success) {
            const from = location.state?.from?.pathname || getDashboardPath(result.user.role);
            navigate(from, { replace: true });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 450,
                    width: '100%',
                    borderRadius: 2
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sign in to GEC Event Portal
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!formErrors.password}
                        helperText={formErrors.password}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <LoginIcon />}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        New to GEC Portal?
                    </Typography>
                </Divider>

                <Button
                    fullWidth
                    component={Link}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{ py: 1.5 }}
                >
                    Create an Account
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
`;

// Register Page
const registerPage = `/**
 * Register Page
 * New user registration with validation
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Divider,
    MenuItem,
    LinearProgress
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    HowToReg as RegisterIcon,
    Badge as RoleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'gec.ac.in';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, user, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(getDashboardPath(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const getDashboardPath = (role) => {
        switch (role) {
            case 'admin':
                return '/admin';
            case 'club_admin':
                return '/club';
            default:
                return '/dashboard';
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: 'grey' };
        
        let score = 0;
        if (password.length >= 6) score += 25;
        if (password.length >= 8) score += 25;
        if (/[a-zA-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        
        if (score <= 25) return { score, label: 'Weak', color: 'error' };
        if (score <= 50) return { score, label: 'Fair', color: 'warning' };
        if (score <= 75) return { score, label: 'Good', color: 'info' };
        return { score, label: 'Strong', color: 'success' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        } else if (ALLOWED_DOMAIN && ALLOWED_DOMAIN !== '*') {
            const emailDomain = formData.email.split('@')[1]?.toLowerCase();
            if (emailDomain !== ALLOWED_DOMAIN.toLowerCase()) {
                errors.email = \`Only @\${ALLOWED_DOMAIN} emails are allowed\`;
            }
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else if (!/[a-zA-Z]/.test(formData.password)) {
            errors.password = 'Password must contain at least one letter';
        } else if (!/[0-9]/.test(formData.password)) {
            errors.password = 'Password must contain at least one number';
        }
        
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        const result = await register({
            name: formData.name.trim(),
            email: formData.email.toLowerCase(),
            password: formData.password,
            role: formData.role
        });
        setIsSubmitting(false);
        
        if (result.success) {
            navigate(getDashboardPath(result.user.role), { replace: true });
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
                py: 4
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: 2
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Create Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Join GEC Event Portal
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email || \`Use your @\${ALLOWED_DOMAIN} email\`}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <RoleIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="club_admin">Club Admin</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!formErrors.password}
                        helperText={formErrors.password || 'Min 6 characters with letters and numbers'}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    {formData.password && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Password Strength
                                </Typography>
                                <Typography variant="caption" color={\`\${passwordStrength.color}.main\`}>
                                    {passwordStrength.label}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={passwordStrength.score}
                                color={passwordStrength.color}
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <RegisterIcon />}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?
                    </Typography>
                </Divider>

                <Button
                    fullWidth
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{ py: 1.5 }}
                >
                    Sign In
                </Button>
            </Paper>
        </Box>
    );
};

export default Register;
`;

// Protected Route Component
const protectedRoute = `/**
 * Protected Route Component
 * Restricts access to authenticated users with specific roles
 */
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default'
                }}
            >
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardPath = getDashboardPath(user?.role);
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

// Helper to get dashboard path based on role
const getDashboardPath = (role) => {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'club_admin':
            return '/club';
        default:
            return '/dashboard';
    }
};

export default ProtectedRoute;

// Higher-order component for role-based access
export const withAuth = (Component, allowedRoles = []) => {
    return function AuthenticatedComponent(props) {
        return (
            <ProtectedRoute allowedRoles={allowedRoles}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
};

// Role-specific route components
export const StudentRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['student', 'admin']}>
        {children}
    </ProtectedRoute>
);

export const ClubAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['club_admin', 'admin']}>
        {children}
    </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin']}>
        {children}
    </ProtectedRoute>
);
`;

// Write files
console.log('\n📝 Creating auth files...');
const files = {
    'backend/controllers/authController.js': authController,
    'backend/routes/auth.js': authRoutes,
    'frontend/src/utils/api.js': apiUtil,
    'frontend/src/context/AuthContext.jsx': authContext,
    'frontend/src/pages/auth/Login.jsx': loginPage,
    'frontend/src/pages/auth/Register.jsx': registerPage,
    'frontend/src/components/ProtectedRoute.jsx': protectedRoute
};

Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(baseDir, filePath);
    fs.writeFileSync(fullPath, content);
    console.log(`  Created: ${filePath}`);
});

console.log('\n✅ Auth system files created successfully!');
console.log('\n📋 Setup Complete! Next steps:');
console.log('');
console.log('1. Backend .env is already configured with ALLOWED_EMAIL_DOMAIN');
console.log('2. server.js is already configured to use auth routes');
console.log('3. Frontend .env is already configured');
console.log('');
console.log('To start the application:');
console.log('  cd backend && npm install && npm run dev');
console.log('  cd frontend && npm install && npm run dev');
console.log('');
console.log('🔗 API Endpoints:');
console.log('  POST /api/auth/register - Register new user');
console.log('  POST /api/auth/login    - Login user');
console.log('  GET  /api/auth/profile  - Get profile (protected)');
console.log('  PUT  /api/auth/profile  - Update profile (protected)');
console.log('');
