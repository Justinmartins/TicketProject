import { useState } from 'react'
import { createEvent, createCategory, updateCategoryContract } from '../api'

const EMPTY_EVENT = { name: '', description: '', venue: '', event_date: '', seller: '' }
const EMPTY_CAT = { name: '', symbol: '', max_supply: '', price_wei: '', price_eur: '', ticket_uri: '' }

export default function SellerDashboard() {
  const [eventForm, setEventForm] = useState(EMPTY_EVENT)
  const [createdEvent, setCreatedEvent] = useState(null)
  const [catForm, setCatForm] = useState(EMPTY_CAT)
  const [createdCat, setCreatedCat] = useState(null)
  const [contractAddress, setContractAddress] = useState('')
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState(null)

  async function handleCreateEvent(e) {
    e.preventDefault()
    setError(null)
    try {
      const event = await createEvent(eventForm)
      setCreatedEvent(event)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault()
    setError(null)
    try {
      const cat = await createCategory(createdEvent.id, {
        ...catForm,
        max_supply: Number(catForm.max_supply),
        price_eur: Number(catForm.price_eur),
      })
      setCreatedCat(cat)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSetContract(e) {
    e.preventDefault()
    setError(null)
    try {
      await updateCategoryContract(createdEvent.id, createdCat.id, {
        contract_address: contractAddress,
        tx_hash: txHash || null,
        deployed_at: new Date().toISOString(),
      })
      setCreatedCat(prev => ({ ...prev, contract_address: contractAddress }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Seller Dashboard</h1>
      {error && <p className="error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {/* Step 1 — Create event */}
      {!createdEvent ? (
        <form className="form-card" onSubmit={handleCreateEvent}>
          <h2>Step 1 — Create Event</h2>
          {[
            { key: 'name', label: 'Event name', required: true },
            { key: 'venue', label: 'Venue', required: true },
            { key: 'event_date', label: 'Date', type: 'date', required: true },
            { key: 'seller', label: 'Seller address / name', required: true },
            { key: 'description', label: 'Description' },
          ].map(({ key, label, type = 'text', required }) => (
            <div key={key} className="field">
              <label>{label}</label>
              <input
                type={type}
                required={required}
                value={eventForm[key]}
                onChange={e => setEventForm(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button type="submit">Create Event</button>
        </form>
      ) : (
        <div className="success-box">Event: <strong>{createdEvent.name}</strong> (ID: {createdEvent.id})</div>
      )}

      {/* Step 2 — Add ticket category */}
      {createdEvent && !createdCat && (
        <form className="form-card" onSubmit={handleCreateCategory}>
          <h2>Step 2 — Add Ticket Category</h2>
          {[
            { key: 'name', label: 'Category name', required: true },
            { key: 'symbol', label: 'Token symbol (e.g. GA)', required: true },
            { key: 'max_supply', label: 'Max supply', type: 'number', required: true },
            { key: 'price_wei', label: 'Price in wei', required: true },
            { key: 'price_eur', label: 'Price in EUR', type: 'number', required: true },
            { key: 'ticket_uri', label: 'Ticket URI (ipfs://…)' },
          ].map(({ key, label, type = 'text', required }) => (
            <div key={key} className="field">
              <label>{label}</label>
              <input
                type={type}
                required={required}
                value={catForm[key]}
                onChange={e => setCatForm(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button type="submit">Add Category</button>
        </form>
      )}

      {/* Step 3 — Link deployed contract */}
      {createdCat && (
        <>
          <div className="success-box">
            Category: <strong>{createdCat.name}</strong> (ID: {createdCat.id})
            {createdCat.contract_address && (
              <> — contract: <code>{createdCat.contract_address}</code></>
            )}
          </div>
          {!createdCat.contract_address && (
            <form className="form-card" onSubmit={handleSetContract}>
              <h2>Step 3 — Link Deployed Contract</h2>
              <p className="muted" style={{ marginBottom: '1rem' }}>
                Deploy the Ticket contract via <code>forge script</code> first, then paste the address here.
              </p>
              <div className="field">
                <label>Contract address</label>
                <input
                  type="text"
                  required
                  placeholder="0x…"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Deploy tx hash (optional)</label>
                <input
                  type="text"
                  placeholder="0x…"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                />
              </div>
              <button type="submit">Save Contract</button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
