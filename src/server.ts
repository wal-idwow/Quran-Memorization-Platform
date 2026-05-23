/**
 * Express Server for Quran Memorization App
 * Provides API endpoints for plan generation and serves the Lab UI
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { PlanGeneratorService } from './services/plan-generator.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

/**
 * API Route: Generate Memorization Plan
 * POST /api/generate-plan
 * 
 * Request body:
 * {
 *   userId: string;
 *   surahNumber: number;
 *   startVerse: number;
 *   endVerse: number;
 *   durationDays: number;
 *   planName?: string;
 * }
 */
app.post('/api/generate-plan', (req: Request, res: Response) => {
  try {
    const {
      userId,
      surahNumber,
      startVerse,
      endVerse,
      durationDays,
      planName,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      surahNumber === undefined ||
      startVerse === undefined ||
      endVerse === undefined ||
      durationDays === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields: userId, surahNumber, startVerse, endVerse, durationDays',
      });
    }

    // Generate the plan
    const plan = PlanGeneratorService.generatePlan(
      userId,
      surahNumber,
      startVerse,
      endVerse,
      durationDays,
      planName
    );

    res.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate plan',
    });
  }
});

/**
 * API Route: Get all available Surahs
 * GET /api/surahs
 */
app.get('/api/surahs', (req: Request, res: Response) => {
  try {
    const { QURAN_DATA } = require('./data/quran-reference');
    const surahs = Object.values(QURAN_DATA);
    res.json({
      success: true,
      surahs,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to fetch Surahs',
    });
  }
});

/**
 * Root Route: Serve the Lab UI
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quran Memorization Lab Server running on http://localhost:${PORT}`);
  console.log(`📋 API available at http://localhost:${PORT}/api`);
});
