// X402 Agent with Stagehand and Bitcoin-Solana Bridge Integration
// This implementation demonstrates how to create an agent that can automate
// cross-chain payments between Bitcoin and Solana using the X402 protocol

import { Stagehand } from "@browserbasehq/stagehand";
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { X402Protocol, PaymentRequirements, BridgeType } from "./x402Protocol";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the schema for payment information
const PaymentInfoSchema = z.object({
  recipientAddress: z.string().describe("The receiving wallet address"),
  amount: z.number().describe("The payment amount"),
  currency: z.string().describe("The currency code (SOL, BTC, USDC, etc.)"),
  description: z.string().optional().describe("Description of what's being purchased"),
  resourceId: z.string().optional().describe("Identifier for the resource being accessed"),
});

// Define the schema for payment verification
const PaymentVerificationSchema = z.object({
  transactionHash: z.string().describe("The transaction hash/signature"),
  status: z.enum(["confirmed", "pending", "failed"]),
  confirmations: z.number().optional(),
  blockTime: z.number().optional(),
});

// Bitcoin-Solana bridge configuration
interface BridgeConfig {
  type: BridgeType; // "zBTC" or "sBTC"
  bitcoinRpcUrl: string;
  solanaRpcUrl: string;
  bridgeAddress: string;
  privateKeyPath: string;
  maxTransactionAmount: number;
  trustedDomains: string[];
}

/**
 * X402 HTTP Payments Agent that can bridge Bitcoin to Solana
 * and execute cross-chain payments through websites
 */
class X402PaymentsAgent {
  private stagehand: Stagehand;
  private x402Protocol: X402Protocol;
  private connection: Connection;
  private wallet: Keypair;
  private bridgeConfig: BridgeConfig;
  private teeEnclave: boolean = true; // Flag to indicate if TEE is available

  /**
   * Initialize the X402 Payments Agent
   */
  constructor(options: {
    openAIApiKey: string;
    bridgeConfig: BridgeConfig;
    modelName?: string;
    teeEnclave?: boolean;
  }) {
    this.bridgeConfig = options.bridgeConfig;
    this.teeEnclave = options.teeEnclave ?? true;
    
    // Initialize stagehand for browser automation
    this.stagehand = new Stagehand({
      env: "LOCAL",
      modelName: options.modelName || "gpt-4o",
      modelClientOptions: {
        apiKey: options.openAIApiKey,
      },
    });
    
    // Initialize Solana connection
    this.connection = new Connection(this.bridgeConfig.solanaRpcUrl);
    
    // Initialize X402 protocol
    this.x402Protocol = new X402Protocol({
      bridgeType: this.bridgeConfig.type,
      bitcoinRpcUrl: this.bridgeConfig.bitcoinRpcUrl,
      solanaConnection: this.connection,
      useTee: this.teeEnclave,
    });
  }

  /**
   * Initialize the agent and load wallet
   */
  async init(): Promise<void> {
    // Initialize browser automation
    await this.stagehand.init();
    
    // Load wallet from file or environment with TEE protection
    try {
      if (this.teeEnclave) {
        console.log("Loading wallet within TEE secure enclave...");
        // In a real implementation, this would use TEE-specific APIs
        // For demonstration purposes, we'll load from a file
        this.wallet = await this.loadWalletSecure(this.bridgeConfig.privateKeyPath);
      } else {
        console.log("WARNING: Loading wallet without TEE protection");
        this.wallet = await this.loadWallet(this.bridgeConfig.privateKeyPath);
      }
      console.log(`Wallet loaded successfully: ${this.wallet.publicKey.toString()}`);
    } catch (error) {
      console.error("Failed to load wallet:", error);
      throw new Error("Wallet initialization failed");
    }
  }

  /**
   * Load a wallet from a file or environment variable
   * NOTE: In a production system, this should be handled within a TEE
   */
  private async loadWallet(keyPath: string): Promise<Keypair> {
    try {
      // Try loading from file
      const keyData = await fs.readFile(keyPath, 'utf-8');
      const secretKey = Uint8Array.from(JSON.parse(keyData));
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      // Fall back to environment variable
      if (process.env.PRIVATE_KEY) {
        const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
        return Keypair.fromSecretKey(secretKey);
      }
      throw new Error("Failed to load wallet from file or environment");
    }
  }

  /**
   * Load a wallet securely within a TEE
   * NOTE: This is a simulated TEE for demonstration purposes
   */
  private async loadWalletSecure(keyPath: string): Promise<Keypair> {
    console.log("Performing attestation for secure wallet loading...");
    // In a real implementation, this would verify the TEE and load the key
    // within the secure enclave with hardware attestation
    return this.loadWallet(keyPath);
  }

