'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin,
    Trash2,
    Route,
    Maximize2,
    Minimize2,
    LocateFixed,
    Loader2,
    Layers,
} from 'lucide-react';
import {
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
    MAPBOX_STYLES,
    PANABO_CENTER,
    LOCATION_TYPES,
    MAPBOX_POI_CATEGORIES,
    optimizeRoute,
    generateRouteGeoJson,
} from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Stop {
    id: string;
    locationName: string;
    locationType: string;
    address: string;
    barangay: string;
    latitude: number;
    longitude: number;
}

interface MapLocation {
    id: string;
    name: string;
    type: string;
    address: string;
    barangay: string;
    lat: number;
    lng: number;
}

interface MapboxRouteEditorProps {
    stops: Stop[];
    onStopsChange: (stops: Stop[]) => void;
    onAddStop?: (stop: Stop) => void;
    onRemoveStop?: (stopId: string) => void;
    readOnly?: boolean;
    showSampleLocations?: boolean;
    height?: string;
}

export function MapboxRouteEditor({
    stops,
    onStopsChange,
    onAddStop,
    onRemoveStop,
    readOnly = false,
    showSampleLocations = true,
    height = '400px',
}: MapboxRouteEditorProps) {
    const mapRef = useRef<MapRef>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [locations, setLocations] = useState<MapLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
    const [viewState, setViewState] = useState({
        longitude: PANABO_CENTER.longitude,
        latitude: PANABO_CENTER.latitude,
        zoom: 13, // Better zoom for city view with visible landmarks
    });

    // Get current map style URL
    const currentMapStyle = mapStyle === 'satellite' ? MAPBOX_STYLES.satellite : MAPBOX_STYLES.streets;

    // Handle map load
    const handleMapLoad = useCallback(() => {
        setIsMapLoaded(true);
    }, []);

    // Fetch POIs from Mapbox when type is selected and map is loaded
    useEffect(() => {
        if (!isMapLoaded) return;

        if (selectedType && selectedType !== 'all') {
            fetchPOIs(selectedType);
        } else if (selectedType === 'all') {
            // Fetch all types
            fetchAllPOIs();
        } else {
            setLocations([]);
        }
    }, [selectedType, isMapLoaded]);

    const fetchPOIs = async (type: string) => {
        setLoading(true);
        try {
            const config = MAPBOX_POI_CATEGORIES[type];
            const categories = config ? config.mapboxIds : [type];
            const bbox = '125.52,7.15,125.85,7.45'; // Panabo City bounds

            const allResults: MapLocation[] = [];

            // Fetch from all mapbox IDs for this type (up to 4 categories)
            for (const category of categories.slice(0, 4)) {
                const response = await fetch(
                    `https://api.mapbox.com/search/searchbox/v1/category/${category}?` +
                    `access_token=${MAPBOX_ACCESS_TOKEN}&` +
                    `bbox=${bbox}&` +
                    `limit=25&` + // Increased limit for more comprehensive results
                    `language=en`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.features) {
                        const mapped = data.features.map((feature: {
                            properties: { mapbox_id: string; name: string; full_address?: string; context?: { place?: { name: string } } };
                            geometry: { coordinates: [number, number] };
                        }) => ({
                            id: feature.properties.mapbox_id,
                            name: feature.properties.name,
                            type: type,
                            address: feature.properties.full_address || 'Panabo City',
                            barangay: feature.properties.context?.place?.name || 'Panabo',
                            lat: feature.geometry.coordinates[1],
                            lng: feature.geometry.coordinates[0],
                        }));
                        allResults.push(...mapped);
                    }
                }
            }

            // Remove duplicates based on ID
            const unique = allResults.filter((v, i, a) =>
                a.findIndex(t => t.id === v.id) === i
            );

            setLocations(unique);
        } catch (error) {
            console.error('Error fetching POIs:', error);
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPOIs = async () => {
        setLoading(true);
        try {
            const allResults: MapLocation[] = [];
            const types = Object.keys(MAPBOX_POI_CATEGORIES);

            // Fetch from more types (up to 15) for comprehensive coverage
            for (const type of types.slice(0, 15)) {
                const config = MAPBOX_POI_CATEGORIES[type];
                const category = config.mapboxIds[0];
                const bbox = '125.52,7.15,125.85,7.45';

                const response = await fetch(
                    `https://api.mapbox.com/search/searchbox/v1/category/${category}?` +
                    `access_token=${MAPBOX_ACCESS_TOKEN}&` +
                    `bbox=${bbox}&` +
                    `limit=10&` + // More results per type
                    `language=en`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.features) {
                        const mapped = data.features.map((feature: {
                            properties: { mapbox_id: string; name: string; full_address?: string; context?: { place?: { name: string } } };
                            geometry: { coordinates: [number, number] };
                        }) => ({
                            id: feature.properties.mapbox_id,
                            name: feature.properties.name,
                            type: type,
                            address: feature.properties.full_address || 'Panabo City',
                            barangay: feature.properties.context?.place?.name || 'Panabo',
                            lat: feature.geometry.coordinates[1],
                            lng: feature.geometry.coordinates[0],
                        }));
                        allResults.push(...mapped);
                    }
                }
            }

            // Remove duplicates
            const unique = allResults.filter((v, i, a) =>
                a.findIndex(t => t.id === v.id) === i
            );

            setLocations(unique);
        } catch (error) {
            console.error('Error fetching all POIs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get location type color
    const getTypeColor = (type: string) => {
        // First try to find in specific types
        const config = MAPBOX_POI_CATEGORIES[type];
        if (config) return config.color;

        // Fallback to location types list
        const locationType = LOCATION_TYPES.find(t => t.id === type);
        return locationType?.color || '#64748b';
    };

    // Handle clicking on a location
    const handleLocationClick = (location: MapLocation) => {
        if (readOnly) return;

        // Check if already added
        if (stops.find(s => s.id === location.id)) return;

        const newStop: Stop = {
            id: location.id,
            locationName: location.name,
            locationType: location.type,
            address: location.address,
            barangay: location.barangay,
            latitude: location.lat,
            longitude: location.lng,
        };

        if (onAddStop) {
            onAddStop(newStop);
        } else {
            onStopsChange([...stops, newStop]);
        }
    };

    // Handle removing a stop
    const handleRemoveStop = (stopId: string) => {
        if (readOnly) return;

        if (onRemoveStop) {
            onRemoveStop(stopId);
        } else {
            onStopsChange(stops.filter(s => s.id !== stopId));
        }
    };

    // Optimize route order
    const handleOptimizeRoute = () => {
        if (stops.length < 3) return;

        const optimizedIds = optimizeRoute(
            stops.map(s => ({ id: s.id, lat: s.latitude, lng: s.longitude }))
        );

        const reorderedStops = optimizedIds
            .map(id => stops.find(s => s.id === id))
            .filter((s): s is Stop => s !== undefined);

        onStopsChange(reorderedStops);
    };

    // Generate route line data
    const routeLineData = stops.length >= 2
        ? generateRouteGeoJson(stops.map(s => ({ lat: s.latitude, lng: s.longitude })))
        : null;

    // Fit map to show all stops
    const fitToStops = useCallback(() => {
        if (stops.length === 0 || !mapRef.current) return;

        const bounds = stops.reduce(
            (acc, stop) => ({
                minLng: Math.min(acc.minLng, stop.longitude),
                maxLng: Math.max(acc.maxLng, stop.longitude),
                minLat: Math.min(acc.minLat, stop.latitude),
                maxLat: Math.max(acc.maxLat, stop.latitude),
            }),
            { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
        );

        mapRef.current.fitBounds(
            [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
            { padding: 50, duration: 1000 }
        );
    }, [stops]);

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            {/* Type Filter */}
            {showSampleLocations && !readOnly && (
                <div className="absolute top-3 left-3 z-10 w-[calc(100%-140px)]">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2">
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                            {/* All Types Button */}
                            <button
                                onClick={() => setSelectedType(selectedType === 'all' ? null : 'all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedType === 'all'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                All Types
                            </button>
                            {/* Individual Type Buttons */}
                            {LOCATION_TYPES.filter(t => t.id !== 'all').map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedType === type.id
                                        ? 'text-white shadow-md transform scale-105'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    style={selectedType === type.id ? { backgroundColor: type.color } : {}}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${selectedType === type.id ? 'bg-white/50' : ''}`}
                                        style={selectedType !== type.id ? { backgroundColor: type.color } : {}}
                                    />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-sm text-neutral-600">Loading locations...</span>
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                {/* Map Style Switcher */}
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
                    className="bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 shadow-sm"
                >
                    <Layers className="h-4 w-4 mr-1" />
                    {mapStyle === 'streets' ? 'Satellite' : 'Streets'}
                </Button>
                {stops.length >= 3 && !readOnly && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleOptimizeRoute}
                        className="bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 shadow-sm"
                    >
                        <Route className="h-4 w-4 mr-1" />
                        Optimize
                    </Button>
                )}
                {stops.length > 0 && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={fitToStops}
                        className="bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 shadow-sm"
                    >
                        <LocateFixed className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 shadow-sm"
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>

            {/* Map */}
            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                onLoad={handleMapLoad}
                mapStyle={currentMapStyle}
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                style={{ width: '100%', height: isFullscreen ? '100vh' : height }}
                attributionControl={false}
                maxBounds={[
                    [125.52, 7.15], // Southwest coordinates
                    [125.85, 7.45]  // Northeast coordinates
                ]}
            >
                <NavigationControl position="bottom-right" />
                <GeolocateControl
                    position="bottom-right"
                    trackUserLocation
                    showUserHeading
                />

                {/* Route Line - only render after map is loaded */}
                {isMapLoaded && routeLineData && (
                    <Source id="route" type="geojson" data={routeLineData}>
                        <Layer
                            id="route-line-outline"
                            type="line"
                            paint={{
                                'line-color': '#047857',
                                'line-width': 6,
                                'line-opacity': 0.4,
                            }}
                        />
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#10b981',
                                'line-width': 4,
                                'line-opacity': 0.8,
                            }}
                        />
                    </Source>
                )}

                {/* Location Markers from API */}
                {showSampleLocations && isMapLoaded && locations.map((location) => {
                    const isSelected = stops.some(s => s.id === location.id);
                    const isHighlighted = selectedType && (selectedType === 'all' || location.type === selectedType);
                    const typeColor = getTypeColor(location.type);

                    return (
                        <Marker
                            key={location.id}
                            longitude={location.lng}
                            latitude={location.lat}
                            onClick={() => handleLocationClick(location)}
                        >
                            <div
                                className={`cursor-pointer transition-all duration-200 transform ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}`}
                                title={`${location.name} - ${location.type}`}
                            >
                                {/* Highlight ring for selected type */}
                                {isHighlighted && !isSelected && (
                                    <div
                                        className="absolute -inset-1 rounded-full animate-pulse opacity-40"
                                        style={{ backgroundColor: typeColor }}
                                    />
                                )}
                                <div
                                    className={`relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${isSelected
                                        ? 'border-white ring-2 ring-emerald-400 ring-offset-1'
                                        : 'border-white hover:ring-2 hover:ring-offset-1'
                                        }`}
                                    style={{
                                        backgroundColor: isSelected ? '#10b981' : typeColor,
                                        '--tw-ring-color': typeColor,
                                    } as React.CSSProperties}
                                >
                                    {isSelected ? (
                                        <span className="text-white text-xs font-bold">
                                            {stops.findIndex(s => s.id === location.id) + 1}
                                        </span>
                                    ) : (
                                        <MapPin className="w-3.5 h-3.5 text-white" />
                                    )}
                                </div>
                                {/* Location name tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
                                    {location.name}
                                </div>
                            </div>
                        </Marker>
                    );
                })}

                {/* Selected Stop Markers (with numbers) */}
                {stops.map((stop, index) => (
                    <Marker
                        key={`selected-${stop.id}`}
                        longitude={stop.longitude}
                        latitude={stop.latitude}
                    >
                        <div className="relative group">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={() => handleRemoveStop(stop.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {stop.locationName}
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            {/* Selected Stops Panel (when fullscreen) */}
            {isFullscreen && stops.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10 w-80">
                    <Card className="bg-white shadow-lg">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm text-neutral-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                Selected Stops ({stops.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 max-h-48 overflow-y-auto">
                            <div className="space-y-2">
                                {stops.map((stop, index) => (
                                    <div key={stop.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-neutral-900 truncate flex-1">{stop.locationName}</span>
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleRemoveStop(stop.id)}
                                                className="text-neutral-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Instructions (when no type selected) */}
            {!readOnly && !selectedType && stops.length === 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white text-neutral-700 text-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200">
                        Select a location type above to show places on the map
                    </div>
                </div>
            )}

            {/* No results message */}
            {!loading && selectedType && locations.length === 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white text-neutral-700 text-sm px-4 py-2 rounded-lg shadow-md border border-neutral-200">
                        No {selectedType} found in this area. Try another category.
                    </div>
                </div>
            )}
        </div>
    );
}
