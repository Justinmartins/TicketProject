import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Basket() {
  const { items, updateQuantity, removeItem, totalItems } = useCart()
  const navigate = useNavigate()

  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
  const totalEth = items.reduce((s, i) => s + (Number(i.priceWei) / 1e18) * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Basket</h1>
        <p className="muted">Your basket is empty.</p>
        <Link to="/" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse events</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Basket</h1>

      <div className="basket-list">
        {items.map(item => (
          <div key={item.categoryId} className="basket-item">
            <div className="basket-item-info">
              <p className="basket-item-name">{item.categoryName}</p>
              <p className="muted">{item.eventName}</p>
              <p className="muted">
                €{item.priceEur.toFixed(2)} / {(Number(item.priceWei) / 1e18).toFixed(6)} ETH each
              </p>
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
        <span>{totalItems} ticket(s)</span>
        <span>€{totalEur.toFixed(2)} / {totalEth.toFixed(6)} ETH</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <Link to="/">← Continue shopping</Link>
        <button onClick={() => navigate('/checkout')}>Proceed to checkout →</button>
      </div>
    </div>
  )
}
