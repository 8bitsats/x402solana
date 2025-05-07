---
description: FrontEnd
---

# SolPay402 SDK

```
// SolPay402 Frontend SDK
// A client library for interacting with SolPay402 services

// ------------------
// src/client/index.ts - Main SDK entry point
// ------------------
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  PaymentRequest, 
  X402PaymentHeader, 
  SolPay402ClientOptions,
  PaymentResponse 
} from './types';
import { createPaymentHeader, processPaymentResponse } from './utils';

export class SolPay402Client {
  private connection: Connection;
  private wallet: any; // Wallet interface
  private options: SolPay402ClientOptions;

  constructor(connection: Connection, wallet: any, options: SolPay402ClientOptions = {}) {
    this.connection = connection;
    this.wallet = wallet;
    this.options = {
      autoApprove: options.autoApprove || false,
      maxPaymentAmount: options.maxPaymentAmount || 1, // 1 USDC/SOL default max
      preferredToken: options.preferredToken || 'USDC',
      ...options
    };
  }

  /**
   * Intercepts fetch requests and handles 402 Payment Required responses
   * @returns A fetch-compatible function that handles x402 payments
   */
  createFetchWithPayment(): typeof fetch {
    const originalFetch = fetch;
    const self = this;

    return async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const response = await originalFetch(input, init);
      
      // Check for 402 Payment Required
      if (response.status === 402) {
        // Clone the response to read it
        const clonedResponse = response.clone();
        const paymentRequestHeader = clonedResponse.headers.get('X-PAYMENT-REQUEST');
        
        if (paymentRequestHeader) {
          try {
            // Parse payment request
            const paymentRequest: PaymentRequest = JSON.parse(paymentRequestHeader);
            
            // Check if payment amount is acceptable
            if (paymentRequest.amount > self.options.maxPaymentAmount!) {
              throw new Error(`Payment amount ${paymentRequest.amount} exceeds maximum allowed ${self.options.maxPaymentAmount}`);
            }
            
            // Get user approval if autoApprove is false
            if (!self.options.autoApprove) {
              const approved = await self.requestUserApproval(paymentRequest);
              if (!approved) {
                throw new Error('Payment not approved by user');
              }
            }
            
            // Create and send payment
            const paymentHeader = await self.createPayment(paymentRequest);
            
            // Retry the original request with payment header
            const newInit = {
              ...init,
              headers: {
                ...(init?.headers || {}),
                'X-PAYMENT': JSON.stringify(paymentHeader)
              }
            };
            
            // Send the request with payment header
            return originalFetch(input, newInit);
          } catch (error: any) {
            console.error('Payment processing error:', error);
            throw new Error(`Payment failed: ${error.message}`);
          }
        }
      }
      
      // Process payment response header if present
      const paymentResponseHeader = response.headers.get('X-PAYMENT-RESPONSE');
      if (paymentResponseHeader) {
        try {
          const paymentResponse: PaymentResponse = JSON.parse(paymentResponseHeader);
          self.processPaymentResponse(paymentResponse);
        } catch (error) {
          console.error('Error processing payment response:', error);
        }
      }
      
      return response;
    };
  }

  /**
   * Creates a payment for the specified request
   * @param paymentRequest The payment request details
   * @returns Payment header to include in subsequent request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<X402PaymentHeader> {
    try {
      // Create a Solana transaction for the payment
      const transaction = await this.createPaymentTransaction(paymentRequest);
      
      // Sign the transaction with the wallet
      const signedTransaction = await this.wallet.signTransaction(transaction);
      
      // Serialize the transaction to include in the payment header
      const serializedTransaction = signedTransaction.serialize().toString('base64');
      
      // Create the payment header
      return createPaymentHeader({
        paymentId: paymentRequest.paymentId,
        amount: paymentRequest.amount,
        token: paymentRequest.token,
        recipient: paymentRequest.recipient,
        transaction: serializedTransaction,
        wallet: this.wallet
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Creates a transaction for the specified payment
   * @param paymentRequest The payment request details
   * @returns Unsigned transaction
   */
  private async createPaymentTransaction(paymentRequest: PaymentRequest): Promise<Transaction> {
    // In a real implementation, this would create the appropriate transaction
    // based on the token type (SOL, USDC, etc.)
    
    // For this example, we'll create a placeholder transaction
    const transaction = new Transaction();
    
    // Add instructions based on token type
    if (paymentRequest.token === 'SOL') {
      // SOL transfer instruction would be added here
    } else if (paymentRequest.token === 'USDC') {
      // USDC transfer instruction would be added here
    } else {
      throw new Error(`Unsupported token: ${paymentRequest.token}`);
    }
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;
    
    return transaction;
  }

  /**
   * Requests user approval for a payment
   * @param paymentRequest The payment request details
   * @returns Whether the payment was approved
   */
  private async requestUserApproval(paymentRequest: PaymentRequest): Promise<boolean> {
    // In a real implementation, this would show a UI dialog to approve
    // For this example, we'll simulate with a console message
    console.log('Payment approval requested:', paymentRequest);
    
    // For demo purposes, always return true
    // In a real implementation, this would return based on user input
    return Promise.resolve(true);
  }

  /**
   * Processes a payment response
   * @param paymentResponse The payment response details
   */
  private processPaymentResponse(paymentResponse: PaymentResponse): void {
    if (paymentResponse.success) {
      console.log('Payment successful:', paymentResponse);
      // In a real implementation, you might update UI, local storage, etc.
    } else {
      console.error('Payment failed:', paymentResponse.error);
      // Handle failed payment
    }
  }
}

// ------------------
// src/client/types.ts - Client type definitions
// ------------------
export interface SolPay402ClientOptions {
  autoApprove?: boolean;
  maxPaymentAmount?: number;
  preferredToken?: string;
  onPaymentRequest?: (request: PaymentRequest) => Promise<boolean>;
  onPaymentSuccess?: (response: PaymentResponse) => void;
  onPaymentFailure?: (error: string) => void;
}

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

export interface CreatePaymentHeaderParams {
  paymentId: string;
  amount: number;
  token: string;
  recipient: string;
  transaction: string;
  wallet: any;
}

// ------------------
// src/client/utils.ts - Client utility functions
// ------------------
import { CreatePaymentHeaderParams, X402PaymentHeader, PaymentResponse } from './types';

/**
 * Creates a payment header for inclusion in HTTP requests
 * @param params Parameters for creating the payment header
 * @returns Payment header object
 */
export async function createPaymentHeader(params: CreatePaymentHeaderParams): Promise<X402PaymentHeader> {
  // Create a message to sign
  const message = `${params.paymentId}:${params.amount}:${params.token}:${params.recipient}:${params.transaction}`;
  
  // Sign the message with the wallet
  // This is a simplified example - actual implementation would depend on wallet interface
  const signature = await params.wallet.signMessage(new TextEncoder().encode(message));
  
  // Create and return the payment header
  return {
    version: '1.0',
    paymentId: params.paymentId,
    amount: params.amount,
    token: params.token,
    recipient: params.recipient,
    transaction: params.transaction,
    signature: Buffer.from(signature).toString('base64')
  };
}

/**
 * Processes a payment response
 * @param response Payment response from server
 * @returns Processed payment response
 */
export function processPaymentResponse(response: PaymentResponse): PaymentResponse {
  // In a real implementation, you might validate the response
  return response;
}

// ------------------
// Example React component using the SolPay402 client
// ------------------
import React, { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { SolPay402Client } from './client';

const SolPay402Example: React.FC = () => {
  const { wallet, publicKey, signTransaction, signMessage } = useWallet();
  const [client, setClient] = useState<SolPay402Client | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (wallet && publicKey) {
      // Create Solana connection
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // Create wallet adapter for SolPay402Client
      const walletAdapter = {
        publicKey,
        signTransaction,
        signMessage
      };
      
      // Create SolPay402 client
      const solPay402Client = new SolPay402Client(connection, walletAdapter, {
        autoApprove: false,
        maxPaymentAmount: 0.1, // 0.1 USDC/SOL
        preferredToken: 'USDC',
        onPaymentRequest: async (request) => {
          // Show UI to approve payment
          return window.confirm(`Approve payment of ${request.amount} ${request.token}?`);
        },
        onPaymentSuccess: (response) => {
          console.log('Payment successful:', response);
        },
        onPaymentFailure: (error) => {
          console.error('Payment failed:', error);
        }
      });
      
      setClient(solPay402Client);
    }
  }, [wallet, publicKey, signTransaction, signMessage]);
  
  const fetchProtectedData = async () => {
    if (!client) {
      setError('Wallet not connected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create fetch with x402 payment support
      const fetchWithPayment = client.createFetchWithPayment();
      
      // Fetch data from API
      const response = await fetchWithPayment('https://api.example.com/protected-data');
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="solpay402-example">
      <h2>SolPay402 Example</h2>
      
      {!wallet ? (
        <p>Please connect your wallet to continue</p>
      ) : (
        <>
          <button onClick={fetchProtectedData} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Protected Data'}
          </button>
          
          {error && <p className="error">{error}</p>}
          
          {data && (
            <div className="data">
              <h3>Protected Data</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SolPay402Example;
```
