require('dotenv').config();
const db = require('./setup');

console.log('Cleaning database...');
// Clear existing database tables
db.exec('DELETE FROM ticket_categories; DELETE FROM events;');

console.log('Seeding database with requested concerts...');

const insertEvent = db.prepare(`
  INSERT INTO events (name, description, venue, event_date, seller)
  VALUES (?, ?, ?, ?, ?)
`);

const insertCategory = db.prepare(`
  INSERT INTO ticket_categories (
    event_id, name, symbol, max_supply, price_wei, price_eur, ticket_uri, contract_address, tx_hash, network, chain_id, deployed_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// 1. Hans Zimmer Concert
const hzResult = insertEvent.run(
  'Hans Zimmer Live',
  'Le compositeur légendaire de Gladiator, Inception et Interstellar en concert unique.',
  'La Défense Arena, Paris',
  '2026-10-15',
  '0x3301D85972E480DE9a5F96746441D754B717BAb4'
);
const hzId = hzResult.lastInsertRowid;

insertCategory.run(
  hzId,
  'VIP Gold',
  'HZ-VIP',
  1,                                            // max_supply
  '10000000000',                                 // price_wei (10^10 wei)
  150.0,                                        // price_eur
  'ipfs://QmExampleHansZimmer',
  '0xE0470E7B4e533Da3512C4639807FAF85EeD2858f', // Existing contract on Sepolia
  '0xc2c833428aa669ddb5d8ac22385ade9bd53ea2470a16a365911b4e825e18c6b5',
  'sepolia',
  11155111,
  new Date().toISOString()
);

// 2. Ludwig Göransson Concert
const lgResult = insertEvent.run(
  'Ludwig Göransson Symphony',
  "Découvrez les chefs-d'œuvre d'Oppenheimer, Black Panther et The Mandalorian.",
  'Philharmonie de Paris',
  '2026-11-20',
  '0x3301D85972E480DE9a5F96746441D754B717BAb4'
);
const lgId = lgResult.lastInsertRowid;

insertCategory.run(
  lgId,
  'Pass Standard',
  'LG-STD',
  50,                                           // max_supply
  '1000000000000000',                           // price_wei (0.001 ETH)
  45.0,                                         // price_eur
  'ipfs://QmExampleLudwig',
  null,                                         // Ready to deploy/link
  null,
  'sepolia',
  11155111,
  null
);

// 3. Slimane Concert
const slResult = insertEvent.run(
  'Slimane - Cupidon Tour',
  'Retrouvez la voix unique de Slimane dans sa nouvelle tournée événement.',
  'Accor Arena, Paris',
  '2026-12-05',
  '0x3301D85972E480DE9a5F96746441D754B717BAb4'
);
const slId = slResult.lastInsertRowid;

insertCategory.run(
  slId,
  'Carré Or',
  'SL-GOLD',
  100,                                          // max_supply
  '2000000000000000',                           // price_wei (0.002 ETH)
  75.0,                                         // price_eur
  'ipfs://QmExampleSlimane',
  null,                                         // Ready to deploy/link
  null,
  'sepolia',
  11155111,
  null
);

console.log('Database seeded successfully with new concerts!');
