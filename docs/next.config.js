const { createMDX } = require("fumadocs-mdx/next");

const withMDX = createMDX();
const isStaticExport = process.env.DOCS_STATIC_EXPORT === "true";
const basePath = process.env.DOCS_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  skipTrailingSlashRedirect: isStaticExport,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: isStaticExport,
  },
  experimental: {
    mdxRs: true,
  },
};

module.exports = withMDX(nextConfig);
