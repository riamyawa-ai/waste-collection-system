import { vi } from 'vitest';

const createMockSupabaseClient = () => ({
    auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
    })),
    storage: {
        from: vi.fn(() => ({
            upload: vi.fn(),
            getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
        })),
    }
});

export default createMockSupabaseClient;
