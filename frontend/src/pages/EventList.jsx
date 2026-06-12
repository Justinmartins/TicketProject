import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEvents } from '../api'
import { useCart } from '../context/CartContext'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)
const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
  </svg>
)

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.6rem', boxShadow: 'var(--shadow)' }}>
      <div className="skeleton" style={{ height: 12, width: '38%' }} />
      <div className="skeleton" style={{ height: 20, width: '72%' }} />
      <div className="skeleton" style={{ height: 1, margin: '.1rem 0' }} />
      <div className="skeleton" style={{ height: 13, width: '52%' }} />
      <div className="skeleton" style={{ height: 22, width: '48%', borderRadius: 4 }} />
    </div>
  )
}

function SidebarCart() {
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

export default function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getEvents().then(setEvents).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="home-layout">
      <main className="home-main fade-up">
        <div className="page-header">
          <p className="page-eyebrow">Online ticketing</p>
          <h1>Upcoming Events</h1>
        </div>

        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or venue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="error-box"><span>Error:</span> {error}</div>}

        {loading ? (
          <div className="event-grid">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><TicketIcon /></div>
            <p style={{ fontWeight: 700, color: 'var(--text)' }}>{search ? 'No results found.' : 'No events available yet.'}</p>
            {!search && <Link to="/seller"><button style={{ marginTop: '.5rem' }}>Create an event</button></Link>}
          </div>
        ) : (
          <div className="event-grid">
            {filtered.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="event-card">
                <p className="event-card-label">Event</p>
                <h2>{event.name}</h2>
                <div className="event-card-divider" />
                <p>{event.venue}</p>
                <div className="event-card-meta">
                  <span className="badge badge-amber">
                    {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {event.ticket_categories?.length > 0 && (
                    <span className="badge badge-gray">
                      {event.ticket_categories.length} tier{event.ticket_categories.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SidebarCart />
    </div>
  )
}
