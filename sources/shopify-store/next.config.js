/** @type {import('next').NextConfig} */

// Static export for GitHub Pages: the site lives at /works/shopify-store/.
// Product pages are pre-rendered at build time; the cart talks to the
// Storefront API straight from the browser.
const nextConfig = {
  output: 'export',
  basePath: '/works/shopify-store',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  env: {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESSTOKEN: process.env.SHOPIFY_STOREFRONT_ACCESSTOKEN,
  },
}

module.exports = nextConfig
