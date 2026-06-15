process.env.DB_PATH = ':memory:';

const dbSetup = require('../../../db/setup');
const dbRepo = require('../../../api/infrastructure/db');

describe('Database Infrastructure Layer', () => {
  beforeEach(() => {
    dbSetup.exec('DELETE FROM ticket_categories; DELETE FROM events;');
  });

  afterAll(() => {
    dbSetup.close();
  });

  it('creates and retrieves events', () => {
    const event = dbRepo.createEvent({
      name: 'Jazz Festival',
      description: 'Jazz in the park',
      venue: 'Nice',
      event_date: '2026-07-20T20:00:00Z',
      seller: 'Nice Organizer',
      banner_url: 'ipfs://banner-hash'
    });

    expect(event.id).toBeDefined();
    expect(event.name).toBe('Jazz Festival');

    const fetched = dbRepo.getEventById(event.id);
    expect(fetched).toMatchObject(event);

    const all = dbRepo.getAllEvents();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(event.id);
  });

  it('creates and retrieves ticket categories (tiers)', () => {
    const event = dbRepo.createEvent({
      name: 'Rock Fest',
      venue: 'London',
      event_date: '2026-08-01T18:00:00Z',
      seller: 'London Rock'
    });

    const category = dbRepo.createTicketCategory({
      event_id: event.id,
      name: 'Early Bird',
      symbol: 'EB',
      max_supply: 200,
      price_wei: '20000000000000000',
      price_eur: 50.0,
      ticket_uri: 'ipfs://eb-meta'
    });

    expect(category.id).toBeDefined();
    expect(category.event_id).toBe(event.id);

    const fetched = dbRepo.getCategoryById(category.id);
    expect(fetched).toMatchObject(category);

    const categories = dbRepo.getCategoriesByEventId(event.id);
    expect(categories).toHaveLength(1);
    expect(categories[0].id).toBe(category.id);
  });

  it('updates category contract information', () => {
    const event = dbRepo.createEvent({
      name: 'Pop Show',
      venue: 'Berlin',
      event_date: '2026-09-01T20:00:00Z',
      seller: 'Berlin Pop'
    });

    const category = dbRepo.createTicketCategory({
      event_id: event.id,
      name: 'VIP',
      symbol: 'VIP',
      max_supply: 50,
      price_wei: '100000000000000000',
      price_eur: 200.0
    });

    const updated = dbRepo.updateCategoryContract(category.id, {
      contract_address: '0x1234567890123456789012345678901234567890',
      tx_hash: '0xhash',
      deployed_at: '2026-06-15T10:00:00.000Z'
    });

    expect(updated.contract_address).toBe('0x1234567890123456789012345678901234567890');
    expect(updated.tx_hash).toBe('0xhash');
    expect(updated.deployed_at).toBe('2026-06-15T10:00:00.000Z');
  });
});
