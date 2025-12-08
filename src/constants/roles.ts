export const USER_ROLES = {
  CLIENT: "client",
  STAFF: "staff",
  COLLECTOR: "collector",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  staff: "Staff",
  collector: "Collector",
  admin: "Administrator",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  client: "Residents who can request waste collection services",
  staff: "City hall employees who manage collection requests",
  collector: "Waste collectors who perform pickups",
  admin: "System administrators with full access",
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  client: {
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  staff: {
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  collector: {
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  admin: {
    bg: "bg-green-100",
    text: "text-green-700",
  },
};

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  client: "/client/dashboard",
  staff: "/staff/dashboard",
  collector: "/collector/dashboard",
  admin: "/admin/dashboard",
};
