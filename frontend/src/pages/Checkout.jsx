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
  const [receipts, setReceipts] = useState({})

  const markPaid = (categoryId, txHash) => setReceipts(prev => ({ ...prev, [categoryId]: txHash }))
  const allPaid = items.length > 0 && Object.keys(receipts).length === items.length

  if (items.length === 0 && !allPaid) return (
    <div className="page fade-up">
      <h1>Checkout</h1>
      <div className="empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
          </svg>
        </div>
        <p style={{ fontWeight: 700, color: 'var(--text)' }}>Your cart is empty.</p>
        <Link to="/"><button style={{ marginTop: '.5rem' }}>Browse events</button></Link>
      </div>
    </div>
  )

  if (allPaid) return (
    <div className="page fade-up">
      <div className="success-box" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
        <span className="success-box-icon">&#10003;</span>
        All tickets have been minted to your wallet!
      </div>
      <h2 style={{ marginBottom: '1rem' }}>Receipts</h2>
      <div className="form-card">
        {items.map(item => (
          <div key={item.categoryId} className="checkout-summary-row">
            <span>{item.categoryName} <span className="muted">({item.eventName})</span></span>
            <span className="badge badge-gray">x {item.quantity}</span>
            <span className="muted" style={{ fontFamily: 'monospace', fontSize: '.78rem' }}>{receipts[item.categoryId]?.slice(0, 18)}…</span>
          </div>
        ))}
      </div>
      <button onClick={() => { clearCart(); navigate('/') }}>Back to events</button>
    </div>
  )

  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)
  const totalEth = items.reduce((s, i) => s + (Number(i.priceWei) / 1e18) * i.quantity, 0)

  return (
    <div className="page fade-up">
      <Link to="/" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', marginBottom: '1.5rem', fontSize: '.85rem', fontWeight: 500, color: 'var(--text-2)' }}>
        &larr; Back to cart
      </Link>
      <div className="page-header">
        <p className="page-eyebrow">Payment</p>
        <h1>Checkout</h1>
      </div>

      <div className="form-card">
        <h2>Order summary</h2>
        {items.map(item => (
          <div key={item.categoryId} className="checkout-summary-row">
            <span>
              {receipts[item.categoryId] && <span className="paid-check">&#10003; </span>}
              {item.categoryName} <span className="muted">({item.eventName})</span>
            </span>
            <span className="muted">x {item.quantity}</span>
            <span style={{ fontWeight: 700 }}>€{(item.priceEur * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="checkout-summary-row checkout-total">
          <span>Total</span><span />
          <span>€{totalEur.toFixed(2)} <span className="muted" style={{ fontSize: '.8rem' }}>/ {totalEth.toFixed(6)} ETH</span></span>
        </div>
      </div>

      <div className="checkout-tabs">
        <button className={`tab${method === 'eth' ? ' active' : ''}`} onClick={() => setMethod('eth')}>Pay with ETH</button>
        <button className={`tab${method === 'eur' ? ' active' : ''}`} onClick={() => setMethod('eur')}>Pay with EUR</button>
      </div>

      {method === 'eth' && (
        <p className="muted" style={{ marginBottom: '1rem', fontSize: '.85rem' }}>
          Each ticket tier requires a separate wallet confirmation.
        </p>
      )}

      {method === 'eur' && (
        <CreditCardForm items={items.filter(i => !receipts[i.categoryId])} buyerAddress={address} onItemPaid={markPaid} />
      )}

      {method === 'eth' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.categoryId} className={`checkout-item${receipts[item.categoryId] ? ' checkout-item--paid' : ''}`}>
              <p className="checkout-item-label">
                {receipts[item.categoryId] && <span className="paid-check">&#10003; </span>}
                {item.categoryName} <span className="muted">— {item.eventName}</span>
              </p>
              {receipts[item.categoryId] ? (
                <p className="success">Minted! Tx: <span style={{ fontFamily: 'monospace' }}>{receipts[item.categoryId].slice(0, 18)}…</span></p>
              ) : (
                <BuyWithEth category={{ contract_address: item.contractAddress, id: item.categoryId }} initialQuantity={item.quantity} lockQuantity onSuccess={({ txHash }) => markPaid(item.categoryId, txHash)} />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button className="btn-ghost" onClick={() => { clearCart(); navigate('/') }}>Cancel &amp; clear cart</button>
      </div>
    </div>
  )
}
