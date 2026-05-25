/**
 * Express Server for Quran Memorization App
 * Provides API endpoints for plan generation, authentication, and progress tracking
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { PlanGeneratorService } from './services/plan-generator.service';
import { errorHandler, asyncHandler } from './middleware/error.middleware';
import { optionalAuth, AuthRequest } from './middleware/auth.middleware';

// Route imports
import authRoutes from './routes/auth.routes';
import planRoutes from './routes/plans.routes';
import progressRoutes from './routes/progress.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// Plan routes (protected)
app.use('/api/plans', planRoutes);

// Progress routes (protected)
app.use('/api/progress', progressRoutes);

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

/**
 * API Route: Get all available Surahs
 * GET /api/surahs
 */
app.get('/api/surahs', optionalAuth, (req: Request, res: Response) => {
  try {
    const { QURAN_DATA } = require('./data/quran-reference');
    const surahs = Object.values(QURAN_DATA);
    res.json({
      success: true,
      surahs,
      count: surahs.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Surahs',
      code: 'FETCH_ERROR',
    });
  }
});

/**
 * API Route: Generate Memorization Plan (legacy endpoint)
 * POST /api/generate-plan
 * 
 * Note: New endpoint is POST /api/plans (requires authentication)
 */
app.post(
  '/api/generate-plan',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Accept data from both JSON body and query parameters
    const params = { ...req.body, ...req.query };
    
    let {
      userId,
      surahNumber,
      startVerse,
      endVerse,
      durationDays,
      planName,
    } = params;

    // Convert string parameters to numbers
    surahNumber = surahNumber ? parseInt(surahNumber as string) : undefined;
    startVerse = startVerse ? parseInt(startVerse as string) : undefined;
    endVerse = endVerse ? parseInt(endVerse as string) : undefined;
    durationDays = durationDays ? parseInt(durationDays as string) : undefined;

    // Validate required fields
    if (
      !userId ||
      surahNumber === undefined ||
      startVerse === undefined ||
      endVerse === undefined ||
      durationDays === undefined
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required fields: userId, surahNumber, startVerse, endVerse, durationDays',
        code: 'VALIDATION_ERROR',
        hint: 'Send data as JSON body or query parameters',
      });
    }

    // Generate the plan
    const plan = PlanGeneratorService.generatePlan(
      userId as string,
      surahNumber,
      startVerse,
      endVerse,
      durationDays,
      planName as string
    );

    res.json({
      success: true,
      plan,
    });
  })
);

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path,
  });
});

// ============================================
// ERROR HANDLER (must be last)
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(
    `🚀 Quran Memorization Server running on http://localhost:${PORT}`
  );
  console.log(`📋 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`📚 Auth routes: POST /api/auth/signup, POST /api/auth/login`);
  console.log(
    `📝 Plan routes: POST /api/plans, GET /api/plans, DELETE /api/plans/:id`
  );
  console.log(
    `📊 Progress routes: POST /api/progress/log, GET /api/progress/:planId`
  );
});
