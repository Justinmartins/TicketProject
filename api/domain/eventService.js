const db = require('../infrastructure/db');
const { deployTicketContract, withdrawFromContract, getContractBalance } = require('../infrastructure/chain');

function createEvent(data) {
  const { name, venue, event_date, seller, banner_url } = data;
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
  const events = db.getAllEvents();
  return events.map(e => ({
    ...e,
    ticket_categories: db.getCategoriesByEventId(e.id)
  }));
}

async function createTicketCategory(event_id, data) {
  const event = db.getEventById(event_id);
  if (!event) throw new Error('Event not found');

  const { name, symbol, max_supply, price_wei, price_eur, ticket_uri } = data;
  if (!name || !symbol || !max_supply || !price_wei || price_eur === undefined) {
    throw new Error('name, symbol, max_supply, price_wei and price_eur are required');
  }

  const category = db.createTicketCategory({ event_id, ...data });

  const deployment = await deployTicketContract({
    name,
    symbol,
    maxSupply: max_supply,
    ticketURI: ticket_uri || '',
    priceWei: price_wei,
  });

  return db.updateCategoryContract(category.id, deployment);
}

function updateCategoryContract(categoryId, data) {
  const category = db.getCategoryById(categoryId);
  if (!category) throw new Error('Category not found');
  return db.updateCategoryContract(categoryId, data);
}

async function withdrawRevenue() {
  const events = listEvents();
  const addresses = [];
  for (const event of events) {
    if (!event.ticket_categories) continue;
    for (const cat of event.ticket_categories) {
      if (cat.contract_address) {
        addresses.push(cat.contract_address);
      }
    }
  }

  let withdrawnCount = 0;
  let attemptedCount = 0;
  for (const address of addresses) {
    try {
      const balance = await getContractBalance(address);
      if (balance > 0n) {
        attemptedCount++;
        await withdrawFromContract(address);
        withdrawnCount++;
      }
    } catch (err) {
      console.error(`Withdraw failed for ${address}:`, err.message);
      // continue with others
    }
  }
  return { attempted: attemptedCount, successful: withdrawnCount };
}

module.exports = { createEvent, getEvent, listEvents, createTicketCategory, updateCategoryContract, withdrawRevenue };
