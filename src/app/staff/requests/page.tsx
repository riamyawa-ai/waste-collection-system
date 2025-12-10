import { redirect } from 'next/navigation';

// Redirect /staff/requests to /staff/collections
export default function StaffRequestsPage() {
    redirect('/staff/collections');
}
