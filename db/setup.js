const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'deployments.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS deployments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    address       TEXT    NOT NULL UNIQUE,
    deployer      TEXT    NOT NULL,
    network       TEXT    NOT NULL,
    chain_id      INTEGER NOT NULL,
    tx_hash       TEXT,
    block_number  INTEGER,
    deployed_at   TEXT    NOT NULL DEFAULT (datetime('now')),

    -- Ticket constructor args
    name          TEXT    NOT NULL,
    symbol        TEXT    NOT NULL,
    max_supply    INTEGER NOT NULL,
    price_wei     TEXT    NOT NULL,
    ticket_uri    TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_deployments_network ON deployments(network);
`);

console.log('Database initialised: db/deployments.sqlite');

module.exports = db;
