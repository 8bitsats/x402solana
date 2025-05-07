---
description: >-
  // SolPay402 Backend Implementation // A Solana-based implementation of the
  x402 protocol
---

# Backend

```
// SolPay402 Backend Implementation
// A Solana-based implementation of the x402 protocol

// ------------------
// src/index.ts - Main entry point
// ------------------
import express from 'express';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PaymentFacilitator } from './facilitator';
import { X402PaymentHeader, PaymentRequest, PaymentResponse } from './types';
import { parsePaymentHeader, createPaymentResponse } from './utils';
import { config } from './config';

const app = express();
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(config.solanaRpcUrl, 'confirmed');
const facilitator = new PaymentFacilitator(connection, config.facilitatorKeyPair);

// Middleware to handle 402 Payment Required responses
const paymentRequiredMiddleware = (req: any, res: any, next: any) => {
  if (!req.headers['x-payment']) {
    // No payment header, send 402 Payment Required
    const paymentRequest: PaymentRequest = {
      amount: req.paymentAmount || config.defaultPaymentAmount,
      token: req.paymentToken || config.defaultToken,
      recipient: config.merchantAccount.toString(),
      paymentId: Date.now().toString(),
      expiresAt: Date.now() + config.paymentExpiryMs,
      description: req.paymentDescription || 'Payment for service',
    };
    
    res.status(402);
    res.set('X-PAYMENT-REQUEST', JSON.stringify(paymentRequest));
    return res.json({ 
      error: 'Payment Required', 
      details: paymentRequest 
    });
  }
  
  // Payment header exists, verify the payment
  const paymentHeader = req.headers['x-payment'];
  try {
    const parsedPaymentHeader = parsePaymentHeader(paymentHeader);
    facilitator.verifyAndSettlePayment(parsedPaymentHeader)
      .then((paymentStatus) => {
        if (paymentStatus.success) {
          req.paymentVerified = true;
          req.paymentTransaction = paymentStatus.transaction;
          next();
        } else {
          res.status(402);
          res.set('X-PAYMENT-RESPONSE', JSON.stringify({
            success: false,
            error: paymentStatus.error,
            paymentId: parsedPaymentHeader.paymentId
          }));
          res.json({ error: 'Payment Verification Failed', details: paymentStatus.error });
        }
      })
      .catch((error) => {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Payment header parsing error:', error);
    res.status(400).json({ error: 'Invalid Payment Header' });
  }
};

// Example protected API route
app.get('/api/protected-resource', (req: any, res: any) => {
  req.paymentAmount = 0.01; // 0.01 USDC
  req.paymentToken = 'USDC';
  req.paymentDescription = 'Access to protected resource';
}, paymentRequiredMiddleware, (req: any, res: any) => {
  // Payment verified, return protected resource
  const paymentResponse: PaymentResponse = createPaymentResponse(req.paymentTransaction);
  res.set('X-PAYMENT-RESPONSE', JSON.stringify(paymentResponse));
  res.json({ 
    data: 'This is your protected resource data', 
    payment: paymentResponse 
  });
});

app.listen(config.port, () => {
  console.log(`SolPay402 server listening on port ${config.port}`);
});

// ------------------
// src/facilitator.ts - Payment Facilitator implementation
// ------------------
import { Connection, Transaction, PublicKey, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { X402PaymentHeader, PaymentStatus } from './types';
import { decodeTransaction, getTokenBalance, sendTransaction } from './utils';

export class PaymentFacilitator {
  private connection: Connection;
  private keypair: Keypair;
  
  constructor(connection: Connection, keypair: Keypair) {
    this.connection = connection;
    this.keypair = keypair;
  }
  
  async verifyAndSettlePayment(paymentHeader: X402PaymentHeader): Promise<PaymentStatus> {
    try {
      // Decode the transaction from the payment header
      const transaction = decodeTransaction(paymentHeader.transaction);
      
      // Verify that the transaction is valid
      const isValid = await this.verifyTransaction(transaction, paymentHeader);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid transaction',
          paymentId: paymentHeader.paymentId
        };
      }
      
      // Send the transaction to the network
      const signature = await sendTransaction(this.connection, transaction);
      
      // Confirm the transaction
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      // Return success status
      return {
        success: true,
        transaction: {
          signature,
          amount: paymentHeader.amount,
          token: paymentHeader.token,
          recipient: paymentHeader.recipient,
          blockTime: Date.now(),
        },
        paymentId: paymentHeader.paymentId
      };
    } catch (error: any) {
      console.error('Payment settlement error:', error);
      return {
        success: false,
        error: error.message,
        paymentId: paymentHeader.paymentId
      };
    }
  }
  
  private async verifyTransaction(transaction: Transaction, header: X402PaymentHeader): Promise<boolean> {
    // Verify the transaction matches the payment header
    try {
      // Verify recipient address
      if (!transaction.instructions.some(ix => 
        ix.programId.equals(TOKEN_PROGRAM_ID) && 
        ix.keys.some(key => key.pubkey.toString() === header.recipient)
      )) {
        return false;
      }
      
      // Verify amount (simplified - actual implementation would depend on token type)
      // For full implementation, you would parse the transfer instruction and verify amount
      
      // Check if transaction is already processed to prevent replay
      // This would use a database in a production system
      
      return true;
    } catch (error) {
      console.error('Transaction verification error:', error);
      return false;
    }
  }
}

// ------------------
// src/types.ts - Type definitions
// ------------------
export interface PaymentRequest {
  amount: number;
  token: string;
  recipient: string;
  paymentId: string;
  expiresAt: number;
  description?: string;
}

export interface X402PaymentHeader {
  version: string;
  paymentId: string;
  amount: number;
  token: string;
  recipient: string;
  transaction: string;
  signature: string;
}

export interface PaymentTransaction {
  signature: string;
  amount: number;
  token: string;
  recipient: string;
  blockTime: number;
}

export interface PaymentResponse {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  paymentId: string;
}

export interface PaymentStatus {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  paymentId: string;
}

// ------------------
// src/utils.ts - Utility functions
// ------------------
import { Transaction, Connection, PublicKey } from '@solana/web3.js';
import { X402PaymentHeader, PaymentResponse, PaymentTransaction } from './types';
import base58 from 'bs58';

export function parsePaymentHeader(headerString: string): X402PaymentHeader {
  try {
    return JSON.parse(headerString) as X402PaymentHeader;
  } catch (error) {
    throw new Error('Invalid payment header format');
  }
}

export function createPaymentResponse(transaction: PaymentTransaction): PaymentResponse {
  return {
    success: true,
    transaction,
    paymentId: transaction.signature,
  };
}

export function decodeTransaction(transactionString: string): Transaction {
  try {
    const buffer = Buffer.from(transactionString, 'base64');
    return Transaction.from(buffer);
  } catch (error) {
    throw new Error('Invalid transaction encoding');
  }
}

export async function sendTransaction(connection: Connection, transaction: Transaction): Promise<string> {
  try {
    return await connection.sendRawTransaction(transaction.serialize());
  } catch (error) {
    throw new Error(`Transaction sending failed: ${error}`);
  }
}

export async function getTokenBalance(connection: Connection, account: PublicKey, mint: PublicKey): Promise<number> {
  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(account, { mint });
    if (tokenAccounts.value.length === 0) {
      return 0;
    }
    const tokenAccountInfo = tokenAccounts.value[0].account;
    const data = tokenAccountInfo.data;
    // Parse token account data to get balance
    // Actual implementation would use the Token class from @solana/spl-token
    return 0; // Placeholder
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

// ------------------
// src/config.ts - Configuration
// ------------------
import { Keypair, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Load private key from env or generate a new one
const loadKeypair = (): Keypair => {
  if (process.env.PRIVATE_KEY) {
    const secretKey = Buffer.from(JSON.parse(process.env.PRIVATE_KEY));
    return Keypair.fromSecretKey(secretKey);
  }
  return Keypair.generate();
};

export const config = {
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  port: parseInt(process.env.PORT || '3000'),
  facilitatorKeyPair: loadKeypair(),
  merchantAccount: new PublicKey(process.env.MERCHANT_ACCOUNT || '11111111111111111111111111111111'),
  defaultPaymentAmount: 0.01,
  defaultToken: 'USDC',
  paymentExpiryMs: 5 * 60 * 1000, // 5 minutes
};
```
