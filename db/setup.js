const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'ticketing.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    venue       TEXT    NOT NULL,
    event_date  TEXT    NOT NULL,
    seller      TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ticket_categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id        INTEGER NOT NULL REFERENCES events(id),
    name            TEXT    NOT NULL,
    symbol          TEXT    NOT NULL,
    max_supply      INTEGER NOT NULL,
    price_wei       TEXT    NOT NULL,
    price_eur       REAL    NOT NULL,
    ticket_uri      TEXT,
    contract_address TEXT,
    tx_hash         TEXT,
    network         TEXT    NOT NULL DEFAULT 'localhost',
    chain_id        INTEGER NOT NULL DEFAULT 31337,
    deployed_at     TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_ticket_categories_event ON ticket_categories(event_id);
`);

console.log('Database initialised: db/ticketing.sqlite');

module.exports = db;
