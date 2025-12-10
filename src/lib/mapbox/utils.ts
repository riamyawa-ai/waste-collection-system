// MapBox utilities for the Waste Collection System

// Using a beautiful, modern map style - Mapbox Standard with satellite layers
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/navigation-day-v1';

// Panabo City, Davao del Norte coordinates - adjusted zoom for better city view
export const PANABO_CENTER = {
    longitude: 125.6843,
    latitude: 7.3086,
    zoom: 12.5, // Lower zoom to show more of the city
};

// Panabo City boundary (approximate)
export const PANABO_BOUNDS: [[number, number], [number, number]] = [
    [125.52, 7.15], // Southwest
    [125.85, 7.45], // Northeast
];

// Comprehensive Mapbox POI Categories mapping - now with MANY more types
export const MAPBOX_POI_CATEGORIES: Record<string, {
    label: string;
    icon: string;
    color: string;
    mapboxIds: string[]; // Mapbox category terms
}> = {
    // Food & Dining
    restaurant: {
        label: 'Restaurants',
        icon: 'utensils',
        color: '#f59e0b', // amber-500
        mapboxIds: ['restaurant', 'food', 'dining']
    },
    fast_food: {
        label: 'Fast Food',
        icon: 'burger',
        color: '#f97316', // orange-500
        mapboxIds: ['fast_food', 'burger_restaurant', 'quick_service']
    },
    pizza: {
        label: 'Pizza Places',
        icon: 'pizza',
        color: '#dc2626', // red-600
        mapboxIds: ['pizza_restaurant', 'pizzeria', 'pizza']
    },
    cafe: {
        label: 'Cafés & Coffee',
        icon: 'coffee',
        color: '#92400e', // amber-800
        mapboxIds: ['cafe', 'coffee_shop', 'coffee']
    },
    bakery: {
        label: 'Bakeries',
        icon: 'cake',
        color: '#fbbf24', // amber-400
        mapboxIds: ['bakery', 'pastry_shop', 'bread']
    },
    bar: {
        label: 'Bars & Pubs',
        icon: 'beer',
        color: '#a16207', // amber-700
        mapboxIds: ['bar', 'pub', 'nightclub', 'cocktail_bar']
    },

    // Shopping & Retail
    shopping: {
        label: 'Shopping Malls',
        icon: 'shopping-bag',
        color: '#ec4899', // pink-500
        mapboxIds: ['mall', 'shopping_center', 'department_store']
    },
    supermarket: {
        label: 'Supermarkets',
        icon: 'shopping-cart',
        color: '#22c55e', // green-500
        mapboxIds: ['supermarket', 'grocery', 'grocery_store']
    },
    convenience: {
        label: 'Convenience Stores',
        icon: 'store',
        color: '#0ea5e9', // sky-500
        mapboxIds: ['convenience_store', 'mini_market', 'convenience']
    },
    clothing: {
        label: 'Clothing Stores',
        icon: 'shirt',
        color: '#a855f7', // purple-500
        mapboxIds: ['clothing_store', 'fashion', 'boutique', 'apparel']
    },
    electronics: {
        label: 'Electronics',
        icon: 'smartphone',
        color: '#3b82f6', // blue-500
        mapboxIds: ['electronics_store', 'computer', 'mobile_phone']
    },
    market: {
        label: 'Markets',
        icon: 'store-front',
        color: '#84cc16', // lime-500
        mapboxIds: ['market', 'public_market', 'wet_market', 'farmers_market']
    },

    // Healthcare
    hospital: {
        label: 'Hospitals',
        icon: 'hospital',
        color: '#ef4444', // red-500
        mapboxIds: ['hospital', 'medical_center', 'emergency_room']
    },
    clinic: {
        label: 'Clinics',
        icon: 'stethoscope',
        color: '#f87171', // red-400
        mapboxIds: ['clinic', 'medical_clinic', 'health_center', 'doctor']
    },
    pharmacy: {
        label: 'Pharmacies',
        icon: 'pill',
        color: '#14b8a6', // teal-500
        mapboxIds: ['pharmacy', 'drugstore', 'chemist']
    },
    dentist: {
        label: 'Dental Clinics',
        icon: 'tooth',
        color: '#06b6d4', // cyan-500
        mapboxIds: ['dentist', 'dental_clinic', 'dental']
    },
    veterinary: {
        label: 'Veterinary',
        icon: 'paw',
        color: '#8b5cf6', // violet-500
        mapboxIds: ['veterinary', 'animal_hospital', 'pet_clinic']
    },

    // Education
    school: {
        label: 'Schools',
        icon: 'school',
        color: '#3b82f6', // blue-500
        mapboxIds: ['school', 'elementary_school', 'high_school', 'secondary_school']
    },
    university: {
        label: 'Universities',
        icon: 'graduation-cap',
        color: '#1d4ed8', // blue-700
        mapboxIds: ['college', 'university', 'higher_education']
    },
    library: {
        label: 'Libraries',
        icon: 'book',
        color: '#7c3aed', // violet-600
        mapboxIds: ['library', 'public_library']
    },
    daycare: {
        label: 'Daycare Centers',
        icon: 'baby',
        color: '#ec4899', // pink-500
        mapboxIds: ['kindergarten', 'daycare', 'preschool', 'nursery']
    },

    // Government & Civic
    government: {
        label: 'Government Offices',
        icon: 'building-2',
        color: '#6366f1', // indigo-500
        mapboxIds: ['government', 'townhall', 'city_hall', 'municipal']
    },
    police: {
        label: 'Police Stations',
        icon: 'shield',
        color: '#1e40af', // blue-800
        mapboxIds: ['police', 'police_station']
    },
    fire_station: {
        label: 'Fire Stations',
        icon: 'flame',
        color: '#dc2626', // red-600
        mapboxIds: ['fire_station', 'fire_department']
    },
    post_office: {
        label: 'Post Offices',
        icon: 'mail',
        color: '#f59e0b', // amber-500
        mapboxIds: ['post_office', 'postal']
    },
    courthouse: {
        label: 'Courts',
        icon: 'gavel',
        color: '#4b5563', // gray-600
        mapboxIds: ['courthouse', 'court', 'justice']
    },

    // Religious
    church: {
        label: 'Churches',
        icon: 'church',
        color: '#8b5cf6', // violet-500
        mapboxIds: ['church', 'chapel', 'cathedral', 'place_of_worship']
    },
    mosque: {
        label: 'Mosques',
        icon: 'moon',
        color: '#059669', // emerald-600
        mapboxIds: ['mosque', 'masjid']
    },
    temple: {
        label: 'Temples',
        icon: 'landmark',
        color: '#d97706', // amber-600
        mapboxIds: ['temple', 'buddhist_temple', 'hindu_temple']
    },

    // Leisure & Entertainment
    park: {
        label: 'Parks',
        icon: 'tree',
        color: '#22c55e', // green-500
        mapboxIds: ['park', 'garden', 'public_park', 'recreation']
    },
    gym: {
        label: 'Gyms & Fitness',
        icon: 'dumbbell',
        color: '#f43f5e', // rose-500
        mapboxIds: ['gym', 'fitness_center', 'health_club', 'sports_center']
    },
    cinema: {
        label: 'Cinemas',
        icon: 'film',
        color: '#6d28d9', // violet-700
        mapboxIds: ['cinema', 'movie_theater', 'theater']
    },
    museum: {
        label: 'Museums',
        icon: 'landmark',
        color: '#b45309', // amber-700
        mapboxIds: ['museum', 'gallery', 'art_museum']
    },
    sports: {
        label: 'Sports Facilities',
        icon: 'trophy',
        color: '#16a34a', // green-600
        mapboxIds: ['stadium', 'sports_complex', 'arena', 'court']
    },
    playground: {
        label: 'Playgrounds',
        icon: 'baby',
        color: '#84cc16', // lime-500
        mapboxIds: ['playground', 'children_playground']
    },

    // Financial Services
    bank: {
        label: 'Banks',
        icon: 'landmark',
        color: '#0891b2', // cyan-600
        mapboxIds: ['bank', 'financial_institution']
    },
    atm: {
        label: 'ATMs',
        icon: 'credit-card',
        color: '#0284c7', // sky-600
        mapboxIds: ['atm', 'cash_machine']
    },
    money_transfer: {
        label: 'Money Transfer',
        icon: 'banknote',
        color: '#059669', // emerald-600
        mapboxIds: ['money_transfer', 'remittance', 'pawnshop']
    },

    // Transportation
    gas_station: {
        label: 'Gas Stations',
        icon: 'fuel',
        color: '#0ea5e9', // sky-500
        mapboxIds: ['gas_station', 'fuel', 'petrol_station']
    },
    parking: {
        label: 'Parking',
        icon: 'parking',
        color: '#64748b', // slate-500
        mapboxIds: ['parking', 'parking_lot', 'parking_garage']
    },
    bus_station: {
        label: 'Bus Stations',
        icon: 'bus',
        color: '#2563eb', // blue-600
        mapboxIds: ['bus_station', 'bus_stop', 'terminal']
    },
    car_repair: {
        label: 'Auto Repair',
        icon: 'wrench',
        color: '#475569', // slate-600
        mapboxIds: ['car_repair', 'auto_repair', 'mechanic', 'car_wash']
    },

    // Lodging
    hotel: {
        label: 'Hotels',
        icon: 'bed',
        color: '#d946ef', // fuchsia-500
        mapboxIds: ['hotel', 'motel', 'resort']
    },
    hostel: {
        label: 'Hostels & Inns',
        icon: 'home',
        color: '#c026d3', // fuchsia-600
        mapboxIds: ['hostel', 'guest_house', 'inn', 'pension']
    },

    // Services
    salon: {
        label: 'Salons & Spas',
        icon: 'scissors',
        color: '#f472b6', // pink-400
        mapboxIds: ['beauty_salon', 'hair_salon', 'spa', 'barbershop']
    },
    laundry: {
        label: 'Laundry Services',
        icon: 'shirt',
        color: '#60a5fa', // blue-400
        mapboxIds: ['laundry', 'laundromat', 'dry_cleaning']
    },
    repair: {
        label: 'Repair Services',
        icon: 'wrench',
        color: '#78716c', // stone-500
        mapboxIds: ['repair', 'electronics_repair', 'phone_repair']
    },

    // Residential
    residential: {
        label: 'Residential Areas',
        icon: 'home',
        color: '#06b6d4', // cyan-500
        mapboxIds: ['residential', 'apartment', 'house', 'housing', 'subdivision']
    },

    // Industrial
    factory: {
        label: 'Industrial',
        icon: 'factory',
        color: '#71717a', // zinc-500
        mapboxIds: ['factory', 'industrial', 'manufacturing', 'warehouse']
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
