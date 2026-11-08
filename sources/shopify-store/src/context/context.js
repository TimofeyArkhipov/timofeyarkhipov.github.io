import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { addCartLines, createCart, fetchCart, removeCartLines, updateCartLines } from '../lib/shopify'

const CartContext = createContext(null)
const STORAGE_KEY = 'shopify_cart_id'

function readId() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}
function writeId(id) {
  try { id ? localStorage.setItem(STORAGE_KEY, id) : localStorage.removeItem(STORAGE_KEY) } catch {}
}

export default function ShopProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cartRef = useRef(null)

  function apply(c) {
    cartRef.current = c
    setCart(c)
    writeId(c?.id)
  }

  // Restore the cart saved in a previous visit (Shopify drops it after checkout or expiry).
  // The first cart action waits for this, so it never creates a second cart.
  const queue = useRef(null)
  if (!queue.current) queue.current = Promise.resolve()
  useEffect(() => {
    const id = readId()
    if (!id) return
    queue.current = queue.current
      .then(() => fetchCart(id))
      .then((c) => { if (c) apply(c); else writeId(null) })
      .catch(() => {})
  }, [])

  // Cart mutations run one after another so quick clicks can't race each other
  const run = useCallback((fn) => {
    const next = queue.current.then(async () => {
      setBusy(true)
      setError('')
      try {
        apply(await fn())
      } catch (e) {
        setError('Could not update the cart. Please try again.')
        console.error(e)
      } finally {
        setBusy(false)
      }
    })
    queue.current = next
    return next
  }, [])

  const addToCart = useCallback((variantId, quantity = 1) => {
    setCartOpen(true)
    return run(() => {
      const c = cartRef.current
      const lines = [{ merchandiseId: variantId, quantity }]
      return c ? addCartLines(c.id, lines) : createCart(lines)
    })
  }, [run])

  const setQuantity = useCallback((lineId, quantity) => run(() => {
    const c = cartRef.current
    return quantity > 0 ? updateCartLines(c.id, [{ id: lineId, quantity }]) : removeCartLines(c.id, [lineId])
  }), [run])

  const removeLine = useCallback((lineId) => run(() => removeCartLines(cartRef.current.id, [lineId])), [run])

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, busy, error, addToCart, setQuantity, removeLine }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
