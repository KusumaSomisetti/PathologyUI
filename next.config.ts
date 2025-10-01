// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // optional: if you also have TS compile errors and need a quick deploy
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
