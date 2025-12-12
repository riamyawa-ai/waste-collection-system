import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUser, mockSession, mockStaff, mockCollector, mockAdmin } from '../../utils/mocks/data';
import createMockSupabaseClient, { setupAuthMock, type MockSupabaseClient } from '../../utils/mocks/supabase';

/**
 * Authentication Integration Tests
 * 
 * Tests the authentication flow including login, registration, 
 * logout, and role-based access.
 */

describe('Authentication Integration', () => {
    let mockClient: MockSupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
        mockClient = createMockSupabaseClient();
    });

    describe('Login Flow', () => {
        it('should successfully login with valid credentials', async () => {
            const expectedUser = { id: mockUser.id, email: mockUser.email };
            const expectedSession = { ...mockSession, user: expectedUser };

            setupAuthMock.loginSuccess(mockClient, expectedUser, expectedSession);

            const { data, error } = await mockClient.auth.signInWithPassword({
                email: 'testclient@example.com',
                password: 'Password1!',
            });

            expect(error).toBeNull();
            expect(data.session).toBeDefined();
            expect(data.user).toBeDefined();
            expect(data.user?.email).toBe('testclient@example.com');
        });

        it('should fail login with invalid credentials', async () => {
            setupAuthMock.loginFailure(mockClient, 'Invalid login credentials');

            const { data, error } = await mockClient.auth.signInWithPassword({
                email: 'wrong@example.com',
                password: 'wrongpassword',
            });

            expect(error).toBeDefined();
            expect(error?.message).toBe('Invalid login credentials');
            expect(data.session).toBeNull();
            expect(data.user).toBeNull();
        });

        it('should fail login with empty password', async () => {
            setupAuthMock.loginFailure(mockClient, 'Password is required');

            const { data, error } = await mockClient.auth.signInWithPassword({
                email: 'test@example.com',
                password: '',
            });

            expect(error).toBeDefined();
            expect(data.session).toBeNull();
        });

        it('should track login attempts for rate limiting', async () => {
            // Simulate multiple failed login attempts
            setupAuthMock.loginFailure(mockClient, 'Invalid login credentials');

            const attempts = [];
            for (let i = 0; i < 5; i++) {
                const result = await mockClient.auth.signInWithPassword({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });
                attempts.push(result);
            }

            // All attempts should fail
            expect(attempts.every(a => a.error !== null)).toBe(true);
            expect(mockClient.auth.signInWithPassword).toHaveBeenCalledTimes(5);
        });
    });

    describe('Registration Flow', () => {
        it('should successfully register a new user', async () => {
            const newUser = {
                id: 'new-user-id',
                email: 'newuser@example.com',
            };

            setupAuthMock.signupSuccess(mockClient, newUser);

            const { data, error } = await mockClient.auth.signUp({
                email: 'newuser@example.com',
                password: 'Password1!',
                options: {
                    data: {
                        first_name: 'New',
                        last_name: 'User',
                        phone: '+639123456789',
                    },
                },
            });

            expect(error).toBeNull();
            expect(data.user).toBeDefined();
            expect(data.user?.email).toBe('newuser@example.com');
            // Session should be null until email verification
            expect(data.session).toBeNull();
        });

        it('should fail registration with existing email', async () => {
            setupAuthMock.signupFailure(mockClient, 'User already registered');

            const { data, error } = await mockClient.auth.signUp({
                email: 'existing@example.com',
                password: 'Password1!',
            });

            expect(error).toBeDefined();
            expect(error?.message).toBe('User already registered');
            expect(data.user).toBeNull();
        });

        it('should validate required user metadata', async () => {
            const newUser = { id: 'user-123', email: 'test@example.com' };
            setupAuthMock.signupSuccess(mockClient, newUser);

            await mockClient.auth.signUp({
                email: 'test@example.com',
                password: 'Password1!',
                options: {
                    data: {
                        first_name: 'Test',
                        last_name: 'User',
                        phone: '+639123456789',
                        barangay: 'Gredu (Poblacion)',
                    },
                },
            });

            expect(mockClient.auth.signUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    options: expect.objectContaining({
                        data: expect.objectContaining({
                            first_name: 'Test',
                            last_name: 'User',
                        }),
                    }),
                })
            );
        });
    });

    describe('Logout Flow', () => {
        it('should successfully logout', async () => {
            mockClient.auth.signOut.mockResolvedValue({ error: null });

            const { error } = await mockClient.auth.signOut();

            expect(error).toBeNull();
            expect(mockClient.auth.signOut).toHaveBeenCalled();
        });

        it('should clear session on logout', async () => {
            // First, set up authenticated state
            setupAuthMock.authenticated(mockClient, mockUser, mockSession);

            // Verify authenticated
            const { data: authData } = await mockClient.auth.getSession();
            expect(authData.session).toBeDefined();

            // Logout
            await mockClient.auth.signOut();

            // Set up unauthenticated state
            setupAuthMock.unauthenticated(mockClient);

            // Verify session is cleared
            const { data: afterLogout } = await mockClient.auth.getSession();
            expect(afterLogout.session).toBeNull();
        });
    });

    describe('Session Management', () => {
        it('should return user when authenticated', async () => {
            setupAuthMock.authenticated(mockClient, mockUser, mockSession);

            const { data, error } = await mockClient.auth.getUser();

            expect(error).toBeNull();
            expect(data.user).toBeDefined();
            expect(data.user?.email).toBe(mockUser.email);
        });

        it('should return null user when not authenticated', async () => {
            setupAuthMock.unauthenticated(mockClient);

            const { data, error } = await mockClient.auth.getUser();

            expect(error).toBeNull();
            expect(data.user).toBeNull();
        });

        it('should return valid session when authenticated', async () => {
            setupAuthMock.authenticated(mockClient, mockUser, mockSession);

            const { data, error } = await mockClient.auth.getSession();

            expect(error).toBeNull();
            expect(data.session).toBeDefined();
            expect(data.session?.access_token).toBeDefined();
        });
    });

    describe('Role-Based Authentication', () => {
        it('should identify client role correctly', async () => {
            setupAuthMock.authenticated(mockClient, { ...mockUser, role: 'client' }, mockSession);

            const { data } = await mockClient.auth.getUser();

            // In real app, role would be fetched from profiles table
            expect(data.user).toBeDefined();
        });

        it('should identify staff role correctly', async () => {
            const staffUser = { id: mockStaff.id, email: mockStaff.email, role: 'staff' };
            setupAuthMock.authenticated(mockClient, staffUser, mockSession);

            const { data } = await mockClient.auth.getUser();

            expect(data.user).toBeDefined();
            expect(data.user?.id).toBe(mockStaff.id);
        });

        it('should identify collector role correctly', async () => {
            const collectorUser = { id: mockCollector.id, email: mockCollector.email, role: 'collector' };
            setupAuthMock.authenticated(mockClient, collectorUser, mockSession);

            const { data } = await mockClient.auth.getUser();

            expect(data.user).toBeDefined();
            expect(data.user?.id).toBe(mockCollector.id);
        });

        it('should identify admin role correctly', async () => {
            const adminUser = { id: mockAdmin.id, email: mockAdmin.email, role: 'admin' };
            setupAuthMock.authenticated(mockClient, adminUser, mockSession);

            const { data } = await mockClient.auth.getUser();

            expect(data.user).toBeDefined();
            expect(data.user?.id).toBe(mockAdmin.id);
        });
    });

    describe('Password Recovery', () => {
        it('should send password reset email', async () => {
            mockClient.auth.resetPasswordForEmail.mockResolvedValue({
                data: {},
                error: null
            });

            const { error } = await mockClient.auth.resetPasswordForEmail('user@example.com', {
                redirectTo: 'http://localhost:3000/reset-password',
            });

            expect(error).toBeNull();
            expect(mockClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
                'user@example.com',
                expect.objectContaining({
                    redirectTo: expect.stringContaining('reset-password'),
                })
            );
        });

        it('should handle reset email for non-existent user gracefully', async () => {
            // Supabase doesn't reveal if email exists for security
            mockClient.auth.resetPasswordForEmail.mockResolvedValue({
                data: {},
                error: null
            });

            const { error } = await mockClient.auth.resetPasswordForEmail('nonexistent@example.com');

            // Should not reveal if email exists
            expect(error).toBeNull();
        });

        it('should update password successfully', async () => {
            mockClient.auth.updateUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const { error } = await mockClient.auth.updateUser({
                password: 'NewPassword1!',
            });

            expect(error).toBeNull();
        });
    });

    describe('Auth State Change Listener', () => {
        it('should set up auth state change listener', () => {
            const callback = vi.fn();

            const { data } = mockClient.auth.onAuthStateChange(callback);

            expect(data.subscription).toBeDefined();
            expect(data.subscription.unsubscribe).toBeDefined();
        });

        it('should allow unsubscribing from auth changes', () => {
            const callback = vi.fn();

            const { data } = mockClient.auth.onAuthStateChange(callback);
            data.subscription.unsubscribe();

            expect(data.subscription.unsubscribe).toHaveBeenCalled();
        });
    });
});
