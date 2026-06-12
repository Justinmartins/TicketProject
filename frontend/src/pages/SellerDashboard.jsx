import { useState } from 'react'
import { createEvent, createCategory, updateCategoryContract } from '../api'

const EMPTY_EVENT = { name: '', description: '', venue: '', event_date: '', seller: '' }
const EMPTY_CAT = { name: '', symbol: '', max_supply: '', price_wei: '', price_eur: '', ticket_uri: '' }

function StepIndicator({ current }) {
  const steps = ['Event', 'Tier', 'Contract']
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
  const [contractAddress, setContractAddress] = useState('')
  const [txHash, setTxHash] = useState('')
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
  async function handleSetContract(e) {
    e.preventDefault(); setError(null)
    try {
      await updateCategoryContract(createdEvent.id, createdCat.id, { contract_address: contractAddress, tx_hash: txHash || null, deployed_at: new Date().toISOString() })
      setCreatedCat(prev => ({ ...prev, contract_address: contractAddress }))
    } catch (err) { setError(err.message) }
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
          {[
            { key: 'name',        label: 'Event name',         required: true },
            { key: 'venue',       label: 'Venue',              required: true },
            { key: 'event_date',  label: 'Date', type: 'date', required: true },
            { key: 'seller',      label: 'Seller address / name', required: true },
            { key: 'description', label: 'Description (optional)' },
          ].map(({ key, label, type = 'text', required }) => (
            <div key={key} className="field">
              <label>{label}</label>
              <input type={type} required={required} value={eventForm[key]} onChange={e => setEventForm(prev => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
          <button type="submit">Create event &rarr;</button>
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
          {[
            { key: 'name',       label: 'Tier name',                required: true },
            { key: 'symbol',     label: 'Token symbol (e.g. GA)',   required: true },
            { key: 'max_supply', label: 'Max supply', type:'number',required: true },
            { key: 'price_wei',  label: 'Price in wei',             required: true },
            { key: 'price_eur',  label: 'Price in EUR', type:'number', required: true },
            { key: 'ticket_uri', label: 'Ticket URI (ipfs://…)' },
          ].map(({ key, label, type = 'text', required }) => (
            <div key={key} className="field">
              <label>{label}</label>
              <input type={type} required={required} value={catForm[key]} onChange={e => setCatForm(prev => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
          <button type="submit">Add tier &rarr;</button>
        </form>
      )}

      {createdCat && !createdCat.contract_address && (
        <form className="form-card" onSubmit={handleSetContract}>
          <h2>Step 3 — Link deployed contract</h2>
          <p className="muted" style={{ marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Deploy the Ticket contract via{' '}
            <code style={{ background: 'var(--bg)', padding: '.1rem .4rem', borderRadius: 4, fontSize: '.85rem' }}>forge script</code>
            {' '}first, then paste the address below.
          </p>
          <div className="field">
            <label>Contract address</label>
            <input type="text" required placeholder="0x…" value={contractAddress} onChange={e => setContractAddress(e.target.value)} />
          </div>
          <div className="field">
            <label>Deploy tx hash (optional)</label>
            <input type="text" placeholder="0x…" value={txHash} onChange={e => setTxHash(e.target.value)} />
          </div>
          <button type="submit">Save contract</button>
        </form>
      )}

      {createdCat?.contract_address && (
        <div className="success-box" style={{ marginTop: '.5rem' }}>
          <span className="success-box-icon">&#10003;</span>
          All done! Your event is live and tickets are available for sale.
        </div>
      )}
    </div>
  )
}
