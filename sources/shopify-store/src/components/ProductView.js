import { useMemo, useState } from 'react'
import { useCart } from '@/context/context'
import { sized } from '@/utils/helpers'
import { Price } from './ProductCard'

function sameOptions(a, b) {
  return Object.keys(b).every((k) => a[k] === b[k])
}

function Gallery({ images, active, onSelect }) {
  const main = images[active]
  return (
    <div className="min-w-0 md:sticky md:top-24">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-tile">
        {main && <img key={main.url} src={sized(main.url, 1200)} alt={main.alt} className="rise h-full w-full object-cover mix-blend-multiply" style={{ animationDuration: '.4s' }} />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-lg bg-tile transition ${i === active ? 'ring-1 ring-ink ring-offset-2 ring-offset-paper' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={sized(img.url, 200)} alt="" className="h-full w-full object-cover mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductView({ product }) {
  const { addToCart, busy } = useCart()
  const { variants, options } = product

  const firstAvailable = variants.find((v) => v.available) || variants[0]
  const [selected, setSelected] = useState(firstAvailable.options)
  const [quantity, setQuantity] = useState(1)

  const variant = variants.find((v) => sameOptions(v.options, selected)) || null

  // Variant images are added to the gallery, so picking a colour shows it
  const images = useMemo(() => {
    const list = [...product.images]
    variants.forEach((v) => { if (v.image && !list.some((i) => i.url === v.image.url)) list.push(v.image) })
    return list
  }, [product.images, variants])
  const [active, setActive] = useState(0)

  function choose(name, value) {
    const next = { ...selected, [name]: value }
    setSelected(next)
    const v = variants.find((x) => sameOptions(x.options, next))
    if (v?.image) {
      const i = images.findIndex((img) => img.url === v.image.url)
      if (i >= 0) setActive(i)
    }
  }

  // A value is "out" when no available variant has it together with the other current choices
  function isOut(name, value) {
    const probe = { ...selected, [name]: value }
    return !variants.some((v) => v.available && sameOptions(v.options, probe))
  }

  const canBuy = variant && variant.available

  return (
    <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:gap-16">
      <Gallery images={images} active={active} onSelect={setActive} />

      <div className="min-w-0 md:pt-4">
        {product.type && <p className="label">{product.type}</p>}
        <h1 className="mt-3 text-balance break-words text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{product.title}</h1>
        <Price
          price={variant ? variant.price : product.price}
          compareAt={variant ? variant.compareAt : product.compareAt}
          currency={product.currency}
          className="mt-4 block text-lg"
        />

        <div className="mt-8 space-y-7 border-t border-line pt-8">
          {options.map(({ name, values }) => (
            <fieldset key={name}>
              <legend className="mb-3 text-sm">
                {name}: <span className="text-mute">{selected[name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const checked = selected[name] === value
                  const out = isOut(name, value)
                  return (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                        checked ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
                      } ${out && !checked ? 'text-mute line-through decoration-1' : ''}`}
                    >
                      <input type="radio" name={name} value={value} checked={checked} onChange={() => choose(name, value)} className="sr-only" />
                      {value}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex gap-3">
            <div className="inline-flex h-12 items-center rounded-full border border-line">
              <button type="button" className="h-full w-11 text-mute hover:text-ink disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)} aria-label="Decrease quantity">−</button>
              <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{quantity}</span>
              <button type="button" className="h-full w-11 text-mute hover:text-ink" onClick={() => setQuantity((q) => Math.min(q + 1, 99))} aria-label="Increase quantity">+</button>
            </div>
            <button
              type="button"
              className="btn flex-1"
              disabled={!canBuy || busy}
              onClick={() => { addToCart(variant.id, quantity); setQuantity(1) }}
            >
              {!variant ? 'Unavailable' : !variant.available ? 'Sold out' : busy ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>

        {product.descriptionHtml && (
          <div className="rich mt-10 border-t border-line pt-8 text-[15px] leading-relaxed text-mute" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        )}

        <ul className="mt-8 space-y-2 border-t border-line pt-8 text-[13px] text-mute">
          <li>Secure checkout on Shopify</li>
          <li>Cart is saved in this browser</li>
        </ul>
      </div>
    </div>
  )
}
