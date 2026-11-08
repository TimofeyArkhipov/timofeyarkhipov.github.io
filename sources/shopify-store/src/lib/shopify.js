// Shopify Storefront API client.
// Catalog queries run at build time (getStaticProps), cart mutations run in the browser.

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_ACCESSTOKEN
const API_VERSION = '2025-10'

async function shopify(query, variables = {}) {
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Shopify request failed: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '))
  return json.data
}

/* ---------- Catalog ---------- */

const CARD = `
  id
  handle
  title
  availableForSale
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount } }
  featuredImage { url altText width height }
`

function toCard(p) {
  const price = Number(p.priceRange.minVariantPrice.amount)
  const compareAt = Number(p.compareAtPriceRange?.minVariantPrice?.amount || 0)
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    available: p.availableForSale,
    price,
    compareAt: compareAt > price ? compareAt : null,
    currency: p.priceRange.minVariantPrice.currencyCode,
    image: p.featuredImage ? { url: p.featuredImage.url, alt: p.featuredImage.altText || p.title } : null,
  }
}

export async function getProducts() {
  const data = await shopify(`{
    collection(handle: "frontpage") { products(first: 50) { nodes { ${CARD} } } }
    products(first: 50) { nodes { ${CARD} } }
  }`)
  // Front page collection keeps the merchant's order; products missing from it go to the end
  const ordered = data.collection?.products.nodes || []
  const seen = new Set(ordered.map((p) => p.id))
  return [...ordered, ...data.products.nodes.filter((p) => !seen.has(p.id))].map(toCard)
}

export async function getProductHandles() {
  const data = await shopify(`{ products(first: 250) { nodes { handle } } }`)
  return data.products.nodes.map((p) => p.handle)
}

export async function getProduct(handle) {
  const data = await shopify(
    `query Product($handle: String!) {
      product(handle: $handle) {
        ${CARD}
        descriptionHtml
        productType
        images(first: 10) { nodes { url altText } }
        options { name values }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount }
            selectedOptions { name value }
            image { url altText }
          }
        }
      }
    }`,
    { handle }
  )
  const p = data.product
  if (!p) return null

  const recs = await shopify(
    `query Recs($id: ID!) { productRecommendations(productId: $id) { ${CARD} } }`,
    { id: p.id }
  ).catch(() => ({ productRecommendations: [] }))

  return {
    ...toCard(p),
    type: p.productType,
    descriptionHtml: p.descriptionHtml,
    images: p.images.nodes.map((i) => ({ url: i.url, alt: i.altText || p.title })),
    // Shopify returns a single "Title" option for products without variants
    options: p.options.filter((o) => !(o.name === 'Title' && o.values.length === 1)),
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      available: v.availableForSale,
      price: Number(v.price.amount),
      compareAt: v.compareAtPrice && Number(v.compareAtPrice.amount) > Number(v.price.amount) ? Number(v.compareAtPrice.amount) : null,
      options: Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value])),
      image: v.image ? { url: v.image.url, alt: v.image.altText || p.title } : null,
    })),
    recommended: (recs.productRecommendations || []).filter((r) => r.id !== p.id).slice(0, 4).map(toCard),
  }
}

/* ---------- Cart ---------- */

const CART = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          image { url altText }
          product { title handle featuredImage { url altText } }
        }
      }
    }
  }
`

function toCart(c) {
  if (!c) return null
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: Number(c.cost.subtotalAmount.amount),
    currency: c.cost.subtotalAmount.currencyCode,
    lines: c.lines.nodes.map((l) => {
      const m = l.merchandise
      const img = m.image || m.product.featuredImage
      return {
        id: l.id,
        quantity: l.quantity,
        total: Number(l.cost.totalAmount.amount),
        variantId: m.id,
        variantTitle: m.title === 'Default Title' ? '' : m.title,
        title: m.product.title,
        handle: m.product.handle,
        image: img ? { url: img.url, alt: img.altText || m.product.title } : null,
      }
    }),
  }
}

function unwrap(payload) {
  if (payload.userErrors?.length) throw new Error(payload.userErrors.map((e) => e.message).join('; '))
  return toCart(payload.cart)
}

export async function fetchCart(cartId) {
  const data = await shopify(`query Cart($id: ID!) { cart(id: $id) { ${CART} } }`, { id: cartId })
  return toCart(data.cart)
}

export async function createCart(lines) {
  const data = await shopify(
    `mutation Create($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ${CART} } userErrors { message } } }`,
    { lines }
  )
  return unwrap(data.cartCreate)
}

export async function addCartLines(cartId, lines) {
  const data = await shopify(
    `mutation Add($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART} } userErrors { message } } }`,
    { id: cartId, lines }
  )
  return unwrap(data.cartLinesAdd)
}

export async function updateCartLines(cartId, lines) {
  const data = await shopify(
    `mutation Update($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART} } userErrors { message } } }`,
    { id: cartId, lines }
  )
  return unwrap(data.cartLinesUpdate)
}

export async function removeCartLines(cartId, lineIds) {
  const data = await shopify(
    `mutation Remove($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CART} } userErrors { message } } }`,
    { id: cartId, ids: lineIds }
  )
  return unwrap(data.cartLinesRemove)
}
