import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEvents } from '../api'

export default function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p className="muted">Loading events…</p></div>
  if (error) return <div className="page"><p className="error">Error: {error}</p></div>

  return (
    <div className="page">
      <h1>Upcoming Events</h1>
      {events.length === 0 && <p className="muted">No events yet.</p>}
      <div className="event-grid">
        {events.map(event => (
          <Link key={event.id} to={`/events/${event.id}`} className="event-card">
            <h2>{event.name}</h2>
            <p>{event.venue}</p>
            <p>{new Date(event.event_date).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
