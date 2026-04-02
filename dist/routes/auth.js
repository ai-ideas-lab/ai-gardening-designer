"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
// Login endpoint
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email and password are required', 400, true);
    }
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401, true);
    }
    // Verify password
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401, true);
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    const response = {
        success: true,
        data: {
            user: userWithoutPassword,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Register endpoint
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, username, name, location, balconyType, balconySize, balconyDirection } = req.body;
    // Validate input
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email and password are required', 400, true);
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw (0, errorHandler_1.createError)('User with this email already exists', 409, true);
    }
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
    // Create new user
    const user = await prisma.user.create({
        data: {
            email,
            username,
            name,
            location,
            balconyType,
            balconySize: balconySize ? parseFloat(balconySize.toString()) : null,
            balconyDirection,
            password: hashedPassword
        }
    });
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    const response = {
        success: true,
        data: {
            user: userWithoutPassword,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        },
        message: 'Registration successful',
        timestamp: new Date().toISOString()
    };
    res.status(201).json(response);
}));
// Get current user endpoint
router.get('/me', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw (0, errorHandler_1.createError)('Authorization token required', 401, true);
    }
    const token = authHeader.substring(7);
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find user by ID
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 404, true);
        }
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        const response = {
            success: true,
            data: userWithoutPassword,
            timestamp: new Date().toISOString()
        };
        res.json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Invalid token', 401, true);
    }
}));
// Update user profile endpoint
router.put('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw (0, errorHandler_1.createError)('Authorization token required', 401, true);
    }
    const token = authHeader.substring(7);
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    const { name, location, balconyType, balconySize, balconyDirection, preferences } = req.body;
    // Update user profile
    const updatedUser = await prisma.user.update({
        where: { id: decoded.id },
        data: {
            name,
            location,
            balconyType,
            balconySize: balconySize ? parseFloat(balconySize.toString()) : null,
            balconyDirection,
            preferences
        }
    });
    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    const response = {
        success: true,
        data: userWithoutPassword,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Change password endpoint
router.put('/password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw (0, errorHandler_1.createError)('Authorization token required', 401, true);
    }
    const token = authHeader.substring(7);
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw (0, errorHandler_1.createError)('Current password and new password are required', 400, true);
    }
    // Find user
    const user = await prisma.user.findUnique({
        where: { id: decoded.id }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404, true);
    }
    // Verify current password
    const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw (0, errorHandler_1.createError)('Current password is incorrect', 401, true);
    }
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
    // Update password
    await prisma.user.update({
        where: { id: decoded.id },
        data: { password: hashedNewPassword }
    });
    const response = {
        success: true,
        message: 'Password updated successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
// Delete user account endpoint
router.delete('/account', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw (0, errorHandler_1.createError)('Authorization token required', 401, true);
    }
    const token = authHeader.substring(7);
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    const { password } = req.body;
    if (!password) {
        throw (0, errorHandler_1.createError)('Password is required to delete account', 400, true);
    }
    // Find user
    const user = await prisma.user.findUnique({
        where: { id: decoded.id }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404, true);
    }
    // Verify password
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.createError)('Password is incorrect', 401, true);
    }
    // Delete user account (cascade will delete related data)
    await prisma.user.delete({
        where: { id: decoded.id }
    });
    const response = {
        success: true,
        message: 'Account deleted successfully',
        timestamp: new Date().toISOString()
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=auth.js.map