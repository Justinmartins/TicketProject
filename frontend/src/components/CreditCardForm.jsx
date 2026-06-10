import { useState } from 'react'

const EMPTY_CARD = { holder: '', number: '', expiry: '', cvv: '' }

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function validateCard({ holder, number, expiry, cvv }) {
  if (!holder.trim()) return 'Cardholder name is required'
  const digits = number.replace(/\s/g, '')
  if (digits.length < 13 || digits.length > 19) return 'Invalid card number'
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be MM/YY'
  const [mm, yy] = expiry.split('/').map(Number)
  if (mm < 1 || mm > 12) return 'Invalid expiry month'
  const now = new Date()
  const exp = new Date(2000 + yy, mm - 1)
  if (exp < now) return 'Card has expired'
  if (cvv.length < 3) return 'CVV must be 3–4 digits'
  return null
}

export default function CreditCardForm({ items, buyerAddress, onItemPaid }) {
  const [card, setCard] = useState(EMPTY_CARD)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState([]) // [{ name, txHash }]
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const totalEur = items.reduce((s, i) => s + i.priceEur * i.quantity, 0)

  function set(field, val) {
    setCard(prev => ({ ...prev, [field]: val }))
  }

  async function handlePay(e) {
    e.preventDefault()
    const validationError = validateCard(card)
    if (validationError) { setError(validationError); return }
    if (!buyerAddress) { setError('Connect your wallet — tickets will be minted to your address.'); return }

    setError(null)
    setProcessing(true)

    const results = []
    for (const item of items) {
      try {
        const res = await fetch('/api/events/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_address: buyerAddress,
            event_id: item.eventId,
            category_id: item.categoryId,
            quantity: item.quantity,
            card: { holder: card.holder, number: card.number.replace(/\s/g, ''), expiry: card.expiry, cvv: card.cvv },
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || res.statusText)
        results.push({ name: item.categoryName, txHash: data.tx_hash })
        setProgress([...results])
        onItemPaid(item.categoryId, data.tx_hash)
      } catch (err) {
        setError(`Failed on "${item.categoryName}": ${err.message}`)
        setProcessing(false)
        return
      }
    }

    setProcessing(false)
    setDone(true)
  }

  if (done) return null

  return (
    <form className="form-card" onSubmit={handlePay}>
      <h2>Card details</h2>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        This is a demo — no real payment is processed.
      </p>

      <div className="field">
        <label>Cardholder name</label>
        <input
          type="text"
          placeholder="Jane Doe"
          value={card.holder}
          onChange={e => set('holder', e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Card number</label>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          value={card.number}
          onChange={e => set('number', formatCardNumber(e.target.value))}
          maxLength={19}
          required
          style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Expiry (MM/YY)</label>
          <input
            type="text"
            placeholder="12/26"
            value={card.expiry}
            onChange={e => set('expiry', formatExpiry(e.target.value))}
            maxLength={5}
            required
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>CVV</label>
          <input
            type="text"
            placeholder="123"
            value={card.cvv}
            onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            required
          />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {processing && progress.length > 0 && (
        <div style={{ margin: '0.75rem 0' }}>
          {progress.map(r => (
            <p key={r.txHash} className="success">✓ {r.name} minted</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={processing} style={{ marginTop: '0.5rem', width: '100%' }}>
        {processing
          ? `Minting… (${progress.length}/${items.length})`
          : `Pay €${totalEur.toFixed(2)}`}
      </button>
    </form>
  )
}
