/**
 * Memorization Plan Type Definitions
 * Defines the structure for Quranic memorization plans with daily targets,
 * revision cycles (Sabaq/Manzil), and progress tracking.
 */

export interface QuranicReference {
  surah: number;
  startVerse: number;
  endVerse: number;
}

export interface DailyTarget {
  day: number;
  date: string; // ISO 8601 format
  sabaq: QuranicReference; // New lesson to memorize
  manzil: QuranicReference[]; // Revision portions (typically Quran divisions)
  estimatedMinutes: number; // Estimated time to complete
  priority: 'high' | 'medium' | 'low';
}

export interface RevisionCycle {
  cycleNumber: number;
  name: string; // e.g., "First Review", "Second Review"
  daysAfterSabaq: number; // Days to wait before this revision
  verseRange: QuranicReference;
  frequency: 'daily' | 'weekly' | 'biweekly';
}

export interface ProgressEntry {
  day: number;
  date: string;
  sabaqCompleted: boolean;
  sabaqVerses: number; // Number of verses memorized
  sabaqRetentionScore: number; // 0-100
  manzilCompleted: QuranicReference[];
  manzilRetentionScores: Map<string, number>; // Reference -> score mapping
  notesOrChallenges?: string;
  sessionDuration: number; // Minutes spent
}

export interface MemorizationPlan {
  id: string;
  userId: string;
  planName: string;
  targetSurah: {
    number: number;
    name: string;
    totalVerses: number;
    arabicName: string;
  };
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  totalDays: number;
  totalVerses: number;
  
  // Configuration
  dailyTargets: DailyTarget[];
  revisionCycles: RevisionCycle[];
  
  // Progress Tracking
  progress: ProgressEntry[];
  overallRetentionScore: number; // 0-100
  completionPercentage: number; // 0-100
  streak: number; // Consecutive days completed
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
}

export interface PlanGenerationOptions {
  versesPerDay: number;
  startDate: Date;
  durationDays: number;
  revisionsPerLesson: number; // Number of revision cycles
  includeWeeklyReview: boolean;
}
