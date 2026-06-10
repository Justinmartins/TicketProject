const db = require('../infrastructure/db');

function createEvent(data) {
  const { name, venue, event_date, seller } = data;
  if (!name || !venue || !event_date || !seller) {
    throw new Error('name, venue, event_date and seller are required');
  }
  return db.createEvent(data);
}

function getEvent(id) {
  const event = db.getEventById(id);
  if (!event) throw new Error('Event not found');
  const categories = db.getCategoriesByEventId(id);
  return { ...event, ticket_categories: categories };
}

function listEvents() {
  return db.getAllEvents();
}

function createTicketCategory(event_id, data) {
  const event = db.getEventById(event_id);
  if (!event) throw new Error('Event not found');

  const { name, symbol, max_supply, price_wei, price_eur } = data;
  if (!name || !symbol || !max_supply || !price_wei || price_eur === undefined) {
    throw new Error('name, symbol, max_supply, price_wei and price_eur are required');
  }
  return db.createTicketCategory({ event_id, ...data });
}

module.exports = { createEvent, getEvent, listEvents, createTicketCategory };
