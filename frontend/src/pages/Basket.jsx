import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const TicketSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
  </svg>
)

export default function Basket() {
  const { items, updateQuantity, removeItem, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
  const totalEth = items.reduce((s, i) => s + (Number(i.priceWei) / 1e18) * i.quantity, 0)

  if (items.length === 0) return (
    <div className="page fade-up">
      <h1>Cart</h1>
      <div className="empty-state">
        <div className="empty-icon"><TicketSvg /></div>
        <p style={{ fontWeight: 700, color: 'var(--text)' }}>Your cart is empty.</p>
        <p className="muted">Browse events and add tickets to your cart.</p>
        <Link to="/"><button style={{ marginTop: '.5rem' }}>Browse events</button></Link>
      </div>
    </div>
  )

  return (
    <div className="page fade-up">
      <div className="page-header">
        <p className="page-eyebrow">Order summary</p>
        <h1>Cart</h1>
        <p className="page-subtitle">{totalItems} ticket{totalItems > 1 ? 's' : ''} selected</p>
      </div>

      <div className="basket-list">
        {items.map(item => (
          <div key={item.categoryId} className="basket-item">
            <div className="basket-item-icon"><TicketSvg /></div>
            <div className="basket-item-info">
              <p className="basket-item-name">{item.categoryName}</p>
              <p className="muted">{item.eventName}</p>
              <p className="muted">€{item.priceEur.toFixed(2)} / {(Number(item.priceWei) / 1e18).toFixed(6)} ETH each</p>
            </div>
            <div className="basket-item-controls">
              <button className="btn-small" onClick={() => updateQuantity(item.categoryId, item.quantity - 1)}>−</button>
              <span className="basket-qty">{item.quantity}</span>
              <button className="btn-small" onClick={() => updateQuantity(item.categoryId, item.quantity + 1)}>+</button>
            </div>
            <div className="basket-item-subtotal">
              <p>€{(item.priceEur * item.quantity).toFixed(2)}</p>
              <p className="muted">{((Number(item.priceWei) / 1e18) * item.quantity).toFixed(6)} ETH</p>
            </div>
            <button className="btn-remove" onClick={() => removeItem(item.categoryId)}>✕</button>
          </div>
        ))}
      </div>

      <div className="basket-total">
        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{totalItems} ticket{totalItems > 1 ? 's' : ''}</span>
        <span>€{totalEur.toFixed(2)} <span className="muted" style={{ fontSize: '.83rem' }}>/ {totalEth.toFixed(6)} ETH</span></span>
      </div>

      <div className="basket-actions">
        <Link to="/" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', padding: '.52rem 1.2rem', borderRadius: 6, fontSize: '.88rem', fontWeight: 600 }}>
          &larr; Continue shopping
        </Link>
        <button onClick={() => navigate('/checkout')}>Proceed to checkout &rarr;</button>
      </div>
    </div>
  )
}
