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

// Location types for quick routes
export const LOCATION_TYPES = [
    { id: 'schools', label: 'Schools', icon: 'school', color: '#3b82f6' },
    { id: 'hospitals', label: 'Hospitals', icon: 'hospital', color: '#ef4444' },
    { id: 'parks', label: 'Parks & Plaza', icon: 'tree', color: '#22c55e' },
    { id: 'government', label: 'Government Offices', icon: 'building', color: '#8b5cf6' },
    { id: 'commercial', label: 'Establishments/Commercial', icon: 'store', color: '#f59e0b' },
    { id: 'residential', label: 'Residential Areas', icon: 'home', color: '#06b6d4' },
    { id: 'markets', label: 'Markets', icon: 'shopping-cart', color: '#ec4899' },
    { id: 'all', label: 'All Types', icon: 'layers', color: '#64748b' },
] as const;

// Sample locations in Panabo City for demonstration
export const SAMPLE_LOCATIONS = [
    // Schools
    { id: '1', name: 'Panabo National High School', type: 'schools', address: 'J.P. Laurel, Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3100, lng: 125.6855 },
    { id: '2', name: 'University of Mindanao - Panabo', type: 'schools', address: 'Gredu, Poblacion', barangay: 'Gredu (Poblacion)', lat: 7.3070, lng: 125.6820 },
    { id: '3', name: 'Panabo Central Elementary School', type: 'schools', address: 'San Francisco, Poblacion', barangay: 'San Francisco (Poblacion)', lat: 7.3085, lng: 125.6840 },

    // Hospitals
    { id: '4', name: 'Panabo Polymedic General Hospital', type: 'hospitals', address: 'Quezon St., Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3095, lng: 125.6860 },
    { id: '5', name: 'DOLE Hospital', type: 'hospitals', address: 'A.O. Floirendo', barangay: 'A.O. Floirendo', lat: 7.2820, lng: 125.6540 },

    // Parks
    { id: '6', name: 'Panabo City Hall Park', type: 'parks', address: 'J.P. Laurel, Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3092, lng: 125.6848 },
    { id: '7', name: 'Panabo Freedom Park', type: 'parks', address: 'San Nicolas, Poblacion', barangay: 'San Nicolas (Poblacion)', lat: 7.3110, lng: 125.6830 },

    // Government
    { id: '8', name: 'Panabo City Hall', type: 'government', address: 'J.P. Laurel, Poblacion', barangay: 'J.P. Laurel (Poblacion)', lat: 7.3090, lng: 125.6845 },
    { id: '9', name: 'Panabo Public Market (Government)', type: 'government', address: 'San Francisco, Poblacion', barangay: 'San Francisco (Poblacion)', lat: 7.3075, lng: 125.6835 },

    // Commercial
    { id: '10', name: 'Panabo Public Market', type: 'commercial', address: 'San Francisco, Poblacion', barangay: 'San Francisco (Poblacion)', lat: 7.3078, lng: 125.6838 },
    { id: '11', name: 'Gaisano Mall Panabo', type: 'commercial', address: 'Quezon, Poblacion', barangay: 'Quezon', lat: 7.3105, lng: 125.6870 },

    // Residential
    { id: '12', name: 'Villa Esperanza Subdivision', type: 'residential', address: 'Kasilak', barangay: 'Kasilak', lat: 7.3150, lng: 125.6900 },
    { id: '13', name: 'Buenavista Heights', type: 'residential', address: 'Buenavista', barangay: 'Buenavista', lat: 7.2950, lng: 125.6780 },

    // Markets
    { id: '14', name: 'Panabo Public Market Main', type: 'markets', address: 'San Francisco, Poblacion', barangay: 'San Francisco (Poblacion)', lat: 7.3080, lng: 125.6840 },
    { id: '15', name: 'New Visayas Market', type: 'markets', address: 'New Visayas', barangay: 'New Visayas', lat: 7.3200, lng: 125.7000 },
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
