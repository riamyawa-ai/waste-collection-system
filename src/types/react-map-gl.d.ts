// Type declarations for react-map-gl
declare module 'react-map-gl' {
    import * as React from 'react';
    import type { Map as MapboxMap, LngLatBoundsLike, PaddingOptions } from 'mapbox-gl';

    export interface ViewState {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch?: number;
        bearing?: number;
        padding?: PaddingOptions;
    }

    export interface ViewStateChangeEvent {
        viewState: ViewState;
        target: MapboxMap;
        originalEvent?: Event;
    }

    export interface MapMouseEvent {
        lngLat: { lng: number; lat: number };
        point: { x: number; y: number };
        originalEvent: MouseEvent;
        target: MapboxMap;
        features?: GeoJSON.Feature[];
    }

    export interface MarkerEvent {
        lngLat: { lng: number; lat: number };
        originalEvent: MouseEvent;
    }

    export interface MarkerDragEvent {
        lngLat: { lng: number; lat: number };
        originalEvent: MouseEvent | TouchEvent;
    }

    export interface MapRef {
        getMap(): MapboxMap;
        getCenter(): { lng: number; lat: number };
        getZoom(): number;
        getBearing(): number;
        getPitch(): number;
        fitBounds(
            bounds: LngLatBoundsLike,
            options?: { padding?: number | PaddingOptions; duration?: number; maxZoom?: number }
        ): void;
        flyTo(options: { center?: [number, number]; zoom?: number; duration?: number }): void;
        easeTo(options: { center?: [number, number]; zoom?: number; duration?: number }): void;
    }

    export interface MapProps {
        ref?: React.Ref<MapRef>;
        mapboxAccessToken?: string;
        mapStyle?: string;
        longitude?: number;
        latitude?: number;
        zoom?: number;
        pitch?: number;
        bearing?: number;
        style?: React.CSSProperties;
        onMove?: (evt: ViewStateChangeEvent) => void;
        onClick?: (evt: MapMouseEvent) => void;
        onLoad?: (evt: { target: MapboxMap }) => void;
        attributionControl?: boolean;
        maxBounds?: LngLatBoundsLike;
        children?: React.ReactNode;
    }

    export interface MarkerProps {
        longitude: number;
        latitude: number;
        anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        onClick?: (evt: MarkerEvent) => void;
        draggable?: boolean;
        onDragStart?: (evt: MarkerDragEvent) => void;
        onDrag?: (evt: MarkerDragEvent) => void;
        onDragEnd?: (evt: MarkerDragEvent) => void;
        children?: React.ReactNode;
    }

    export interface SourceProps {
        id: string;
        type: 'geojson' | 'vector' | 'raster' | 'image' | 'video';
        data?: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry | string;
        url?: string;
        tiles?: string[];
        children?: React.ReactNode;
    }

    export interface LayerProps {
        id: string;
        type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background';
        source?: string;
        paint?: Record<string, unknown>;
        layout?: Record<string, unknown>;
        filter?: (string | number | boolean | unknown[])[];
        minzoom?: number;
        maxzoom?: number;
    }

    export interface NavigationControlProps {
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        showCompass?: boolean;
        showZoom?: boolean;
        visualizePitch?: boolean;
    }

    export interface GeolocateControlProps {
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        trackUserLocation?: boolean;
        showUserLocation?: boolean;
        showUserHeading?: boolean;
        showAccuracyCircle?: boolean;
        positionOptions?: PositionOptions;
    }

    const Map: React.ForwardRefExoticComponent<MapProps & React.RefAttributes<MapRef>>;
    export const Marker: React.FC<MarkerProps>;
    export const Source: React.FC<SourceProps>;
    export const Layer: React.FC<LayerProps>;
    export const NavigationControl: React.FC<NavigationControlProps>;
    export const GeolocateControl: React.FC<GeolocateControlProps>;

    export default Map;
}
