import Link from 'next/link'
import { useCart } from '@/context/context'
import CartDrawer from './CartDrawer'

function BagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
      <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { cart, setCartOpen } = useCart()
  const count = cart?.totalQuantity || 0

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-ink px-4 py-2 text-center text-[12px] text-paper/70">
        Demo storefront on the Shopify Storefront API - checkout runs in test mode
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-[.2em]">
            <span className="h-2.5 w-2.5 rotate-45 bg-ink" aria-hidden="true" />
            DRIFT
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/#shop" className="hidden text-mute transition hover:text-ink sm:block">Shop</Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative -m-2 flex items-center gap-2 p-2"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <BagIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[11px] font-medium text-paper">
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-mute sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <div className="mb-2 font-semibold tracking-[.2em] text-ink">DRIFT</div>
            <p>Snowboards, wax and gift cards. A demo store, no real orders.</p>
          </div>
          <div className="sm:text-right">
            <p>Next.js · Tailwind CSS · Shopify Storefront API</p>
            <a href="/#sites" className="mt-2 inline-block text-ink underline-offset-4 hover:underline">← Back to portfolio</a>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  )
}
