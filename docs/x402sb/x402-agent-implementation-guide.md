# X402 Agent Implementation Guide: Cross-Chain Trustless Transactions

## Overview

This guide explains how to implement an X402 HTTP Payments Agent that can seamlessly bridge Bitcoin to Solana and facilitate trustless cross-chain transactions. The agent combines several cutting-edge technologies:

1. **X402 Protocol**: Implements the HTTP 402 Payment Required status code for machine-to-machine payments
2. **TEE Security**: Uses Trusted Execution Environments for secure key management and transaction processing
3. **Bitcoin-Solana Bridges**: Integrates with zBTC and sBTC bridges for cross-chain liquidity
4. **Browser Automation**: Leverages Stagehand for intelligent navigation and payment flow detection

## Prerequisites

Before getting started, ensure you have the following:

- Node.js v18+ (v23+ recommended)
- Solana CLI tools installed
- A funded Solana wallet (for testing on devnet or mainnet)
- Bitcoin testnet wallet (for cross-chain testing)
- OpenAI API key (for Stagehand's browser automation)

## Installation

Create a new project and install the required dependencies:

```bash
# Create a new project
mkdir x402-agent && cd x402-agent
npm init -y

# Install dependencies
npm install @browserbasehq/stagehand @solana/web3.js zod dotenv
npm install @project-serum/anchor @solana/spl-token

# For Bitcoin bridging support
npm install bitcoinjs-lib zeebe

# For TEE support (optional)
npm install @azure/attestation @intel/sgx-sdk
```

## Environment Setup

Create a `.env` file with the necessary configuration:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
HELIUS_API_KEY=your_helius_api_key

# Blockchain RPC URLs
SOLANA_RPC_URL=https://api.devnet.solana.com
BITCOIN_RPC_URL=https://btc.getblock.io/testnet/

# Wallet Configuration
SOLANA_PRIVATE_KEY=path/to/wallet.json
MAX_TRANSACTION_AMOUNT=0.1
TRUSTED_DOMAINS=example.com,trusteddomain.org

# Bridge Configuration
BRIDGE_TYPE=zBTC  # or sBTC
BRIDGE_ADDRESS=your_bridge_address
```

## Implementation Steps

### 1. Setting Up the Agent

Create the basic structure for your X402 agent by implementing the Stagehand integration:

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define schemas for payment information
const PaymentInfoSchema = z.object({
  recipientAddress: z.string(),
  amount: z.number(),
  currency: z.string(),
  description: z.string().optional(),
});

class X402Agent {
  private stagehand: Stagehand;
  
  constructor(openAIApiKey: string) {
    this.stagehand = new Stagehand({
      env: "LOCAL",
      modelName: "gpt-4o",
      modelClientOptions: {
        apiKey: openAIApiKey,
      },
    });
  }
  
  async init() {
    await this.stagehand.init();
    console.log("X402 Agent initialized");
  }
  
  async close() {
    await this.stagehand.close();
  }
}
```

### 2. Implementing TEE-Secured Wallet Management

The critical aspect of secure agent operation is proper key management within TEEs. Implement this functionality next:

```typescript
import { Keypair } from "@solana/web3.js";
import fs from "fs/promises";

class SecureWalletManager {
  private teeAvailable: boolean;
  
  constructor(useTee = true) {
    // In production, would check for TEE availability
    this.teeAvailable = useTee;
  }
  
  async loadWallet(keyPath: string): Promise<Keypair> {
    if (this.teeAvailable) {
      return this.loadWalletInTee(keyPath);
    } else {
      console.warn("WARNING: Loading wallet without TEE protection");
      const keyData = await fs.readFile(keyPath, 'utf-8');
      const secretKey = Uint8Array.from(JSON.parse(keyData));
      return Keypair.fromSecretKey(secretKey);
    }
  }
  
  private async loadWalletInTee(keyPath: string): Promise<Keypair> {
    console.log("Loading wallet within TEE secure enclave...");
    
    // In a real implementation, this would use TEE-specific APIs
    // For demonstration, we'll simulate the secure loading
    
    // 1. Verify the TEE environment
    await this.performAttestation();
    
    // 2. Load and decrypt the key within the TEE
    const keyData = await fs.readFile(keyPath, 'utf-8');
    const secretKey = Uint8Array.from(JSON.parse(keyData));
    
    // 3. Create the keypair within the secure enclave
    return Keypair.fromSecretKey(secretKey);
  }
  
  private async performAttestation(): Promise<boolean> {
    // In production, this would verify the TEE integrity
    console.log("Performing TEE attestation...");
    return true;
  }
}
```

### 3. Implementing Bitcoin-Solana Bridge Support

Next, add support for both zBTC and sBTC bridges:

```typescript
enum BridgeType {
  ZBTC = "zBTC",
  SBTC = "sBTC"
}

interface BridgeResult {
  transactionHash: string;
  status: "pending" | "complete" | "failed";
  destinationAddress?: string;
  sourceChain: string;
  destinationChain: string;
}

class BridgeManager {
  private bridgeType: BridgeType;
  private bitcoinRpcUrl: string;
  private solanaRpcUrl: string;
  
  constructor(options: {
    bridgeType: BridgeType;
    bitcoinRpcUrl: string;
    solanaRpcUrl: string;
  }) {
    this.bridgeType = options.bridgeType;
    this.bitcoinRpcUrl = options.bitcoinRpcUrl;
    this.solanaRpcUrl = options.solanaRpcUrl;
  }
  
  async bridgeAssets(options: {
    sourceChain: "bitcoin" | "solana";
    destinationChain: "bitcoin" | "solana";
    amount: number;
    asset: string;
    recipientAddress: string;
    wallet: Keypair;
  }): Promise<BridgeResult> {
    console.log(`Bridging ${options.amount} ${options.asset} from ${options.sourceChain} to ${options.destinationChain}`);
    
    if (this.bridgeType === BridgeType.ZBTC) {
      return this.processZeusBridge(options);
    } else {
      return this.processStacksBridge(options);
    }
  }
  
  private async processZeusBridge(options: any): Promise<BridgeResult> {
    // Implementation for Zeus Network bridge (zBTC)
    console.log("Processing via Zeus Network bridge with MPC and Taproot...");
    
    // In production, this would integrate with the Zeus Network API
    
    return {
      transactionHash: "simulated-zeus-tx-hash",
      status: "complete",
      sourceChain: options.sourceChain,
      destinationChain: options.destinationChain
    };
  }
  
  private async processStacksBridge(options: any): Promise<BridgeResult> {
    // Implementation for Stacks bridge (sBTC)
    console.log("Processing via Stacks decentralized bridge...");
    
    // In production, this would integrate with the Stacks bridge API
    
    return {
      transactionHash: "simulated-stacks-tx-hash",
      status: "complete",
      sourceChain: options.sourceChain,
      destinationChain: options.destinationChain
    };
  }
}
```

### 4. Implementing the X402 Protocol Handler

Now, implement the core X402 protocol handling for payment detection and processing:

```typescript
interface PaymentRequirements {
  scheme: string;
  network: string;
  payTo: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  asset: string;
  maxTimeoutSeconds: number;
}

class X402ProtocolHandler {
  async detectPaymentRequirements(page: any): Promise<PaymentRequirements | null> {
    // Check for HTTP 402 response or payment metadata
    const headers = await page.evaluate(() => {
      return {
        status: window.performance.getEntriesByType('resource')
          .filter((r: any) => r.name === window.location.href)
          .map((r: any) => r.responseStatus)[0],
        paymentMeta: document.querySelector('meta[name="x-payment-required"]')?.getAttribute('content')
      };
    });
    
    if (headers.status === 402 || headers.paymentMeta) {
      // Extract payment details using AI vision or metadata parsing
      const paymentInfo = await this.extractPaymentInfo(page);
      
      return {
        scheme: "exact",
        network: paymentInfo.currency.toLowerCase().includes("btc") ? "bitcoin" : "solana",
        payTo: paymentInfo.recipientAddress,
        maxAmountRequired: paymentInfo.amount.toString(),
        resource: paymentInfo.resourceId || page.url(),
        description: paymentInfo.description || `Payment for resource`,
        asset: paymentInfo.currency,
        maxTimeoutSeconds: 60,
      };
    }
    
    return null;
  }
  
  private async extractPaymentInfo(page: any): Promise<any> {
    // Use Stagehand's extract function or visual analysis
    // This is a simplified example
    return {
      recipientAddress: "simulated-address",
      amount: 0.01,
      currency: "SOL",
      description: "Access to premium content"
    };
  }
  
  async createPaymentHeader(txSignature: string): Promise<string> {
    // Create the X-PAYMENT header for the transaction
    const paymentPayload = {
      version: 1,
      signature: txSignature,
      timestamp: Date.now(),
    };
    
    // In production, this would be properly encoded and secured
    return Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
  }
}
```

### 5. Putting It All Together

Now, combine all components into a complete X402 agent:

```typescript
class X402CompleteAgent {
  private stagehand: Stagehand;
  private walletManager: SecureWalletManager;
  private bridgeManager: BridgeManager;
  private protocolHandler: X402ProtocolHandler;
  private wallet?: Keypair;
  
  constructor(options: {
    openAIApiKey: string;
    bridgeType: BridgeType;
    bitcoinRpcUrl: string;
    solanaRpcUrl: string;
    useTee: boolean;
  }) {
    this.stagehand = new Stagehand({
      env: "LOCAL",
      modelName: "gpt-4o",
      modelClientOptions: {
        apiKey: options.openAIApiKey,
      },
    });
    
    this.walletManager = new SecureWalletManager(options.useTee);
    
    this.bridgeManager = new BridgeManager({
      bridgeType: options.bridgeType,
      bitcoinRpcUrl: options.bitcoinRpcUrl,
      solanaRpcUrl: options.solanaRpcUrl,
    });
    
    this.protocolHandler = new X402ProtocolHandler();
  }
  
  async init(walletPath: string): Promise<void> {
    await this.stagehand.init();
    this.wallet = await this.walletManager.loadWallet(walletPath);
    console.log(`Agent initialized with wallet: ${this.wallet.publicKey.toString()}`);
  }
  
  async processUrl(url: string): Promise<boolean> {
    const page = this.stagehand.page;
    await page.goto(url);
    
    // Detect if payment is required
    const paymentReq = await this.protocolHandler.detectPaymentRequirements(page);
    
    if (!paymentReq) {
      console.log("No payment required");
      return true;
    }
    
    console.log(`Payment required: ${paymentReq.maxAmountRequired} ${paymentReq.asset}`);
    
    // Determine if bridging is needed
    const requiresBridge = this.checkIfBridgingRequired(paymentReq);
    
    let txSignature;
    if (requiresBridge) {
      // Process cross-chain payment
      const bridgeResult = await this.bridgeManager.bridgeAssets({
        sourceChain: "bitcoin",
        destinationChain: "solana",
        amount: parseFloat(paymentReq.maxAmountRequired),
        asset: paymentReq.asset,
        recipientAddress: paymentReq.payTo,
        wallet: this.wallet!,
      });
      
      txSignature = bridgeResult.transactionHash;
    } else {
      // Process same-chain payment
      txSignature = "direct-payment-signature";
    }
    
    // Create payment header and submit
    const paymentHeader = await this.protocolHandler.createPaymentHeader(txSignature);
    
    // Navigate with the payment header
    await page.goto(url, {
      headers: {
        "X-PAYMENT": paymentHeader
      }
    });
    
    // Verify success
    const success = await page.evaluate(() => {
      return !document.querySelector(".paywall") && document.body.textContent.length > 500;
    });
    
    return success;
  }
  
  private checkIfBridgingRequired(paymentReq: PaymentRequirements): boolean {
    // Simplified check for demo purposes
    return paymentReq.network === "bitcoin" && this.wallet !== undefined;
  }
  
  async close(): Promise<void> {
    await this.stagehand.close();
  }
}
```

## Usage Examples

### Basic Usage Example

```typescript
// Basic agent usage
import { X402CompleteAgent, BridgeType } from './x402Agent';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const agent = new X402CompleteAgent({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    bridgeType: process.env.BRIDGE_TYPE === 'sBTC' ? BridgeType.SBTC : BridgeType.ZBTC,
    bitcoinRpcUrl: process.env.BITCOIN_RPC_URL!,
    solanaRpcUrl: process.env.SOLANA_RPC_URL!,
    useTee: true,
  });
  
  try {
    await agent.init(process.env.SOLANA_PRIVATE_KEY!);
    
    const targetUrl = 'https://example.com/premium-content';
    const success = await agent.processUrl(targetUrl);
    
    if (success) {
      console.log('Successfully accessed content!');
    } else {
      console.log('Failed to access content');
    }
  } finally {
    await agent.close();
  }
}

main().catch(console.error);
```

### Advanced Cross-Chain Example

For more advanced use cases, you can implement policy controls and transaction verification:

```typescript
// Create a policy-controlled agent
const agent = new X402CompleteAgent({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  bridgeType: BridgeType.ZBTC,
  bitcoinRpcUrl: process.env.BITCOIN_RPC_URL!,
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  useTee: true,
  policyConfig: {
    maxTransactionAmount: 0.1,
    allowedDomains: ['example.com', 'trusted-site.org'],
    requireApprovalAbove: 0.05,
  }
});

// Process multiple URLs
const urlsToProcess = [
  'https://example.com/article1',
  'https://example.com/article2',
  'https://trusted-site.org/premium'
];

for (const url of urlsToProcess) {
  const result = await agent.processWithVerification(url);
  console.log(`${url}: ${result.success ? 'Success' : 'Failed'}`);
  
  if (result.transactionHash) {
    console.log(`Transaction: ${result.transactionHash}`);
  }
}
```

## Best Practices

1. **Security First**: Always use TEEs for key management and transaction signing
2. **Attest