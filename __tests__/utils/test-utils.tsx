import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Add providers as needed (Theme, Context, etc.)
function AllTheProviders({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => ({
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
});

export * from '@testing-library/react';
export { customRender as render };

// Mock global navigation if needed in tests
export const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
};
