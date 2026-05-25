/**
 * Memorization Plan Generator Service
 * Generates personalized 30-day memorization plans for Quranic chapters
 */

import {
  MemorizationPlan,
  DailyTarget,
  RevisionCycle,
  QuranicReference,
  PlanGenerationOptions,
} from '../types/memorization-plan.types';
import { getSurahInfo } from '../data/quran-reference';

export class PlanGeneratorService {
  /**
   * Generates a 30-day memorization plan for Surah Al-Kahf
   * 
   * Plan Structure (Spaced Repetition Model):
   * - Daily new lesson (Sabaq): ~4 verses/day (110 verses / 30 days ≈ 3.67)
   * - Multiple revision cycles (Manzil) following the 1-3-7-14 pattern
   *   - 1st review: 1 day after
   *   - 2nd review: 3 days after
   *   - 3rd review: 7 days after
   *   - 4th review: 14 days after
   * - Weekly comprehensive reviews
   */
  static generateAlKahfPlan(
    userId: string,
    startDate: Date = new Date()
  ): MemorizationPlan {
    const surahNumber = 18; // Al-Kahf
    const surahInfo = getSurahInfo(surahNumber);

    if (!surahInfo) {
      throw new Error(`Surah ${surahNumber} not found in reference data`);
    }

    const durationDays = 30;
    const totalVerses = surahInfo.totalVerses;
    const versesPerDay = Math.ceil(totalVerses / durationDays);

    // Initialize plan metadata
    const planId = `plan_${this.generateId()}`;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const plan: MemorizationPlan = {
      id: planId,
      userId,
      planName: `Surah Al-Kahf 30-Day Memorization Challenge`,
      targetSurah: {
        number: surahInfo.number,
        name: surahInfo.englishName,
        totalVerses: surahInfo.totalVerses,
        arabicName: surahInfo.arabicName,
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays: durationDays,
      totalVerses,
      dailyTargets: [],
      revisionCycles: [],
      progress: [],
      overallRetentionScore: 0,
      completionPercentage: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
    };

    // Generate daily targets
    plan.dailyTargets = this.generateDailyTargets(
      surahNumber,
      totalVerses,
      versesPerDay,
      startDate,
      durationDays
    );

    // Generate revision cycles using spaced repetition
    plan.revisionCycles = this.generateRevisionCycles(surahNumber, totalVerses);

    return plan;
  }

  /**
   * Generic method to generate a custom memorization plan
   * Supports any Surah with custom verse ranges and durations
   */
  static generatePlan(
    userId: string,
    surahNumber: number,
    startVerse: number,
    endVerse: number,
    durationDays: number,
    planName?: string,
    startDate: Date = new Date()
  ): MemorizationPlan {
    const surahInfo = getSurahInfo(surahNumber);

    if (!surahInfo) {
      throw new Error(`Surah ${surahNumber} not found in reference data`);
    }

    // Validate verse range
    if (startVerse < 1 || endVerse > surahInfo.totalVerses || startVerse > endVerse) {
      throw new Error(
        `Invalid verse range. Surah ${surahNumber} has ${surahInfo.totalVerses} verses.`
      );
    }

    const totalVerses = endVerse - startVerse + 1;
    const versesPerDay = Math.ceil(totalVerses / durationDays);

    // Initialize plan metadata
    const planId = `plan_${this.generateId()}`;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const plan: MemorizationPlan = {
      id: planId,
      userId,
      planName: planName || `${surahInfo.englishName} (Verses ${startVerse}-${endVerse}) - ${durationDays}-Day Plan`,
      targetSurah: {
        number: surahInfo.number,
        name: surahInfo.englishName,
        totalVerses: surahInfo.totalVerses,
        arabicName: surahInfo.arabicName,
      },
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays: durationDays,
      totalVerses,
      dailyTargets: [],
      revisionCycles: [],
      progress: [],
      overallRetentionScore: 0,
      completionPercentage: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
    };

    // Generate daily targets for the custom verse range
    plan.dailyTargets = this.generateCustomDailyTargets(
      surahNumber,
      startVerse,
      endVerse,
      totalVerses,
      versesPerDay,
      startDate,
      durationDays
    );

    // Generate revision cycles
    plan.revisionCycles = this.generateRevisionCycles(surahNumber, totalVerses);

    return plan;
  }

  /**
   * Generates daily targets for custom verse ranges
   */
  private static generateCustomDailyTargets(
    surahNumber: number,
    startVerse: number,
    endVerse: number,
    totalVerses: number,
    versesPerDay: number,
    startDate: Date,
    durationDays: number
  ): DailyTarget[] {
    const dailyTargets: DailyTarget[] = [];
    let currentVerseStart = startVerse;

    for (let day = 1; day <= durationDays; day++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + day - 1);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Skip if we've already covered all verses
      if (currentVerseStart > endVerse) {
        const sabaq: QuranicReference = {
          surah: surahNumber,
          startVerse: endVerse,
          endVerse: endVerse - 1, // Empty range to indicate completion
        };

        const dailyTarget: DailyTarget = {
          day,
          date: dateStr,
          sabaq,
          manzil: [],
          estimatedMinutes: 0,
          priority: 'low',
        };

        dailyTargets.push(dailyTarget);
        continue;
      }

      // Calculate Sabaq (new lesson)
      let currentVerseEnd = Math.min(
        currentVerseStart + versesPerDay - 1,
        endVerse
      );

      const sabaq: QuranicReference = {
        surah: surahNumber,
        startVerse: currentVerseStart,
        endVerse: currentVerseEnd,
      };

      // Generate Manzil (revisions) based on spaced repetition pattern
      const manzil = this.generateCustomManzilForDay(
        surahNumber,
        day,
        currentVerseStart,
        startVerse,
        versesPerDay,
        currentVerseEnd
      );

      const dailyTarget: DailyTarget = {
        day,
        date: dateStr,
        sabaq,
        manzil,
        estimatedMinutes: this.calculateEstimatedTime(
          sabaq.endVerse - sabaq.startVerse + 1,
          manzil
        ),
        priority: day <= Math.ceil(durationDays / 3) ? 'high' : day <= Math.ceil(2 * durationDays / 3) ? 'medium' : 'low',
      };

      dailyTargets.push(dailyTarget);
      currentVerseStart = currentVerseEnd + 1;
    }

    return dailyTargets;
  }

