/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '../database/supabase';
import { ApiError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
  token?: string;
}

/**
 * Verify JWT token and attach user to request
 */
export const verifyAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabaseClient.auth.getUser(token);

    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication - doesn't fail if token is missing
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data } = await supabaseClient.auth.getUser(token);

      if (data.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
        };
        req.token = token;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional routes
  }

  next();
};
