import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  function addItem({ categoryId, eventId, eventName, categoryName, contractAddress, priceWei, priceEur, quantity = 1 }) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.categoryId === categoryId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { categoryId, eventId, eventName, categoryName, contractAddress, priceWei, priceEur, quantity }]
    })
  }

  function updateQuantity(categoryId, qty) {
    if (qty < 1) return removeItem(categoryId)
    setItems(prev => prev.map(i => i.categoryId === categoryId ? { ...i, quantity: qty } : i))
  }

  function removeItem(categoryId) {
    setItems(prev => prev.filter(i => i.categoryId !== categoryId))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
