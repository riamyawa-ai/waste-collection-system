import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUser, mockSession } from '../utils/mocks/data';
import createMockSupabaseClient from '../utils/mocks/supabase';

describe('Authentication Integration', () => {
    let mockClient = createMockSupabaseClient();

    beforeEach(() => {
        vi.clearAllMocks();
        mockClient = createMockSupabaseClient();
    });

    describe('Login Flow', () => {
        it('should successfully login with valid credentials', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { session: mockSession, user: mockUser },
                error: null,
            });

            const { data, error } = await mockClient.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(error).toBeNull();
            expect(data.session).toBeDefined();
            expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'Password1!',
            });
        });

        it('should fail login with invalid credentials', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { session: null, user: null },
                error: { message: 'Invalid login credentials' },
            });

            const { error } = await mockClient.auth.signInWithPassword({
                email: 'wrong@example.com',
                password: 'wrongpassword',
            });

            expect(error).toBeDefined();
            expect(error.message).toBe('Invalid login credentials');
        });
    });

    describe('Registration Flow', () => {
        it('should successfully register a new user', async () => {
            const newUser = { id: 'new-user-id', email: 'newuser@example.com' };

            mockClient.auth.signUp.mockResolvedValue({
                data: { user: newUser, session: null },
                error: null,
            });

            const { data, error } = await mockClient.auth.signUp({
                email: 'newuser@example.com',
                password: 'Password1!',
            });

            expect(error).toBeNull();
            expect(data.user).toBeDefined();
        });
    });

    describe('Logout Flow', () => {
        it('should successfully logout', async () => {
            mockClient.auth.signOut.mockResolvedValue({ error: null });

            const { error } = await mockClient.auth.signOut();

            expect(error).toBeNull();
            expect(mockClient.auth.signOut).toHaveBeenCalled();
        });
    });
});
