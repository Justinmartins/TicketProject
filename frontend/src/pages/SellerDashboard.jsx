import { useState } from 'react'
import { createEvent, createCategory } from '../api'

const EMPTY_EVENT = { name: '', description: '', venue: '', event_date: '', seller: '' }
const EMPTY_CAT = { name: '', symbol: '', max_supply: '', price_wei: '', price_eur: '', ticket_uri: '' }

function StepIndicator({ current }) {
  const steps = ['Event', 'Tier']
  return (
    <>
      <div className="step-indicator">
        {steps.map((_, i) => (
          <>
            <div key={`d${i}`} className={`step-dot${i + 1 === current ? ' active' : i + 1 < current ? ' done' : ''}`}>
              {i + 1 < current ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div key={`l${i}`} className={`step-line${i + 1 < current ? ' done' : ''}`} />}
          </>
        ))}
      </div>
      <div className="step-labels">
        {steps.map((label, i) => (
          <span key={label} className={`step-label${i + 1 === current ? ' active' : i + 1 < current ? ' done' : ''}`}>{label}</span>
        ))}
      </div>
    </>
  )
}

export default function SellerDashboard() {
  const [eventForm, setEventForm] = useState(EMPTY_EVENT)
  const [createdEvent, setCreatedEvent] = useState(null)
  const [catForm, setCatForm] = useState(EMPTY_CAT)
  const [createdCat, setCreatedCat] = useState(null)
  const [error, setError] = useState(null)

  const currentStep = !createdEvent ? 1 : !createdCat ? 2 : 3

  async function handleCreateEvent(e) {
    e.preventDefault(); setError(null)
    try { setCreatedEvent(await createEvent(eventForm)) } catch (err) { setError(err.message) }
  }
  async function handleCreateCategory(e) {
    e.preventDefault(); setError(null)
    try { setCreatedCat(await createCategory(createdEvent.id, { ...catForm, max_supply: Number(catForm.max_supply), price_eur: Number(catForm.price_eur) })) }
    catch (err) { setError(err.message) }
  }

  return (
    <div className="page fade-up">
      <div className="page-header">
        <p className="page-eyebrow">Seller portal</p>
        <h1>Seller Dashboard</h1>
        <p className="page-subtitle">Create your event and deploy NFT tickets in 3 steps.</p>
      </div>

      <StepIndicator current={currentStep} />

      {error && <div className="error-box" style={{ marginBottom: '1.5rem' }}>Error: {error}</div>}

      {createdEvent && (
        <div className="success-box">
          <span className="success-box-icon">&#10003;</span>
          Event created: <strong style={{ marginLeft: '.3rem' }}>{createdEvent.name}</strong>
          <span className="muted" style={{ marginLeft: '.5rem' }}>ID #{createdEvent.id}</span>
        </div>
      )}

      {!createdEvent && (
        <form className="form-card" onSubmit={handleCreateEvent}>
          <h2>Step 1 — Create an event</h2>
          <div className="field">
            <label>Event name</label>
            <input type="text" required placeholder="e.g. Summer Music Festival" value={eventForm.name} onChange={e => setEventForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Venue</label>
              <input type="text" required placeholder="e.g. Stade de France" value={eventForm.venue} onChange={e => setEventForm(prev => ({ ...prev, venue: e.target.value }))} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" required value={eventForm.event_date} onChange={e => setEventForm(prev => ({ ...prev, event_date: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Seller address / name</label>
            <input type="text" required placeholder="0x... or your brand name" value={eventForm.seller} onChange={e => setEventForm(prev => ({ ...prev, seller: e.target.value }))} />
          </div>
          <div className="field">
            <label>Description <span className="muted" style={{textTransform:'none', fontWeight:500}}>(optional)</span></label>
            <textarea placeholder="Tell your attendees what this event is about..." value={eventForm.description} onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <button type="submit" style={{marginTop:'.5rem', width:'100%', padding:'.75rem'}}>Create Event &rarr;</button>
        </form>
      )}

      {createdEvent && createdCat && (
        <div className="success-box">
          <span className="success-box-icon">&#10003;</span>
          Tier created: <strong style={{ marginLeft: '.3rem' }}>{createdCat.name}</strong>
          {createdCat.contract_address && <code style={{ marginLeft: '.5rem', fontSize: '.77rem', opacity: .75 }}>{createdCat.contract_address}</code>}
        </div>
      )}

      {createdEvent && !createdCat && (
        <form className="form-card" onSubmit={handleCreateCategory}>
          <h2>Step 2 — Add a ticket tier</h2>
          <div className="form-row">
            <div className="field">
              <label>Tier name</label>
              <input type="text" required placeholder="e.g. General Admission" value={catForm.name} onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Token symbol</label>
              <input type="text" required placeholder="e.g. GA" value={catForm.symbol} onChange={e => setCatForm(prev => ({ ...prev, symbol: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Max supply</label>
              <input type="number" required placeholder="e.g. 500" min="1" value={catForm.max_supply} onChange={e => setCatForm(prev => ({ ...prev, max_supply: e.target.value }))} />
            </div>
            <div className="field">
              <label>Price in EUR</label>
              <input type="number" required placeholder="e.g. 50" min="0" step="0.01" value={catForm.price_eur} onChange={e => setCatForm(prev => ({ ...prev, price_eur: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Price in Wei <span className="muted" style={{textTransform:'none', fontWeight:500}}>(Blockchain)</span></label>
              <input type="text" required placeholder="e.g. 10000000000000000" value={catForm.price_wei} onChange={e => setCatForm(prev => ({ ...prev, price_wei: e.target.value }))} />
            </div>
            <div className="field">
              <label>Ticket URI <span className="muted" style={{textTransform:'none', fontWeight:500}}>(optional)</span></label>
              <input type="text" placeholder="ipfs://..." value={catForm.ticket_uri} onChange={e => setCatForm(prev => ({ ...prev, ticket_uri: e.target.value }))} />
            </div>
          </div>
          <button type="submit" style={{marginTop:'.5rem', width:'100%', padding:'.75rem'}}>Deploy Ticket Tier &rarr;</button>
        </form>
      )}


      {createdCat && (
        <div className="success-box" style={{ marginTop: '.5rem' }}>
          <span className="success-box-icon">&#10003;</span>
          All done! Your event is live and tickets are available for sale.
        </div>
      )}
    </div>
  )
}
