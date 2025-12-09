/**
 * Central type exports for the Waste Collection Management System
 * 
 * This file re-exports types from:
 * - database.types.ts (auto-generated from Supabase)
 * - models.ts (extended types and helpers)
 * - constants (enums and configuration)
 */

// Re-export all database types
export type { Database } from './database.types';

// Re-export all model types
export * from './models';

// Re-export constant types
export type { Barangay } from '@/constants/barangays';
export type {
  RequestStatus as ConstantRequestStatus,
  PriorityLevel as ConstantPriorityLevel,
  WasteType
} from '@/constants/status';
export type { UserRole as ConstantUserRole } from '@/constants/roles';

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// These will be deprecated in favor of the Supabase-generated types
// ============================================================================

import type { Barangay } from '@/constants/barangays';
import type {
  RequestStatus as ConstantRequestStatus,
  PriorityLevel as ConstantPriorityLevel,
  WasteType
} from '@/constants/status';
import type { UserRole as ConstantUserRole } from '@/constants/roles';

/**
 * @deprecated Use Profile from models.ts instead
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: ConstantUserRole;
  barangay?: Barangay;
  address?: string;
  created_at: string;
  updated_at: string;
}

/**
 * @deprecated Use CollectionRequest from models.ts instead
 */
export interface LegacyCollectionRequest {
  id: string;
  client_id: string;
  collector_id?: string;
  waste_type: WasteType;
  description?: string;
  address: string;
  barangay: Barangay;
  latitude?: number;
  longitude?: number;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  status: ConstantRequestStatus;
  priority: ConstantPriorityLevel;
  photos?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * @deprecated Use CollectorWithStats from models.ts instead
 */
export interface Collector {
  id: string;
  user_id: string;
  vehicle_plate?: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
  assigned_barangays: Barangay[];
}

/**
 * @deprecated Use CollectionScheduleWithRelations from models.ts instead
 */
export interface CollectionRoute {
  id: string;
  collector_id: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  requests: string[];
  optimized_order?: number[];
}

/**
 * @deprecated Use Notification from models.ts instead
 */
export interface LegacyNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

/**
 * @deprecated Use ClientDashboardStats from models.ts instead
 */
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  cancelledRequests: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

/**
 * Error response from API
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Supabase query result type
 */
export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Supabase list query result type
 */
export type ListQueryResult<T> = {
  data: T[] | null;
  error: Error | null;
  count: number | null;
};

/**
 * Filter options for list queries
 */
export interface ListFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  barangay?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}
