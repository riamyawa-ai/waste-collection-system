import { describe, it, expect } from 'vitest';
import { emailSchema, phoneSchema, passwordSchema, loginSchema, registerSchema } from '@/lib/validators/auth';

describe('Auth Validators', () => {
    describe('Email Validation', () => {
        it('should accept valid email addresses', () => {
            expect(() => emailSchema.parse('test@example.com')).not.toThrow();
            expect(() => emailSchema.parse('user.name+tag@domain.co.uk')).not.toThrow();
        });

        it('should reject invalid email addresses', () => {
            expect(() => emailSchema.parse('invalid-email')).toThrow();
            expect(() => emailSchema.parse('@domain.com')).toThrow();
            expect(() => emailSchema.parse('user@')).toThrow();
        });
    });

    describe('Phone Number Validation', () => {
        it('should accept valid Philippine phone numbers', () => {
            expect(() => phoneSchema.parse('+639123456789')).not.toThrow();
            expect(() => phoneSchema.parse('09123456789')).not.toThrow();
            // Test the cleaning logic (schema removes spaces/dashes)
            expect(() => phoneSchema.parse('+63 912 345 6789')).not.toThrow();
        });

        it('should reject invalid phone numbers', () => {
            expect(() => phoneSchema.parse('123456789')).toThrow();
            expect(() => phoneSchema.parse('+1234567890')).toThrow(); // Wrong country code logic if enforced strictly or just length/structure? Regex is /^(\+?63|0)?9\d{9}$/
        });
    });

    describe('Password Validation', () => {
        it('should accept strong passwords', () => {
            expect(() => passwordSchema.parse('StrongP@ssw0rd!')).not.toThrow();
        });

        it('should reject weak passwords', () => {
            expect(() => passwordSchema.parse('weak')).toThrow(); // Too short
            expect(() => passwordSchema.parse('password123')).toThrow(); // No uppercase, no special
            expect(() => passwordSchema.parse('PASSWORD123!')).toThrow(); // No lowercase
        });
    });

    describe('Login Form Schema', () => {
        it('should validate complete login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password', // Login schema might just check min(1) depending on implementation, let's check auth.ts
                // auth.ts: password: z.string().min(1, "Password is required")
                rememberMe: true
            };
            expect(() => loginSchema.parse(validData)).not.toThrow();
        });
    });

    describe('Register Form Schema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '09123456789',
                password: 'StrongP@ssw0rd!',
                confirmPassword: 'StrongP@ssw0rd!',
                agreeToTerms: true
            };
            expect(() => registerSchema.parse(validData)).not.toThrow();
        });

        it('should reject when passwords do not match', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '09123456789',
                password: 'StrongP@ssw0rd!',
                confirmPassword: 'MismatchPassword!',
                agreeToTerms: true
            };
            expect(() => registerSchema.parse(invalidData)).toThrow(/Passwords do not match/);
        });
    });
});
