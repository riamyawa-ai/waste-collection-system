/**
 * Mock Exports Index
 * 
 * Centralized exports for all mock utilities and data.
 */

export * from './data';
export { default as createMockSupabaseClient, setupAuthMock, setupQueryMock } from './supabase';
export type { MockSupabaseClient } from './supabase';
