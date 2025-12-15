import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone", // CRUCIAL: Gera a pasta .next/standalone
  trailingSlash: true,

  // Ativa compressão Gzip/Brotli básica (útil se não passar por Nginx,
  // mas com Nginx configurado, o Nginx é mais eficiente nisso).
  compress: false,

  // Recomendo desativar o 'poweredByHeader' por segurança
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  productionBrowserSourceMaps: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    // optimizePackageImports ajuda no Tree Shaking, essencial para manter o standalone pequeno
    optimizePackageImports: ["lucide-react", "date-fns", "lodash"],
    serverActions: {
      // Defina o limite aqui (ex: 5mb, 10mb, 50mb)
      bodySizeLimit: "10mb",
    },
  },

  // Webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configuração defensiva para o Sharp
      config.externals = [
        ...(config.externals || []),
        {
          sharp: "commonjs sharp",
        },
      ];
    }
    return config;
  },

  // Headers de segurança básicos
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
