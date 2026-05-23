/**
 * Spaced Repetition Configuration
 * Configurable parameters for the memorization algorithm
 */

export interface SpacedRepetitionConfig {
  // Daily target configuration
  dailyTargets: {
    versesPerDay: number; // Number of verses to memorize daily
    estimatedMinutesPerVerse: number; // Time estimate for new material
    revisionMinutesPerVerse: number; // Time estimate for revision
  };

  // Revision cycles (in days after initial learning)
  revisionCycles: {
    day1: number; // First review
    day3: number; // Second review
    day7: number; // Third review
    day14: number; // Deep consolidation
    day30: number; // Long-term retention
  };

  // Weekly review configuration
  weeklyReview: {
    enabled: boolean;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    versesPerReview: number; // Verses to include in weekly review
  };

  // Retention score thresholds
  retentionThresholds: {
    excellent: number; // 90+
    good: number; // 70-89
    fair: number; // 50-69
    needsWork: number; // <50
  };

  // Streak and motivation
  streakBonuses: {
    enabled: boolean;
    bonusPointsPerDay: number;
    streakMilestones: Record<number, string>; // e.g., { 7: "One Week Champion!", 30: "Full Month Master!" }
  };
}

/**
 * Default configuration optimized for Quranic memorization
 * Based on traditional Hafiz methodology and modern spaced repetition research
 */
export const DEFAULT_CONFIG: SpacedRepetitionConfig = {
  dailyTargets: {
    versesPerDay: 4, // Approximately 3.67 for 110-verse surah in 30 days
    estimatedMinutesPerVerse: 1.5, // 1.5 minutes per verse for new material
    revisionMinutesPerVerse: 0.75, // 0.75 minutes per verse for review
  },

  revisionCycles: {
    day1: 1, // Review after 1 day (next day)
    day3: 3, // Review after 3 days
    day7: 7, // Review after 1 week
    day14: 14, // Review after 2 weeks
    day30: 30, // Final comprehensive review
  },

  weeklyReview: {
    enabled: true,
    dayOfWeek: 0, // Sunday (Islamic tradition often uses Fridays, but can be customized)
    versesPerReview: 28, // Approximately 4 days worth of verses (1 week of Sabaq)
  },

  retentionThresholds: {
    excellent: 90,
    good: 70,
    fair: 50,
    needsWork: 0,
  },

  streakBonuses: {
    enabled: true,
    bonusPointsPerDay: 10,
    streakMilestones: {
      7: '🌟 One Week Champion!',
      14: '🚀 Two Week Warrior!',
      21: '👑 Three Week Master!',
      30: '🎖️ Full Month Achiever! (30-Day Challenge Complete)',
    },
  },
};

/**
 * Intensive configuration for advanced students
 * Higher daily targets for experienced memorizers
 */
export const INTENSIVE_CONFIG: SpacedRepetitionConfig = {
  ...DEFAULT_CONFIG,
  dailyTargets: {
    versesPerDay: 8, // Double the default
    estimatedMinutesPerVerse: 1.2, // Slightly less time due to experience
    revisionMinutesPerVerse: 0.5,
  },
};

/**
 * Gentle configuration for beginners
 * Lower daily targets with more revision cycles
 */
export const GENTLE_CONFIG: SpacedRepetitionConfig = {
  ...DEFAULT_CONFIG,
  dailyTargets: {
    versesPerDay: 2,
    estimatedMinutesPerVerse: 2.0, // More time per verse
    revisionMinutesPerVerse: 1.0,
  },
  revisionCycles: {
    day1: 1,
    day3: 3,
    day7: 7,
    day14: 14,
    day30: 30,
  },
};

/**
 * Long-term retention configuration
 * Optimized for permanent memorization with extended review cycles
 */
export const LONG_TERM_CONFIG: SpacedRepetitionConfig = {
  ...DEFAULT_CONFIG,
  dailyTargets: {
    versesPerDay: 4,
    estimatedMinutesPerVerse: 1.5,
    revisionMinutesPerVerse: 0.75,
  },
  revisionCycles: {
    day1: 1,
    day3: 3,
    day7: 7,
    day14: 14,
    day30: 30,
    // Additional cycles would be added for long-term plans
  },
};

/**
 * Get configuration by profile
 */
export function getConfigByProfile(
  profile: 'beginner' | 'intermediate' | 'advanced' | 'long-term'
): SpacedRepetitionConfig {
  switch (profile) {
    case 'beginner':
      return GENTLE_CONFIG;
    case 'intermediate':
      return DEFAULT_CONFIG;
    case 'advanced':
      return INTENSIVE_CONFIG;
    case 'long-term':
      return LONG_TERM_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}
