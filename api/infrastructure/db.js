const db = require('../../db/setup');

function createEvent({ name, description, venue, event_date, seller, banner_url }) {
  const stmt = db.prepare(`
    INSERT INTO events (name, description, venue, event_date, seller, banner_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, description, venue, event_date, seller, banner_url || null);
  return getEventById(result.lastInsertRowid);
}

function getEventById(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
}

function getAllEvents() {
  return db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();
}

function createTicketCategory({ event_id, name, symbol, max_supply, price_wei, price_eur, ticket_uri }) {
  const stmt = db.prepare(`
    INSERT INTO ticket_categories (event_id, name, symbol, max_supply, price_wei, price_eur, ticket_uri)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(event_id, name, symbol, max_supply, price_wei, price_eur, ticket_uri ?? null);
  return getCategoryById(result.lastInsertRowid);
}

function getCategoriesByEventId(event_id) {
  return db.prepare('SELECT * FROM ticket_categories WHERE event_id = ?').all(event_id);
}

function getCategoryById(id) {
  return db.prepare('SELECT * FROM ticket_categories WHERE id = ?').get(id);
}

function updateCategoryContract(id, { contract_address, tx_hash, deployed_at }) {
  db.prepare(`
    UPDATE ticket_categories
    SET contract_address = ?, tx_hash = ?, deployed_at = ?
    WHERE id = ?
  `).run(contract_address, tx_hash, deployed_at, id);
  return getCategoryById(id);
}

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  createTicketCategory,
  getCategoriesByEventId,
  getCategoryById,
  updateCategoryContract,
};
