/**
 * Extended model types for the Waste Collection Management System
 * These types extend the auto-generated Supabase types with additional utilities
 */

import { Database } from './database.types';

// ============================================================================
// TABLE ROW TYPES (for reading data)
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CollectionRequest = Database['public']['Tables']['collection_requests']['Row'];
export type RequestPhoto = Database['public']['Tables']['request_photos']['Row'];
export type RequestStatusHistory = Database['public']['Tables']['request_status_history']['Row'];
export type CollectionSchedule = Database['public']['Tables']['collection_schedules']['Row'];
export type ScheduleStop = Database['public']['Tables']['schedule_stops']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type CollectorAttendance = Database['public']['Tables']['collector_attendance']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

// ============================================================================
// TABLE INSERT TYPES (for creating data)
// ============================================================================

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CollectionRequestInsert = Database['public']['Tables']['collection_requests']['Insert'];
export type RequestPhotoInsert = Database['public']['Tables']['request_photos']['Insert'];
export type RequestStatusHistoryInsert = Database['public']['Tables']['request_status_history']['Insert'];
export type CollectionScheduleInsert = Database['public']['Tables']['collection_schedules']['Insert'];
export type ScheduleStopInsert = Database['public']['Tables']['schedule_stops']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type CollectorAttendanceInsert = Database['public']['Tables']['collector_attendance']['Insert'];
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

// ============================================================================
// TABLE UPDATE TYPES (for updating data)
// ============================================================================

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type CollectionRequestUpdate = Database['public']['Tables']['collection_requests']['Update'];
export type RequestPhotoUpdate = Database['public']['Tables']['request_photos']['Update'];
export type CollectionScheduleUpdate = Database['public']['Tables']['collection_schedules']['Update'];
export type ScheduleStopUpdate = Database['public']['Tables']['schedule_stops']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
export type CollectorAttendanceUpdate = Database['public']['Tables']['collector_attendance']['Update'];

// ============================================================================
// ENUM TYPES
// ============================================================================

export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type PriorityLevel = Database['public']['Enums']['priority_level'];
export type ScheduleType = Database['public']['Enums']['schedule_type'];
export type ScheduleStatus = Database['public']['Enums']['schedule_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type FeedbackStatus = Database['public']['Enums']['feedback_status'];
export type AnnouncementType = Database['public']['Enums']['announcement_type'];
export type AnnouncementPriority = Database['public']['Enums']['announcement_priority'];
export type NotificationType = Database['public']['Enums']['notification_type'];

// ============================================================================
// EXTENDED TYPES (with relationships)
// ============================================================================

/**
 * Collection request with related data
 */
export type CollectionRequestWithRelations = CollectionRequest & {
    client?: Profile | null;
    assigned_collector?: Profile | null;
    photos?: RequestPhoto[];
    status_history?: RequestStatusHistory[];
    payment?: Payment | null;
    feedback?: Feedback | null;
};

/**
 * Collection schedule with related data
 */
export type CollectionScheduleWithRelations = CollectionSchedule & {
    assigned_collector?: Profile | null;
    backup_collector?: Profile | null;
    stops?: ScheduleStop[];
    created_by_user?: Profile | null;
};

/**
 * Payment with related data
 */
export type PaymentWithRelations = Payment & {
    request?: CollectionRequest | null;
    client?: Profile | null;
    verified_by_user?: Profile | null;
};

/**
 * Feedback with related data
 */
export type FeedbackWithRelations = Feedback & {
    request?: CollectionRequest | null;
    client?: Profile | null;
    collector?: Profile | null;
};

/**
 * Announcement with related data
 */
export type AnnouncementWithRelations = Announcement & {
    created_by_user?: Profile | null;
};

/**
 * Collector profile with stats
 */
export type CollectorWithStats = Profile & {
    active_assignments_count?: number;
    completed_today_count?: number;
    average_rating?: number;
    is_on_duty?: boolean;
};

// ============================================================================
// FORM TYPES (for client-side forms)
// ============================================================================

/**
 * Form data for creating a new collection request
 */
export interface CreateRequestFormData {
    requester_name: string;
    contact_number: string;
    alt_contact_number?: string;
    barangay: string;
    address: string;
    priority: PriorityLevel;
    preferred_date: string; // ISO date string
    preferred_time_slot: string;
    special_instructions?: string;
    photos?: File[];
}

/**
 * Form data for assigning a collector
 */
export interface AssignCollectorFormData {
    request_id: string;
    collector_id: string;
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
}

/**
 * Form data for recording a payment
 */
export interface RecordPaymentFormData {
    request_id: string;
    amount: number;
    reference_number?: string;
    payment_method?: string;
    date_received: string;
    receipt?: File;
    staff_notes?: string;
}

/**
 * Form data for submitting feedback
 */
export interface SubmitFeedbackFormData {
    request_id: string;
    overall_rating: number;
    comments?: string;
    is_anonymous?: boolean;
}

/**
 * Form data for creating an announcement
 */
export interface CreateAnnouncementFormData {
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    target_audience: string[];
    publish_date: string;
    expiry_date?: string;
    image?: File;
    send_email_notification?: boolean;
    send_push_notification?: boolean;
    enable_maintenance_mode?: boolean;
}

/**
 * Form data for creating a schedule
 */
export interface CreateScheduleFormData {
    name: string;
    description?: string;
    schedule_type: ScheduleType;
    start_date: string;
    end_date?: string;
    start_time: string;
    end_time: string;
    working_days?: string[];
    week_of_month?: number[];
    assigned_collector_id?: string;
    backup_collector_id?: string;
    special_instructions?: string;
    stops: Omit<ScheduleStopInsert, 'id' | 'schedule_id' | 'created_at' | 'updated_at'>[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Dashboard statistics for clients
 */
export interface ClientDashboardStats {
    total_requests: number;
    completed_collections: number;
    pending_requests: number;
    active_collections: number;
}

/**
 * Dashboard statistics for staff/admin
 */
export interface StaffDashboardStats {
    total_users: number;
    total_collections_today: number;
    total_collections_week: number;
    total_collections_month: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
    pending_requests: number;
    active_collectors: number;
}

/**
 * Dashboard statistics for collectors
 */
export interface CollectorDashboardStats {
    todays_routes: number;
    assigned_requests: number;
    in_progress: number;
    completed_today: number;
    average_rating: number;
}

/**
 * Available collector for assignment
 */
export interface AvailableCollector {
    id: string;
    full_name: string;
    phone: string | null;
    active_assignments: number;
    completed_today: number;
    average_rating: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make certain properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make certain properties optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract ID from a type
 */
export type EntityId = string;

/**
 * Common status change payload
 */
export interface StatusChangePayload {
    status: RequestStatus;
    reason?: string;
    notes?: string;
}
