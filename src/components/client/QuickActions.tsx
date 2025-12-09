'use client';

import Link from 'next/link';
import {
    Plus,
    CreditCard,
    Calendar,
    MessageSquare,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: React.ElementType;
    variant: 'primary' | 'secondary';
}

const quickActions: QuickAction[] = [
    {
        label: 'Request Pickup',
        description: 'Schedule a new waste collection',
        href: '/client/requests?new=true',
        icon: Plus,
        variant: 'primary',
    },
    {
        label: 'Payment History',
        description: 'View your payment records',
        href: '/client/payments',
        icon: CreditCard,
        variant: 'secondary',
    },
    {
        label: 'Collection Schedule',
        description: 'View upcoming pickups',
        href: '/client/schedule',
        icon: Calendar,
        variant: 'secondary',
    },
    {
        label: 'Submit Feedback',
        description: 'Rate your experience',
        href: '/client/feedback',
        icon: MessageSquare,
        variant: 'secondary',
    },
];

export function QuickActions() {
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={cn(
                            'flex items-center gap-4 p-3 rounded-lg transition-all group',
                            action.variant === 'primary'
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-eco'
                                : 'hover:bg-neutral-50 border border-neutral-200'
                        )}
                    >
                        <div
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                                action.variant === 'primary'
                                    ? 'bg-white/20'
                                    : 'bg-primary-50'
                            )}
                        >
                            <action.icon
                                className={cn(
                                    'w-5 h-5',
                                    action.variant === 'primary' ? 'text-white' : 'text-primary-600'
                                )}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className={cn(
                                    'font-medium',
                                    action.variant === 'primary' ? 'text-white' : 'text-neutral-900'
                                )}
                            >
                                {action.label}
                            </p>
                            <p
                                className={cn(
                                    'text-sm truncate',
                                    action.variant === 'primary'
                                        ? 'text-white/80'
                                        : 'text-neutral-500'
                                )}
                            >
                                {action.description}
                            </p>
                        </div>
                        <ArrowRight
                            className={cn(
                                'w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1',
                                action.variant === 'primary' ? 'text-white/70' : 'text-neutral-400'
                            )}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}
