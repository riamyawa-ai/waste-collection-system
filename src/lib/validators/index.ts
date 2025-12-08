// Form validators will be added in Day 2+
// This folder will contain Zod schemas for form validation

import { z } from "zod";

// Placeholder - will be expanded in Day 2
export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^(\+63|0)?[0-9]{10,11}$/, "Invalid Philippine phone number");
