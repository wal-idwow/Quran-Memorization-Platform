/**
 * Plans Service Layer
 * Handles memorization plan storage and retrieval
 */

import { supabaseClient } from '../database/supabase';
import { MemorizationPlan } from '../types/memorization-plan.types';

export class PlanService {
  /**
   * Save a generated plan to the database
   */
  static async savePlan(userId: string, plan: MemorizationPlan) {
    try {
      const { data, error } = await supabaseClient
        .from('plans')
        .insert({
          user_id: userId,
          plan_name: plan.planName,
          plan_data: plan,
          surah_number: plan.targetSurah.number,
          start_verse: plan.dailyTargets[0]?.sabaq.startVerse || 1,
          end_verse:
            plan.dailyTargets[plan.dailyTargets.length - 1]?.sabaq.endVerse ||
            plan.targetSurah.totalVerses,
          duration_days: plan.totalDays,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, plan: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to save plan',
      };
    }
  }

  /**
   * Get a single plan by ID
   */
  static async getPlan(planId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;

      return { success: true, plan: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch plan',
      };
    }
  }

  /**
   * Get all plans for a user
   */
  static async getUserPlans(
    userId: string,
    status?: 'active' | 'completed' | 'paused' | 'abandoned'
  ) {
    try {
      let query = supabaseClient.from('plans').select('*').eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;

      return { success: true, plans: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch plans',
      };
    }
  }

  /**
   * Update plan status
   */
  static async updatePlanStatus(
    planId: string,
    status: 'active' | 'completed' | 'paused' | 'abandoned'
  ) {
    try {
      const { data, error } = await supabaseClient
        .from('plans')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, plan: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update plan',
      };
    }
  }

  /**
   * Update plan data (for progress tracking)
   */
  static async updatePlanData(planId: string, planData: MemorizationPlan) {
    try {
      const { data, error } = await supabaseClient
        .from('plans')
        .update({
          plan_data: planData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, plan: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update plan',
      };
    }
  }

  /**
   * Delete a plan
   */
  static async deletePlan(planId: string) {
    try {
      const { error } = await supabaseClient
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      return { success: true, message: 'Plan deleted successfully' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete plan',
      };
    }
  }
}
