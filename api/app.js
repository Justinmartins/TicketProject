const express = require('express');
const cors = require('cors');

const eventsRouter = require('./routes/events');

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use('/events', eventsRouter);

module.exports = app;
