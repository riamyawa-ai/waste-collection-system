'use client';

/**
 * Realtime Subscription Hooks
 * 
 * Custom React hooks for subscribing to real-time database changes.
 * Optimized with proper cleanup and callback stability.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
    subscribeToRequestChanges,
    subscribeToNotifications,
    subscribeToCollectorAssignments,
    subscribeToAnnouncements,
    unsubscribe,
} from '@/lib/realtime';
import { CollectionRequest, Notification, Announcement } from '@/types/models';

/**
 * Hook to subscribe to request status changes
 * Uses stable callback reference to prevent subscription recreation
 */
export function useRequestRealtime(
    requestId: string | null,
    onUpdate?: (request: CollectionRequest) => void
) {
    const [latestUpdate, setLatestUpdate] = useState<CollectionRequest | null>(null);
    const onUpdateRef = useRef(onUpdate);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Keep callback ref updated without triggering effect
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        if (!requestId) return;

        // Cleanup previous subscription if exists
        if (channelRef.current) {
            unsubscribe(channelRef.current);
        }

        channelRef.current = subscribeToRequestChanges(requestId, (payload) => {
            const newRequest = payload.new as CollectionRequest;
            setLatestUpdate(newRequest);
            onUpdateRef.current?.(newRequest);
        });

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [requestId]);

    return latestUpdate;
}

/**
 * Hook to subscribe to notifications
 * Optimized with stable callbacks and proper cleanup
 */
export function useNotificationsRealtime(
    userId: string | null,
    onNewNotification?: (notification: Notification) => void
) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const onNewNotificationRef = useRef(onNewNotification);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Keep callback ref updated
    useEffect(() => {
        onNewNotificationRef.current = onNewNotification;
    }, [onNewNotification]);

    useEffect(() => {
        if (!userId) return;

        // Cleanup previous subscription
        if (channelRef.current) {
            unsubscribe(channelRef.current);
        }

        channelRef.current = subscribeToNotifications(userId, (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            onNewNotificationRef.current?.(newNotification);
        });

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [userId]);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, is_read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const removeNotification = useCallback((notificationId: string) => {
        setNotifications((prev) => {
            const notification = prev.find((n) => n.id === notificationId);
            if (notification && !notification.is_read) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }
            return prev.filter((n) => n.id !== notificationId);
        });
    }, []);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
    };
}

/**
 * Hook for collectors to receive new assignments
 * Optimized with proper cleanup and callback stability
 */
export function useCollectorAssignments(
    collectorId: string | null,
    onNewAssignment?: (request: CollectionRequest) => void
) {
    const [newAssignment, setNewAssignment] = useState<CollectionRequest | null>(null);
    const [assignmentQueue, setAssignmentQueue] = useState<CollectionRequest[]>([]);
    const onNewAssignmentRef = useRef(onNewAssignment);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Keep callback ref updated
    useEffect(() => {
        onNewAssignmentRef.current = onNewAssignment;
    }, [onNewAssignment]);

    useEffect(() => {
        if (!collectorId) return;

        // Cleanup previous subscription
        if (channelRef.current) {
            unsubscribe(channelRef.current);
        }

        channelRef.current = subscribeToCollectorAssignments(collectorId, (payload) => {
            const request = payload.new as CollectionRequest;
            // Only notify for new assignments (status = 'assigned')
            if (request.status === 'assigned') {
                setNewAssignment(request);
                setAssignmentQueue((prev) => [...prev, request]);
                onNewAssignmentRef.current?.(request);
            }
        });

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [collectorId]);

    const clearAssignment = useCallback(() => {
        setNewAssignment(null);
    }, []);

    const dismissAssignment = useCallback((requestId: string) => {
        setAssignmentQueue((prev) => prev.filter((r) => r.id !== requestId));
        if (newAssignment?.id === requestId) {
            setNewAssignment(null);
        }
    }, [newAssignment]);

    const clearQueue = useCallback(() => {
        setAssignmentQueue([]);
        setNewAssignment(null);
    }, []);

    return {
        newAssignment,
        assignmentQueue,
        clearAssignment,
        dismissAssignment,
        clearQueue,
    };
}

/**
 * Hook to subscribe to announcements
 * Optimized with proper cleanup
 */
export function useAnnouncementsRealtime(
    onNewAnnouncement?: (announcement: Announcement) => void
) {
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
    const [announcementHistory, setAnnouncementHistory] = useState<Announcement[]>([]);
    const onNewAnnouncementRef = useRef(onNewAnnouncement);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Keep callback ref updated
    useEffect(() => {
        onNewAnnouncementRef.current = onNewAnnouncement;
    }, [onNewAnnouncement]);

    useEffect(() => {
        // Cleanup previous subscription
        if (channelRef.current) {
            unsubscribe(channelRef.current);
        }

        channelRef.current = subscribeToAnnouncements((payload) => {
            const announcement = payload.new as Announcement;
            if (announcement.is_published) {
                setLatestAnnouncement(announcement);
                setAnnouncementHistory((prev) => [announcement, ...prev.slice(0, 9)]);
                onNewAnnouncementRef.current?.(announcement);
            }
        });

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    const dismissAnnouncement = useCallback(() => {
        setLatestAnnouncement(null);
    }, []);

    return {
        latestAnnouncement,
        announcementHistory,
        dismissAnnouncement,
    };
}

/**
 * Generic realtime subscription hook
 * For custom subscriptions with full control
 */
export function useRealtimeSubscription<T>(
    subscribe: () => RealtimeChannel,
    onMessage: (data: T) => void,
    deps: React.DependencyList = []
) {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        // Cleanup previous subscription
        if (channelRef.current) {
            unsubscribe(channelRef.current);
        }

        channelRef.current = subscribe();

        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return channelRef;
}

/**
 * Hook to check realtime connection status
 */
export function useRealtimeStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [lastConnected, setLastConnected] = useState<Date | null>(null);

    useEffect(() => {
        const handleOnline = () => {
            setIsConnected(true);
            setLastConnected(new Date());
        };

        const handleOffline = () => {
            setIsConnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial status
        setIsConnected(navigator.onLine);
        if (navigator.onLine) {
            setLastConnected(new Date());
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isConnected, lastConnected };
}
