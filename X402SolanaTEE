# Solana x402 Complete Implementation Guide

A comprehensive guide to building HTTP 402 Payment Required APIs with Solana USDC payments and Helius DAS integration.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Payment Protocol](#payment-protocol)
4. [Helius DAS Integration](#helius-das-integration)
5. [TEE Integration](#tee-integration)
6. [API Reference](#api-reference)
7. [Development Guide](#development-guide)
8. [Deployment](#deployment)

---

## Overview

This project implements a production-ready HTTP 402 Payment Required API server powered by Solana. Unlike traditional payment APIs that rely on centralized payment processors or slow blockchain confirmations, this implementation leverages Solana's sub-second finality and native USDC support for instant micropayments.

### Key Features

- **Instant Payments**: Solana confirms transactions in ~400ms
- **Micropayment Support**: Handle payments as small as $0.01 efficiently
- **Native USDC**: Direct USDC SPL token transfers without bridges
- **NFT/Asset Queries**: Complete Helius DAS API integration
- **TEE Security**: Optional Trusted Execution Environment deployment
- **HTTP 402 Protocol**: Standard-compliant payment required responses

### Why Solana?

| Feature | Solana | Ethereum/Base |
|---------|--------|---------------|
| Transaction Finality | ~400ms | 12-30 seconds |
| Transaction Cost | <$0.00001 | $1-50 |
| USDC Support | Native SPL token | Bridge required |
| Throughput | 65,000 TPS | 15-100 TPS |
| Micropayments | ✅ Viable | ❌ Too expensive |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                          Client                              │
│  (Browser, CLI, Mobile App, etc.)                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 1. API Request (no payment)
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Solana Payment Middleware                      │  │
│  │  • Checks for payment headers                         │  │
│  │  • Returns 402 if no payment                         │  │
│  │  • Verifies payment on-chain                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           API Route Handlers                          │  │
│  │  • /text-to-image                                     │  │
│  │  • /word-count                                        │  │
│  │  • /sentiment-analysis                                │  │
│  │  • /das/* (Helius DAS endpoints)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 2. 402 Payment Required
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  • Creates USDC transfer transaction                        │
│  • Signs & sends to Solana                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 3. Transaction sent
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    Solana Network                            │
│  • Validates transaction                                    │
│  • Transfers USDC                                           │
│  • Confirms in ~400ms                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 4. API Request + Payment Proof
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   Express Server                             │
│  • Verifies payment on-chain                                │
│  • Grants access to endpoint                                │
│  • Returns API response                                     │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
402-api-test-phala-cloud/
├── server.js                      # Main Express server
├── middleware/
│   └── solana-payment.js         # Payment verification middleware
├── handlers/
│   ├── textToImageHandler.js     # DALL-E image generation
│   ├── wordCountHandler.js       # Word counting
│   ├── sentimentAnalysisHandler.js # Sentiment analysis
│   ├── testBuyHandler.js         # Test payment flow
│   └── helius-das-handlers.js    # Helius DAS API endpoints
├── services/
│   └── helius-das-api.js         # Helius DAS service layer
├── utils/
│   └── log.js                    # Logging utilities
├── public/
│   └── index.html                # Web interface
├── testBuy.js                    # Payment testing script
└── .env                          # Environment configuration
```

---

## Payment Protocol

### HTTP 402 Flow

The HTTP 402 Payment Required status code is used to indicate that payment is required to access a resource.

#### Step 1: Initial Request (No Payment)

```bash
curl -X POST http://localhost:4021/text-to-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a sunset over mountains"}'
```

**Response (402 Payment Required):**

```json
{
  "error": "payment required",
  "price": "250000",
  "currency": "USDC",
  "receiver": "YourWalletAddress...",
  "network": "devnet",
  "usdcMint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
}
```

#### Step 2: Create & Send Payment

```javascript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

// Create USDC transfer
const connection = new Connection('https://api.devnet.solana.com');
const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const receiver = new PublicKey('YourWalletAddress...');

const fromTokenAccount = await getAssociatedTokenAddress(
  usdcMint,
  payer.publicKey
);

const toTokenAccount = await getAssociatedTokenAddress(
  usdcMint,
  receiver
);

const transferInstruction = createTransferInstruction(
  fromTokenAccount,
  toTokenAccount,
  payer.publicKey,
  250000, // Amount in base units (0.25 USDC)
);

const transaction = new Transaction().add(transferInstruction);
const signature = await connection.sendTransaction(transaction, [payer]);
await connection.confirmTransaction(signature);
```

#### Step 3: Retry with Payment Proof

```bash
curl -X POST http://localhost:4021/text-to-image \
  -H "Content-Type: application/json" \
  -H "x-solana-signature: 5Xj8...signature..." \
  -H "x-solana-payer: YourWalletAddress..." \
  -d '{"prompt": "a sunset over mountains"}'
```

**Response (200 OK):**

```json
{
  "image": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a sunset over mountains"
}
```

### Payment Verification

The middleware verifies payments by:

1. **Checking Headers**: Looks for `x-solana-signature` and `x-solana-payer`
2. **Fetching Transaction**: Retrieves transaction from Solana using signature
3. **Validating Transfer**:
   - Transaction succeeded (no errors)
   - Correct amount transferred
   - Correct receiver address
   - Correct token mint (USDC)
4. **Caching**: Stores verified payments to prevent replay attacks

```javascript
// middleware/solana-payment.js
async function verifyPayment(signature, expectedAmount, receiver) {
  const transaction = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  
  if (!transaction || transaction.meta.err) {
    throw new Error('transaction failed or not found');
  }
  
  // Verify USDC transfer
  const tokenTransfer = transaction.meta.postTokenBalances.find(
    (balance) => balance.mint === USDC_MINT_ADDRESS
  );
  
  if (!tokenTransfer || tokenTransfer.uiTokenAmount.uiAmount < expectedAmount) {
    throw new Error('insufficient payment amount');
  }
  
  return true;
}
```

### Route Pricing Configuration

Pricing is configured per route in the middleware:

```javascript
const routePricing = {
  '/text-to-image': 0.25,        // $0.25 USDC
  '/word-count': 0.01,            // $0.01 USDC
  '/sentiment-analysis': 0.05,    // $0.05 USDC
};
```

---

## Helius DAS Integration

### What is Helius DAS?

The Digital Asset Standard (DAS) API by Helius provides a unified interface for querying Solana NFTs and digital assets, including:

- Regular NFTs (Metaplex Token Metadata)
- Compressed NFTs (state compression)
- Fungible tokens (SPL tokens)
- Token-2022 assets
- Core assets (Metaplex Core)

### Key Features

1. **Unified API**: Single interface for all asset types
2. **Rich Metadata**: Complete asset information including collections, creators, royalties
3. **Compression Support**: Native support for compressed NFTs with merkle proofs
4. **Fast Queries**: Optimized indexing for sub-100ms responses
5. **Advanced Search**: Filter by owner, creator, collection, attributes, and more

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Express Server (server.js)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│        Helius DAS Handlers (handlers/helius-das-handlers.js)│
│  • Request validation                                        │
│  • Error handling                                           │
│  • Response formatting                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│      Helius DAS Service (services/helius-das-api.js)        │
│  • JSON-RPC requests                                        │
│  • Method implementations                                   │
│  • Helper utilities                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│              Helius RPC API                                  │
│  https://devnet.helius-rpc.com/?api-key=...                │
└─────────────────────────────────────────────────────────────┘
```

### Core Methods

#### 1. Asset Queries

**Get Single Asset**
```javascript
// GET /das/asset/:id
const asset = await fetch('http://localhost:4021/das/asset/ASSET_ID');
```

Returns complete asset information:
- Ownership details
- Metadata (name, symbol, image)
- Collection information
- Creator & royalty data
- Compression details
- Token accounts & balances

**Get Multiple Assets (Batch)**
```javascript
// POST /das/assets/batch
const assets = await fetch('http://localhost:4021/das/assets/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ids: ['ASSET_ID_1', 'ASSET_ID_2', 'ASSET_ID_3']
  })
});
```

#### 2. Ownership Queries

**Assets by Owner**
```javascript
// POST /das/assets/by-owner
const portfolio = await fetch('http://localhost:4021/das/assets/by-owner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ownerAddress: 'WALLET_ADDRESS',
    limit: 100,
    page: 1
  })
});
```

**Assets by Creator**
```javascript
// POST /das/assets/by-creator
const createdAssets = await fetch('http://localhost:4021/das/assets/by-creator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    creatorAddress: 'CREATOR_ADDRESS',
    onlyVerified: true
  })
});
```

**Assets by Collection**
```javascript
// POST /das/assets/by-group
const collectionAssets = await fetch('http://localhost:4021/das/assets/by-group', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupKey: 'collection',
    groupValue: 'COLLECTION_ADDRESS'
  })
});
```

#### 3. Compressed NFT Support

**Get Asset Proof**
```javascript
// GET /das/asset/:id/proof
const proof = await fetch('http://localhost:4021/das/asset/CNFT_ID/proof');
```

Returns merkle proof needed for cNFT operations:
```json
{
  "root": "...",
  "proof": ["...", "...", "..."],
  "node_index": 42,
  "leaf": "...",
  "tree_id": "..."
}
```

**Batch Proof Retrieval**
```javascript
// POST /das/assets/proof/batch
const proofs = await fetch('http://localhost:4021/das/assets/proof/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ids: ['CNFT_ID_1', 'CNFT_ID_2']
  })
});
```

#### 4. Advanced Search

**Search with Filters**
```javascript
// POST /das/assets/search
const results = await fetch('http://localhost:4021/das/assets/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ownerAddress: 'WALLET_ADDRESS',
    compressed: true,              // Only compressed NFTs
    tokenType: 'NonFungible',      // Only NFTs
    burnt: false,                  // Exclude burned
    frozen: false,                 // Exclude frozen
    sortBy: {
      sortBy: 'created',
      sortDirection: 'desc'
    }
  })
});
```

#### 5. Transaction Utilities

**Priority Fee Estimation**
```javascript
// POST /das/priority-fee-estimate
const feeEstimate = await fetch('http://localhost:4021/das/priority-fee-estimate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountKeys: ['ACCOUNT_1', 'ACCOUNT_2'],
    options: {
      recommended: true
    }
  })
});

// Response
{
  "priorityFeeEstimate": {
    "min": 1000,
    "low": 5000,
    "medium": 10000,
    "high": 50000,
    "veryHigh": 100000
  }
}
```

### Helper Methods

**Get Collection Info**
```javascript
// GET /das/collection/:address
const collection = await fetch(
  'http://localhost:4021/das/collection/COLLECTION_ADDRESS'
);
```

**Get Wallet Portfolio**
```javascript
// GET /das/wallet/:address/portfolio
const portfolio = await fetch(
  'http://localhost:4021/das/wallet/WALLET_ADDRESS/portfolio'
);
```

Returns complete portfolio including:
- All NFTs (regular and compressed)
- All fungible tokens
- SOL balance with USD value
- Total portfolio value

**Verify Ownership**
```javascript
// POST /das/verify-ownership
const isOwner = await fetch('http://localhost:4021/das/verify-ownership', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assetId: 'ASSET_ID',
    ownerAddress: 'WALLET_ADDRESS'
  })
});
```

---

## TEE Integration

### What is TEE?

A Trusted Execution Environment (TEE) is a secure area within a processor that ensures code and data are protected with respect to confidentiality and integrity. This project can run in a TEE for enhanced security.

### Benefits

1. **Secure Key Management**: Private keys never leave the secure enclave
2. **Verifiable Execution**: Users can verify code is running in genuine TEE
3. **Tamper Protection**: Host system cannot access or modify secure data
4. **Attestation**: Cryptographic proof of code integrity

### Phala Cloud Deployment

This project supports deployment on [Phala Cloud](https://cloud.phala.network), which provides TEE-backed confidential VMs.

#### Key Generation in TEE

```javascript
import { deriveSecret } from '@phala/dstack-sdk';

// Generate deterministic keypair from TEE secret
const salt = process.env.DSTACK_SECRET_SALT;
const secretBytes = await deriveSecret(salt);
const keypair = Keypair.fromSeed(secretBytes.slice(0, 32));
```

Benefits:
- Same keypair generated consistently
- Never stored on disk
- Derived from TEE-protected secret
- Backup via salt (stored securely elsewhere)

#### Deployment Process

1. **Build Docker Image**
```bash
npx phala docker build
npx phala docker push
```

2. **Deploy to Phala Cloud**
```bash
npx phala cvms create \
  -n solana-x402-api \
  -c docker-compose.yaml \
  -e .env
```

3. **Access via HTTPS**
```
https://your-deployment.phala.network/text-to-image
```

---

## API Reference

### Paid Endpoints

All endpoints require USDC payment via HTTP 402 protocol.

#### POST /text-to-image

Generate images using DALL-E 3.

**Price:** $0.25 USDC

**Request:**
```json
{
  "prompt": "a beautiful sunset over mountains"
}
```

**Response:**
```json
{
  "image": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a beautiful sunset over mountains"
}
```

#### POST /word-count

Count words in text.

**Price:** $0.01 USDC

**Request:**
```json
{
  "text": "Hello world, this is a test."
}
```

**Response:**
```json
{
  "wordCount": 6,
  "text": "Hello world, this is a test."
}
```

#### POST /sentiment-analysis

Analyze sentiment of text.

**Price:** $0.05 USDC

**Request:**
```json
{
  "text": "I love this amazing product!"
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "text": "I love this amazing product!",
  "scores": {
    "positive": 2,
    "negative": 0
  }
}
```

### Free Endpoints

#### GET /

Web interface for testing the API.

#### GET /test-account-address

Get test account address for development.

#### GET /test-buy

Test payment flow with generated keypair.

### DAS API Endpoints

All Helius DAS endpoints are free to use (no payment required).

See [Helius DAS Integration](#helius-das-integration) section for complete reference.

---

## Development Guide

### Prerequisites

- Node.js 18+
- Solana CLI (optional, for testing)
- Git

### Local Setup

1. **Clone Repository**
```bash
git clone https://github.com/Dstack-TEE/dstack.git
cd dstack/402-api-test-phala-cloud
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**

Create `.env` file:
```env
# Solana Configuration
SOLANA_NETWORK=devnet
WALLET_ADDRESS=your_wallet_address_here
RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_KEY=your_helius_api_key_here

# Payment Testing
PRIVATE_KEY=your_base58_private_key_here
DSTACK_SECRET_SALT=your_secret_salt_here

# OpenAI (for DALL-E)
OPENAI_API_KEY=your_openai_key_here

# Server
PORT=4021
NODE_ENV=development
```

4. **Get Devnet USDC**

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Create wallet
solana-keygen new --outfile ~/my-wallet.json

# Get devnet SOL
solana airdrop 2 --url devnet

# Get devnet USDC from faucet
# Visit: https://spl-token-faucet.com/
```

5. **Start Development Server**
```bash
npm start
```

Server will be available at `http://localhost:4021`

### Testing Payment Flow

Run the test script:
```bash
node testBuy.js
```

This will:
1. Generate a keypair (or use existing)
2. Make initial request → get 402
3. Create & send USDC payment
4. Retry request with payment proof
5. Display result

### Adding New Paid Endpoints

1. **Create Handler** (`handlers/myHandler.js`)
```javascript
export async function myHandler(req, res) {
  try {
    const { input } = req.body;
    const result = await processInput(input);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **Add Route** (`server.js`)
```javascript
import { myHandler } from './handlers/myHandler.js';

app.post('/my-endpoint', myHandler);
```

3. **Set Price** (`middleware/solana-payment.js`)
```javascript
const routePricing = {
  // ... existing routes
  '/my-endpoint': 0.10,  // $0.10 USDC
};
```

### Debugging

Enable detailed logging:
```javascript
// utils/log.js
export function log(message, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}]`, message, data || '');
  }
}
```

Check logs for:
- Payment verification details
- Transaction signatures
- Error messages
- Request/response timing

---

## Deployment

### Production Checklist

- [ ] Switch to mainnet configuration
- [ ] Use production USDC mint address
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Set up domain and DNS
- [ ] Configure CORS properly
- [ ] Back up wallet keys securely
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Load test payment flow

### Environment Configuration

**Mainnet `.env`:**
```env
SOLANA_NETWORK=mainnet
WALLET_ADDRESS=your_mainnet_wallet
RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_production_helius_key
OPENAI_API_KEY=your_openai_key
PORT=4021
NODE_ENV=production
```

### Mainnet USDC Address

```javascript
// Mainnet USDC mint
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
```

### Docker Deployment

1. **Build Image**
```bash
docker build -t solana-x402-api .
```

2. **Run Container**
```bash
docker run -d \
  --name solana-api \
  -p 4021:4021 \
  --env-file .env \
  solana-x402-api
```

### Phala Cloud (TEE) Deployment

See [TEE Integration](#tee-integration) section above.

### Monitoring

Track key metrics:
- Request volume
- Payment success rate
- Response times
- Error rates
- Revenue (USDC received)

Example monitoring with Prometheus:
```javascript
import prometheus from 'prom-client';

const paymentCounter = new prometheus.Counter({
  name: 'payments_total',
  help: 'Total payments processed',
});

const paymentValue = new prometheus.Counter({
  name: 'payments_value_usdc',
  help: 'Total USDC received',
});

// In payment middleware
paymentCounter.inc();
paymentValue.inc(amount);
```

---

## Best Practices

### Security

1. **Never Expose Private Keys**
   - Use environment variables
   - Never commit to git
   - Use TEE for production

2. **Validate All Inputs**
   - Sanitize user input
   - Check payment amounts
   - Verify signatures

3. **Rate Limiting**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

4. **HTTPS Only**
   - Use SSL certificates
   - Redirect HTTP to HTTPS
   - Set secure headers

### Performance

1. **Cache Verified Payments**
```javascript
const verifiedPayments = new Map();

function isPaymentVerified(signature) {
  return verifiedPayments.has(signature);
}
```

2. **Use Connection Pooling**
```javascript
const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});
```

3. **Optimize RPC Calls**
   - Use batch requests when possible
   - Cache frequently accessed data
   - Use Helius for better performance

### Error Handling

```javascript
app.use((error, req, res, next) => {
  log('error occurred:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'internal server error' 
      : error.message
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue: Payment verification fails**
- Check transaction signature is correct
- Verify USDC mint address matches
- Ensure transaction has confirmed
- Check receiver address matches

**Issue: RPC rate limiting**
- Use paid RPC endpoint (Helius, QuickNode)
- Implement request caching
- Add retry logic with exponential backoff

**Issue: High gas fees**
- Use priority fee estimation
- Batch multiple operations
- Optimize transaction size

### Getting Help

- [Solana Discord](https://discord.gg/solana)
- [Helius Discord](https://discord.gg/helius)
- [Phala Discord](https://discord.gg/phala)
- [GitHub Issues](https://github.com/Dstack-TEE/dstack/issues)

---

## Resources

### Documentation

- [Solana Docs](https://docs.solana.com/)
- [Helius DAS API](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
- [SPL Token](https://spl.solana.com/token)
- [Phala Docs](https://docs.phala.network/)

### Tools

- [Solana Explorer](https://explorer.solana.com/)
- [Helius Dashboard](https://dashboard.helius.dev/)
- [SPL Token Faucet](https://spl-token-faucet.com/)

### Example Projects

- [This Repository](https://github.com/Dstack-TEE/dstack)
- [Solana Cookbook](https://solanacookbook.com/)
- [Helius Examples](https://github.com/helius-labs/helius-sdk)

---

## License

Apache 2.0

---

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our repository.

---

## Changelog

### v1.0.0 - Complete Solana Migration
- ✅ Replaced Base/Ethereum with Solana
- ✅ USDC SPL token payments
- ✅ HTTP 402 payment protocol
- ✅ Helius DAS API integration (15 endpoints)
- ✅ TEE support via Phala Cloud
- ✅ Comprehensive documentation

---

**Built with ❤️ for the Solana ecosystem**
