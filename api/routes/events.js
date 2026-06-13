const { Router } = require('express');
const multer = require('multer');
const service = require('../domain/eventService');
const purchaseRouter = require('./purchase');
const { uploadFileToIPFS, uploadJsonToIPFS } = require('../infrastructure/pinata');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Array of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', (req, res) => {
  try {
    res.json(service.listEvents());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, venue, event_date, seller]
 *             properties:
 *               name:        { type: string, example: Paris Music Festival }
 *               description: { type: string, example: A great outdoor event }
 *               venue:       { type: string, example: Parc de la Villette }
 *               event_date:  { type: string, example: '2026-08-15' }
 *               seller:      { type: string, example: '0xf39Fd6...' }
 *     responses:
 *       201:
 *         description: Created event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', upload.single('banner'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const hash = await uploadFileToIPFS(req.file.buffer, req.file.originalname, req.file.mimetype);
      data.banner_url = hash;
    }
    const event = service.createEvent(data);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event with its ticket categories
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event with ticket categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventWithCategories'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', (req, res) => {
  try {
    res.json(service.getEvent(Number(req.params.id)));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * @swagger
 * /events/{id}/categories:
 *   post:
 *     summary: Create a ticket category and auto-deploy its NFT contract
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, symbol, max_supply, price_wei, price_eur]
 *             properties:
 *               name:       { type: string,  example: VIP }
 *               symbol:     { type: string,  example: VIP25 }
 *               max_supply: { type: integer, example: 100 }
 *               price_wei:  { type: string,  example: '10000000000000000' }
 *               price_eur:  { type: number,  example: 15.00 }
 *               ticket_uri: { type: string,  example: 'ipfs://Qm...' }
 *     responses:
 *       201:
 *         description: Category created and contract deployed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketCategory'
 *       400:
 *         description: Validation error or deployment failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/categories', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    
    // If an image was uploaded, pin it and generate metadata
    if (req.file) {
      const imageHash = await uploadFileToIPFS(req.file.buffer, req.file.originalname, req.file.mimetype);
      const metadata = {
        name: data.name,
        description: `Ticket for event #${req.params.id}`,
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`
      };
      const metaHash = await uploadJsonToIPFS(metadata);
      data.ticket_uri = `https://gateway.pinata.cloud/ipfs/${metaHash}`;
    }

    const category = await service.createTicketCategory(Number(req.params.id), data);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /events/{id}/categories/{catId}/contract:
 *   patch:
 *     summary: Manually link a deployed contract address to a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: catId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contract_address]
 *             properties:
 *               contract_address: { type: string, example: '0xAbCd...' }
 *               tx_hash:          { type: string, example: '0x1234...' }
 *               deployed_at:      { type: string, example: '2026-06-10T12:00:00.000Z' }
 *     responses:
 *       200:
 *         description: Updated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketCategory'
 *       400:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/categories/:catId/contract', (req, res) => {
  try {
    const category = service.updateCategoryContract(Number(req.params.catId), req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /events/{id}/categories/{catId}/purchase:
 *   post:
 *     summary: Purchase tickets via API (mints NFT to buyer address)
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: catId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [buyer_address, quantity]
 *             properties:
 *               buyer_address: { type: string, example: '0xf39Fd6...' }
 *               quantity:      { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: NFT minted on-chain
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseResult'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /events/withdraw:
 *   post:
 *     summary: Withdraw all collected ETH from ticket contracts to the backend wallet
 *     tags: [Seller]
 *     responses:
 *       200:
 *         description: Withdrawal results
 */
router.post('/withdraw', async (req, res) => {
  try {
    const result = await service.withdrawRevenue();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
