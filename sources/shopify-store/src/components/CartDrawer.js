import { Fragment } from 'react'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react'
import { useCart } from '@/context/context'
import { money, sized } from '@/utils/helpers'

function Stepper({ value, onChange, disabled }) {
  const btn = 'grid h-8 w-8 place-items-center text-mute transition hover:text-ink disabled:opacity-30'
  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button type="button" className={btn} disabled={disabled} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">−</button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <button type="button" className={btn} disabled={disabled} onClick={() => onChange(value + 1)} aria-label="Increase quantity">+</button>
    </div>
  )
}

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, busy, error, setQuantity, removeLine } = useCart()
  const lines = cart?.lines || []
  const close = () => setCartOpen(false)

  return (
    <Transition.Root show={cartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-[cubic-bezier(.2,.8,.2,1)] duration-500" enterFrom="translate-x-full" enterTo="translate-x-0"
            leave="transform transition ease-in duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b border-line px-6">
                <Dialog.Title className="text-sm font-medium">
                  Cart {cart?.totalQuantity ? <span className="text-mute">({cart.totalQuantity})</span> : null}
                </Dialog.Title>
                <button type="button" onClick={close} className="-mr-2 p-2 text-sm text-mute transition hover:text-ink">
                  Close
                </button>
              </div>

              {lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                  <p className="text-mute">{busy ? 'Updating…' : 'Your cart is empty.'}</p>
                  {!busy && <button type="button" onClick={close} className="btn">Continue shopping</button>}
                </div>
              ) : (
                <>
                  <ul className={`flex-1 divide-y divide-line overflow-y-auto px-6 transition-opacity ${busy ? 'opacity-60' : ''}`}>
                    {lines.map((line) => (
                      <li key={line.id} className="flex gap-4 py-6">
                        <Link href={`/products/${line.handle}/`} onClick={close} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-tile">
                          {line.image && <img src={sized(line.image.url, 200)} alt={line.image.alt} className="h-full w-full object-cover mix-blend-multiply" />}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <Link href={`/products/${line.handle}/`} onClick={close} className="text-sm font-medium leading-snug hover:underline">
                              {line.title}
                            </Link>
                            <span className="shrink-0 text-sm tabular-nums">{money(line.total, cart.currency)}</span>
                          </div>
                          {line.variantTitle && <p className="mt-1 text-[13px] text-mute">{line.variantTitle}</p>}
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <Stepper value={line.quantity} disabled={busy} onChange={(q) => setQuantity(line.id, q)} />
                            <button type="button" disabled={busy} onClick={() => removeLine(line.id)} className="text-[13px] text-mute underline-offset-4 transition hover:text-ink hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-line px-6 py-6">
                    {error && <p className="mb-4 text-[13px] text-red-700">{error}</p>}
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium tabular-nums">{money(cart.subtotal, cart.currency)}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-mute">Shipping and taxes are calculated at checkout.</p>
                    <a href={cart.checkoutUrl} className={`btn mt-6 w-full ${busy ? 'pointer-events-none opacity-50' : ''}`}>
                      Checkout
                    </a>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
