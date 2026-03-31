import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { LoginRequest, RegisterRequest, ApiResponse } from '@/types';

const router = Router();
const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password }: LoginRequest = req.body;

  // Validate input
  if (!email || !password) {
    throw createError('Email and password are required', 400, true);
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid credentials', 401, true);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401, true);
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  const response: ApiResponse = {
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
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, username, name, location, balconyType, balconySize, balconyDirection }: RegisterRequest = req.body;

  // Validate input
  if (!email || !password) {
    throw createError('Email and password are required', 400, true);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409, true);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  const response: ApiResponse = {
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
router.get('/me', asyncHandler(async (req, res) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Authorization token required', 401, true);
  }

  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw createError('User not found', 404, true);
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse = {
      success: true,
      data: userWithoutPassword,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    throw createError('Invalid token', 401, true);
  }
}));

// Update user profile endpoint
router.put('/profile', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Authorization token required', 401, true);
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

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

  const response: ApiResponse = {
    success: true,
    data: userWithoutPassword,
    message: 'Profile updated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Change password endpoint
router.put('/password', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Authorization token required', 401, true);
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400, true);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!user) {
    throw createError('User not found', 404, true);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 401, true);
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashedNewPassword }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Password updated successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

// Delete user account endpoint
router.delete('/account', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('Authorization token required', 401, true);
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

  const { password } = req.body;

  if (!password) {
    throw createError('Password is required to delete account', 400, true);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!user) {
    throw createError('User not found', 404, true);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Password is incorrect', 401, true);
  }

  // Delete user account (cascade will delete related data)
  await prisma.user.delete({
    where: { id: decoded.id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Account deleted successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

export default router;