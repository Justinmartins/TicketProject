const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

function createApp({ eventsRouter, payRouter }) {
  const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
  const app = express();
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/events/pay', payRouter);
  app.use('/events', eventsRouter);

  return app;
}

// Wire default dependencies for backward compatibility (e.g. for api/index.js and integration tests)
const db = require('./infrastructure/db');
const chain = require('./infrastructure/chain');
const pinata = require('./infrastructure/pinata');
const createEventService = require('./domain/eventService');
const createPurchaseService = require('./domain/purchaseService');
const createEventsRouter = require('./routes/events');
const createPayRouter = require('./routes/pay');
const createPurchaseRouter = require('./routes/purchase');

const eventService = createEventService(db, chain);
const purchaseService = createPurchaseService(db, chain);
const purchaseRouter = createPurchaseRouter(purchaseService);
const eventsRouter = createEventsRouter(eventService, purchaseRouter, pinata);
const payRouter = createPayRouter(purchaseService);

const defaultApp = createApp({ eventsRouter, payRouter });

module.exports = defaultApp;
module.exports.createApp = createApp;
