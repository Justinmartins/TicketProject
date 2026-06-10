const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ticketing API',
      version: '1.0.0',
      description: 'NFT ticketing platform — events, ticket categories, and on-chain minting',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev' }],
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            name:        { type: 'string',  example: 'Paris Music Festival' },
            description: { type: 'string',  example: 'A great outdoor event' },
            venue:       { type: 'string',  example: 'Parc de la Villette' },
            event_date:  { type: 'string',  example: '2026-08-15' },
            seller:      { type: 'string',  example: '0xf39Fd6...' },
            created_at:  { type: 'string',  example: '2026-06-10T12:00:00.000Z' },
          },
        },
        EventWithCategories: {
          allOf: [
            { $ref: '#/components/schemas/Event' },
            {
              type: 'object',
              properties: {
                ticket_categories: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TicketCategory' },
                },
              },
            },
          ],
        },
        TicketCategory: {
          type: 'object',
          properties: {
            id:               { type: 'integer', example: 1 },
            event_id:         { type: 'integer', example: 1 },
            name:             { type: 'string',  example: 'VIP' },
            symbol:           { type: 'string',  example: 'VIP25' },
            max_supply:       { type: 'integer', example: 100 },
            price_wei:        { type: 'string',  example: '10000000000000000' },
            price_eur:        { type: 'number',  example: 15.00 },
            ticket_uri:       { type: 'string',  example: 'ipfs://Qm...' },
            contract_address: { type: 'string',  example: '0xAbCd...' },
            tx_hash:          { type: 'string',  example: '0x1234...' },
            network:          { type: 'string',  example: 'sepolia' },
            chain_id:         { type: 'integer', example: 11155111 },
            deployed_at:      { type: 'string',  example: '2026-06-10T12:00:00.000Z' },
          },
        },
        PurchaseResult: {
          type: 'object',
          properties: {
            tx_hash:       { type: 'string',  example: '0xabc...' },
            buyer_address: { type: 'string',  example: '0xf39...' },
            quantity:      { type: 'integer', example: 2 },
            total_eur:     { type: 'number',  example: 30.00 },
            category_id:   { type: 'integer', example: 1 },
            event_id:      { type: 'integer', example: 1 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Event not found' },
          },
        },
      },
    },
  },
  apis: ['./api/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