  /**
   * Generates Manzil (revision portions) for custom scenarios
   */
  private static generateCustomManzilForDay(
    surahNumber: number,
    day: number,
    currentVerseStart: number,
    planStartVerse: number,
    versesPerDay: number,
    currentVerseEnd: number
  ): QuranicReference[] {
    const manzil: QuranicReference[] = [];
    const spacedRepetitionDays = [1, 3, 7, 14];

    for (const daysAgo of spacedRepetitionDays) {
      if (day > daysAgo) {
        // Calculate which lesson from daysAgo needs revision
        const lessonDay = day - daysAgo;
        const verseStart = planStartVerse + (lessonDay - 1) * versesPerDay;
        const verseEnd = Math.min(verseStart + versesPerDay - 1, currentVerseEnd);

        if (verseStart <= verseEnd && verseEnd < currentVerseEnd) {
          manzil.push({
            surah: surahNumber,
            startVerse: verseStart,
            endVerse: verseEnd,
          });
        }
      }
    }

    return manzil;
  }

  /**
   * Generates daily targets with Sabaq (new lessons) and Manzil (revisions)
   */
  private static generateDailyTargets(
    surahNumber: number,
    totalVerses: number,
    versesPerDay: number,
    startDate: Date,
    durationDays: number
  ): DailyTarget[] {
    const dailyTargets: DailyTarget[] = [];
    let currentVerseStart = 1;

    for (let day = 1; day <= durationDays; day++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + day - 1);
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Calculate Sabaq (new lesson)
      let currentVerseEnd = Math.min(
        currentVerseStart + versesPerDay - 1,
        totalVerses
      );

      // Adjust last day to include any remaining verses
      if (day === durationDays) {
        currentVerseEnd = totalVerses;
      }

      const sabaq: QuranicReference = {
        surah: surahNumber,
        startVerse: currentVerseStart,
        endVerse: currentVerseEnd,
      };

      // Generate Manzil (revisions) based on spaced repetition pattern
      const manzil = this.generateManzilForDay(surahNumber, day, currentVerseStart);

      const dailyTarget: DailyTarget = {
        day,
        date: dateStr,
        sabaq,
        manzil,
        estimatedMinutes: this.calculateEstimatedTime(
          sabaq.endVerse - sabaq.startVerse + 1,
          manzil
        ),
        priority: day <= 10 ? 'high' : day <= 20 ? 'medium' : 'low',
      };

      dailyTargets.push(dailyTarget);
      currentVerseStart = currentVerseEnd + 1;
    }

