import Head from 'next/head'
import { ProductGrid } from '@/components/ProductCard'
import { getProducts } from '@/lib/shopify'
import { sized } from '@/utils/helpers'

export default function Home({ products }) {
  const hero = products.find((p) => p.available && p.image) || products[0]

  return (
    <>
      <Head><title>Drift · Snowboard store</title></Head>

      <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="rise min-w-0">
          <p className="label">Winter collection</p>
          <h1 className="mt-5 text-[40px] font-medium leading-[1.05] tracking-tight sm:text-6xl">
            Boards for the<br />quiet side of<br />the mountain.
          </h1>
          <p className="mt-6 max-w-sm text-mute">
            A short list of snowboards and wax. Pick a size, add it to the cart, check out on Shopify.
          </p>
          <a href="#shop" className="btn mt-8">Shop the collection</a>
        </div>
        {hero?.image && (
          <div className="rise aspect-[4/5] overflow-hidden rounded-2xl bg-tile md:aspect-[5/6]" style={{ animationDelay: '120ms' }}>
            <img src={sized(hero.image.url, 1100)} alt={hero.image.alt} className="h-full w-full object-cover mix-blend-multiply" />
          </div>
        )}
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-8 sm:px-6">
        <div className="mb-8 flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="text-lg font-medium">All products</h2>
          <span className="text-sm text-mute">{products.length} items</span>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  )
}

export async function getStaticProps() {
  return { props: { products: await getProducts() } }
}
