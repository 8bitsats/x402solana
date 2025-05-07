---
description: >-
  This is the new Swarm of Solana-based AI agents utilizing the x402 HTTP-native
  payments protocol.
---

# X402 Solana Agentics

It's now been integrated with Shopify, Helio Pay, Solana Pay, Birdeye, Helius, and your own customized Solana X402 payments solution.

I'll outline the plan clearly in the following structure:

* **Visual Flowchart**: illustrating the agentic payment flow clearly.
* **Complete Guide**: step-by-step explanation of integration and functioning.
* **Example Code Integration**: practical snippets for Shopify, Helio Pay, Solana Pay, and custom X402 integration.

***

### 🖥️ **Visual Flowchart**

```mermaid
graph TD
subgraph Traditional Payment Flow (High Friction)
A[User Initiates Request] --> B[Create Account with Provider]
B --> C[Link Payment Method - KYC delays]
C --> D[Prepay Subscription/Credits]
D --> E[API Key Management - Manual & Security Risk]
E --> F[Monitor Account & Handle Chargebacks]
F --> G[Access Granted]
end

subgraph Solana X402 Agentic Flow (Frictionless)
X[AI Agent Initiates HTTP Request] --> Y[Receives 402 HTTP Status - Payment Required]
Y --> Z[Agent Sends X-PAYMENT Header w/ Stablecoin Payment]
Z --> AA[Facilitator Server Validates Payment]
AA --> BB[Payment Settled on Solana Blockchain via Helio Pay / Solana Pay]
BB --> CC[Immediate Access Granted]
end

style Traditional Payment Flow fill:#ffcccc,stroke:#ff3333,stroke-width:2px
style Solana X402 Agentic Flow fill:#ccffcc,stroke:#33cc33,stroke-width:2px
```

***

### 📚 **Complete Guide: Solana X402 AI Agentic Payments**

#### **1. Introduction**

**Goal**: Enable autonomous, frictionless payments between AI agents and web resources using stablecoins on Solana.

**Why X402?**

* HTTP native payments.
* Gasless interactions for clients and resource servers.
* Simplifies onboarding with zero KYC.
* Instant micropayment capability.

***

#### **2. AI Agents Overview**

We have **5 distinct AI Agents**:

| Agent                     | Purpose                                             | Integrated Services                     |
| ------------------------- | --------------------------------------------------- | --------------------------------------- |
| 🦅 **Birdeye Agent**      | Autonomous trading via real-time data insights      | Birdeye API, Solana RPC, Helius RPC     |
| 🛍️ **Commerce Agent**    | Streamlined retail transactions                     | Shopify, Solana Pay, Helio Pay          |
| 📈 **Data Agent**         | Automated retrieval & monetization of web data      | Helius DAS, Chainlink oracles           |
| 📲 **Social Agent**       | Monetizing content and interactions on social media | XMTP, Neynar, Farcaster, Solana Actions |
| 🚚 **Supply Chain Agent** | Automate logistics, inventory, and payments         | Solana blinks, Helio Payments, Helium   |

***

#### **3. Implementation**

**✅ Server Side (Resource Server)**

**Express.js example**

```javascript
app.get('/premium-data', (req, res) => {
    const paymentRequired = {
        x402Version: 1,
        accepts: [{
            scheme: 'exact',
            network: 'solana-mainnet',
            maxAmountRequired: '1000000', // in lamports or SPL token units
            resource: '/premium-data',
            description: 'Real-time financial insights',
            mimeType: 'application/json',
            payTo: 'SOLANA_WALLET_ADDRESS',
            asset: 'USDC_SOLANA_MINT_ADDRESS'
        }],
        error: null
    };

    res.status(402).json(paymentRequired);
});
```

**✅ Client Side (AI Agent)**

```javascript
const axios = require('axios');
const { Connection, PublicKey } = require('@solana/web3.js');
const { payWithUSDC } = require('./solanaPayments');

async function requestResource() {
  const url = 'https://api.yourservice.com/premium-data';
  let response = await axios.get(url).catch(e => e.response);

  if (response.status === 402) {
    const paymentRequirements = response.data.accepts[0];

    const paymentPayload = await payWithUSDC({
      recipient: paymentRequirements.payTo,
      amount: paymentRequirements.maxAmountRequired,
      network: paymentRequirements.network,
    });

    response = await axios.get(url, {
      headers: { 'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64') }
    });

    console.log(response.data);
  }
}

requestResource();
```

***

### 🚀 **Integration Snippets**

#### **Shopify Integration via Solana Pay & X402**

```javascript
// Shopify Checkout API Example using Solana Pay & X402
fetch('/create-checkout', {
  method: 'POST',
  headers: {
    'X-PAYMENT': paymentHeaderBase64, // X402 header
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [{ product_id: '123456', quantity: 1 }]
  })
});
```

#### **Helio Pay Integration**

```javascript
// Facilitator setup for Helio Payments
const processHelioPayment = async ({ payer, amount, recipient }) => {
  const helioEndpoint = 'https://api.hel.io/payment';
  const paymentDetails = {
    from: payer,
    to: recipient,
    amount,
    currency: 'USDC'
  };

  const response = await axios.post(helioEndpoint, paymentDetails);
  return response.data;
};
```

#### **Solana Pay Integration**

```javascript
// Solana Pay QR Code Generation
import { encodeURL, createQR } from '@solana/pay';

const url = encodeURL({
  recipient: new PublicKey('MERCHANT_SOLANA_ADDRESS'),
  amount: 1.5, // amount in SOL or USDC
});

const qrCode = createQR(url);
qrCode.toCanvas(document.getElementById('qrCanvas'));
```

***

### 🌐 **Building Your Custom Solana X402 Payments Protocol**

* Fork existing x402 standard implementation from GitHub.
* Create a Solana-specific settlement scheme.
* Set up facilitator nodes to interact seamlessly with Helio Pay, Solana Pay, Shopify, and Birdeye APIs.
* Ensure security through Web3auth, abstracting gas & RPC complexities away from end-users.

**Example Custom Scheme Implementation**

```javascript
// Custom Solana X402 payment verification endpoint
app.post('/verify', async (req, res) => {
  const { paymentHeader, paymentRequirements } = req.body;

  const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf8'));

  const isValid = await verifySolanaPayment(paymentPayload, paymentRequirements);

  res.json({ isValid, invalidReason: isValid ? null : "Verification Failed" });
});
```

***

### 🔮 **Next Steps**

* Deploy this setup on a robust cloud infrastructure.
* Connect with frontend libraries like React & Vue for seamless integrations.
* Continuous monitoring through Helium & Helius API integrations.

***

### 🗒️ **Principles & Philosophy Adherence**

* **Open Standard**: Fully open-source and extendable.
* **HTTP Native**: Fully embedded into existing HTTP client/server interactions.
* **Chain and Token Agnostic**: Ready to integrate various Solana-based tokens and beyond.
* **Trust Minimizing**: Facilitator server ensures client intent is strictly followed.
* **Ease of Use**: Abstract complexity, offer 1-line integration simplicity.

***

This guide provides a complete pathway to building a frictionless, HTTP-native, fully autonomous AI agentic payments solution on Solana, ready for immediate practical integration and further innovation.