  /**
   * Navigate to a website and detect payment requirements
   */
  async navigateAndDetectPayment(url: string): Promise<PaymentRequirements | null> {
    const page = this.stagehand.page;
    
    // Navigate to the website
    console.log(`Navigating to ${url}...`);
    await page.goto(url);
    
    // Check for HTTP 402 Payment Required response
    const response = await page.evaluate(() => {
      return {
        status: window.performance
          .getEntriesByType('resource')
          .filter((resource: any) => resource.name === window.location.href)
          .map((resource: any) => resource.responseStatus)[0],
        headers: document.querySelector('meta[name="x-payment-required"]')?.getAttribute('content')
      };
    });
    
    // If we got a 402 response, parse the payment requirements
    if (response.status === 402 || response.headers) {
      console.log("Detected payment required response");
      
      // Extract payment information using AI vision
      const paymentInfo = await page.extract({
        instruction: "Extract payment information from this page, including recipient address, amount, currency, and any resource identifier",
        schema: PaymentInfoSchema,
      });
      
      console.log("Extracted payment information:", paymentInfo);
      
      // Convert to X402 payment requirements format
      return {
        scheme: "exact",
        network: paymentInfo.currency.toLowerCase().includes("btc") ? "bitcoin-mainnet" : "solana-mainnet",
        payTo: paymentInfo.recipientAddress,
        maxAmountRequired: paymentInfo.amount.toString(),
        resource: paymentInfo.resourceId || url,
        description: paymentInfo.description || `Payment for resource at ${url}`,
        asset: paymentInfo.currency,
        maxTimeoutSeconds: 60,
      };
    }
    
    // No payment required
    console.log("No payment required detected");
    return null;
  }

  /**
   * Process a cross-chain payment using the appropriate bridge
   */
  async processPayment(paymentReq: PaymentRequirements): Promise<string> {
    console.log(`Processing payment: ${paymentReq.maxAmountRequired} ${paymentReq.asset} to ${paymentReq.payTo}`);
    
    // Verify payment request against policy
    if (!this.verifyAgainstPolicy(paymentReq)) {
      throw new Error("Payment request violates policy limits");
    }
    
    // Determine if cross-chain bridging is required
    const requiresBridge = this.requiresBridging(paymentReq);
    
    if (requiresBridge) {
      console.log(`Cross-chain bridging required: ${paymentReq.network} -> ${this.bridgeConfig.type}`);
      
      // Perform the bridging operation and get the transaction signature
      const bridgeResult = await this.x402Protocol.bridgeAssets({
        sourceChain: paymentReq.network.includes("bitcoin") ? "bitcoin" : "solana",
        destinationChain: paymentReq.network.includes("bitcoin") ? "solana" : "bitcoin",
        amount: parseFloat(paymentReq.maxAmountRequired),
        asset: paymentReq.asset,
        recipientAddress: paymentReq.payTo,
        bridgeType: this.bridgeConfig.type,
        wallet: this.wallet,
      });
      
      console.log(`Bridge operation completed: ${bridgeResult.transactionHash}`);
      return bridgeResult.transactionHash;
    } else {
      // No bridging required, process direct payment
      console.log("Processing direct payment on same chain");
      
      // Create and sign transaction
      const txSignature = await this.x402Protocol.processDirectPayment({
        paymentRequirements: paymentReq,
        wallet: this.wallet,
      });
      
      console.log(`Payment transaction submitted: ${txSignature}`);
      return txSignature;
    }
  }

  /**
   * Check if a payment request requires cross-chain bridging
   */
  private requiresBridging(paymentReq: PaymentRequirements): boolean {
    // If payment network matches our current network, no bridging needed
    if (paymentReq.network.includes("solana") && this.x402Protocol.getCurrentChain() === "solana") {
      return false;
    }
    
    if (paymentReq.network.includes("bitcoin") && this.x402Protocol.getCurrentChain() === "bitcoin") {
      return false;
    }
    
    // Bridging is required
    return true;
  }

  /**
   * Verify a payment request against the agent's policy
   */
  private verifyAgainstPolicy(paymentReq: PaymentRequirements): boolean {
    // Check amount against max allowed
    const amount = parseFloat(paymentReq.maxAmountRequired);
    if (amount > this.bridgeConfig.maxTransactionAmount) {
      console.warn(`Payment amount ${amount} exceeds maximum allowed ${this.bridgeConfig.maxTransactionAmount}`);
      return false;
    }
    
    // Check domain against trusted domains
    try {
      const resourceUrl = new URL(paymentReq.resource);
      const domain = resourceUrl.hostname;
      
      if (!this.bridgeConfig.trustedDomains.includes(domain) && 
          !this.bridgeConfig.trustedDomains.includes("*")) {
        console.warn(`Domain ${domain} is not in the trusted domains list`);
        return false;
      }
    } catch (error) {
      console.warn("Invalid resource URL:", paymentReq.resource);
      return false;
    }
    
    // All checks passed
    return true;
  }

