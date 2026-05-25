/**
 * User Service Layer
 * Handles all user-related database operations
 */

import { supabaseAdmin, supabaseClient } from '../database/supabase';
import { SignupRequest, LoginRequest } from '../schemas/validation.schema';

export class UserService {
  /**
   * Create a new user with authentication
   */
  static async signup(data: SignupRequest) {
    try {
      // Create auth user
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true, // Automatically confirm email
          user_metadata: {
            full_name: data.fullName,
            language: data.language,
          },
        });

      if (authError) throw authError;

      // Create user profile
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          language: data.language,
        })
        .select()
        .single();

      if (userError) throw userError;

      return {
        success: true,
        user: userData,
        message: 'User created successfully. Please check your email.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }

  /**
   * Login user with email and password
   */
  static async login(data: LoginRequest) {
    try {
      const { data: sessionData, error } =
        await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) throw error;

      return {
        success: true,
        session: sessionData.session,
        user: sessionData.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to login',
      };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { success: true, user: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch user profile',
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: { full_name?: string; language?: string }
  ) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, user: data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update user profile',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout() {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to logout',
      };
    }
  }
}
