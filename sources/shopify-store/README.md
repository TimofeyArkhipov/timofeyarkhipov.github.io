# Drift Store

**Live:** https://timofeyarkhipov.github.io/works/shopify-store/

Headless Shopify storefront built with Next.js (pages router), Tailwind CSS and the Shopify Storefront GraphQL API.

- Catalog and product pages are pre-rendered at build time (`getStaticProps` / `getStaticPaths`) and exported as static HTML
- Product page: gallery with variant images, option picker that marks sold-out combinations, quantity, sale prices
- Cart drawer on the Storefront Cart API (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`)
- Cart id is kept in `localStorage`, so the cart survives reloads; cart requests are queued so fast clicks can't race
- Checkout is handed over to Shopify (`checkoutUrl`)

## Structure

```
src/
  lib/shopify.js      Storefront API client: catalog queries and cart mutations
  context/context.js  cart state, persistence and the request queue
  components/         Layout (header, footer), CartDrawer, ProductCard / ProductGrid, ProductView
  pages/              home (catalog) and products/[product]
scripts/publish.js    copies the static export into ../../works/shopify-store
```

## Run

Create `.env.local` with the store credentials:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESSTOKEN=...
```

```
npm install
npm run dev     # local dev server: http://localhost:3000/works/shopify-store
npm run build   # static export into ../../works/shopify-store
```

The Storefront access token ends up in the browser bundle: Storefront tokens are public by design, give it only the scopes the store needs.
