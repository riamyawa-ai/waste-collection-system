// MapBox utilities for the Waste Collection System

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

// Panabo City, Davao del Norte coordinates
export const PANABO_CENTER = {
    longitude: 125.6843,
    latitude: 7.3086,
    zoom: 13,
};

// Panabo City boundary (approximate)
export const PANABO_BOUNDS: [[number, number], [number, number]] = [
    [125.52, 7.15], // Southwest
    [125.85, 7.45], // Northeast
];

// Comprehensive Mapbox POI Categories mapping
export const MAPBOX_POI_CATEGORIES: Record<string, {
    label: string;
    icon: string;
    color: string;
    mapboxIds: string[]; // Mapbox category terms
}> = {
    food: {
        label: 'Food & Drink',
        icon: 'utensils',
        color: '#f59e0b', // amber-500
        mapboxIds: ['restaurant', 'cafe', 'bakery', 'food', 'fast_food']
    },
    shopping: {
        label: 'Shopping',
        icon: 'shopping-bag',
        color: '#ec4899', // pink-500
        mapboxIds: ['shop', 'store', 'mall', 'supermarket', 'grocery', 'clothing_store', 'electronics_store']
    },
    health: {
        label: 'Health',
        icon: 'hospital',
        color: '#ef4444', // red-500
        mapboxIds: ['hospital', 'clinic', 'pharmacy', 'doctor', 'dentist']
    },
    education: {
        label: 'Education',
        icon: 'school',
        color: '#3b82f6', // blue-500
        mapboxIds: ['school', 'college', 'university', 'kindergarten', 'library']
    },
    government: {
        label: 'Public Services',
        icon: 'building-2',
        color: '#6366f1', // indigo-500
        mapboxIds: ['government', 'post_office', 'police', 'fire_station', 'townhall']
    },
    leisure: {
        label: 'Leisure & Parks',
        icon: 'tree',
        color: '#22c55e', // green-500
        mapboxIds: ['park', 'garden', 'playground', 'cinema', 'museum', 'tourist_attraction']
    },
    financial: {
        label: 'Financial',
        icon: 'landmark',
        color: '#8b5cf6', // violet-500
        mapboxIds: ['bank', 'atm']
    },
    transport: {
        label: 'Transport',
        icon: 'car',
        color: '#0ea5e9', // sky-500
        mapboxIds: ['gas_station', 'parking', 'bus_station']
    },
    lodging: {
        label: 'Lodging',
        icon: 'bed',
        color: '#d946ef', // fuchsia-500
        mapboxIds: ['hotel', 'motel', 'guest_house']
    },
    residential: {
        label: 'Residential',
        icon: 'home',
        color: '#06b6d4', // cyan-500
        mapboxIds: ['residential', 'apartment', 'house', 'housing_development']
    }
};

// Flattened LOCATION_TYPES for backward compatibility and UI iteration
export const LOCATION_TYPES = [
    { id: 'all', label: 'All Types', icon: 'layers', color: '#64748b' },
    ...Object.entries(MAPBOX_POI_CATEGORIES).map(([key, config]) => ({
        id: key,
        label: config.label,
        icon: config.icon,
        color: config.color
    }))
];

// Sample locations in Panabo City for demonstration/fallback
export const SAMPLE_LOCATIONS = [
    // Schools
    { id: '1', name: 'Panabo National High School', type: 'education', address: 'J.P. Laurel, Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3100, lng: 125.6855 },
    { id: '2', name: 'University of Mindanao - Panabo', type: 'education', address: 'Gredu, Poblacion', barangay: 'Gredu (Poblacion)', lat: 7.3070, lng: 125.6820 },

    // Hospitals
    { id: '4', name: 'Panabo Polymedic General Hospital', type: 'health', address: 'Quezon St., Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3095, lng: 125.6860 },

    // Government
    { id: '8', name: 'Panabo City Hall', type: 'government', address: 'J.P. Laurel, Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3090, lng: 125.6845 },

    // Commercial
    { id: '10', name: 'Panabo Public Market', type: 'shopping', address: 'San Francisco, Poblacion', barangay: 'San Francisco (Poblacion)', lat: 7.3078, lng: 125.6838 },
    { id: '11', name: 'Gaisano Mall Panabo', type: 'shopping', address: 'Quezon, Poblacion', barangay: 'Quezon', lat: 7.3105, lng: 125.6870 },

    // Food
    { id: '20', name: 'Jollibee Panabo', type: 'food', address: 'Quezon St, Panabo', barangay: 'Poblacion', lat: 7.3082, lng: 125.6850 },
    { id: '21', name: 'McDonalds Panabo', type: 'food', address: 'National Highway', barangay: 'Poblacion', lat: 7.3085, lng: 125.6852 },
];

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Simple nearest neighbor route optimization
export function optimizeRoute(
    locations: Array<{ lat: number; lng: number; id: string }>
): string[] {
    if (locations.length <= 2) return locations.map(l => l.id);

    const optimized: string[] = [];
    const remaining = [...locations];

    // Start with the first location
    let current = remaining.shift()!;
    optimized.push(current.id);

    while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        remaining.forEach((loc, index) => {
            const distance = calculateDistance(current.lat, current.lng, loc.lat, loc.lng);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        current = remaining.splice(nearestIndex, 1)[0];
        optimized.push(current.id);
    }

    return optimized;
}

// Generate route GeoJSON for Mapbox
export function generateRouteGeoJson(
    locations: Array<{ lat: number; lng: number }>
): GeoJSON.Feature<GeoJSON.LineString> {
    return {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: locations.map(loc => [loc.lng, loc.lat]),
        },
    };
}

// Generate markers GeoJSON for Mapbox
export function generateMarkersGeoJson(
    locations: Array<{ id: string; name: string; lat: number; lng: number; type: string }>
): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
        type: 'FeatureCollection',
        features: locations.map((loc, index) => ({
            type: 'Feature',
            properties: {
                id: loc.id,
                name: loc.name,
                type: loc.type,
                stopNumber: index + 1,
            },
            geometry: {
                type: 'Point',
                coordinates: [loc.lng, loc.lat],
            },
        })),
    };
}
