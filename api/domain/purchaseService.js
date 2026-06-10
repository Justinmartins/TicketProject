const db = require('../infrastructure/db');
const { getTicketContract } = require('../infrastructure/chain');

async function purchaseWithEur(eventId, categoryId, { buyer_address, quantity }) {
  if (!buyer_address || !quantity || quantity < 1) {
    throw new Error('buyer_address and quantity (>=1) are required');
  }

  const category = db.getCategoryById(categoryId);
  if (!category || category.event_id !== eventId) throw new Error('Category not found');
  if (!category.contract_address) throw new Error('Contract not yet deployed for this category');

  // Mock payment — replace with Stripe PaymentIntent verification in production
  const totalEur = (category.price_eur * quantity).toFixed(2);
  console.log(`[Mock Payment] €${totalEur} accepted for ${quantity} ticket(s) → ${buyer_address}`);

  const contract = getTicketContract(category.contract_address);
  const tx = await contract.mint(buyer_address, BigInt(quantity));
  const receipt = await tx.wait();

  return {
    tx_hash: receipt.hash,
    buyer_address,
    quantity,
    total_eur: Number(totalEur),
    category_id: categoryId,
    event_id: eventId,
  };
}

module.exports = { purchaseWithEur };
