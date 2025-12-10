'use client';

import { useState, useCallback, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin,
    Trash2,
    Route,
    Maximize2,
    Minimize2,
    LocateFixed
} from 'lucide-react';
import {
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
    PANABO_CENTER,
    SAMPLE_LOCATIONS,
    LOCATION_TYPES,
    optimizeRoute,
    generateRouteGeoJson
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
    const [viewState, setViewState] = useState({
        longitude: PANABO_CENTER.longitude,
        latitude: PANABO_CENTER.latitude,
        zoom: PANABO_CENTER.zoom,
    });

    // Filter sample locations by type
    const filteredLocations = selectedType && selectedType !== 'all'
        ? SAMPLE_LOCATIONS.filter(loc => loc.type === selectedType)
        : SAMPLE_LOCATIONS;

    // Get location type color
    const getTypeColor = (type: string) => {
        const locationType = LOCATION_TYPES.find(t => t.id === type);
        return locationType?.color || '#64748b';
    };

    // Handle clicking on a sample location
    const handleLocationClick = (location: typeof SAMPLE_LOCATIONS[0]) => {
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
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
            {/* Type Filter */}
            {showSampleLocations && !readOnly && (
                <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1 max-w-[60%]">
                    {LOCATION_TYPES.filter(t => t.id !== 'all').map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${selectedType === type.id
                                ? 'bg-white text-slate-900'
                                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                                }`}
                            style={selectedType === type.id ? { backgroundColor: type.color, color: '#fff' } : {}}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                {stops.length >= 3 && !readOnly && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleOptimizeRoute}
                        className="bg-slate-800/80 text-white hover:bg-slate-700 border-0"
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
                        className="bg-slate-800/80 text-white hover:bg-slate-700 border-0"
                    >
                        <LocateFixed className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-slate-800/80 text-white hover:bg-slate-700 border-0"
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>

            {/* Map */}
            <Map
                ref={mapRef}
                {...viewState}
                onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                mapStyle={MAPBOX_STYLE}
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                style={{ width: '100%', height: isFullscreen ? '100vh' : height }}
                attributionControl={false}
            >
                <NavigationControl position="bottom-right" />
                <GeolocateControl
                    position="bottom-right"
                    trackUserLocation
                    showUserHeading
                />

                {/* Route Line */}
                {routeLineData && (
                    <Source id="route" type="geojson" data={routeLineData}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#10b981',
                                'line-width': 4,
                                'line-opacity': 0.8,
                            }}
                        />
                        <Layer
                            id="route-line-outline"
                            type="line"
                            paint={{
                                'line-color': '#047857',
                                'line-width': 6,
                                'line-opacity': 0.4,
                            }}
                        />
                    </Source>
                )}

                {/* Sample Location Markers */}
                {showSampleLocations && filteredLocations.map((location) => {
                    const isSelected = stops.some(s => s.id === location.id);
                    return (
                        <Marker
                            key={location.id}
                            longitude={location.lng}
                            latitude={location.lat}
                            onClick={() => handleLocationClick(location)}
                        >
                            <div
                                className={`cursor-pointer transition-all transform ${isSelected ? 'scale-125' : 'hover:scale-110'
                                    }`}
                                title={location.name}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 ${isSelected
                                        ? 'border-white bg-emerald-500'
                                        : 'border-white/50'
                                        }`}
                                    style={{
                                        backgroundColor: isSelected ? '#10b981' : getTypeColor(location.type),
                                    }}
                                >
                                    {isSelected && (
                                        <span className="text-white text-xs font-bold">
                                            {stops.findIndex(s => s.id === location.id) + 1}
                                        </span>
                                    )}
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
                            <div className="w-8 h-8 rounded-full bg-emerald-500 border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
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
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {stop.locationName}
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            {/* Selected Stops Panel (when fullscreen) */}
            {isFullscreen && stops.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10 w-80">
                    <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-400" />
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
                                        <span className="text-white truncate flex-1">{stop.locationName}</span>
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleRemoveStop(stop.id)}
                                                className="text-slate-400 hover:text-red-400"
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

            {/* Instructions (when no stops) */}
            {!readOnly && stops.length === 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-slate-800/90 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm">
                        Click on markers to add stops to your route
                    </div>
                </div>
            )}
        </div>
    );
}
