process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../api/app');
const db = require('../db/setup');

beforeEach(() => {
  db.exec('DELETE FROM ticket_categories; DELETE FROM events;');
});

afterAll(() => {
  db.close();
});

describe('GET /events', () => {
  it('returns an empty array when no events exist', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns previously created events', async () => {
    await request(app).post('/events').send({
      name: 'Test Event',
      venue: 'Paris',
      event_date: '2026-12-31T20:00:00Z',
      seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    });
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Event');
  });
});

describe('POST /events', () => {
  const validEvent = {
    name: 'Concert',
    description: 'One night only',
    venue: 'Accor Arena',
    event_date: '2026-12-31T20:00:00Z',
    seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  };

  it('creates an event and returns 201 with the persisted row', async () => {
    const res = await request(app).post('/events').send(validEvent);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(validEvent);
    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.created_at).toEqual(expect.any(String));
  });

  it('rejects a payload missing required fields with 400', async () => {
    const res = await request(app).post('/events').send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe('GET /events/:id', () => {
  it('returns the event and an empty ticket_categories array', async () => {
    const created = await request(app).post('/events').send({
      name: 'Solo',
      venue: 'Lyon',
      event_date: '2026-10-10T20:00:00Z',
      seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    });
    const res = await request(app).get(`/events/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.ticket_categories).toEqual([]);
  });

  it('returns 404 when the event does not exist', async () => {
    const res = await request(app).get('/events/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
});

describe('POST /events/:id/tiers', () => {
  let eventId;

  beforeEach(async () => {
    const res = await request(app).post('/events').send({
      name: 'Concert',
      venue: 'Paris',
      event_date: '2026-12-31T20:00:00Z',
      seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    });
    eventId = res.body.id;
  });

  const validCategory = {
    name: 'Gold',
    symbol: 'GLD',
    max_supply: 100,
    price_wei: '50000000000000000',
    price_eur: 150.0,
    ticket_uri: 'ipfs://QmExampleCID/metadata.json',
  };

  it('creates a category for an existing event', async () => {
    const res = await request(app)
      .post(`/events/${eventId}/tiers`)
      .send(validCategory);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      ...validCategory,
      event_id: eventId,
      contract_address: null,
    });
  });

  it('attaches multiple categories to the same event', async () => {
    await request(app).post(`/events/${eventId}/tiers`).send(validCategory);
    await request(app)
      .post(`/events/${eventId}/tiers`)
      .send({ ...validCategory, name: 'Standard', symbol: 'STD', price_eur: 60 });

    const res = await request(app).get(`/events/${eventId}`);
    expect(res.body.ticket_categories).toHaveLength(2);
  });

  it('returns 400 when the event does not exist', async () => {
    const res = await request(app)
      .post('/events/9999/tiers')
      .send(validCategory);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Event not found');
  });

  it('returns 400 when required category fields are missing', async () => {
    const res = await request(app)
      .post(`/events/${eventId}/tiers`)
      .send({ name: 'Bad' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});
