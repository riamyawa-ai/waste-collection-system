import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with necessary providers
 * This can be extended to include ThemeProvider, Context providers, etc.
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

/**
 * Custom render with providers and userEvent setup
 * @example
 * const { user, getByRole } = render(<MyComponent />);
 * await user.click(getByRole('button'));
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => ({
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
});

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

// Re-export userEvent
export { userEvent };
