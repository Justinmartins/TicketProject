import { useState } from 'react'
import { purchaseWithEur } from '../api'

export default function BuyWithEur({ eventId, category, buyerAddress, initialQuantity = 1, lockQuantity = false, onSuccess }) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const totalEur = (category.price_eur * quantity).toFixed(2)

  async function handleBuy() {
    if (!buyerAddress) {
      setError('Connect your wallet first — tickets will be minted to your address.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await purchaseWithEur(eventId, category.id, { buyer_address: buyerAddress, quantity })
      setResult(data)
      if (onSuccess) onSuccess({ txHash: data.tx_hash })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="buy-box">
      <h4>Pay with EUR</h4>
      <div className="quantity-row">
        {lockQuantity ? (
          <span className="muted">Qty: <strong>{quantity}</strong></span>
        ) : (
          <>
            <label>Qty</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </>
        )}
        <span className="muted">€{totalEur}</span>
      </div>
      <button onClick={handleBuy} disabled={loading || !!result}>
        {loading ? 'Processing…' : result ? '✓ Paid' : `Pay €${totalEur}`}
      </button>
      {result && <p className="success">{result.quantity} ticket(s) minted! Tx: {result.tx_hash.slice(0, 10)}…</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
