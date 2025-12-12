import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Authentication Validation Tests
 * 
 * Tests for email, phone number, password, and registration validation schemas.
 * Uses Zod for schema validation (same as the application).
 */

// Email validation schema
const emailSchema = z.string().email('Invalid email format');

// Philippine phone number validation
const phoneSchema = z.string().regex(
    /^(\+63|0)\d{10}$/,
    'Invalid Philippine phone number format. Use +63XXXXXXXXXX or 09XXXXXXXXX'
);

// Password validation with policy requirements
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

// Registration form schema
const registerSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
        lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
        email: emailSchema,
        phone: phoneSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
        barangay: z.string().optional(),
        address: z.string().optional(),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and conditions',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Login form schema
const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

describe('Auth Validators', () => {
    describe('Email Validation', () => {
        it('should accept valid email addresses', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co',
                'user+tag@example.org',
                'firstname.lastname@company.com.ph',
                'email@subdomain.domain.com',
            ];

            validEmails.forEach((email) => {
                expect(() => emailSchema.parse(email)).not.toThrow();
            });
        });

        it('should reject invalid email addresses', () => {
            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'user@',
                'user@.com',
                'user@domain.',
                'user space@domain.com',
                '',
            ];

            invalidEmails.forEach((email) => {
                expect(() => emailSchema.parse(email)).toThrow();
            });
        });

        it('should provide error message for invalid email', () => {
            const result = emailSchema.safeParse('invalid-email');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email format');
            }
        });
    });

    describe('Phone Number Validation', () => {
        it('should accept valid Philippine phone numbers with +63 prefix', () => {
            const validPhones = [
                '+639123456789',
                '+639987654321',
                '+639001234567',
            ];

            validPhones.forEach((phone) => {
                expect(() => phoneSchema.parse(phone)).not.toThrow();
            });
        });

        it('should accept valid Philippine phone numbers with 09 prefix', () => {
            const validPhones = [
                '09123456789',
                '09987654321',
                '09001234567',
            ];

            validPhones.forEach((phone) => {
                expect(() => phoneSchema.parse(phone)).not.toThrow();
            });
        });

        it('should reject invalid phone numbers', () => {
            const invalidPhones = [
                '123456789',          // No prefix
                '+1234567890',        // Wrong country code
                '0912345',            // Too short
                '+63912345678901',    // Too long
                '9123456789',         // Missing leading 0
                '+63 912 345 6789',   // With spaces
                '',
            ];

            invalidPhones.forEach((phone) => {
                expect(() => phoneSchema.parse(phone)).toThrow();
            });
        });
    });

    describe('Password Validation', () => {
        it('should accept valid passwords meeting all requirements', () => {
            const validPasswords = [
                'Password1!',
                'MySecure@123',
                'Test$Pass99',
                'Abcdefg1!',
                'StrongP@ss1',
            ];

            validPasswords.forEach((password) => {
                expect(() => passwordSchema.parse(password)).not.toThrow();
            });
        });

        it('should reject passwords without uppercase letters', () => {
            const result = passwordSchema.safeParse('password1!');
            expect(result.success).toBe(false);
        });

        it('should reject passwords without lowercase letters', () => {
            const result = passwordSchema.safeParse('PASSWORD1!');
            expect(result.success).toBe(false);
        });

        it('should reject passwords without numbers', () => {
            const result = passwordSchema.safeParse('Password!');
            expect(result.success).toBe(false);
        });

        it('should reject passwords without special characters', () => {
            const result = passwordSchema.safeParse('Password1');
            expect(result.success).toBe(false);
        });

        it('should reject passwords shorter than 8 characters', () => {
            const result = passwordSchema.safeParse('Pass1!');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
            }
        });

        it('should accept passwords with multiple special characters', () => {
            expect(() => passwordSchema.parse('P@ssw0rd!#$')).not.toThrow();
        });
    });

    describe('Registration Schema', () => {
        const validData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+639123456789',
            password: 'Password1!',
            confirmPassword: 'Password1!',
            acceptTerms: true,
        };

        it('should accept valid registration data', () => {
            expect(() => registerSchema.parse(validData)).not.toThrow();
        });

        it('should accept registration with optional fields', () => {
            const dataWithOptional = {
                ...validData,
                barangay: 'Gredu (Poblacion)',
                address: '123 Test Street, Panabo City',
            };
            expect(() => registerSchema.parse(dataWithOptional)).not.toThrow();
        });

        it('should reject when passwords do not match', () => {
            const result = registerSchema.safeParse({
                ...validData,
                confirmPassword: 'DifferentPassword1!',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const confirmError = result.error.issues.find(e => e.path.includes('confirmPassword'));
                expect(confirmError?.message).toBe('Passwords do not match');
            }
        });

        it('should reject empty first name', () => {
            const result = registerSchema.safeParse({
                ...validData,
                firstName: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject empty last name', () => {
            const result = registerSchema.safeParse({
                ...validData,
                lastName: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject when terms are not accepted', () => {
            const result = registerSchema.safeParse({
                ...validData,
                acceptTerms: false,
            });
            expect(result.success).toBe(false);
        });

        it('should reject first name that is too long', () => {
            const result = registerSchema.safeParse({
                ...validData,
                firstName: 'A'.repeat(51),
            });
            expect(result.success).toBe(false);
        });
    });

    describe('Login Schema', () => {
        it('should accept valid login data', () => {
            const validLogin = {
                email: 'user@example.com',
                password: 'anypassword',
            };
            expect(() => loginSchema.parse(validLogin)).not.toThrow();
        });

        it('should accept login with remember me option', () => {
            const loginWithRemember = {
                email: 'user@example.com',
                password: 'anypassword',
                rememberMe: true,
            };
            expect(() => loginSchema.parse(loginWithRemember)).not.toThrow();
        });

        it('should reject empty password for login', () => {
            const result = loginSchema.safeParse({
                email: 'user@example.com',
                password: '',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password is required');
            }
        });

        it('should reject invalid email for login', () => {
            const result = loginSchema.safeParse({
                email: 'invalid-email',
                password: 'password',
            });
            expect(result.success).toBe(false);
        });
    });
});
