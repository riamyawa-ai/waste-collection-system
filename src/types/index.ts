import type { Barangay } from "@/constants/barangays";
import type { RequestStatus, PriorityLevel, WasteType } from "@/constants/status";
import type { UserRole } from "@/constants/roles";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: UserRole;
  barangay?: Barangay;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionRequest {
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
  status: RequestStatus;
  priority: PriorityLevel;
  photos?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

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

export interface CollectionRoute {
  id: string;
  collector_id: string;
  date: string;
  status: "planned" | "in_progress" | "completed";
  requests: string[];
  optimized_order?: number[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  cancelledRequests: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  barangay: Barangay;
  address: string;
}

export interface CollectionRequestFormData {
  wasteType: WasteType;
  description: string;
  address: string;
  barangay: Barangay;
  preferredDate?: string;
  preferredTimeSlot?: string;
  photos?: File[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
