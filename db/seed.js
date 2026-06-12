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
  100,                                          // max_supply
  '10000000000',                                 // price_wei (10^10 wei)
  150.0,                                        // price_eur
  'ipfs://QmExampleHansZimmer',
  '0xEe34bdbF79EFd982912185Dd42421b9C11820661', // Newly deployed contract on Sepolia
  '0x6b36af1c3fb08cb142821aa6be36a99dbe7013db246ca5e451b7454cf701926d',
  'sepolia',
  11155111,
  new Date().toISOString()
);

console.log('Database seeded successfully with Hans Zimmer concert!');

