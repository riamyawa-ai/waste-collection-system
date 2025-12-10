// MapBox configuration and exports

// Access token from environment variable
// This must be prefixed with NEXT_PUBLIC_ to be available on the client side
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Mapbox style URL - Using navigation-day style for clearer roads and better visual appeal
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/navigation-day-v1';

// Alternative styles for different use cases
export const MAPBOX_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

// Panabo City, Davao del Norte default coordinates - adjusted zoom for city-wide view
export const PANABO_CENTER = {
  latitude: 7.3086,
  longitude: 125.6843,
  zoom: 12, // Lower zoom to show more establishments
};

// Default map configuration
export const DEFAULT_MAP_CONFIG = {
  ...PANABO_CENTER,
  pitch: 0,
  bearing: 0,
  minZoom: 10,
  maxZoom: 18,
};

// Re-export utilities
export * from './utils';
