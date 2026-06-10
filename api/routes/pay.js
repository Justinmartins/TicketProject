const { Router } = require('express');
const { purchaseWithEur } = require('../domain/purchaseService');

const router = Router();

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

  // Mock: log the "charge" — replace with Stripe in production
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
