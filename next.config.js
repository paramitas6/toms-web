// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals = config.externals || [];
        config.externals.push("@node-escpos/core", "@node-escpos/usb-adapter");
      }
      return config;
    },
  };
  
  module.exports = nextConfig;
  