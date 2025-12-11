'use client';

/**
 * Realtime Subscription Hooks
 * 
 * Custom React hooks for subscribing to real-time database changes.
 * Will be fully implemented in DAY9.
 */

import { useEffect, useState, useCallback } from 'react';
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
 */
export function useRequestRealtime(
    requestId: string | null,
    onUpdate?: (request: CollectionRequest) => void
) {
    const [latestUpdate, setLatestUpdate] = useState<CollectionRequest | null>(null);

    useEffect(() => {
        if (!requestId) return;

        const channel = subscribeToRequestChanges(requestId, (payload) => {
            const newRequest = payload.new as CollectionRequest;
            setLatestUpdate(newRequest);
            onUpdate?.(newRequest);
        });

        return () => {
            unsubscribe(channel);
        };
    }, [requestId, onUpdate]);

    return latestUpdate;
}

/**
 * Hook to subscribe to notifications
 */
export function useNotificationsRealtime(
    userId: string | null,
    onNewNotification?: (notification: Notification) => void
) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const channel = subscribeToNotifications(userId, (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            onNewNotification?.(newNotification);
        });

        return () => {
            unsubscribe(channel);
        };
    }, [userId, onNewNotification]);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, is_read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return {
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
    };
}

/**
 * Hook for collectors to receive new assignments
 */
export function useCollectorAssignments(
    collectorId: string | null,
    onNewAssignment?: (request: CollectionRequest) => void
) {
    const [newAssignment, setNewAssignment] = useState<CollectionRequest | null>(null);

    useEffect(() => {
        if (!collectorId) return;

        const channel = subscribeToCollectorAssignments(collectorId, (payload) => {
            const request = payload.new as CollectionRequest;
            // Only notify for new assignments (status = 'assigned')
            if (request.status === 'assigned') {
                setNewAssignment(request);
                onNewAssignment?.(request);
            }
        });

        return () => {
            unsubscribe(channel);
        };
    }, [collectorId, onNewAssignment]);

    const clearAssignment = useCallback(() => {
        setNewAssignment(null);
    }, []);

    return { newAssignment, clearAssignment };
}

/**
 * Hook to subscribe to announcements
 */
export function useAnnouncementsRealtime(
    onNewAnnouncement?: (announcement: Announcement) => void
) {
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        const channel = subscribeToAnnouncements((payload) => {
            const announcement = payload.new as Announcement;
            if (announcement.is_published) {
                setLatestAnnouncement(announcement);
                onNewAnnouncement?.(announcement);
            }
        });

        return () => {
            unsubscribe(channel);
        };
    }, [onNewAnnouncement]);

    return latestAnnouncement;
}
