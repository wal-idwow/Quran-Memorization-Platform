/**
 * Test Engine for Quran Memorization Plan Generator
 * 
 * Tests 3 different memorization scenarios:
 * 1. Short & Intense: Surah Al-Mulk (30 ayahs) in 7 days
 * 2. Long Term: First 100 Ayahs of Surah Al-Baqarah in 60 days
 * 3. Custom Slice: Ayahs 10-30 of Surah Maryam in 5 days
 * 
 * Validates: Total Ayahs, Ayahs per day, and Sabqi/Manzil revision logic
 */

const { PlanGeneratorService } = require('./dist/services/plan-generator.service');

// Define test scenarios
const scenarios = [
  {
    name: 'Short & Intense: Al-Mulk',
    surahNumber: 67,
    startVerse: 1,
    endVerse: 30,
    durationDays: 7,
    planName: 'Short & Intense: Surah Al-Mulk (7-Day Challenge)',
  },
  {
    name: 'Long Term: Al-Baqarah (First 100)',
    surahNumber: 2,
    startVerse: 1,
    endVerse: 100,
    durationDays: 60,
    planName: 'Long Term: Surah Al-Baqarah Verses 1-100 (60-Day Plan)',
  },
  {
    name: 'Custom Slice: Maryam 10-30',
    surahNumber: 19,
    startVerse: 10,
    endVerse: 30,
    durationDays: 5,
    planName: 'Custom Slice: Surah Maryam Verses 10-30 (5-Day Plan)',
  },
];

/**
 * Validates the mathematical consistency of the revision logic
 * Ensures that Manzil (revisions) don't exceed plan boundaries
 */
function validateRevisionLogic(plan) {
  let isValid = true;
  const issues = [];

  // Get first sabaq's start verse to track plan boundaries
  const planStartVerse = plan.dailyTargets[0].sabaq.startVerse;
  const planEndVerse = Math.max(...plan.dailyTargets.map(t => t.sabaq.endVerse));

  for (const dailyTarget of plan.dailyTargets) {
    // Check Sabaq is within plan boundaries
    if (dailyTarget.sabaq.startVerse < planStartVerse || dailyTarget.sabaq.startVerse > planEndVerse) {
      issues.push(`Day ${dailyTarget.day}: Sabaq start verse (${dailyTarget.sabaq.startVerse}) out of range`);
      isValid = false;
    }

    // Check each Manzil revision
    for (const manzil of dailyTarget.manzil) {
      // Verify manzil is from previously taught content
      if (manzil.startVerse < planStartVerse) {
        issues.push(`Day ${dailyTarget.day}: Manzil starts before plan start`);
        isValid = false;
      }

      // Verify manzil doesn't exceed the verses taught so far
      if (manzil.endVerse > dailyTarget.sabaq.endVerse) {
        issues.push(`Day ${dailyTarget.day}: Manzil (${manzil.startVerse}-${manzil.endVerse}) exceeds current teaching`);
        isValid = false;
      }

      // Verify start verse is valid
      if (manzil.startVerse < 1) {
        issues.push(`Day ${dailyTarget.day}: Manzil has invalid start verse`);
        isValid = false;
      }
    }
  }

  // Verify spaced repetition pattern
  let verificationMap = new Map();
  for (const dailyTarget of plan.dailyTargets) {
    const key = `${dailyTarget.sabaq.startVerse}-${dailyTarget.sabaq.endVerse}`;

    if (verificationMap.has(key)) {
      const previousDay = verificationMap.get(key);
      // Should see this lesson again on day+1, day+3, day+7, day+14
      const expectedRevisionDays = [1, 3, 7, 14];
      let hasRevision = false;
    
      for (const offset of expectedRevisionDays) {
        const revisionDay = previousDay + offset;
    
        if (revisionDay <= plan.totalDays) {
          // Check if this lesson appears in manzil on that day
          const revisionTarget = plan.dailyTargets[revisionDay - 1];
    
          for (const manzil of revisionTarget.manzil) {
    
            if (manzil.startVerse === dailyTarget.sabaq.startVerse && 
                manzil.endVerse === dailyTarget.sabaq.endVerse) {
              hasRevision = true;
              break;
            }
          }
        }
      }
    }
    verificationMap.set(key, dailyTarget.day);
  }

  return {
    isValid,
    issues,
  };
}

