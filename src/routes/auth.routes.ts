/**
 * Authentication Routes
 * POST /api/auth/signup
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET /api/auth/profile
 */

import { Router, Response } from 'express';
import { SignupSchema, LoginSchema } from '../schemas/validation.schema';
import { UserService } from '../services/user.service';
import {
  verifyAuth,
  AuthRequest,
} from '../middleware/auth.middleware';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = SignupSchema.parse(req.body);
    const result = await UserService.signup(validated);

    if (!result.success) {
      throw new ApiError(400, result.error || 'Signup failed', 'SIGNUP_ERROR');
    }

    res.status(201).json({
      success: true,
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
      },
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = LoginSchema.parse(req.body);
    const result = await UserService.login(validated);

    if (!result.success) {
      throw new ApiError(401, result.error || 'Login failed', 'LOGIN_ERROR');
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      session: {
        accessToken: result.session?.access_token,
        refreshToken: result.session?.refresh_token,
        expiresIn: result.session?.expires_in,
      },
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await UserService.logout();

    if (!result.success) {
      throw new ApiError(400, result.error || 'Logout failed', 'LOGOUT_ERROR');
    }

    res.json({
      success: true,
      message: result.message,
    });
  })
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get(
  '/profile',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, 'User not found', 'AUTH_ERROR');
    }

    const result = await UserService.getUserProfile(req.user.id);

    if (!result.success) {
      throw new ApiError(404, result.error || 'Profile not found', 'NOT_FOUND');
    }

    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.full_name,
        language: result.user.language,
      },
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, 'User not found', 'AUTH_ERROR');
    }

    const { fullName, language } = req.body;
    const result = await UserService.updateUserProfile(req.user.id, {
      full_name: fullName,
      language,
    });

    if (!result.success) {
      throw new ApiError(
        400,
        result.error || 'Failed to update profile',
        'UPDATE_ERROR'
      );
    }

    res.json({
      success: true,
      user: result.user,
    });
  })
);

export default router;
