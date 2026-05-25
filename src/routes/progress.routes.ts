/**
 * Progress Routes
 * POST /api/progress/log - Log daily progress
 * GET /api/progress/:planId - Get plan progress
 * GET /api/progress/:planId/stats - Get plan statistics
 * DELETE /api/progress/:progressId - Delete a progress log
 */

import { Router, Response } from 'express';
import { LogProgressSchema } from '../schemas/validation.schema';
import { ProgressService } from '../services/progress.service';
import {
  verifyAuth,
  AuthRequest,
} from '../middleware/auth.middleware';
import { ApiError, asyncHandler } from '../middleware/error.middleware';
import { PlanService } from '../services/plan.service';

const router = Router();

/**
 * POST /api/progress/log
 * Log daily progress for a plan
 */
router.post(
  '/log',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, 'User not found', 'AUTH_ERROR');
    }

    const validated = LogProgressSchema.parse(req.body);

    // Verify plan ownership
    const planResult = await PlanService.getPlan(validated.planId);
    if (!planResult.success || planResult.plan.user_id !== req.user.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    const result = await ProgressService.logProgress(req.user.id, validated);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to log progress',
        'LOG_ERROR'
      );
    }

    res.status(201).json({
      success: true,
      message: result.message,
      progress: result.progress,
      streak: result.streak,
    });
  })
);

/**
 * GET /api/progress/:planId
 * Get progress logs for a plan
 */
router.get(
  '/:planId',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    // Verify plan ownership
    const planResult = await PlanService.getPlan(planId);
    if (!planResult.success || planResult.plan.user_id !== req.user?.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    const result = await ProgressService.getPlanProgress(
      planId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to fetch progress',
        'FETCH_ERROR'
      );
    }

    res.json({
      success: true,
      progress: result.progress,
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    });
  })
);

/**
 * GET /api/progress/:planId/stats
 * Get statistics for a plan
 */
router.get(
  '/:planId/stats',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.params;

    // Verify plan ownership
    const planResult = await PlanService.getPlan(planId);
    if (!planResult.success || planResult.plan.user_id !== req.user?.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    const result = await ProgressService.getPlanStatistics(planId);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to fetch statistics',
        'FETCH_ERROR'
      );
    }

    res.json({
      success: true,
      stats: result.stats,
    });
  })
);

/**
 * DELETE /api/progress/:progressId
 * Delete a progress log
 */
router.delete(
  '/:progressId',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { progressId } = req.params;

    // TODO: Verify ownership by checking associated plan
    const result = await ProgressService.deleteProgress(progressId);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to delete progress',
        'DELETE_ERROR'
      );
    }

    res.json({
      success: true,
      message: result.message,
    });
  })
);

export default router;
