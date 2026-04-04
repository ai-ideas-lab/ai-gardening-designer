/**
 * Main application file for AI Gardening Designer
 * This file re-exports from server.ts for backward compatibility
 */

export { app } from './server';

// Export types
export type { AuthRequest } from './middleware/auth';
export type { ApiError } from './middleware/errorHandler';