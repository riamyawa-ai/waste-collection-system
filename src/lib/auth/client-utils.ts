// Client-safe auth utilities
// These functions don't import any server-side code

/**
 * Format email to show masked version
 * e.g., test@example.com -> t***@example.com
 */
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");

    if (!localPart || !domain) {
        return email;
    }

    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    }

    return `${localPart[0]}***@${domain}`;
}

/**
 * Format phone to show masked version
 * e.g., +639123456789 -> +63 912 ***6789
 */
export function maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length < 10) {
        return phone;
    }

    const lastFour = cleaned.slice(-4);
    return `***${lastFour}`;
}

/**
 * Format a name for display (capitalize first letters)
 */
export function formatName(name: string): string {
    return name
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}
