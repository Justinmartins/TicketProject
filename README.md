# NFTicket

Our plateform is a Web3 ticketing platform where using NFTs on ERC-721 standard. Event organizers create events and ticket categories with a REST API, each category automatically deploys its own smart contract on Ethereum. Buyers can then purchase tickets either directly with ETH on-chain, or with a credit card (the platform mints for them).


## How it works

When you create a ticket category : fresh `Ticket` smart contract is deployed on-chain holding the supply cap, the price, and the metadata URI pointing to IPFS. From there, two purchase paths exist:

- **Buy with ETH** — the user calls `buy(quantity)` directly on the contract from their wallet. No backend involved.
- **Buy with card (EUR)** — the API accepts the payment (currently mocked, designed for Stripe), then calls `mint()` on the contract as the platform owner, sending the NFTs to the buyer's wallet address.

Ticket metadata (images, descriptions) is stored on IPFS via Pinata.

---

## Project structure

```
.
├── src/                    # Solidity smart contracts
│   └── Skeloton.sol        # The Ticket ERC-721 contract
├── test/                   # Foundry unit tests for the contracts
├── script/                 # Forge deployment scripts
├── api/
│   ├── app.js              # Express app setup + Swagger wiring
│   ├── index.js            # Server entry point
│   ├── routes/
│   │   ├── events.js       # CRUD for events and ticket categories
│   │   ├── purchase.js     # EUR purchase endpoint (nested under events)
│   │   └── pay.js          # Alternative flat pay route (with card validation)
│   ├── domain/
│   │   ├── eventService.js    # Business logic: create events, deploy contracts
│   │   └── purchaseService.js # Business logic: mint after payment
│   └── infrastructure/
│       ├── db.js           # SQLite queries via better-sqlite3
│       └── chain.js        # ethers.js: deploy contracts + call mint
├── db/
│   ├── setup.js            # Creates SQLite tables on first run
│   └── ticketing.sqlite    # Local database (git-ignored)
├── frontend/               # React + Vite frontend
│   └── src/
│       ├── pages/          # EventList, EventDetail, Basket, Checkout, SellerDashboard
│       ├── components/     # BuyWithEth, BuyWithEur, ConnectWallet, CreditCardForm
│       ├── context/        # CartContext (shopping cart state)
│       ├── wagmiConfig.js  # Wallet connection config (wagmi + viem)
│       └── abi.js          # Contract ABI for frontend calls
└── tests/
    └── events.test.js      # Jest + supertest API integration tests
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                          │
│          React + Vite + wagmi/viem + react-router       │
│                                                         │
│   EventList → EventDetail → Basket → Checkout           │
│                                  │           │          │
│                               pay with    pay with      │
│                                 ETH        card         │
└──────────────────────┬──────────────────────┬───────────┘
                       │ direct RPC call       │ HTTP POST /events/pay
                       │                       │
                       ▼                       ▼
              ┌────────────────┐    ┌──────────────────────┐
              │ Smart Contract │    │   Express REST API   │
              │  (ERC-721 NFT) │◄───│  Node.js + ethers.js │
              │ deployed per   │    │  + SQLite            │
              │ ticket category│    └──────────────────────┘
              └────────────────┘
```

The API is the single source of truth for event/category metadata (SQLite). The blockchain is the source of truth for ticket ownership. The two are linked by the `contract_address` stored in the `ticket_categories` table.

---

## Prerequisites

- **Node.js** v18+
- **Foundry** — install via `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- An Ethereum node to connect to — for local dev, Anvil (bundled with Foundry) is the easiest option

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd TicketProject
npm install
cd frontend && npm install && cd ..
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `RPC_URL` | Your Ethereum node URL (default: `http://127.0.0.1:8545` for local Anvil) |
| `PRIVATE_KEY` | Deployer wallet private key |
| `DB_PATH` | Path to the SQLite file |
| `PORT` | API port (default is `3000`) |
| `PINATA_JWT` | Pinata JWT token for IPFS uploads with PINATA |
| `PINATA_GATEWAY` | Pinata gateway URL |

### 3. Building the smart contracts

The API loads the compiled artifact from `out/Skeloton.sol/Ticket.json`

```bash
forge build
```

### 4. Initialize the database

```bash
npm run db:setup
```

### 5. Start the API

```bash
npm run dev        # auto-restarts on file changes
# or
npm start
```

The API runs at `http://localhost:3000`. Swagger docs are available at `http://localhost:3000/api-docs`.

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## API overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/events` | List all events |
| `POST` | `/events` | Create an event |
| `GET` | `/events/:id` | Get event with its ticket categories |
| `POST` | `/events/:id/categories` | Create a ticket category + deploy contract |
| `PATCH` | `/events/:id/categories/:catId/contract` | Update contract address manually |
| `POST` | `/events/:id/categories/:catId/purchase` | Buy tickets (EUR path) |
| `POST` | `/events/pay` | Alternative payment endpoint with card validation |

Full interactive docs at `/api-docs` once the server is running.

---

## Running tests

**API tests** (Jest + supertest):

```bash
npm test
```

**Smart contract tests** (Foundry):

```bash
forge test
```

---

## Smart contract

The `Ticket` contract ([src/Skeloton.sol](src/Skeloton.sol)) is an ERC-721 with a few additions:

- **`buy(quantity)`** — public payable function. Anyone can buy tickets by sending exactly `quantity × price` wei.
- **`mint(to, quantity)`** — owner-only. Used by the platform after a card payment.
- **`ticketsOf(account)`** — returns all token IDs owned by a given address.
- **`withdraw()`** — owner can pull the ETH balance out of the contract.

Each ticket in a category shares the same metadata URI (pointing to IPFS), which is set at mint time. The contract inherits from OpenZeppelin's `ERC721URIStorage`, `ERC721Enumerable`, and `Ownable`.

---

## Dependencies

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `better-sqlite3` | Synchronous SQLite client |
| `ethers` | Interact with the Ethereum blockchain |
| `cors` | Cross-origin request headers |
| `dotenv` | Load `.env` variables |
| `pinata` | Upload metadata/images to IPFS |
| `swagger-jsdoc` + `swagger-ui-express` | Auto-generate API docs from JSDoc comments |

### Frontend
| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `wagmi` + `viem` | Wallet connection and on-chain reads/writes |
| `@tanstack/react-query` | Async state management (required by wagmi) |
| `vite` | Dev server and bundler |

### Smart contracts
| Library | Purpose |
|---|---|
| `openzeppelin-contracts` | ERC-721, Ownable, and other battle-tested base contracts |
| `forge-std` | Foundry testing utilities |

---

## Notes on euro payment

- The EUR payment flow is **mocked** (so not your money, yay) the API logs a fake charge to the console. To go to production, we could think of replacing the mock in `purchaseService.js` with a real Stripe PaymentIntent verification before calling `mint()`.
