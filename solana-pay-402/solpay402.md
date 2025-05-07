---
description: The Solana Native Payment Protocol
---

# SolPay402

### Introduction

<figure><img src="../.gitbook/assets/Image 5-7-25 at 3.43 PM.jpeg" alt=""><figcaption></figcaption></figure>

SolPay402 is a specialized implementation of the x402 protocol built specifically for the Solana blockchain. It enables instant, frictionless stablecoin payments directly over HTTP, allowing APIs, applications, and AI agents to transact seamlessly without traditional payment barriers.

### What Is SolPay402?

SolPay402 is a fork of Coinbase's x402 protocol, optimized for Solana's high-throughput, low-cost blockchain environment. It leverages the HTTP 402 "Payment Required" status code to embed payments directly into standard web interactions, creating a fully decentralized, programmable payment layer for the internet.

#### Key Features

* **Solana-Native**: Built specifically for Solana's ultra-fast, low-fee blockchain
* **HTTP-Integrated**: Payments happen directly within standard HTTP requests
* **Stablecoin-Powered**: Uses USDC, USDT, and other stablecoins on Solana
* **Agent-Ready**: Designed for AI agent autonomy with zero manual intervention
* **Non-Custodial**: Facilitators cannot move funds without explicit authorization
* **Developer-Friendly**: Simple integration with just a few lines of code
* **Cross-Platform**: Works with browsers, mobile apps, AI agents, and any HTTP client

### Why SolPay402 Matters

Traditional payment systems were designed for a human-centric economy, not the internet-native, automated future we're building. SolPay402 addresses fundamental payment problems:

1. **Eliminates Friction**: No accounts, KYC, or API keys required
2. **Reduces Costs**: Solana transactions cost fractions of a cent
3. **Enables Micropayments**: Pay for exactly what you use, when you use it
4. **Increases Speed**: Settlements confirmed in under a second
5. **Empowers AI Agents**: Autonomous systems can independently transact
6. **Global Access**: Works the same everywhere, regardless of geography

### How SolPay402 Works

The SolPay402 protocol follows a straightforward flow:

1. **Request**: Client requests access to a protected resource via HTTP
2. **402 Response**: Server responds with 402 Payment Required and payment details
3. **Payment Creation**: Client creates and signs a Solana transaction
4. **Retry With Payment**: Client includes the signed transaction in X-PAYMENT header
5. **Verification**: Payment facilitator verifies the transaction
6. **Settlement**: Transaction is submitted to Solana blockchain
7. **Resource Delivery**: Server delivers the requested resource
8. **Confirmation**: Payment confirmed in X-PAYMENT-RESPONSE header

### SolPay402 vs. Traditional Payment Flows

#### Traditional API Payment Flow (5+ steps):

1. Create account with API provider
2. Add payment method with KYC
3. Purchase credits/subscription
4. Manage API keys
5. Monitor account and payments

#### SolPay402 Flow (3 steps):

1. AI agent sends HTTP request
2. Agent pays seamlessly with stablecoins
3. API access granted automatically

### Technical Architecture

SolPay402 consists of four main components:

#### 1. Client SDK

* Handles 402 responses automatically
* Creates and signs Solana transactions
* Manages payment headers
* Integrates with wallet adapters

#### 2. Server Middleware

* Issues 402 Payment Required responses
* Specifies payment details
* Verifies payment signatures
* Delivers protected resources

#### 3. Payment Facilitator

* Validates payment payloads
* Submits transactions to Solana
* Provides settlement confirmation
* Manages receipt generation

#### 4. AI Agent Integration

* Enables autonomous financial decisions
* Manages budgets and spending policies
* Handles payment requests programmatically
* Creates seamless machine-to-machine commerce

### Use Cases

#### For Developers

* **Pay-Per-Call APIs**: Charge per request without subscriptions
* **Content Access**: Monetize individual articles, videos, or files
* **Compute Resources**: Sell serverless functions with usage-based pricing
* **Service Unlocks**: Enable premium features on demand

#### For AI Agents

