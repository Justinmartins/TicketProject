import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { getEvents } from '../api'
import { TICKET_ABI } from '../abi'

function TicketHolding({ cat, eventName, address }) {
  const { data: tokenIds } = useReadContract({
    address: cat.contract_address,
    abi: TICKET_ABI,
    functionName: 'ticketsOf',
    args: [address],
    enabled: !!address && !!cat.contract_address,
  })

  const count = tokenIds?.length ?? 0
  if (count === 0) return null

  return (
    <div className="ticket-card fade-up">
      <div className="ticket-card-left">
        <div className="ticket-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z"/>
          </svg>
        </div>
        <div>
          <p className="ticket-name">{cat.name}</p>
          <p className="muted">{eventName}</p>
          <div style={{ marginTop: '.5rem', display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {tokenIds.map(id => (
              <span key={id.toString()} className="badge badge-dark">#{id.toString()}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="ticket-card-right">
        <span className="ticket-count">{count}</span>
        <span className="muted" style={{ fontSize: '.73rem' }}>ticket{count > 1 ? 's' : ''}</span>
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

  const allCategories = events.flatMap(e =>
    (e.ticket_categories ?? []).filter(c => c.contract_address).map(c => ({ cat: c, eventName: e.name }))
  )

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

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 10 }} />)}
        </div>
      ) : allCategories.length === 0 ? (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {allCategories.map(({ cat, eventName }) => (
            <TicketHolding key={cat.id} cat={cat} eventName={eventName} address={address} />
          ))}
        </div>
      )}
    </div>
  )
}
