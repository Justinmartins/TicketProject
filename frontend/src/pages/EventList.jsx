import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getEvents } from '../api'
import SidebarCart from '../components/SidebarCart'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
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
