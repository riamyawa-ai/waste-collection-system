'use client';

import { Suspense } from 'react';
import { RequestsPageContent } from './RequestsPageContent';

export default function ClientRequestsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <RequestsPageContent />
        </Suspense>
    );
}
