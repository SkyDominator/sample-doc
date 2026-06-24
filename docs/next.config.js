const { createMDX } = require("fumadocs-mdx/next");

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: true,
  },
};

module.exports = withMDX(nextConfig);
