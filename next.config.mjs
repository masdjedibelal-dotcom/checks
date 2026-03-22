/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Gegen EMFILE / „too many open files“ auf macOS (File-Watcher) */
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Kein X-Frame-Options: SAMEORIGIN auf /demo/* — sonst laden eingebettete Checks
  // auf Kundenwebsites (fremde Origin) im Browser gar nicht (Makler-iFrame nach Kauf).
  // Zugriff steuert middleware.ts (Token / Referer).
};

export default nextConfig;
