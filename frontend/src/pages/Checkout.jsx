import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCart } from '../context/CartContext'
import BuyWithEth from '../components/BuyWithEth'
import CreditCardForm from '../components/CreditCardForm'

export default function Checkout() {
  const { items, clearCart } = useCart()
  const { address } = useAccount()
  const navigate = useNavigate()
  const [method, setMethod] = useState('eth')
  const [receipts, setReceipts] = useState({}) // { categoryId: txHash }

  function markPaid(categoryId, txHash) {
    setReceipts(prev => ({ ...prev, [categoryId]: txHash }))
  }

  const allPaid = items.length > 0 && Object.keys(receipts).length === items.length

  if (items.length === 0 && !allPaid) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p className="muted">Your basket is empty. <Link to="/">Browse events</Link></p>
      </div>
    )
  }

  // Success screen — all items paid
  if (allPaid) {
    return (
      <div className="page">
        <div className="success-box" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
          All tickets minted to your wallet!
        </div>
        <h2 style={{ marginBottom: '1rem' }}>Receipts</h2>
        {items.map(item => (
          <div key={item.categoryId} className="checkout-summary-row" style={{ marginBottom: '0.5rem' }}>
            <span>{item.categoryName} <span className="muted">({item.eventName})</span></span>
            <span>× {item.quantity}</span>
            <span className="muted" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {receipts[item.categoryId]?.slice(0, 18)}…
            </span>
          </div>
        ))}
        <button
          style={{ marginTop: '1.5rem' }}
          onClick={() => { clearCart(); navigate('/') }}
        >
          Back to events
        </button>
      </div>
    )
  }

  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
  const totalEth = items.reduce((s, i) => s + (Number(i.priceWei) / 1e18) * i.quantity, 0)

  return (
    <div className="page">
      <h1>Checkout</h1>

      {/* Order summary */}
      <div className="form-card">
        <h2>Order summary</h2>
        {items.map(item => (
          <div key={item.categoryId} className="checkout-summary-row">
            <span>
              {receipts[item.categoryId] && <span className="paid-check">✓ </span>}
              {item.categoryName} <span className="muted">({item.eventName})</span>
            </span>
            <span>× {item.quantity}</span>
            <span>€{(item.priceEur * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="checkout-summary-row checkout-total">
          <span>Total</span>
          <span />
          <span>€{totalEur.toFixed(2)} / {totalEth.toFixed(6)} ETH</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="checkout-tabs">
        <button
          className={`tab ${method === 'eth' ? 'active' : ''}`}
          onClick={() => setMethod('eth')}
        >
          Pay with ETH
        </button>
        <button
          className={`tab ${method === 'eur' ? 'active' : ''}`}
          onClick={() => setMethod('eur')}
        >
          Pay with EUR
        </button>
      </div>

      {method === 'eth' && (
        <p className="muted" style={{ marginBottom: '1rem' }}>
          Each ticket category requires a separate wallet confirmation.
        </p>
      )}

      {/* EUR — single CC form covering all items */}
      {method === 'eur' && (
        <CreditCardForm
          items={items.filter(i => !receipts[i.categoryId])}
          buyerAddress={address}
          onItemPaid={(categoryId, txHash) => markPaid(categoryId, txHash)}
        />
      )}

      {/* ETH — per-item wallet confirmation */}
      {method === 'eth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.categoryId} className={`checkout-item ${receipts[item.categoryId] ? 'checkout-item--paid' : ''}`}>
              <p className="checkout-item-label">
                {receipts[item.categoryId] && <span className="paid-check">✓ </span>}
                {item.categoryName} <span className="muted">— {item.eventName}</span>
              </p>
              {receipts[item.categoryId] ? (
                <p className="success">
                  Minted! Tx: <span style={{ fontFamily: 'monospace' }}>{receipts[item.categoryId].slice(0, 18)}…</span>
                </p>
              ) : (
                <BuyWithEth
                  category={{ contract_address: item.contractAddress, id: item.categoryId }}
                  initialQuantity={item.quantity}
                  lockQuantity
                  onSuccess={({ txHash }) => markPaid(item.categoryId, txHash)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/basket">← Back to basket</Link>
        <button className="btn-small" onClick={() => { clearCart(); navigate('/') }}>
          Cancel & clear cart
        </button>
      </div>
    </div>
  )
}
