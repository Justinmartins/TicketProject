import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

export default function SidebarCart() {
  const { items, updateQuantity, removeItem, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar-header">
        <span className="cart-sidebar-title">Cart</span>
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon"><CartIcon /></div>
          <p className="muted" style={{ fontSize: '.82rem', textAlign: 'center' }}>
            Your cart is empty.<br />Select tickets to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.categoryId} className="cart-sidebar-item">
                <div className="cart-sidebar-item-info">
                  <p className="cart-sidebar-item-name">{item.categoryName}</p>
                  <p className="muted" style={{ fontSize: '.73rem' }}>{item.eventName}</p>
                  <p className="cart-sidebar-item-price">€{(item.priceEur * item.quantity).toFixed(2)}</p>
                </div>
                <div className="cart-sidebar-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.categoryId, item.quantity - 1)}>−</button>
                  <span className="basket-qty" style={{ fontSize: '.83rem', minWidth: 22 }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.categoryId, item.quantity + 1)}>+</button>
                  <button className="btn-remove" onClick={() => removeItem(item.categoryId)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar-total">
            <span className="muted" style={{ fontSize: '.83rem' }}>{totalItems} ticket{totalItems > 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>€{totalEur.toFixed(2)}</span>
          </div>

          <button style={{ width: '100%', padding: '.65rem' }} onClick={() => navigate('/checkout')}>
            Checkout &rarr;
          </button>
          <button className="btn-ghost" style={{ width: '100%' }} onClick={clearCart}>
            Clear cart
          </button>
        </>
      )}
    </aside>
  )
}
