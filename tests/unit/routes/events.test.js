const request = require('supertest');
const { createApp } = require('../../../api/app');
const createEventsRouter = require('../../../api/routes/events');

describe('Events Router Presentation Layer', () => {
  let eventServiceMock;
  let purchaseRouterMock;
  let pinataMock;
  let app;

  beforeEach(() => {
    eventServiceMock = {
      listEvents: jest.fn(),
      createEvent: jest.fn(),
      getEvent: jest.fn(),
      createTicketCategory: jest.fn(),
      updateCategoryContract: jest.fn(),
      withdrawRevenue: jest.fn(),
    };

    purchaseRouterMock = require('express').Router();
    purchaseRouterMock.post('/', (req, res) => res.status(201).json({ success: true }));

    pinataMock = {
      uploadFileToIPFS: jest.fn().mockResolvedValue('ipfs-image-hash'),
      uploadJsonToIPFS: jest.fn().mockResolvedValue('ipfs-meta-hash'),
    };

    const eventsRouter = createEventsRouter(eventServiceMock, purchaseRouterMock, pinataMock);
    const payRouter = require('express').Router();

    app = createApp({ eventsRouter, payRouter });
  });

  it('GET /events returns list of events from eventService', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }];
    eventServiceMock.listEvents.mockReturnValue(mockEvents);

    const res = await request(app).get('/events');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockEvents);
    expect(eventServiceMock.listEvents).toHaveBeenCalled();
  });

  it('POST /events creates event and returns 201', async () => {
    const mockEvent = { id: 1, name: 'Festival' };
    eventServiceMock.createEvent.mockReturnValue(mockEvent);

    const res = await request(app)
      .post('/events')
      .send({ name: 'Festival', venue: 'Paris', event_date: '2026-06-15', seller: 'Platform' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockEvent);
    expect(eventServiceMock.createEvent).toHaveBeenCalledWith({
      name: 'Festival',
      venue: 'Paris',
      event_date: '2026-06-15',
      seller: 'Platform'
    });
  });

  it('GET /events/:id returns single event details', async () => {
    const mockEvent = { id: 2, name: 'Concert' };
    eventServiceMock.getEvent.mockReturnValue(mockEvent);

    const res = await request(app).get('/events/2');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockEvent);
    expect(eventServiceMock.getEvent).toHaveBeenCalledWith(2);
  });

  it('GET /events/:id returns 404 if eventService throws', async () => {
    eventServiceMock.getEvent.mockImplementation(() => {
      throw new Error('Event not found');
    });

    const res = await request(app).get('/events/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });

  it('POST /events/:id/tiers creates category and returns 201', async () => {
    const mockCategory = { id: 10, name: 'Gold' };
    eventServiceMock.createTicketCategory.mockResolvedValue(mockCategory);

    const res = await request(app)
      .post('/events/1/tiers')
      .send({ name: 'Gold', symbol: 'GLD', max_supply: 50, price_wei: '10', price_eur: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockCategory);
    expect(eventServiceMock.createTicketCategory).toHaveBeenCalledWith(1, {
      name: 'Gold',
      symbol: 'GLD',
      max_supply: 50,
      price_wei: '10',
      price_eur: 5
    });
  });
});
