/**
 * Plans Routes
 * POST /api/plans - Create and save a new plan
 * GET /api/plans - Get all user plans
 * GET /api/plans/:planId - Get a specific plan
 * PUT /api/plans/:planId - Update plan status
 * DELETE /api/plans/:planId - Delete a plan
 */

import { Router, Response } from 'express';
import {
  GeneratePlanSchema,
  SavePlanSchema,
} from '../schemas/validation.schema';
import { PlanService } from '../services/plan.service';
import { PlanGeneratorService } from '../services/plan-generator.service';
import {
  verifyAuth,
  AuthRequest,
} from '../middleware/auth.middleware';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * POST /api/plans
 * Generate and save a new memorization plan
 */
router.post(
  '/',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, 'User not found', 'AUTH_ERROR');
    }

    const validated = GeneratePlanSchema.parse(req.body);

    // Generate the plan
    const plan = PlanGeneratorService.generatePlan(
      req.user.id,
      validated.surahNumber,
      validated.startVerse,
      validated.endVerse,
      validated.durationDays,
      validated.planName
    );

    // Save to database
    const result = await PlanService.savePlan(req.user.id, plan);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to save plan',
        'SAVE_ERROR'
      );
    }

    res.status(201).json({
      success: true,
      message: 'Plan created and saved successfully',
      plan: result.plan,
    });
  })
);

/**
 * GET /api/plans
 * Get all plans for the current user
 */
router.get(
  '/',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, 'User not found', 'AUTH_ERROR');
    }

    const { status } = req.query;

    const result = await PlanService.getUserPlans(
      req.user.id,
      status as any
    );

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to fetch plans',
        'FETCH_ERROR'
      );
    }

    const plans = result.plans ?? [];
    res.json({
      success: true,
      plans,
      total: plans.length,
    });
  })
);

/**
 * GET /api/plans/:planId
 * Get a specific plan
 */
router.get(
  '/:planId',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.params;

    const result = await PlanService.getPlan(planId);

    if (!result.success) {
      throw new ApiError(
        404,
        result.error || 'Plan not found',
        'NOT_FOUND'
      );
    }

    // Verify ownership
    if (result.plan.user_id !== req.user?.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    res.json({
      success: true,
      plan: result.plan,
    });
  })
);

/**
 * PUT /api/plans/:planId
 * Update plan status
 */
router.put(
  '/:planId',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'completed', 'paused', 'abandoned'].includes(status)) {
      throw new ApiError(400, 'Invalid status', 'INVALID_STATUS');
    }

    // Check ownership
    const planResult = await PlanService.getPlan(planId);
    if (!planResult.success || planResult.plan.user_id !== req.user?.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    const result = await PlanService.updatePlanStatus(planId, status);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to update plan',
        'UPDATE_ERROR'
      );
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      plan: result.plan,
    });
  })
);

/**
 * DELETE /api/plans/:planId
 * Delete a plan
 */
router.delete(
  '/:planId',
  verifyAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { planId } = req.params;

    // Check ownership
    const planResult = await PlanService.getPlan(planId);
    if (!planResult.success || planResult.plan.user_id !== req.user?.id) {
      throw new ApiError(403, 'Unauthorized', 'FORBIDDEN');
    }

    const result = await PlanService.deletePlan(planId);

    if (!result.success) {
      throw new ApiError(
        500,
        result.error || 'Failed to delete plan',
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