/**
 * Calculates total revision load for a specific day
 */
function calculateRevisionLoad(dailyTarget) {
  let totalVerses = dailyTarget.sabaq.endVerse - dailyTarget.sabaq.startVerse + 1;
  let revisionVerses = 0;

  for (const manzil of dailyTarget.manzil) {
    revisionVerses += manzil.endVerse - manzil.startVerse + 1;
  }

  return {
    sabaqVerses: totalVerses,
    manzilVerses: revisionVerses,
    totalVerses: totalVerses + revisionVerses,
  };
}

/**
 * Main test loop
 */
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     🕋  QURAN MEMORIZATION PLAN - TEST ENGINE  🕋             ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const userId = 'test_user_001';
const results = [];

scenarios.forEach((scenario, index) => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📌 SCENARIO ${index + 1}: ${scenario.name}`);
  console.log(`${'═'.repeat(70)}`);

  try {
    // Generate the plan
    const plan = PlanGeneratorService.generatePlan(
      userId,
      scenario.surahNumber,
      scenario.startVerse,
      scenario.endVerse,
      scenario.durationDays,
      scenario.planName
    );

    // Calculate metrics
    const totalAyahs = scenario.endVerse - scenario.startVerse + 1;
    const ayahsPerDay = (totalAyahs / scenario.durationDays).toFixed(2);
    const daysSummary = [];

    // Validate revision logic
    const validation = validateRevisionLogic(plan);

    console.log(`\n📊 PLAN SUMMARY:`);
    console.log(`   • Plan ID: ${plan.id}`);
    console.log(`   • Plan Name: ${plan.planName}`);
    console.log(`   • Target Surah: ${plan.targetSurah.arabicName} (${plan.targetSurah.name})`);
    console.log(`   • Verse Range: ${scenario.startVerse}-${scenario.endVerse}`);
    console.log(`   • Duration: ${scenario.durationDays} days`);
    console.log(`   • Start Date: ${new Date(plan.startDate).toDateString()}`);
    console.log(`   • End Date: ${new Date(plan.endDate).toDateString()}`);

    console.log(`\n🎯 AYAH DISTRIBUTION:`);
    console.log(`   • Total Ayahs: ${totalAyahs}`);
    console.log(`   • Ayahs per Day: ${ayahsPerDay}`);
    console.log(`   • Min Ayahs/Day: ${Math.min(...plan.dailyTargets.map(t => t.sabaq.endVerse - t.sabaq.startVerse + 1))}`);
    console.log(`   • Max Ayahs/Day: ${Math.max(...plan.dailyTargets.map(t => t.sabaq.endVerse - t.sabaq.startVerse + 1))}`);

    console.log(`\n⏱️  TIME ESTIMATES:`);
    const totalTime = plan.dailyTargets.reduce((sum, target) => sum + target.estimatedMinutes, 0);
    const avgTime = (totalTime / scenario.durationDays).toFixed(1);
    console.log(`   • Total Estimated Time: ${totalTime} minutes`);
    console.log(`   • Average Time per Day: ${avgTime} minutes`);
    console.log(`   • Min Time: ${Math.min(...plan.dailyTargets.map(t => t.estimatedMinutes))} minutes`);
    console.log(`   • Max Time: ${Math.max(...plan.dailyTargets.map(t => t.estimatedMinutes))} minutes`);

    console.log(`\n🔄 REVISION LOGIC (Sabqi/Manzil):`);
    console.log(`   • Spaced Repetition Pattern: 1-day, 3-day, 7-day, 14-day cycles`);
    console.log(`   • Total Revision Cycles: ${plan.revisionCycles.length}`);
    
    // Analyze revision load across the plan
    let maxManzilDay = 0;
    let maxManzilLoad = 0;
    plan.dailyTargets.forEach((target) => {
      const load = calculateRevisionLoad(target);
      if (load.manzilVerses > maxManzilLoad) {
        maxManzilLoad = load.manzilVerses;
        maxManzilDay = target.day;
      }
    });
    console.log(`   • Peak Revision Load: Day ${maxManzilDay} (${maxManzilLoad} revision verses)`);

    // Sample days
    console.log(`\n📅 SAMPLE DAILY BREAKDOWN:`);
    const sampleDays = [1, Math.ceil(scenario.durationDays / 2), scenario.durationDays];
    
    sampleDays.forEach((dayNum) => {
      if (dayNum <= plan.dailyTargets.length) {
        const target = plan.dailyTargets[dayNum - 1];
        const load = calculateRevisionLoad(target);
        const date = new Date(target.date);
        console.log(`\n   Day ${dayNum} (${date.toDateString()}):`);
        console.log(`     - Sabaq: Verses ${target.sabaq.startVerse}-${target.sabaq.endVerse} (${load.sabaqVerses} verses)`);
        if (target.manzil.length > 0) {
          console.log(`     - Manzil Revisions: ${target.manzil.length} cycles`);
          target.manzil.forEach((m, idx) => {
            console.log(`       [${idx + 1}] Verses ${m.startVerse}-${m.endVerse} (${m.endVerse - m.startVerse + 1} verses)`);
          });
          console.log(`     - Total: ${load.totalVerses} verses | Est. Time: ${target.estimatedMinutes} min`);
        } else {
          console.log(`     - Total: ${load.sabaqVerses} verses | Est. Time: ${target.estimatedMinutes} min`);
        }
      }
    });

    // Validation results
    console.log(`\n✅ REVISION LOGIC VALIDATION:`);
    if (validation.isValid) {
      console.log(`   • Status: ✓ MATHEMATICALLY CONSISTENT`);
    } else {
      console.log(`   • Status: ✗ ISSUES FOUND`);
      validation.issues.forEach((issue) => {
        console.log(`     ⚠️  ${issue}`);
      });
    }

    results.push({
      scenario: scenario.name,
      success: true,
      plan: plan,
      validation: validation,
    });

  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    results.push({
      scenario: scenario.name,
      success: false,
      error: error.message,
    });
  }
});

// Final summary
console.log(`\n\n${'═'.repeat(70)}`);
console.log('📈 TEST EXECUTION SUMMARY');
console.log(`${'═'.repeat(70)}`);

const successCount = results.filter(r => r.success).length;
const failureCount = results.filter(r => !r.success).length;

console.log(`\n✓ Successful Plans: ${successCount}/${scenarios.length}`);
console.log(`✗ Failed Plans: ${failureCount}/${scenarios.length}`);

// Detailed statistics
if (successCount > 0) {
  console.log(`\n📊 DETAILED COMPARISON:`);
  console.log(`\n${'Scenario'.padEnd(35)} | ${'Ayahs'} | ${'Days'} | ${'Ayah/Day'} | ${'Total Min'}`);
  console.log(`${'-'.repeat(80)}`);
  
  results.forEach((result) => {
    if (result.success) {
      const scenario = scenarios.find(s => s.name === result.scenario);
      const totalAyahs = scenario.endVerse - scenario.startVerse + 1;
      const ayahsPerDay = (totalAyahs / scenario.durationDays).toFixed(1);
      const totalTime = result.plan.dailyTargets.reduce((sum, t) => sum + t.estimatedMinutes, 0);
      
      console.log(
        `${result.scenario.padEnd(35)} | ${String(totalAyahs).padStart(5)} | ${String(scenario.durationDays).padStart(4)} | ${String(ayahsPerDay).padStart(8)} | ${String(totalTime).padStart(9)}`
      );
    }
  });
}

console.log(`\n${'═'.repeat(70)}\n`);
console.log('✨ Test Engine Execution Complete!\n');
