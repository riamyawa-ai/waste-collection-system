/**
 * Status and Priority constants aligned with database enums
 * These match the PostgreSQL enums in the database schema
 */

// ============================================================================
// REQUEST STATUS
// Matches database enum: request_status
// ============================================================================

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  ASSIGNED: 'assigned',
  ACCEPTED_BY_COLLECTOR: 'accepted_by_collector',
  DECLINED_BY_COLLECTOR: 'declined_by_collector',
  EN_ROUTE: 'en_route',
  AT_LOCATION: 'at_location',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

// Status colors for UI display
export const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  accepted: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  payment_confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  assigned: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  accepted_by_collector: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  declined_by_collector: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  en_route: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  at_location: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  in_progress: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
};

// Human-readable status labels
export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending Review',
  accepted: 'Accepted - Awaiting Payment',
  rejected: 'Rejected',
  payment_confirmed: 'Payment Confirmed',
  assigned: 'Assigned to Collector',
  accepted_by_collector: 'Accepted by Collector',
  declined_by_collector: 'Declined by Collector',
  en_route: 'Collector En Route',
  at_location: 'Collector At Location',
  in_progress: 'Collection In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Status workflow - what statuses can transition to what
export const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['payment_confirmed', 'cancelled'],
  rejected: [],
  payment_confirmed: ['assigned', 'cancelled'],
  assigned: ['accepted_by_collector', 'declined_by_collector', 'cancelled'],
  accepted_by_collector: ['en_route', 'cancelled'],
  declined_by_collector: ['assigned'], // Reassignment
  en_route: ['at_location'],
  at_location: ['in_progress'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
};

// ============================================================================
// PRIORITY LEVELS
// Matches database enum: priority_level
// ============================================================================

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  URGENT: 'urgent',
} as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS];

export const PRIORITY_COLORS: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  urgent: 'Urgent',
};

// ============================================================================
// SCHEDULE STATUS
// Matches database enum: schedule_status
// ============================================================================

export const SCHEDULE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_COLORS: Record<ScheduleStatus, { bg: string; text: string; border: string }> = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  active: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ============================================================================
// PAYMENT STATUS
// Matches database enum: payment_status
// ============================================================================

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  COMPLETED: 'completed',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  verified: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending Verification',
  verified: 'Verified',
  completed: 'Completed',
};

// ============================================================================
// FEEDBACK STATUS
// Matches database enum: feedback_status
// ============================================================================

export const FEEDBACK_STATUS = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  RESPONDED: 'responded',
  FLAGGED: 'flagged',
} as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS];

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, { bg: string; text: string; border: string }> = {
  new: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  reviewed: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  responded: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  flagged: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  responded: 'Responded',
  flagged: 'Flagged',
};

// ============================================================================
// ANNOUNCEMENT TYPES
// Matches database enum: announcement_type
// ============================================================================

export const ANNOUNCEMENT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  MAINTENANCE: 'maintenance',
  EVENT: 'event',
} as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[keyof typeof ANNOUNCEMENT_TYPES];

export const ANNOUNCEMENT_TYPE_COLORS: Record<AnnouncementType, { bg: string; text: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '💡',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: '✅',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: '⚠️',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '❌',
  },
  maintenance: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: '🔧',
  },
  event: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: '🎉',
  },
};

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  maintenance: 'Maintenance',
  event: 'Event',
};

// ============================================================================
// USER STATUS
// Matches database enum: user_status
// ============================================================================

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUS_COLORS: Record<UserStatus, { bg: string; text: string; border: string }> = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  suspended: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

// ============================================================================
// SCHEDULE TYPES
// Matches database enum: schedule_type
// ============================================================================

export const SCHEDULE_TYPES = {
  ONE_TIME: 'one-time',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi-weekly',
  MONTHLY: 'monthly',
} as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[keyof typeof SCHEDULE_TYPES];

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  'one-time': 'One-time',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
};

// ============================================================================
// LOCATION TYPES (for schedule stops)
// ============================================================================

export const LOCATION_TYPES = [
  'school',
  'hospital',
  'park',
  'government',
  'commercial',
  'residential',
  'market',
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  school: 'Schools',
  hospital: 'Hospitals',
  park: 'Parks & Plaza',
  government: 'Government Offices',
  commercial: 'Commercial/Establishments',
  residential: 'Residential Areas',
  market: 'Markets',
};

// ============================================================================
// TIME SLOTS (for preferred pickup times)
// ============================================================================

export const TIME_SLOTS = {
  MORNING: [
    '7:00 AM - 8:00 AM',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
  ],
  AFTERNOON: [
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
  ],
  FLEXIBLE: ['Flexible'],
} as const;

export const ALL_TIME_SLOTS = [
  ...TIME_SLOTS.MORNING,
  ...TIME_SLOTS.AFTERNOON,
  ...TIME_SLOTS.FLEXIBLE,
] as const;

export type TimeSlot = (typeof ALL_TIME_SLOTS)[number];

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

export const WASTE_TYPES = [
  'Biodegradable',
  'Non-Biodegradable',
  'Recyclable',
  'Hazardous',
  'Bulky/Special',
] as const;

export type WasteType = (typeof WASTE_TYPES)[number];
