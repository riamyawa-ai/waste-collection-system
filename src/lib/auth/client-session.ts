"use client";

import { createClient } from "@/lib/supabase/client";

// Session configuration
export const SESSION_CONFIG = {
    // Session timeout in milliseconds (30 minutes)
    TIMEOUT_MS: 30 * 60 * 1000,
    // Warning before timeout (5 minutes)
    WARNING_BEFORE_TIMEOUT_MS: 5 * 60 * 1000,
    // Activity update throttle (1 minute)
    ACTIVITY_THROTTLE_MS: 60 * 1000,
    // Storage key for last activity
    LAST_ACTIVITY_KEY: "last_activity_timestamp",
} as const;

/**
 * Client-side session manager
 */
export class ClientSessionManager {
    private supabase = createClient();
    private lastActivityUpdate = 0;
    private timeoutWarningCallback?: () => void;
    private timeoutCallback?: () => void;
    private checkInterval?: ReturnType<typeof setInterval>;

    /**
     * Initialize the session manager
     */
    init(options: {
        onTimeoutWarning?: () => void;
        onTimeout?: () => void;
    } = {}) {
        this.timeoutWarningCallback = options.onTimeoutWarning;
        this.timeoutCallback = options.onTimeout;

        // Update activity on user interactions
        if (typeof window !== "undefined") {
            const events = ["mousedown", "keydown", "scroll", "touchstart"];
            events.forEach((event) => {
                window.addEventListener(event, this.handleActivity.bind(this), { passive: true });
            });

            // Start checking for timeout
            this.startTimeoutCheck();
        }

        return this;
    }

    /**
     * Handle user activity
     */
    private handleActivity() {
        const now = Date.now();

        // Throttle activity updates
        if (now - this.lastActivityUpdate < SESSION_CONFIG.ACTIVITY_THROTTLE_MS) {
            return;
        }

        this.lastActivityUpdate = now;
        this.updateLastActivity();
    }

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                SESSION_CONFIG.LAST_ACTIVITY_KEY,
                Date.now().toString()
            );
        }
    }

    /**
     * Get last activity timestamp
     */
    getLastActivity(): number {
        if (typeof window === "undefined") {
            return Date.now();
        }

        const stored = localStorage.getItem(SESSION_CONFIG.LAST_ACTIVITY_KEY);
        return stored ? parseInt(stored, 10) : Date.now();
    }

    /**
     * Check if session is about to timeout
     */
    isTimeoutWarning(): boolean {
        const lastActivity = this.getLastActivity();
        const elapsed = Date.now() - lastActivity;
        const warningThreshold =
            SESSION_CONFIG.TIMEOUT_MS - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT_MS;

        return elapsed >= warningThreshold && elapsed < SESSION_CONFIG.TIMEOUT_MS;
    }

    /**
     * Check if session has timed out
     */
    isTimedOut(): boolean {
        const lastActivity = this.getLastActivity();
        const elapsed = Date.now() - lastActivity;
        return elapsed >= SESSION_CONFIG.TIMEOUT_MS;
    }

    /**
     * Get remaining time until timeout
     */
    getRemainingTime(): number {
        const lastActivity = this.getLastActivity();
        const elapsed = Date.now() - lastActivity;
        return Math.max(0, SESSION_CONFIG.TIMEOUT_MS - elapsed);
    }

    /**
     * Start checking for session timeout
     */
    private startTimeoutCheck() {
        // Check every 30 seconds
        this.checkInterval = setInterval(() => {
            if (this.isTimedOut()) {
                this.handleTimeout();
            } else if (this.isTimeoutWarning()) {
                this.timeoutWarningCallback?.();
            }
        }, 30000);
    }

    /**
     * Handle session timeout
     */
    private async handleTimeout() {
        this.cleanup();
        this.timeoutCallback?.();

        // Sign out
        await this.supabase.auth.signOut();

        // Redirect to login
        if (typeof window !== "undefined") {
            window.location.href = "/login?reason=timeout";
        }
    }

    /**
     * Extend the session
     */
    async extendSession(): Promise<boolean> {
        const { data, error } = await this.supabase.auth.refreshSession();

        if (error) {
            console.error("Failed to extend session:", error);
            return false;
        }

        this.updateLastActivity();
        return !!data.session;
    }

    /**
     * Cleanup event listeners and intervals
     */
    cleanup() {
        if (typeof window !== "undefined") {
            const events = ["mousedown", "keydown", "scroll", "touchstart"];
            events.forEach((event) => {
                window.removeEventListener(event, this.handleActivity.bind(this));
            });
        }

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Singleton instance
let sessionManager: ClientSessionManager | null = null;

export function getClientSessionManager(): ClientSessionManager {
    if (!sessionManager) {
        sessionManager = new ClientSessionManager();
    }
    return sessionManager;
}
