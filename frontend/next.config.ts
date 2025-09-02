import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export',
  images: {
    unoptimized: true,
  },
  
  // Настройки для работы с API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  
  // Настройки для стабильной гидратации
  compiler: {
    // Отключаем некоторые оптимизации, которые могут вызывать проблемы
    removeConsole: false,
  },
  
  // Стабильная конфигурация Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Настройки для разработки
  typescript: {
    // Игнорируем ошибки TypeScript в режиме разработки
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Игнорируем ошибки ESLint в режиме разработки
    ignoreDuringBuilds: false,
  },
  
  // Оптимизация для лучшей производительности
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Настройки для лучшей совместимости
  webpack: (config, { isServer }) => {
    // Добавляем fallback для Node.js модулей
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
