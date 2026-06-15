const { Router } = require('express');

function createPurchaseRouter(purchaseService) {
  const router = Router({ mergeParams: true });

  router.post('/', async (req, res) => {
    try {
      const result = await purchaseService.purchaseWithEur(
        Number(req.params.id),
        Number(req.params.catId),
        req.body,
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createPurchaseRouter;
