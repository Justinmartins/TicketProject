const express = require('express');
const cors = require('cors');

const eventsRouter = require('./routes/events');
const payRouter = require('./routes/pay');

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/events/pay', payRouter);
app.use('/events', eventsRouter);

module.exports = app;