    return dailyTargets;
  }

  /**
   * Generates Manzil (revision portions) for a specific day
   * Uses spaced repetition: 1-day, 3-day, 7-day, 14-day cycles
   */
  private static generateManzilForDay(
    surahNumber: number,
    currentDay: number,
    currentVerseStart: number
  ): QuranicReference[] {
    const manzil: QuranicReference[] = [];
    const spacedRepetitionDays = [1, 3, 7, 14];
    const versesPerDay = 4; // Approximately 110/30

    for (const daysAgo of spacedRepetitionDays) {
      if (currentDay > daysAgo) {
        // Calculate which lesson from daysAgo needs revision
        const lessonDay = currentDay - daysAgo;
        const verseStart = 1 + (lessonDay - 1) * versesPerDay;
        const verseEnd = Math.min(verseStart + versesPerDay - 1, 110);

        manzil.push({
          surah: surahNumber,
          startVerse: verseStart,
          endVerse: verseEnd,
        });
      }
    }

    // Add weekly comprehensive review (every 7 days, starting day 7)
    if (currentDay % 7 === 0 && currentDay > 0) {
      const weekStart = (Math.floor((currentDay - 1) / 7)) * 7 + 1;
      const weekEnd = Math.min(weekStart + 27, 110); // ~4 days worth of verses
      manzil.push({
        surah: surahNumber,
        startVerse: weekStart,
        endVerse: weekEnd,
      });
    }

    return manzil;
  }

  /**
   * Generates revision cycles for the entire plan
   * Based on Leitner system and spaced repetition
   */
  private static generateRevisionCycles(
    surahNumber: number,
    totalVerses: number
  ): RevisionCycle[] {
    return [
      {
        cycleNumber: 1,
        name: 'revision.first',
        daysAfterSabaq: 1,
        verseRange: {
          surah: surahNumber,
          startVerse: 1,
          endVerse: Math.min(4, totalVerses),
        },
        frequency: 'daily',
      },
      {
        cycleNumber: 2,
        name: 'revision.second',
        daysAfterSabaq: 3,
        verseRange: {
          surah: surahNumber,
          startVerse: 1,
          endVerse: Math.min(8, totalVerses),
        },
        frequency: 'daily',
      },
      {
        cycleNumber: 3,
        name: 'revision.third',
        daysAfterSabaq: 7,
        verseRange: {
          surah: surahNumber,
          startVerse: 1,
          endVerse: Math.min(28, totalVerses),
        },
        frequency: 'daily',
      },
      {
        cycleNumber: 4,
        name: 'revision.deep',
        daysAfterSabaq: 14,
        verseRange: {
          surah: surahNumber,
          startVerse: 1,
          endVerse: Math.min(56, totalVerses),
        },
        frequency: 'biweekly',
      },
      {
        cycleNumber: 5,
        name: 'revision.maintenance',
        daysAfterSabaq: 30,
        verseRange: {
          surah: surahNumber,
          startVerse: 1,
          endVerse: totalVerses,
        },
        frequency: 'weekly',
      },
    ];
  }

  /**
   * Calculates estimated time based on number of verses and revisions
   * Formula: (verses × 1.5 minutes per verse) + (number of revisions × 1 minute)
   */
  private static calculateEstimatedTime(
    newVerses: number,
    revisions: QuranicReference[]
  ): number {
    const newLessonTime = newVerses * 1.5; // 1.5 minutes per verse for new material
    const revisionTime = revisions.reduce((total, ref) => {
      const verseCount = ref.endVerse - ref.startVerse + 1;
      return total + verseCount * 0.75; // 0.75 minutes per verse for revision
    }, 0);

    return Math.round(newLessonTime + revisionTime);
  }

  /**
   * Updates plan with progress entry
   */
  static addProgressEntry(
    plan: MemorizationPlan,
    day: number,
    sabaqCompleted: boolean,
    sabaqRetentionScore: number,
    manzilRetentionScores: Map<string, number>,
    sessionDuration: number,
    notes?: string
  ): void {
    const dailyTarget = plan.dailyTargets.find((t) => t.day === day);
    if (!dailyTarget) {
      throw new Error(`Day ${day} not found in plan`);
    }

    const progressEntry = {
      day,
      date: dailyTarget.date,
      sabaqCompleted,
      sabaqVerses: dailyTarget.sabaq.endVerse - dailyTarget.sabaq.startVerse + 1,
      sabaqRetentionScore,
      manzilCompleted: dailyTarget.manzil,
      manzilRetentionScores,
      notesOrChallenges: notes,
      sessionDuration,
    };

    plan.progress.push(progressEntry);
    plan.updatedAt = new Date().toISOString();

    // Update completion percentage and streak
    this.updatePlanMetrics(plan);
  }

  /**
   * Updates plan metrics like completion percentage and retention scores
   */
  private static updatePlanMetrics(plan: MemorizationPlan): void {
    const completedDays = plan.progress.filter((p) => p.sabaqCompleted).length;
    plan.completionPercentage = Math.round(
      (completedDays / plan.totalDays) * 100
    );

    // Calculate overall retention score
    if (plan.progress.length > 0) {
      const avgRetention =
        plan.progress.reduce((sum, p) => sum + p.sabaqRetentionScore, 0) /
        plan.progress.length;
      plan.overallRetentionScore = Math.round(avgRetention);
    }

    // Calculate streak (consecutive days completed)
    let streak = 0;
    for (let i = plan.progress.length - 1; i >= 0; i--) {
      if (plan.progress[i].sabaqCompleted) {
        streak++;
      } else {
        break;
      }
    }
    plan.streak = streak;
  }

  /**
   * Generates a simple unique ID
   */
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
