'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navigation, MapPin, Clock, ChevronRight } from 'lucide-react';

interface Stop {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    estimatedTime?: string;
    completed?: boolean;
    order: number;
}

interface RouteMapProps {
    stops: Stop[];
    onStopClick?: (stop: Stop) => void;
    onStartNavigation?: () => void;
    className?: string;
}

export default function RouteMap({ stops, onStopClick, onStartNavigation, className = '' }: RouteMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) return;

        mapboxgl.accessToken = token;

        // Calculate center from stops
        const center: [number, number] = stops.length > 0
            ? [
                stops.reduce((sum, s) => sum + s.coordinates[0], 0) / stops.length,
                stops.reduce((sum, s) => sum + s.coordinates[1], 0) / stops.length,
            ]
            : [125.5313, 7.3075];

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center,
            zoom: 13,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add markers for each stop
        stops.forEach((stop, index) => {
            const el = document.createElement('div');
            el.className = `flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm cursor-pointer shadow-lg transition-transform hover:scale-110 ${stop.completed ? 'bg-green-500' : 'bg-blue-500'
                }`;
            el.innerHTML = `${index + 1}`;
            el.onclick = () => {
                setSelectedStop(stop);
                onStopClick?.(stop);
            };

            new mapboxgl.Marker({ element: el })
                .setLngLat(stop.coordinates)
                .addTo(map.current!);
        });

        // Draw route line if we have coordinates
        if (stops.length >= 2) {
            map.current.on('load', () => {
                map.current?.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: stops.map(s => s.coordinates),
                        },
                    },
                });

                map.current?.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 1] },
                });
            });
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [stops, onStopClick]);

    return (
        <div className={`grid gap-4 lg:grid-cols-3 ${className}`}>
            {/* Map */}
            <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-600" />
                            Route Map
                        </CardTitle>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onStartNavigation}>
                            <Navigation className="h-4 w-4 mr-2" />
                            Start Navigation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div ref={mapContainer} className="h-[400px] w-full rounded-lg" />
                </CardContent>
            </Card>

            {/* Stops List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Stops ({stops.length})</span>
                        <Badge>{stops.filter(s => s.completed).length}/{stops.length} done</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                            {stops.map((stop, index) => (
                                <button
                                    key={stop.id}
                                    onClick={() => {
                                        setSelectedStop(stop);
                                        onStopClick?.(stop);
                                        map.current?.flyTo({ center: stop.coordinates, zoom: 15 });
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedStop?.id === stop.id ? 'border-green-500 bg-green-50' :
                                            stop.completed ? 'border-green-200 bg-green-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${stop.completed ? 'bg-green-500' : 'bg-blue-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{stop.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                                            {stop.estimatedTime && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    {stop.estimatedTime}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
