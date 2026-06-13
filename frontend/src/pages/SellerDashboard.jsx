import { useState, useEffect } from 'react'
import { createEvent, createCategory, getEvents, withdrawRevenue } from '../api'
import { parseEther } from 'viem'
import { usePublicClient } from 'wagmi'

const EMPTY_EVENT = { name: '', description: '', venue: '', event_date: '', seller: '', banner: null }
const EMPTY_CAT = { name: '', symbol: '', max_supply: '', price_eth: '', price_eur: '', image: null }

function StepIndicator({ current }) {
  const steps = ['Details & Tiers', 'Live']
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
  const [catForms, setCatForms] = useState([EMPTY_CAT])
  const [createdCat, setCreatedCat] = useState(null)
  const [error, setError] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [creating, setCreating] = useState(false)

  const publicClient = usePublicClient()
  const [totalRevenue, setTotalRevenue] = useState(null)

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const events = await getEvents()
        let totalWei = 0n
        for (const event of events) {
          if (!event.ticket_categories) continue
          for (const cat of event.ticket_categories) {
            if (cat.contract_address) {
              const bal = await publicClient.getBalance({ address: cat.contract_address })
              totalWei += bal
            }
          }
        }
        setTotalRevenue((Number(totalWei) / 1e18).toFixed(4))
      } catch (err) {
        console.error("Failed to fetch revenue", err)
      }
    }

    if (publicClient) fetchRevenue()
  }, [publicClient, createdCat])

  const currentStep = !createdCat ? 1 : 2

  async function handleWithdraw() {
    if (!totalRevenue || totalRevenue === '0.0000') return
    setWithdrawing(true)
    setError(null)
    try {
      const result = await withdrawRevenue()
      alert(`Success! Withdrawn from ${result.successful} out of ${result.attempted} contracts.`)
      setTotalRevenue('0.0000') 
    } catch (err) {
      setError("Withdraw failed: " + err.message)
    } finally {
      setWithdrawing(false)
    }
  }

  async function handleCreateEverything(e) {
    e.preventDefault(); setError(null); setCreating(true);
    try {
      // 1. Create Event
      const eventFormData = new FormData();
      for (const key in eventForm) {
        if (key === 'banner' && !eventForm[key]) continue;
        eventFormData.append(key, eventForm[key]);
      }
      const newEvent = await createEvent(eventFormData);
      setCreatedEvent(newEvent);

      // 2. Create Categories
      for (const form of catForms) {
        const priceWei = parseEther(form.price_eth || '0').toString();
        const catFormData = new FormData();
        for (const key in form) {
          if (key === 'image' && !form[key]) continue;
          if (key !== 'price_eth') {
             catFormData.append(key, form[key]);
          }
        }
        catFormData.append('price_wei', priceWei);
        await createCategory(newEvent.id, catFormData);
      }
      setCreatedCat(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page fade-up">
      <div className="page-header">
        <p className="page-eyebrow">Seller portal</p>
        <h1>Seller Dashboard</h1>
        <p className="page-subtitle">Create your event and deploy NFT tickets in 2 steps.</p>
      </div>

      <div className="form-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem', background: 'var(--black)', color: 'white', borderColor: 'var(--black)' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: 'var(--text-3)', margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Platform Revenue</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2 }}>
              {totalRevenue !== null ? `${totalRevenue} ETH` : 'Loading...'}
            </p>            {totalRevenue !== null && Number(totalRevenue) > 0 && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                style={{ background: 'var(--green)', color: 'white', padding: '0.35rem 0.8rem', fontSize: '0.8rem', borderRadius: '999px', boxShadow: 'none', border: 'none' }}
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw to Wallet'}
              </button>
            )}
          </div>
        </div>
        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      </div>

      <StepIndicator current={currentStep} />

      {error && <div className="error-box" style={{ marginBottom: '1.5rem' }}>Error: {error}</div>}

      {!createdCat && (
        <form className="form-card" onSubmit={handleCreateEverything}>
          <h2>Event Details</h2>
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
            <label>Seller name</label>
            <input type="text" required placeholder="Your brand name" value={eventForm.seller} onChange={e => setEventForm(prev => ({ ...prev, seller: e.target.value }))} />
          </div>
          <div className="field">
            <label>Description <span className="muted" style={{ textTransform: 'none', fontWeight: 500 }}>(optional)</span></label>
            <textarea placeholder="Tell your attendees what this event is about..." value={eventForm.description} onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="field">
            <label>Event Banner</label>
            <input type="file" accept="image/*" onChange={e => setEventForm(prev => ({ ...prev, banner: e.target.files[0] }))} />
          </div>

          <hr className="divider" style={{ margin: '2rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Ticket Tiers</h2>
            <button type="button" className="btn-outline" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', lineHeight: 1 }} onClick={() => setCatForms(prev => [...prev, { ...EMPTY_CAT }])} title="Add another tier">+</button>
          </div>

          {catForms.map((form, index) => (
            <div key={index} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: index < catForms.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {catForms.length > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h3 style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-2)' }}>Tier #{index + 1}</h3><button type="button" className="btn-ghost" style={{ padding: '0.2rem 0.5rem', color: 'var(--red)', fontSize: '.8rem' }} onClick={() => setCatForms(prev => prev.filter((_, i) => i !== index))}>Remove</button></div>}
              
              <div className="form-row">
                <div className="field">
                  <label>Tier name</label>
                  <input type="text" required placeholder="e.g. General Admission" value={form.name} onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], name: e.target.value }; setCatForms(newForms); }} />
                </div>
                <div className="field">
                  <label>Token symbol</label>
                  <input type="text" required placeholder="e.g. GA" value={form.symbol} onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], symbol: e.target.value }; setCatForms(newForms); }} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Max supply</label>
                  <input type="number" required placeholder="e.g. 500" min="1" value={form.max_supply} onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], max_supply: e.target.value }; setCatForms(newForms); }} />
                </div>
                <div className="field">
                  <label>Price in EUR</label>
                  <input type="number" required placeholder="e.g. 50" min="0" step="0.01" value={form.price_eur} onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], price_eur: e.target.value }; setCatForms(newForms); }} />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Price in ETH <span className="muted" style={{ textTransform: 'none', fontWeight: 500 }}>(Blockchain)</span></label>
                  <input type="number" step="0.000001" required placeholder="e.g. 0.05" value={form.price_eth} onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], price_eth: e.target.value }; setCatForms(newForms); }} />
                </div>
                <div className="field">
                  <label>Ticket Illustration <span className="muted" style={{ textTransform: 'none', fontWeight: 500 }}>(IPFS NFT image)</span></label>
                  <input type="file" accept="image/*" onChange={e => { const newForms = [...catForms]; newForms[index] = { ...newForms[index], image: e.target.files[0] }; setCatForms(newForms); }} />
                </div>
              </div>
            </div>
          ))}

          <button type="submit" disabled={creating} style={{ marginTop: '.5rem', width: '100%', padding: '.75rem', background: 'var(--green)', color: 'white' }}>{creating ? 'Deploying to Blockchain...' : 'Create Event & Deploy Tiers \u2192'}</button>
        </form>
      )}


      {createdCat && (
        <div className="form-card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginTop: '1.5rem' }}>
          <div className="success-box" style={{ justifyContent: 'center' }}>
            <span className="success-box-icon">&#10003;</span>
            Tiers deployed successfully!
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn-outline" onClick={() => { setCreatedEvent(null); setCreatedCat(null); setEventForm(EMPTY_EVENT); setCatForms([EMPTY_CAT]) }}>Create new event</button>
            <a href={`/events/${createdEvent.id}`}><button>View Event Page</button></a>
          </div>
        </div>
      )}
    </div>
  )
}
