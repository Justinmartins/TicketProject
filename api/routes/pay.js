const { Router } = require('express');
const { purchaseWithEur } = require('../domain/purchaseService');

const router = Router();

/**
 * @swagger
 * /events/pay:
 *   post:
 *     summary: Off-chain checkout — fake card payment, mints NFT to buyer wallet
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [buyer_address, event_id, category_id, quantity, card]
 *             properties:
 *               buyer_address: { type: string,  example: '0xf39Fd6...' }
 *               event_id:      { type: integer, example: 1 }
 *               category_id:   { type: integer, example: 1 }
 *               quantity:      { type: integer, example: 2 }
 *               card:
 *                 type: object
 *                 required: [holder, number, expiry, cvv]
 *                 properties:
 *                   holder: { type: string, example: Jane Doe }
 *                   number: { type: string, example: '4111111111111111' }
 *                   expiry: { type: string, example: 12/26 }
 *                   cvv:    { type: string, example: '123' }
 *     responses:
 *       201:
 *         description: Payment accepted and NFT minted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseResult'
 *       400:
 *         description: Validation error or mint failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  const { buyer_address, event_id, category_id, quantity, card } = req.body;

  if (!buyer_address || !event_id || !category_id || !quantity) {
    return res.status(400).json({ error: 'buyer_address, event_id, category_id and quantity are required' });
  }

  if (!card?.number || !card?.expiry || !card?.cvv || !card?.holder) {
    return res.status(400).json({ error: 'card.holder, card.number, card.expiry and card.cvv are required' });
  }

  const digits = card.number.replace(/\s/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return res.status(400).json({ error: 'Invalid card number' });
  }

  console.log(`[Mock Charge] €${(quantity * 1).toFixed(2)} on card ending ${digits.slice(-4)} for ${buyer_address}`);

  try {
    const result = await purchaseWithEur(Number(event_id), Number(category_id), {
      buyer_address,
      quantity: Number(quantity),
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
