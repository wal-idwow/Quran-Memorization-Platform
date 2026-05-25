/**
 * Zod Validation Schemas
 * Define request/response validation for all API endpoints
 */

import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  language: z.enum(['en', 'ar']).default('en'),
});

export type SignupRequest = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

// ============================================
// PLAN SCHEMAS
// ============================================

export const GeneratePlanSchema = z.object({
  surahNumber: z.number().min(1).max(114, 'Invalid Surah number'),
  startVerse: z.number().min(1, 'Start verse must be positive'),
  endVerse: z.number().min(1, 'End verse must be positive'),
  durationDays: z.number().min(7).max(365, 'Duration must be 7-365 days'),
  planName: z.string().min(3, 'Plan name is required').optional(),
});

export type GeneratePlanRequest = z.infer<typeof GeneratePlanSchema>;

export const SavePlanSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  surahNumber: z.number(),
  startVerse: z.number(),
  endVerse: z.number(),
  durationDays: z.number(),
  planName: z.string().optional(),
});

export type SavePlanRequest = z.infer<typeof SavePlanSchema>;

// ============================================
// PROGRESS SCHEMAS
// ============================================

export const LogProgressSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  day: z.number().min(1, 'Day must be positive'),
  sabaqCompleted: z.boolean(),
  sabaqVerses: z.number().min(0).optional(),
  sabaqRetentionScore: z.number().min(0).max(100, 'Score must be 0-100'),
  manzilCompleted: z
    .array(
      z.object({
        surah: z.number(),
        startVerse: z.number(),
        endVerse: z.number(),
      })
    )
    .default([]),
  manzilRetentionScores: z.record(z.number().min(0).max(100)).default({}),
  sessionDuration: z.number().min(0, 'Duration must be positive'),
  notesOrChallenges: z.string().optional(),
});

export type LogProgressRequest = z.infer<typeof LogProgressSchema>;

export const ProgressFilterSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type ProgressFilterRequest = z.infer<typeof ProgressFilterSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
