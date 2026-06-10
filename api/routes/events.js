const { Router } = require('express');
const service = require('../domain/eventService');
const purchaseRouter = require('./purchase');

const router = Router();

// GET /events
router.get('/', (req, res) => {
  try {
    res.json(service.listEvents());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /events
router.post('/', (req, res) => {
  try {
    const event = service.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /events/:id
router.get('/:id', (req, res) => {
  try {
    res.json(service.getEvent(Number(req.params.id)));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /events/:id/categories
router.post('/:id/categories', async (req, res) => {
  try {
    const category = await service.createTicketCategory(Number(req.params.id), req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /events/:id/categories/:catId/contract
router.patch('/:id/categories/:catId/contract', (req, res) => {
  try {
    const category = service.updateCategoryContract(Number(req.params.catId), req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /events/:id/categories/:catId/purchase
router.use('/:id/categories/:catId/purchase', purchaseRouter);

module.exports = router;
