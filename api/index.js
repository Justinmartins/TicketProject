require('dotenv').config();
const express = require('express');
const cors = require('cors');

const eventsRouter = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/events', eventsRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
