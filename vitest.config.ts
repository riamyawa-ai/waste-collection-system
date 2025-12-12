import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        // Test environment
        environment: 'jsdom',

        // Setup files
        setupFiles: ['./vitest.setup.ts'],

        // Include patterns
        include: ['__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],

        // Exclude patterns
        exclude: [
            'node_modules',
            'e2e',
            '.next',
            'dist',
        ],

        // Run tests sequentially (single worker) to prevent resource conflicts
        // This is equivalent to Jest's --runInBand
        fileParallelism: false,

        // Prevent parallel execution within test files
        sequence: {
            concurrent: false,
        },

        // Global test timeout (30 seconds)
        testTimeout: 30000,

        // Hook timeout
        hookTimeout: 30000,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{js,jsx,ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/types/**/*',
                'src/**/*.test.{js,jsx,ts,tsx}',
                'src/**/*.spec.{js,jsx,ts,tsx}',
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70,
                },
            },
        },

        // Reporter configuration
        reporters: ['verbose'],

        // Global variables (like Jest's expect)
        globals: true,
    },

    // Resolve aliases (matches tsconfig paths)
    resolve: {
        alias: {
            '@': '/src',
            '@tests': '/__tests__',
        },
    },
});
