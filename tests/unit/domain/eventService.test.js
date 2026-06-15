const createEventService = require('../../../api/domain/eventService');

describe('Event Service Domain Layer', () => {
  let dbMock;
  let chainMock;
  let eventService;

  beforeEach(() => {
    dbMock = {
      createEvent: jest.fn(),
      getEventById: jest.fn(),
      getCategoriesByEventId: jest.fn(),
      getAllEvents: jest.fn(),
      createTicketCategory: jest.fn(),
      getCategoryById: jest.fn(),
      updateCategoryContract: jest.fn(),
    };

    chainMock = {
      deployTicketContract: jest.fn(),
      withdrawFromContract: jest.fn(),
      getContractBalance: jest.fn(),
    };

    eventService = createEventService(dbMock, chainMock);
  });

  describe('createEvent', () => {
    it('creates event when required fields are present', () => {
      const payload = {
        name: 'Rock Concert',
        venue: 'Stadium',
        event_date: '2026-10-10T19:00:00Z',
        seller: 'Rock Corp'
      };

      dbMock.createEvent.mockReturnValue({ id: 1, ...payload });

      const result = eventService.createEvent(payload);

      expect(dbMock.createEvent).toHaveBeenCalledWith(payload);
      expect(result.id).toBe(1);
    });

    it('throws error if required fields are missing', () => {
      const payload = { name: 'Incomplete' };

      expect(() => eventService.createEvent(payload)).toThrow(/required/);
      expect(dbMock.createEvent).not.toHaveBeenCalled();
    });
  });

  describe('getEvent', () => {
    it('returns event with ticket categories', () => {
      dbMock.getEventById.mockReturnValue({ id: 1, name: 'Show' });
      dbMock.getCategoriesByEventId.mockReturnValue([{ id: 10, name: 'VIP' }]);

      const result = eventService.getEvent(1);

      expect(dbMock.getEventById).toHaveBeenCalledWith(1);
      expect(dbMock.getCategoriesByEventId).toHaveBeenCalledWith(1);
      expect(result.ticket_categories).toHaveLength(1);
      expect(result.name).toBe('Show');
    });

    it('throws error if event not found', () => {
      dbMock.getEventById.mockReturnValue(null);

      expect(() => eventService.getEvent(999)).toThrow('Event not found');
    });
  });

  describe('createTicketCategory', () => {
    it('deploys ticket contract and registers category', async () => {
      const event = { id: 1, name: 'Festival' };
      const categoryPayload = {
        name: 'VIP',
        symbol: 'VIP',
        max_supply: 100,
        price_wei: '1000000000000000',
        price_eur: 5.0,
        ticket_uri: 'ipfs://vip'
      };

      dbMock.getEventById.mockReturnValue(event);
      dbMock.createTicketCategory.mockReturnValue({ id: 20, ...categoryPayload });
      chainMock.deployTicketContract.mockResolvedValue({
        contract_address: '0xcontract',
        tx_hash: '0xtx',
        deployed_at: '2026-06-15T12:00:00.000Z'
      });
      dbMock.updateCategoryContract.mockReturnValue({
        id: 20,
        ...categoryPayload,
        contract_address: '0xcontract'
      });

      const result = await eventService.createTicketCategory(1, categoryPayload);

      expect(dbMock.getEventById).toHaveBeenCalledWith(1);
      expect(dbMock.createTicketCategory).toHaveBeenCalledWith({ event_id: 1, ...categoryPayload });
      expect(chainMock.deployTicketContract).toHaveBeenCalledWith({
        name: 'VIP',
        symbol: 'VIP',
        maxSupply: 100,
        ticketURI: 'ipfs://vip',
        priceWei: '1000000000000000'
      });
      expect(dbMock.updateCategoryContract).toHaveBeenCalledWith(20, {
        contract_address: '0xcontract',
        tx_hash: '0xtx',
        deployed_at: '2026-06-15T12:00:00.000Z'
      });
      expect(result.contract_address).toBe('0xcontract');
    });
  });

  describe('withdrawRevenue', () => {
    it('withdraws only from contracts with a positive balance', async () => {
      const events = [
        {
          id: 1,
          ticket_categories: [
            { id: 10, contract_address: '0xaddr1' },
            { id: 11, contract_address: '0xaddr2' }
          ]
        }
      ];

      dbMock.getAllEvents.mockReturnValue(events);
      dbMock.getCategoriesByEventId.mockReturnValue(events[0].ticket_categories);
      chainMock.getContractBalance.mockImplementation(async (addr) => {
        if (addr === '0xaddr1') return 100n;
        return 0n;
      });
      chainMock.withdrawFromContract.mockResolvedValue();

      const result = await eventService.withdrawRevenue();

      expect(chainMock.getContractBalance).toHaveBeenCalledWith('0xaddr1');
      expect(chainMock.getContractBalance).toHaveBeenCalledWith('0xaddr2');
      expect(chainMock.withdrawFromContract).toHaveBeenCalledWith('0xaddr1');
      expect(chainMock.withdrawFromContract).not.toHaveBeenCalledWith('0xaddr2');
      expect(result).toEqual({ attempted: 1, successful: 1 });
    });
  });
});
