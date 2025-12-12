import { vi } from 'vitest';

/**
 * Mock Supabase Client
 * 
 * Provides a configurable mock of the Supabase client for testing.
 * Can be customized per test using vi.mocked().
 */

// Create chainable mock functions
const createChainableMock = () => {
    const mock: Record<string, unknown> = {};

    const chainMethods = [
        'select', 'insert', 'update', 'delete', 'upsert',
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
        'like', 'ilike', 'is', 'in', 'contains',
        'order', 'limit', 'range', 'filter',
        'match', 'not', 'or', 'and',
    ];

    chainMethods.forEach((method) => {
        mock[method] = vi.fn().mockReturnValue(mock);
    });

    // Terminal methods
    mock.single = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mock.then = undefined; // Remove promise-like behavior from chain

    return mock;
};

// Create storage mock
const createStorageMock = () => ({
    from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null }),
    })),
});

// Create auth mock
const createAuthMock = () => ({
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
    })),
});

// Create realtime mock
const createRealtimeMock = () => {
    const channel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue('subscribed'),
        unsubscribe: vi.fn(),
        send: vi.fn(),
        track: vi.fn(),
        untrack: vi.fn(),
    };

    return {
        channel: vi.fn(() => channel),
        removeChannel: vi.fn(),
        removeAllChannels: vi.fn(),
        getChannels: vi.fn().mockReturnValue([]),
    };
};

// Main mock client factory
export const createMockSupabaseClient = () => ({
    auth: createAuthMock(),
    from: vi.fn(() => createChainableMock()),
    storage: createStorageMock(),
    ...createRealtimeMock(),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
});

// Type for the mock client
export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

// Helper to set up common auth scenarios
export const setupAuthMock = {
    authenticated: (client: MockSupabaseClient, user: object, session: object) => {
        client.auth.getUser.mockResolvedValue({ data: { user }, error: null });
        client.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    },

    unauthenticated: (client: MockSupabaseClient) => {
        client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
        client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    },

    loginSuccess: (client: MockSupabaseClient, user: object, session: object) => {
        client.auth.signInWithPassword.mockResolvedValue({
            data: { user, session },
            error: null
        });
    },

    loginFailure: (client: MockSupabaseClient, message = 'Invalid login credentials') => {
        client.auth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message, status: 400 }
        });
    },

    signupSuccess: (client: MockSupabaseClient, user: object) => {
        client.auth.signUp.mockResolvedValue({
            data: { user, session: null },
            error: null
        });
    },

    signupFailure: (client: MockSupabaseClient, message = 'User already registered') => {
        client.auth.signUp.mockResolvedValue({
            data: { user: null, session: null },
            error: { message, status: 400 }
        });
    },
};

// Helper to set up common database query scenarios
export const setupQueryMock = {
    success: (client: MockSupabaseClient, tableName: string, data: unknown) => {
        const mockChain = createChainableMock();
        mockChain.single = vi.fn().mockResolvedValue({ data, error: null });
        client.from.mockImplementation((name: string) => {
            if (name === tableName) return mockChain;
            return createChainableMock();
        });
    },

    list: (client: MockSupabaseClient, tableName: string, data: unknown[]) => {
        const mockChain = createChainableMock();
        // Override the chain to return array data
        mockChain.select = vi.fn().mockResolvedValue({ data, error: null });
        client.from.mockImplementation((name: string) => {
            if (name === tableName) return mockChain;
            return createChainableMock();
        });
    },

    error: (client: MockSupabaseClient, tableName: string, message = 'Database error') => {
        const mockChain = createChainableMock();
        mockChain.single = vi.fn().mockResolvedValue({ data: null, error: { message } });
        client.from.mockImplementation((name: string) => {
            if (name === tableName) return mockChain;
            return createChainableMock();
        });
    },
};

export default createMockSupabaseClient;
