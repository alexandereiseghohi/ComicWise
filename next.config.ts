import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler for automatic optimization
  reactCompiler: true,

  experimental: {
    // Turbopack caching for faster dev builds
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: false,

    // Type-safe environment variables
    typedEnv: true,

    // Optimized caching strategy
    staleTimes: {
      dynamic: 30,
      static: 180,
    },

    // Static generation optimization
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 16,
    staticGenerationMinPagesPerWorker: 25,

    // Package import optimization
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-label",
      "@radix-ui/react-switch",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-slider",
      "@radix-ui/react-separator",
      "lucide-react",
      "@tabler/icons-react",
      "@heroicons/react",
      "framer-motion",
      "recharts",
      "date-fns",
      "clsx",
      "class-variance-authority",
      "@tanstack/react-query",
    ],

    // Server optimization
    optimizeServerReact: true,
    serverMinification: true,
    webpackBuildWorker: true,

    // Server Actions configuration
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: ["localhost:3000"],
    },
  },

  // External packages for server-side
  serverExternalPackages: ["postgres", "libsql/client", "bcryptjs", "sharp", "nodemailer"],

  // Cache React Server Components
  // cacheComponents: true,
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "gg.asuracomic.net" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "localhost" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Type-safe routing
  typedRoutes: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Development indicators
  devIndicators: {
    position: "bottom-right",
  },

  // Bundle optimization
  bundlePagesRouterDependencies: true,

  // Security headers
  poweredByHeader: false,
  compress: true,
  // cacheComponents: true, // Disabled - incompatible with dynamic route segments

  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
  webpack: (config: Record<string, unknown>, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      const resolveConfig = config["resolve"] as Record<string, unknown>;
      resolveConfig["fallback"] = {
        ...(resolveConfig["fallback"] as Record<string, boolean>),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
