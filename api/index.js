require('dotenv').config();
const express = require('express');
const cors = require('cors');

const eventsRouter = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/events', eventsRouter);

app.listen(PORT, () => {
  console.log(`API running on http://${HOST}:${PORT}`);
});
