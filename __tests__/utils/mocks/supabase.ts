import { vi } from 'vitest';

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

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

export const setupAuthMock = (client: MockSupabaseClient, user: { id: string; email: string } | null) => {
    client.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
    });
    client.auth.getSession.mockResolvedValue({
        data: { session: user ? { user } : null },
        error: null,
    });
};

export const setupQueryMock = (
    client: MockSupabaseClient,
    _tableName: string,
    data: unknown,
    error: { message: string } | null = null
) => {
    const mockChain = client.from();
    mockChain.single.mockResolvedValue({ data, error });
    mockChain.maybeSingle.mockResolvedValue({ data, error });
};

export default createMockSupabaseClient;
