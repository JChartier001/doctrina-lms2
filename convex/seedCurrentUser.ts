/**
 * Seed Current User - User-Friendly Wrapper
 *
 * Simple mutation for seeding test data from Convex dashboard
 *
 * Usage:
 * 1. Open Convex Dashboard
 * 2. Navigate to Functions → seedCurrentUser
 * 3. Click "Run" button (or use seed function)
 * 4. View results in console
 *
 * Note: This file re-exports the main seedTestData mutation for convenience.
 * You can also call seedData.seedTestData directly from the dashboard.
 */

import { seedTestData } from './seedData';

/**
 * Seed test data - convenience re-export
 * Simply re-exports the main seedTestData mutation
 */
export const seed = seedTestData;
