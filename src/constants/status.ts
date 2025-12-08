export const REQUEST_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string; border: string }> = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  scheduled: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  in_progress: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  URGENT: "urgent",
} as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS];

export const PRIORITY_COLORS: Record<PriorityLevel, { bg: string; text: string }> = {
  low: {
    bg: "bg-green-100",
    text: "text-green-700",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  urgent: {
    bg: "bg-red-100",
    text: "text-red-700",
  },
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  urgent: "Urgent",
};

export const WASTE_TYPES = [
  "Biodegradable",
  "Non-Biodegradable",
  "Recyclable",
  "Hazardous",
  "Bulky/Special",
] as const;

export type WasteType = (typeof WASTE_TYPES)[number];
