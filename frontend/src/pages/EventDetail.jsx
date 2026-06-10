import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent } from '../api'
import { useCart } from '../context/CartContext'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [added, setAdded] = useState({})

  useEffect(() => {
    getEvent(id)
      .then(setEvent)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function getQty(catId) {
    return quantities[catId] ?? 1
  }

  function setQty(catId, val) {
    setQuantities(prev => ({ ...prev, [catId]: Math.max(1, val) }))
  }

  function handleAdd(cat) {
    addItem({
      categoryId: cat.id,
      eventId: event.id,
      eventName: event.name,
      categoryName: cat.name,
      contractAddress: cat.contract_address,
      priceWei: cat.price_wei,
      priceEur: cat.price_eur,
      quantity: getQty(cat.id),
    })
    setAdded(prev => ({ ...prev, [cat.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [cat.id]: false })), 2000)
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>
  if (error) return <div className="page"><p className="error">Error: {error}</p></div>

  return (
    <div className="page">
      <h1>{event.name}</h1>
      {event.description && <p style={{ marginBottom: '0.75rem' }}>{event.description}</p>}
      <p className="muted"><strong>Venue:</strong> {event.venue}</p>
      <p className="muted"><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>

      <h2>Ticket Categories</h2>
      {event.ticket_categories.length === 0 && (
        <p className="muted">No ticket categories yet.</p>
      )}
      {event.ticket_categories.map(cat => (
        <div key={cat.id} className="category-card">
          <h3>{cat.name} ({cat.symbol})</h3>
          <p>Max supply: {cat.max_supply}</p>
          <p>Price: €{cat.price_eur} / {(Number(cat.price_wei) / 1e18).toFixed(6)} ETH</p>

          {cat.contract_address ? (
            <div className="quantity-row" style={{ marginTop: '0.75rem' }}>
              <button className="btn-small" onClick={() => setQty(cat.id, getQty(cat.id) - 1)}>−</button>
              <span className="basket-qty">{getQty(cat.id)}</span>
              <button className="btn-small" onClick={() => setQty(cat.id, getQty(cat.id) + 1)}>+</button>
              <button onClick={() => handleAdd(cat)} disabled={added[cat.id]}>
                {added[cat.id] ? '✓ Added' : 'Add to basket'}
              </button>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: '0.75rem' }}>Contract not yet deployed</p>
          )}
        </div>
      ))}

      <button style={{ marginTop: '1.5rem' }} onClick={() => navigate('/basket')}>
        View basket →
      </button>
    </div>
  )
}
