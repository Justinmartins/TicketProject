import { useEffect, useState } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { getEvents } from '../api'
import { TICKET_ABI } from '../abi'

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const target = new Date(targetDate)
    target.setHours(20, 0, 0, 0) // Assume events start at 8 PM
    
    const update = () => {
      const now = new Date().getTime()
      const diff = target.getTime() - now
      
      if (diff <= 0) {
        setTimeLeft('Started')
        return
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      
      let str = ''
      if (d > 0) {
        str = `In ${d} day${d > 1 ? 's' : ''}`
      } else if (h > 0) {
        str = `In ${h} hour${h > 1 ? 's' : ''}`
      } else if (m > 0) {
        str = `In ${m} min`
      } else {
        str = `In ${s} sec`
      }
      setTimeLeft(str)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return <span style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text)', letterSpacing: '0.02em' }}>{timeLeft}</span>
}

function EventHolding({ event, ownedTiers, totalCount, isPast }) {
  return (
    <div className="event-card fade-up" style={{ padding: event.banner_url ? 0 : '1.25rem', overflow: 'hidden', cursor: isPast ? 'not-allowed' : 'default', filter: isPast ? 'grayscale(100%)' : 'none' }}>
      {event.banner_url && (
        <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
          <img src={`https://gateway.pinata.cloud/ipfs/${event.banner_url}`} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: event.banner_url ? '1rem 1.25rem 1.25rem' : 0, display: 'flex', flexDirection: 'column', gap: '.6rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p className="event-card-label" style={{ margin: 0 }}>Event</p>
          <div style={{ textAlign: 'right', marginTop: '-.2rem' }}>
            <span className="ticket-count">{totalCount}</span>
            <span className="muted" style={{ fontSize: '.73rem', display: 'block' }}>ticket{totalCount > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.2rem', marginTop: '-.5rem' }}>{event.name}</h2>
        <div className="event-card-divider" />
        <p>{event.venue}</p>
        
        <div className="event-card-meta">
          <span className="badge badge-amber">
            {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {!isPast && <Countdown targetDate={event.event_date} />}
          {isPast && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>Ended</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', borderTop: '1px solid var(--border)', paddingTop: '.8rem', marginTop: '.5rem' }}>
          {ownedTiers.map(({ cat, tokenIds }) => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{cat.name}</span>
                <span className="badge badge-blue" style={{ fontSize: '.7rem' }}>{cat.symbol}</span>
              </div>
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                {tokenIds.map(id => (
                  <span key={id.toString()} className="badge badge-dark" style={{ fontSize: '.75rem' }}>#{id.toString()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MyTickets() {
  const { address, isConnected } = useAccount()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (!isConnected) return (
    <div className="page fade-up">
      <div className="page-header">
        <p className="page-eyebrow">Wallet</p>
        <h1>My Tickets</h1>
      </div>
      <div className="empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <p style={{ fontWeight: 700, color: 'var(--text)' }}>Connect your wallet</p>
        <p className="muted">Your NFT tickets will appear here once your wallet is connected.</p>
      </div>
    </div>
  )

  const allContracts = events.flatMap(e => 
    (e.ticket_categories || []).filter(c => c.contract_address).map(c => ({
      address: c.contract_address,
      abi: TICKET_ABI,
      functionName: 'ticketsOf',
      args: [address]
    }))
  )

  const { data: allBalances, isLoading: isBalancesLoading } = useReadContracts({
    contracts: allContracts,
    enabled: allContracts.length > 0 && !!address
  })

  const isPastEvent = (dateStr) => {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) return false;
    
    // Un événement est considéré "passé" 24h après sa date (le lendemain)
    const pastTime = eventDate.getTime() + (24 * 60 * 60 * 1000);
    return pastTime < new Date().getTime();
  }

  // Group by event
  const eventsWithTickets = []
  if (allBalances) {
    let contractIdx = 0;
    events.forEach(e => {
      const validCategories = (e.ticket_categories || []).filter(c => c.contract_address)
      const ownedTiers = []
      let totalCount = 0

      validCategories.forEach(cat => {
        const tokenIds = allBalances[contractIdx]?.result || []
        if (tokenIds.length > 0) {
          ownedTiers.push({ cat, tokenIds })
          totalCount += tokenIds.length
        }
        contractIdx++
      })

      if (ownedTiers.length > 0) {
        eventsWithTickets.push({ event: e, ownedTiers, totalCount })
      }
    })
  }

  const upcomingTickets = eventsWithTickets.filter(e => !isPastEvent(e.event.event_date))
  const pastTickets = eventsWithTickets.filter(e => isPastEvent(e.event.event_date))

  return (
    <div className="page fade-up">
      <div className="page-header">
        <p className="page-eyebrow">Wallet</p>
        <h1>My Tickets</h1>
        <p className="page-subtitle">
          Address: <code style={{ fontSize: '.8rem', color: 'var(--text-2)', fontFamily: 'monospace' }}>
            {address.slice(0, 6)}…{address.slice(-4)}
          </code>
        </p>
      </div>

      {(loading || (allContracts.length > 0 && isBalancesLoading)) ? (
        <div className="event-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 250, borderRadius: 10 }} />)}
        </div>
      ) : eventsWithTickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: 'var(--text)' }}>No tickets found.</p>
          <p className="muted">Purchase tickets to see them appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {upcomingTickets.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Upcoming Events</h2>
              <div className="event-grid">
                {upcomingTickets.map(({ event, ownedTiers, totalCount }) => (
                  <EventHolding key={event.id} event={event} ownedTiers={ownedTiers} totalCount={totalCount} isPast={false} />
                ))}
              </div>
            </div>
          )}
          
          {pastTickets.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-2)', marginTop: upcomingTickets.length > 0 ? '1rem' : '0' }}>Past Events</h2>
              <div className="event-grid" style={{ opacity: 0.75 }}>
                {pastTickets.map(({ event, ownedTiers, totalCount }) => (
                  <EventHolding key={event.id} event={event} ownedTiers={ownedTiers} totalCount={totalCount} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
