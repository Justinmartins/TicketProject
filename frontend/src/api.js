const BASE = '/api'

async function json(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const getEvents = () =>
  fetch(`${BASE}/events`).then(json)

export const getEvent = id =>
  fetch(`${BASE}/events/${id}`).then(json)

export const createEvent = data =>
  fetch(`${BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(json)

export const createCategory = (eventId, data) =>
  fetch(`${BASE}/events/${eventId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(json)

export const updateCategoryContract = (eventId, catId, data) =>
  fetch(`${BASE}/events/${eventId}/categories/${catId}/contract`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(json)

export const purchaseWithEur = (eventId, catId, data) =>
  fetch(`${BASE}/events/${eventId}/categories/${catId}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(json)
