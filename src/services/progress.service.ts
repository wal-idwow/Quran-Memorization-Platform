/**
 * Progress Service Layer
 * Handles daily progress logging and streak calculations
 */

import { supabaseClient } from '../database/supabase';
import { LogProgressRequest } from '../schemas/validation.schema';
import { PlanService } from './plan.service';

export class ProgressService {
  /**
   * Log daily progress for a plan
   */
  static async logProgress(userId: string, data: LogProgressRequest) {
    try {
      // Get the plan first
      const { success, plan } = await PlanService.getPlan(data.planId);
      if (!success || !plan) {
        throw new Error('Plan not found');
      }

      // Insert progress log
      const { data: progressData, error } = await supabaseClient
        .from('progress_logs')
        .insert({
          plan_id: data.planId,
          user_id: userId,
          day: data.day,
          date: new Date().toISOString().split('T')[0],
          sabaq_completed: data.sabaqCompleted,
          sabaq_verses: data.sabaqVerses || null,
          sabaq_retention_score: data.sabaqRetentionScore,
          manzil_retention_scores: data.manzilRetentionScores,
          session_duration: data.sessionDuration,
          notes: data.notesOrChallenges || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Calculate and update streak
      const streak = await this.calculateStreak(data.planId);

      return {
        success: true,
        progress: progressData,
        streak,
        message: 'Progress logged successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to log progress',
      };
    }
  }

  /**
   * Get progress logs for a plan
   */
  static async getPlanProgress(
    planId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const { data, error, count } = await supabaseClient
        .from('progress_logs')
        .select('*', { count: 'exact' })
        .eq('plan_id', planId)
        .order('day', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        progress: data || [],
        total: count || 0,
        limit,
        offset,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch progress',
      };
    }
  }

  /**
   * Get all progress for a user
   */
  static async getUserProgress(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, progress: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch user progress',
      };
    }
  }

  /**
   * Calculate streak for a plan (consecutive days of completion)
   * Runs automatically when progress is logged
   */
  static async calculateStreak(planId: string): Promise<number> {
    try {
      const { data, error } = await supabaseClient
        .from('progress_logs')
        .select('day, date, sabaq_completed')
        .eq('plan_id', planId)
        .order('day', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) return 0;

      let streak = 0;
      let previousDay = 0;

      for (const log of data) {
        if (!log.sabaq_completed) continue;

        // Check if this is a consecutive day
        if (previousDay === 0 || log.day === previousDay + 1) {
          streak++;
          previousDay = log.day;
        } else {
          // Reset streak if not consecutive
          streak = 1;
          previousDay = log.day;
        }
      }

      return streak;
    } catch (error: any) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Get statistics for a plan
   */
  static async getPlanStatistics(planId: string) {
    try {
      const { data: logs, error } = await supabaseClient
        .from('progress_logs')
        .select('*')
        .eq('plan_id', planId);

      if (error) throw error;

      if (!logs || logs.length === 0) {
        return {
          success: true,
          stats: {
            totalDaysCompleted: 0,
            averageRetentionScore: 0,
            totalSessionMinutes: 0,
            streak: 0,
          },
        };
      }

      const totalDaysCompleted = logs.filter((l) => l.sabaq_completed).length;
      const averageRetentionScore =
        logs.reduce((sum, log) => sum + log.sabaq_retention_score, 0) /
        logs.length;
      const totalSessionMinutes = logs.reduce(
        (sum, log) => sum + log.session_duration,
        0
      );
      const streak = await this.calculateStreak(planId);

      return {
        success: true,
        stats: {
          totalDaysCompleted,
          averageRetentionScore: Math.round(averageRetentionScore),
          totalSessionMinutes,
          streak,
          totalLogsRecorded: logs.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to calculate statistics',
      };
    }
  }

  /**
   * Delete a progress log
   */
  static async deleteProgress(progressId: string) {
    try {
      const { error } = await supabaseClient
        .from('progress_logs')
        .delete()
        .eq('id', progressId);

      if (error) throw error;

      return { success: true, message: 'Progress log deleted' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete progress log',
      };
    }
  }
}