  /**
   * Submit payment and verify success
   */
  async submitPaymentAndVerify(url: string, paymentSignature: string): Promise<boolean> {
    const page = this.stagehand.page;
    
    // Create the X-PAYMENT header with the transaction signature
    const paymentHeader = await this.x402Protocol.createPaymentHeader(paymentSignature);
    
    // Navigate with the payment header
    console.log("Submitting payment and navigating to resource...");
    await page.goto(url, {
      headers: {
        "X-PAYMENT": paymentHeader
      }
    });
    
    // Check if the payment was accepted
    const success = await page.evaluate(() => {
      // Check if we have access to the content (no 402 status)
      const hasPaywallElement = document.querySelector(".paywall, .payment-required, #payment-wall");
      return !hasPaywallElement && document.body.textContent.length > 500;
    });
    
    if (success) {
      console.log("Payment was accepted, resource is now accessible");
      
      // Extract payment verification details
      try {
        const verification = await page.extract({
          instruction: "Extract any payment confirmation information from this page",
          schema: PaymentVerificationSchema,
        });
        
        console.log("Payment verification:", verification);
      } catch (error) {
        // Verification extraction failed, but page is accessible
        console.log("Couldn't extract verification details, but page is accessible");
      }
      
      return true;
    } else {
      console.error("Payment was rejected or resource is still inaccessible");
      return false;
    }
  }

  /**
   * Record a transaction in the agent's history
   */
  async recordTransaction(paymentReq: PaymentRequirements, txSignature: string, success: boolean): Promise<void> {
    // In a real implementation, this would store transaction history
    // For demonstration purposes, we'll just log it
    const record = {
      timestamp: new Date().toISOString(),
      recipient: paymentReq.payTo,
      amount: paymentReq.maxAmountRequired,
      asset: paymentReq.asset,
      resource: paymentReq.resource,
      transactionSignature: txSignature,
      success,
    };
    
    console.log("Transaction recorded:", record);
    
    // This would typically be stored in a database or on-chain
  }

  /**
   * Process a complete payment flow for a given URL
   */
  async processPaymentFlow(url: string): Promise<{ success: boolean; transactionSignature?: string }> {
    try {
      // Navigate to the URL and detect payment requirements
      const paymentRequirements = await this.navigateAndDetectPayment(url);
      
      // If no payment required, we're done
      if (!paymentRequirements) {
        console.log("No payment required for this resource");
        return { success: true };
      }
      
      // Process the payment
      const transactionSignature = await this.processPayment(paymentRequirements);
      
      // Submit the payment and verify success
      const success = await this.submitPaymentAndVerify(url, transactionSignature);
      
      // Record the transaction
      await this.recordTransaction(paymentRequirements, transactionSignature, success);
      
      return { success, transactionSignature };
    } catch (error) {
      console.error("Payment flow failed:", error);
      return { success: false };
    }
  }

  /**
   * Take a screenshot of the current page
   */
  async takeScreenshot(filePath: string): Promise<void> {
    await this.stagehand.page.screenshot({ path: filePath });
    console.log(`Screenshot saved to ${filePath}`);
  }

  /**
   * Close the agent and clean up resources
   */
  async close(): Promise<void> {
    await this.stagehand.close();
    console.log("Agent closed");
  }
}

/**
 * Main function to run the X402 Agent
 */
async function main() {
  // Create bridge configuration
  const bridgeConfig: BridgeConfig = {
    type: "zBTC", // or "sBTC"
    bitcoinRpcUrl: process.env.BITCOIN_RPC_URL || "https://btc.getblock.io/mainnet/",
    solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    bridgeAddress: process.env.BRIDGE_ADDRESS || "",
    privateKeyPath: path.resolve(__dirname, "../keys/wallet.json"),
    maxTransactionAmount: parseFloat(process.env.MAX_TRANSACTION_AMOUNT || "0.1"),
    trustedDomains: (process.env.TRUSTED_DOMAINS || "").split(","),
  };
  
  // Create and initialize the agent
  const agent = new X402PaymentsAgent({
    openAIApiKey: process.env.OPENAI_API_KEY || "",
    bridgeConfig,
    modelName: "gpt-4o",
    teeEnclave: true,
  });
  
  try {
    // Initialize the agent
    await agent.init();
    
    // Process a payment flow for a specific URL
    const targetUrl = process.env.TARGET_URL || "https://example-with-x402.com/premium-content";
    console.log(`Processing payment flow for ${targetUrl}...`);
    
    const result = await agent.processPaymentFlow(targetUrl);
    
    if (result.success) {
      console.log("Payment flow completed successfully!");
      if (result.transactionSignature) {
        console.log(`Transaction signature: ${result.transactionSignature}`);
      }
      
      // Take a screenshot of the accessed resource
      await agent.takeScreenshot("./successful-payment.png");
    } else {
      console.error("Payment flow failed");
    }
  } catch (error) {
    console.error("Error in agent execution:", error);
  } finally {
    // Clean up resources
    await agent.close();
  }
}

// Run the agent if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export the agent class for use in other modules
export { X402PaymentsAgent, BridgeConfig };
