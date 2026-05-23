/**
 * Example Usage: Generating a 30-Day Memorization Plan for Surah Al-Kahf
 * 
 * This demonstrates how to use the PlanGeneratorService to create
 * a personalized memorization plan with spaced repetition cycles.
 */

import { PlanGeneratorService } from './services/plan-generator.service';
import { MemorizationPlan } from './types/memorization-plan.types';

// Generate a plan for a user
const userId = 'user_12345';
const startDate = new Date('2024-01-15'); // Start date for the plan

console.log('🌟 Quran Memorization Plan Generator - Al-Kahf Challenge\n');
console.log('='.repeat(60));

const plan = PlanGeneratorService.generateAlKahfPlan(userId, startDate);

// Display plan overview
console.log('\n📋 PLAN OVERVIEW');
console.log('-'.repeat(60));
console.log(`Plan ID: ${plan.id}`);
console.log(`Plan Name: ${plan.planName}`);
console.log(`Target Surah: ${plan.targetSurah.arabicName} (${plan.targetSurah.name})`);
console.log(`Total Verses: ${plan.totalVerses}`);
console.log(`Duration: ${plan.totalDays} days`);
console.log(`Start Date: ${new Date(plan.startDate).toLocaleDateString()}`);
console.log(`End Date: ${new Date(plan.endDate).toLocaleDateString()}`);
console.log(`Status: ${plan.status}`);

// Display first week's daily targets
console.log('\n📅 FIRST WEEK DAILY TARGETS');
console.log('-'.repeat(60));
plan.dailyTargets.slice(0, 7).forEach((target) => {
  const sabaqInfo = `Verses ${target.sabaq.startVerse}-${target.sabaq.endVerse} (${target.sabaq.endVerse - target.sabaq.startVerse + 1} verses)`;
  console.log(
    `\nDay ${target.day} (${new Date(target.date).toLocaleDateString()})`
  );
  console.log(`  📖 Sabaq (New Lesson): ${sabaqInfo}`);
  console.log(`  ⏱️  Estimated Time: ${target.estimatedMinutes} minutes`);
  console.log(`  🎯 Priority: ${target.priority}`);

  if (target.manzil.length > 0) {
    console.log(`  🔄 Manzil (Revisions):`);
    target.manzil.forEach((manzil) => {
      console.log(
        `     • Verses ${manzil.startVerse}-${manzil.endVerse}`
      );
    });
  }
});

// Display revision cycles
console.log('\n\n🔁 REVISION CYCLES (Spaced Repetition)');
console.log('-'.repeat(60));
plan.revisionCycles.forEach((cycle) => {
  console.log(
    `\nCycle ${cycle.cycleNumber}: ${cycle.name}`
  );
  console.log(
    `  Days After Sabaq: ${cycle.daysAfterSabaq}`
  );
  console.log(
    `  Verses: ${cycle.verseRange.startVerse}-${cycle.verseRange.endVerse}`
  );
  console.log(`  Frequency: ${cycle.frequency}`);
});

// Simulate progress tracking
console.log('\n\n📊 SIMULATING PROGRESS TRACKING');
console.log('-'.repeat(60));

// Day 1: Complete successfully
PlanGeneratorService.addProgressEntry(
  plan,
  1,
  true, // completed
  90, // retention score
  new Map([['1-4', 90]]), // manzil scores
  45, // session duration
  'Good progress, felt comfortable with the verses'
);

console.log('\n✅ Added Day 1 progress:');
console.log('  Sabaq Completed: Yes');
console.log('  Retention Score: 90%');
console.log('  Session Duration: 45 minutes');

// Day 2: Partial completion
PlanGeneratorService.addProgressEntry(
  plan,
  2,
  true,
  80,
  new Map([
    ['1-4', 90],
    ['5-8', 80],
  ]),
  50,
  'Reviewed previous day successfully'
);

console.log('\n✅ Added Day 2 progress:');
console.log('  Sabaq Completed: Yes');
console.log('  Retention Score: 80%');
console.log('  Session Duration: 50 minutes');

// Display updated metrics
console.log('\n\n📈 UPDATED PLAN METRICS');
console.log('-'.repeat(60));
console.log(`Completion Percentage: ${plan.completionPercentage}%`);
console.log(`Overall Retention Score: ${plan.overallRetentionScore}%`);
console.log(`Current Streak: ${plan.streak} days`);
console.log(`Days Completed: ${plan.progress.length} / ${plan.totalDays}`);

// Display sample JSON output for the first day
console.log('\n\n📄 SAMPLE JSON OUTPUT (Day 1 Target)');
console.log('-'.repeat(60));
console.log(JSON.stringify(plan.dailyTargets[0], null, 2));

// Display plan summary
console.log('\n\n✨ PLAN SUMMARY');
console.log('-'.repeat(60));
console.log(`
The 30-day Al-Kahf memorization plan uses:

1. SABAQ (New Lesson): ~4 verses per day
   - Structured progression through all 110 verses
   - Increasing familiarity with the surah

2. MANZIL (Revision): Spaced Repetition Pattern
   - 1-day cycle: Reinforce the previous day's lesson
   - 3-day cycle: Review from 3 days ago
   - 7-day cycle: Review from 1 week ago
   - 14-day cycle: Deep consolidation review
   - 30-day cycle: Long-term retention maintenance
   - Weekly comprehensive reviews: Consolidate the entire week

3. PROGRESS TRACKING:
   - Track daily completion and retention scores
   - Monitor consecutive day streaks
   - Calculate overall plan completion percentage
   - Identify weak areas for reinforcement

This approach follows proven memorization techniques used by Quran scholars,
combining daily new material with systematic spaced repetition.
`);

console.log('='.repeat(60));
console.log('Plan generation complete! ✨\n');
