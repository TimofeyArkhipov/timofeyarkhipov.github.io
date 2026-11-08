import Head from 'next/head'
import Link from 'next/link'
import { getProduct, getProductHandles } from '@/lib/shopify'
import ProductView from '@/components/ProductView'
import { ProductGrid } from '@/components/ProductCard'

export default function ProductPage({ product }) {
  return (
    <>
      <Head><title>{`${product.title} · Drift`}</title></Head>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <nav className="mb-8 text-[13px] text-mute" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.title}</span>
        </nav>

        <ProductView product={product} />

        {product.recommended.length > 0 && (
          <section className="mt-24">
            <div className="mb-8 border-b border-line pb-4">
              <h2 className="text-lg font-medium">You may also like</h2>
            </div>
            <ProductGrid products={product.recommended.slice(0, 3)} />
          </section>
        )}
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const handles = await getProductHandles()
  return { paths: handles.map((product) => ({ params: { product } })), fallback: false }
}

export async function getStaticProps({ params }) {
  const product = await getProduct(params.product)
  if (!product) return { notFound: true }
  return { props: { product } }
}
