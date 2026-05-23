# Quran Memorization Platform

A Node.js service for generating personalized Quranic memorization plans with spaced repetition and progress tracking.

## Features

- 🎯 **Memorization Plans**: Structured, progressive lessons for efficient learning
- 🔄 **Spaced Repetition**: Evidence-based revision cycles (1-3-7-14 days) for optimal retention
- 📊 **Progress Tracking**: Detailed metrics on retention scores, completion, and streaks
- ⏱️ **Time Management**: Daily time estimates for planning your memorization sessions
- 📱 **Comprehensive API**: TypeScript-based service for easy integration

## Quick Start

### Installation

```bash
npm install
```

### Generate a Memorization Plan

```typescript
import { PlanGeneratorService } from './src/services/plan-generator.service';

// Create a 30-day plan for Surah Al-Kahf
const plan = PlanGeneratorService.generateAlKahfPlan(
  'user_12345',
  new Date()
);
```

### Build and Run

```bash
npm run build    # Compile TypeScript
npm run start    # Run the application
npm run dev      # Development mode with hot reload
```

## Project Structure

```
src/
├── types/                    # TypeScript interfaces
├── data/                     # Quranic reference data
├── services/                 # Core service logic
├── i18n/                     # Internationalization
└── components/               # UI components

schemas/                      # JSON schema validation
public/                       # Static assets
```

## Memorization Methodology

The platform uses three core components:

1. **Sabaq (New Lesson)**: ~4 verses per day for comfortable memorization
2. **Manzil (Revision)**: Spaced repetition following scientific retention patterns
3. **Progress Tracking**: Retention scores, completion metrics, and consistency streaks

## Documentation

- See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed technical information
- Check existing markdown files for implementation guides and architecture details

## Requirements

- Node.js 14+
- npm 6+

## License

MIT


