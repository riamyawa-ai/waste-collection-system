import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile react-map-gl for proper ESM support
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // Use empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
};

export default nextConfig;
