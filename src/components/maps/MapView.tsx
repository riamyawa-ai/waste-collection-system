'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
    initialCenter?: [number, number];
    initialZoom?: number;
    markers?: Array<{
        id: string;
        coordinates: [number, number];
        title?: string;
        color?: string;
    }>;
    route?: [number, number][];
    showCurrentLocation?: boolean;
    className?: string;
    onMarkerClick?: (markerId: string) => void;
}

export default function MapView({
    initialCenter = [125.5313, 7.3075], // Panabo City center
    initialZoom = 12,
    markers = [],
    route,
    showCurrentLocation = false,
    className = 'h-[400px] w-full rounded-lg',
    onMarkerClick,
}: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
            console.error('Mapbox token not found');
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: initialCenter,
            zoom: initialZoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        if (showCurrentLocation) {
            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                    showUserHeading: true,
                }),
                'top-right'
            );
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [initialCenter, initialZoom, showCurrentLocation]);

    // Add markers
    useEffect(() => {
        if (!map.current) return;

        // Remove existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        markers.forEach((marker, index) => {
            const el = document.createElement('div');
            el.className = 'flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm cursor-pointer shadow-lg';
            el.style.backgroundColor = marker.color || '#16a34a';
            el.innerHTML = `${index + 1}`;

            const m = new mapboxgl.Marker({ element: el })
                .setLngLat(marker.coordinates)
                .addTo(map.current!);

            if (marker.title) {
                m.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(marker.title));
            }

            el.addEventListener('click', () => onMarkerClick?.(marker.id));
            markersRef.current.push(m);
        });
    }, [markers, onMarkerClick]);

    // Draw route
    useEffect(() => {
        if (!map.current || !route || route.length < 2) return;

        const sourceId = 'route';
        const layerId = 'route-line';

        map.current.on('load', () => {
            if (map.current?.getSource(sourceId)) {
                (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: route },
                });
            } else {
                map.current?.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates: route },
                    },
                });

                map.current?.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#16a34a', 'line-width': 4, 'line-opacity': 0.75 },
                });
            }
        });
    }, [route]);

    // Get current location
    useEffect(() => {
        if (!showCurrentLocation) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation([position.coords.longitude, position.coords.latitude]);
                },
                (error) => console.error('Error getting location:', error)
            );
        }
    }, [showCurrentLocation]);

    return (
        <div className={className}>
            <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </div>
    );
}
