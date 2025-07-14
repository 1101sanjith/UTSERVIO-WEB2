import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['storage.googleapis.com'], // Add your allowed domains here
  },
  matcher: [
    // Only run middleware on paths that do NOT start with:
    // - _next (static files)
    // - favicon.ico
    // - files with extensions (e.g., .js, .css)
    '/((?!_next|favicon.ico|.*\\..*).*)',
  ],
};

export default nextConfig;