* **Autonomous Research**: Pay for specialized data sources directly
* **Cloud Resources**: Purchase compute and storage as needed
* **Content Generation**: Buy access to premium media libraries
* **Knowledge Purchases**: Pay for expert information in real-time
* **E-commerce Transactions**: Make purchases without human intervention

### Getting Started with SolPay402

#### For API Providers

1.  **Install the SolPay402 server package**:

    ```bash
    npm install solpay402-server
    ```
2.  **Add the middleware to your Express app**:

    ```javascript
    import { solpay402Middleware } from 'solpay402-server';

    app.use('/api/protected', solpay402Middleware({
      price: 0.01, // 0.01 USDC
      token: 'USDC',
      recipient: 'your-solana-address'
    }));
    ```
3.  **Create your protected route**:

    ```javascript
    app.get('/api/protected', (req, res) => {
      // Payment already verified by middleware
      res.json({ data: 'Your protected data' });
    });
    ```

#### For API Consumers & Developers

1.  **Install the SolPay402 client package**:

    ```bash
    npm install solpay402-client
    ```
2.  **Initialize the client**:

    ```javascript
    import { SolPay402Client } from 'solpay402-client';
    import { Connection } from '@solana/web3.js';

    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const solpay402 = new SolPay402Client(connection, wallet);
    ```
3.  **Make requests with automatic payment handling**:

    ```javascript
    const fetchWithPayment = solpay402.createFetchWithPayment();

    const response = await fetchWithPayment('https://api.example.com/protected');
    const data = await response.json();
    ```

#### For AI Agent Developers

1.  **Initialize the agent swarm**:

    ```javascript
    import { AgentSwarm } from 'solpay402-agent-swarm';

    const swarm = new AgentSwarm({
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      agentCounts: {
        payment: 3,
        discovery: 2,
        policy: 1,
        accounting: 1
      },
      // Additional configuration...
    });

    await swarm.start();
    ```
2.  **Process payment intents**:

    ```javascript
    const paymentResult = await swarm.processPaymentIntent({
      id: 'payment123',
      amount: 0.05,
      token: 'USDC',
      recipient: 'recipient-solana-address',
      description: 'Access to premium API'
    });
    ```

### Solana Integrations

SolPay402 integrates with several Solana ecosystem components:

#### Helio

Helio provides price oracle services for token conversions and real-time pricing data in SolPay402, ensuring accurate payment amounts regardless of market volatility.

#### Solana Pay

SolPay402 extends Solana Pay with HTTP-native capabilities, making it compatible with standard web infrastructure while maintaining the security and speed of Solana Pay.

#### SPL Tokens

The protocol supports all SPL tokens, with special optimizations for stablecoins like USDC and USDT, enabling stable-value transactions critical for business operations.

### Shopify Integration

SolPay402 includes a dedicated Shopify plugin that allows:

1. AI agents to autonomously browse and purchase products
2. One-click checkout without account creation
3. Automatic stablecoin payments for e-commerce
4. Inventory management via HTTP API with x402 payment headers

### Future Roadmap

The SolPay402 protocol will continue to evolve with planned features including:

* **Multi-Chain Support**: Bridges to other blockchains while keeping Solana as primary settlement layer
* **Payment Streaming**: Continuous micropayments for ongoing services
* **Advanced Agent Capabilities**: More sophisticated autonomous financial behaviors
* **Expanded E-commerce Integrations**: Beyond Shopify to other platforms
* **Enterprise Features**: Multi-sig approvals and organizational controls

### Conclusion

SolPay402 represents a fundamental evolution in how payments work on the internet. By embracing Solana's speed and efficiency while following the x402 open standard, it creates a foundation for truly autonomous commerce between humans, applications, and AI agents.

The elimination of traditional payment friction points opens possibilities for new business models, particularly those involving machine-to-machine transactions and micropayments that were previously impractical.

As AI agents become more prevalent in our digital economy, payment protocols that enable their financial autonomy will be essential infrastructure. SolPay402 aims to be the standard for this new paradigm, allowing seamless value exchange directly through the HTTP protocol that powers the web.
