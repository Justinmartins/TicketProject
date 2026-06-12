import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEvent } from '../api'
import { useCart } from '../context/CartContext'

const TicketSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
  </svg>
)

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, totalItems } = useCart()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [added, setAdded] = useState({})

  useEffect(() => {
    getEvent(id).then(setEvent).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  const getQty = catId => quantities[catId] ?? 1
  const setQty = (catId, val) => setQuantities(prev => ({ ...prev, [catId]: Math.max(1, val) }))

  function handleAdd(cat) {
    addItem({ categoryId: cat.id, eventId: event.id, eventName: event.name, categoryName: cat.name, contractAddress: cat.contract_address, priceWei: cat.price_wei, priceEur: cat.price_eur, quantity: getQty(cat.id) })
    setAdded(prev => ({ ...prev, [cat.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [cat.id]: false })), 2000)
  }

  if (loading) return (
    <div className="page fade-up">
      <div className="skeleton" style={{ height: 30, width: '45%', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: '2rem' }} />
      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 10, marginBottom: '1rem' }} />)}
    </div>
  )

  if (error) return (
    <div className="page fade-up">
      <div className="error-box">Error: {error}</div>
      <Link to="/">Back to events</Link>
    </div>
  )

  return (
    <div className="page fade-up">
      <Link to="/" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', marginBottom: '1.5rem', fontSize: '.85rem', fontWeight: 500, color: 'var(--text-2)' }}>
        &larr; All events
      </Link>

      <div className="page-header">
        <p className="page-eyebrow">Event detail</p>
        <h1>{event.name}</h1>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '.75rem' }}>
          <span className="badge badge-gray">{event.venue}</span>
          <span className="badge badge-amber">
            {new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        {event.description && (
          <p style={{ marginTop: '1rem', color: 'var(--text-2)', lineHeight: 1.7, fontSize: '.93rem' }}>{event.description}</p>
        )}
      </div>

      <hr className="divider" />
      <h2 style={{ marginTop: 0 }}>Ticket tiers</h2>

      {event.ticket_categories.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <div className="empty-icon"><TicketSvg /></div>
          <p style={{ color: 'var(--text)' }}>No ticket tiers available.</p>
        </div>
      ) : event.ticket_categories.map(cat => (
        <div key={cat.id} className="category-card">
          <div className="category-card-header">
            <div>
              <h3>{cat.name} <span className="badge badge-blue" style={{ marginLeft: '.4rem' }}>{cat.symbol}</span></h3>
              <p style={{ marginTop: '.3rem' }}>Max supply: {Number(cat.max_supply).toLocaleString()}</p>
            </div>
            <div className="price-tag">
              <span className="price-eur">€{Number(cat.price_eur).toFixed(2)}</span>
              <span className="price-eth">{(Number(cat.price_wei) / 1e18).toFixed(6)} ETH</span>
            </div>
          </div>

          {cat.contract_address ? (
            <div className="quantity-row" style={{ marginTop: '.75rem' }}>
              <button className="btn-small" onClick={() => setQty(cat.id, getQty(cat.id) - 1)}>−</button>
              <span className="basket-qty">{getQty(cat.id)}</span>
              <button className="btn-small" onClick={() => setQty(cat.id, getQty(cat.id) + 1)}>+</button>
              <button onClick={() => handleAdd(cat)} disabled={added[cat.id]}
                style={added[cat.id] ? { background: 'var(--green-l)', color: 'var(--green)', border: '1px solid #a7f3d0' } : {}}>
                {added[cat.id] ? 'Added to cart' : 'Add to cart'}
              </button>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: '.75rem' }}>Contract not yet deployed</p>
          )}
        </div>
      ))}

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={() => navigate('/checkout')}>
          View cart{totalItems > 0 ? ` (${totalItems})` : ''} &rarr;
        </button>
      </div>
    </div>
  )
}
