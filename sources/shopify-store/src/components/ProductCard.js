import Link from 'next/link'
import { money, sized } from '@/utils/helpers'

export function Price({ price, compareAt, currency, className = '' }) {
  return (
    <span className={`tabular-nums ${className}`}>
      {money(price, currency)}
      {compareAt && <s className="ml-2 text-mute">{money(compareAt, currency)}</s>}
    </span>
  )
}

export default function ProductCard({ product, index = 0 }) {
  const { handle, title, image, available, compareAt } = product
  const badge = !available ? 'Sold out' : compareAt ? 'Sale' : null

  return (
    <Link href={`/products/${handle}/`} className="rise group block min-w-0" style={{ animationDelay: `${(index % 6) * 60}ms` }}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-tile">
        {image && (
          <img
            src={sized(image.url, 700)}
            alt={image.alt}
            loading="lazy"
            className={`h-full w-full object-cover mix-blend-multiply transition duration-700 ease-out group-hover:scale-[1.04] ${available ? '' : 'opacity-60 grayscale'}`}
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-medium">{badge}</span>
        )}
      </div>
      <div className="mt-4 min-w-0">
        <h3 className="text-[15px] font-medium leading-snug">{title}</h3>
        <Price {...product} className="mt-1 block text-[14px] text-mute" />
      </div>
    </Link>
  )
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  )
}
