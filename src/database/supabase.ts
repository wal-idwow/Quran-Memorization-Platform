/**
 * Supabase Database Client Initialization
 * Handles all database operations with proper error handling
 */

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// WebSocket transport for Node.js < 22 (no native WebSocket support)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const realtimeOptions = { realtime: { transport: ws as any } };

// Public client for frontend/auth
export const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  realtimeOptions
);

// Admin client for server operations
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  realtimeOptions
);

// Export for convenience
export { createClient } from '@supabase/supabase-js';

/**
 * Database Types (auto-generated from schema)
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          language: 'en' | 'ar';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          full_name: string;
          language?: 'en' | 'ar';
        };
        Update: {
          full_name?: string;
          language?: 'en' | 'ar';
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          plan_name: string;
          plan_data: Record<string, any>;
          surah_number: number;
          start_verse: number;
          end_verse: number;
          duration_days: number;
          status: 'active' | 'completed' | 'paused' | 'abandoned';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan_name: string;
          plan_data: Record<string, any>;
          surah_number: number;
          start_verse: number;
          end_verse: number;
          duration_days: number;
          status?: 'active' | 'completed' | 'paused' | 'abandoned';
        };
        Update: {
          plan_name?: string;
          plan_data?: Record<string, any>;
          status?: 'active' | 'completed' | 'paused' | 'abandoned';
          updated_at?: string;
        };
      };
      progress_logs: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          day: number;
          date: string;
          sabaq_completed: boolean;
          sabaq_verses: number | null;
          sabaq_retention_score: number;
          manzil_retention_scores: Record<string, number>;
          session_duration: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          plan_id: string;
          user_id: string;
          day: number;
          date: string;
          sabaq_completed: boolean;
          sabaq_retention_score: number;
          manzil_retention_scores?: Record<string, number>;
          session_duration: number;
          notes?: string | null;
        };
        Update: {
          sabaq_completed?: boolean;
          sabaq_retention_score?: number;
          manzil_retention_scores?: Record<string, number>;
          session_duration?: number;
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
