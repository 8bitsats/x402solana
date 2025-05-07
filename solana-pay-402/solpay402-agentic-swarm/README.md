# SolPay402 Agentic Swarm

```
// SolPay402 Agent Swarm
// A system of AI agents for handling e-commerce payments using the SolPay402 protocol

// ------------------
// src/agent-swarm/index.ts - Main entry point for agent swarm
// ------------------
import { Connection, PublicKey } from '@solana/web3.js';
import { AgentSwarmConfig, AgentRole, AgentMessage, PaymentIntent } from './types';
import { CoordinatorAgent } from './agents/coordinator';
import { PaymentAgent } from './agents/payment';
import { DiscoveryAgent } from './agents/discovery';
import { PolicyAgent } from './agents/policy';
import { AccountingAgent } from './agents/accounting';
import { HelioPriceOracle } from './integrations/helio';
import { SolanaPayAdapter } from './integrations/solana-pay';
import { ShopifyIntegration } from './integrations/shopify';
import { EventBus } from './messaging/event-bus';

export class AgentSwarm {
  private config: AgentSwarmConfig;
  private connection: Connection;
  private eventBus: EventBus;
  private coordinatorAgent: CoordinatorAgent;
  private paymentAgents: PaymentAgent[] = [];
  private discoveryAgents: DiscoveryAgent[] = [];
  private policyAgents: PolicyAgent[] = [];
  private accountingAgents: AccountingAgent[] = [];

  constructor(config: AgentSwarmConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.eventBus = new EventBus();
    
    // Initialize the price oracle
    const priceOracle = new HelioPriceOracle(this.connection);
    
    // Initialize the coordinatorAgent
    this.coordinatorAgent = new CoordinatorAgent(this.eventBus, config.coordinator);
    
    // Initialize payment agents
    for (let i = 0; i < config.agentCounts.payment; i++) {
      this.paymentAgents.push(new PaymentAgent(
        this.eventBus,
        config.paymentAgents[i] || {},
        {
          connection: this.connection,
          priceOracle,
          solanaPayAdapter: new SolanaPayAdapter(this.connection),
          shopifyIntegration: new ShopifyIntegration(config.shopify)
        }
      ));
    }
    
    // Initialize discovery agents
    for (let i = 0; i < config.agentCounts.discovery; i++) {
      this.discoveryAgents.push(new DiscoveryAgent(
        this.eventBus,
        config.discoveryAgents[i] || {}
      ));
    }
    
    // Initialize policy agents
    for (let i = 0; i < config.agentCounts.policy; i++) {
      this.policyAgents.push(new PolicyAgent(
        this.eventBus,
        config.policyAgents[i] || {}
      ));
    }
    
    // Initialize accounting agents
    for (let i = 0; i < config.agentCounts.accounting; i++) {
      this.accountingAgents.push(new AccountingAgent(
        this.eventBus,
        config.accountingAgents[i] || {}
      ));
    }
  }

  /**
   * Start the agent swarm
   */
  public async start(): Promise<void> {
    console.log('Starting SolPay402 Agent Swarm...');
    
    // Register all agents with the event bus
    this.eventBus.register(this.coordinatorAgent);
    this.paymentAgents.forEach(agent => this.eventBus.register(agent));
    this.discoveryAgents.forEach(agent => this.eventBus.register(agent));
    this.policyAgents.forEach(agent => this.eventBus.register(agent));
    this.accountingAgents.forEach(agent => this.eventBus.register(agent));
    
    // Initialize each agent
    await this.coordinatorAgent.initialize();
    await Promise.all(this.paymentAgents.map(agent => agent.initialize()));
    await Promise.all(this.discoveryAgents.map(agent => agent.initialize()));
    await Promise.all(this.policyAgents.map(agent => agent.initialize()));
    await Promise.all(this.accountingAgents.map(agent => agent.initialize()));
    
    console.log('SolPay402 Agent Swarm started successfully');
  }

  /**
   * Stop the agent swarm
   */
  public async stop(): Promise<void> {
    console.log('Stopping SolPay402 Agent Swarm...');
    
    // Shutdown all agents
    await this.coordinatorAgent.shutdown();
    await Promise.all(this.paymentAgents.map(agent => agent.shutdown()));
    await Promise.all(this.discoveryAgents.map(agent => agent.shutdown()));
    await Promise.all(this.policyAgents.map(agent => agent.shutdown()));
    await Promise.all(this.accountingAgents.map(agent => agent.shutdown()));
    
    console.log('SolPay402 Agent Swarm stopped successfully');
  }

  /**
   * Process a payment intent using the agent swarm
   * @param intent Payment intent to process
   * @returns Result of payment processing
   */
  public async processPaymentIntent(intent: PaymentIntent): Promise<any> {
    return await this.coordinatorAgent.processPaymentIntent(intent);
  }
}

// ------------------
// src/agent-swarm/types.ts - Type definitions for agent swarm
// ------------------
import { PublicKey, Keypair } from '@solana/web3.js';

export interface AgentSwarmConfig {
  rpcUrl: string;
  agentCounts: {
    payment: number;
    discovery: number;
    policy: number;
    accounting: number;
  };
  coordinator: CoordinatorAgentConfig;
  paymentAgents: PaymentAgentConfig[];
  discoveryAgents: DiscoveryAgentConfig[];
  policyAgents: PolicyAgentConfig[];
  accountingAgents: AccountingAgentConfig[];
  shopify: ShopifyConfig;
}

export interface BaseAgentConfig {
  id: string;
  name: string;
  capabilities?: string[];
  ai?: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface CoordinatorAgentConfig extends BaseAgentConfig {
  decisionThreshold: number;
  maxConcurrentTasks: number;
}

export interface PaymentAgentConfig extends BaseAgentConfig {
  supportedTokens: string[];
  keypair?: Keypair;
  maxPaymentAmount: number;
}

export interface DiscoveryAgentConfig extends BaseAgentConfig {
  scanInterval: number;
  apiEndpoints: string[];
}

export interface PolicyAgentConfig extends BaseAgentConfig {
  spendingLimits: {
    [token: string]: number;
  };
  dailyLimit: number;
  requiredApprovals: number;
}

export interface AccountingAgentConfig extends BaseAgentConfig {
  reportingInterval: number;
  storageMethod: 'memory' | 'database';
  categories: string[];
}

export interface ShopifyConfig {
  apiKey: string;
  apiSecret: string;
  scopes: string;
  hostName: string;
  storeUrl: string;
}

export enum AgentRole {
  COORDINATOR = 'coordinator',
  PAYMENT = 'payment',
  DISCOVERY = 'discovery',
  POLICY = 'policy',
  ACCOUNTING = 'accounting'
}

export interface PaymentIntent {
  id: string;
  amount: number;
  token: string;
  recipient: string;
  description: string;
  metadata?: Record<string, any>;
  requiredBy?: number; // Timestamp
}

export interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface ShoppingCart {
  id: string;
  items: PurchaseItem[];
  total: number;
  currency: string;
}

export interface AgentMessage {
  id: string;
  type: string;
  timestamp: number;
  sender: string;
  recipient: string | null;
  payload: any;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  details?: any;
}

// ------------------
// src/agent-swarm/agents/base-agent.ts - Base class for all agents
// ------------------
import { EventBus } from '../messaging/event-bus';
import { AgentMessage } from '../types';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected eventBus: EventBus;
  protected isRunning: boolean = false;
  protected messageHandlers: Map<string, (message: AgentMessage) => Promise<void>> = new Map();

  constructor(eventBus: EventBus, id: string, name: string) {
    this.eventBus = eventBus;
    this.id = id;
    this.name = name;
    
    // Register message handler
    this.eventBus.onMessage(this.id, this.handleMessage.bind(this));
  }

  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    this.isRunning = true;
    console.log(`Agent ${this.name} (${this.id}) initialized`);
  }

  /**
   * Shutdown the agent
   */
  public async shutdown(): Promise<void> {
    this.isRunning = false;
    console.log(`Agent ${this.name} (${this.id}) shutdown`);
  }

  /**
   * Send a message to another agent
   * @param recipient Recipient agent ID
   * @param type Message type
   * @param payload Message payload
   */
  protected async sendMessage(recipient: string | null, type: string, payload: any): Promise<void> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      timestamp: Date.now(),
      sender: this.id,
      recipient,
      payload
    };
    
    await this.eventBus.publish(message);
  }

  /**
   * Handle incoming messages
   * @param message Incoming message
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    if (!this.isRunning) return;
    
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      await handler(message);
    } else {
      console.log(`Agent ${this.name} (${this.id}) received unhandled message type: ${message.type}`);
    }
  }

  /**
   * Register a message handler
   * @param type Message type to handle
   * @param handler Handler function
   */
  protected registerMessageHandler(type: string, handler: (message: AgentMessage) => Promise<void>): void {
    this.messageHandlers.set(type, handler);
  }
}

// ------------------
// src/agent-swarm/agents/coordinator.ts - Coordinator agent implementation
// ------------------
import { BaseAgent } from './base-agent';
import { EventBus } from '../messaging/event-bus';
import { CoordinatorAgentConfig, AgentMessage, PaymentIntent, PaymentResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CoordinatorAgent extends BaseAgent {
  private config: CoordinatorAgentConfig;
  private activeTasks: Map<string, PaymentIntent> = new Map();
  private taskResults: Map<string, PaymentResult> = new Map();
  
  constructor(eventBus: EventBus, config: CoordinatorAgentConfig) {
    super(eventBus, config.id || 'coordinator', config.name || 'Coordinator Agent');
    this.config = config;
    
    // Register message handlers
    this.registerMessageHandler('payment.result', this.handlePaymentResult.bind(this));
    this.registerMessageHandler('discovery.result', this.handleDiscoveryResult.bind(this));
    this.registerMessageHandler('policy.decision', this.handlePolicyDecision.bind(this));
    this.registerMessageHandler('accounting.report', this.handleAccountingReport.bind(this));
  }
  
  /**
   * Process a payment intent
   * @param intent Payment intent to process
   * @returns Result of payment processing
   */
  public async processPaymentIntent(intent: PaymentIntent): Promise<PaymentResult> {
    const taskId = uuidv4();
    
    // Store the payment intent
    this.activeTasks.set(taskId, intent);
    
    // Check if the payment intent is valid
    if (!this.validatePaymentIntent(intent)) {
      const result: PaymentResult = {
        success: false,
        error: 'Invalid payment intent'
      };
      this.taskResults.set(taskId, result);
      return result;
    }
    
    // Check payment policy
    await this.sendMessage(null, 'policy.check', {
      taskId,
      intent
    });
    
    // Wait for all agents to complete their tasks
    return new Promise<PaymentResult>((resolve) => {
      const checkInterval = setInterval(() => {
        const result = this.taskResults.get(taskId);
        if (result) {
          clearInterval(checkInterval);
          this.activeTasks.delete(taskId);
          this.taskResults.delete(taskId);
          resolve(result);
        }
      }, 100);
    });
  }
  
  /**
   * Validate a payment intent
   * @param intent Payment intent to validate
   * @returns Whether the intent is valid
   */
  private validatePaymentIntent(intent: PaymentIntent): boolean {
    return !!(
      intent.id &&
      intent.amount > 0 &&
      intent.token &&
      intent.recipient
    );
  }
  
  /**
   * Handle a payment result message
   * @param message Payment result message
   */
  private async handlePaymentResult(message: AgentMessage): Promise<void> {
    const { taskId, result } = message.payload;
    
    if (this.activeTasks.has(taskId)) {
      this.taskResults.set(taskId, result);
      
      // Notify accounting agents
      await this.sendMessage(null, 'accounting.record', {
        taskId,
        intent: this.activeTasks.get(taskId),
        result
      });
    }
  }
  
  /**
   * Handle a discovery result message
   * @param message Discovery result message
   */
  private async handleDiscoveryResult(message: AgentMessage): Promise<void> {
    // Handle discovery results
    console.log(`Discovery result received: ${JSON.stringify(message.payload)}`);
  }
  
  /**
   * Handle a policy decision message
   * @param message Policy decision message
   */
  private async handlePolicyDecision(message: AgentMessage): Promise<void> {
    const { taskId, approved, reason } = message.payload;
    
    if (this.activeTasks.has(taskId)) {
      if (approved) {
        // Request payment
        await this.sendMessage(null, 'payment.request', {
          taskId,
          intent: this.activeTasks.get(taskId)
        });
      } else {
        // Policy rejected
        const result: PaymentResult = {
          success: false,
          error: `Policy rejected: ${reason}`
        };
        this.taskResults.set(taskId, result);
      }
    }
  }
  
  /**
   * Handle an accounting report message
   * @param message Accounting report message
   */
  private async handleAccountingReport(message: AgentMessage): Promise<void> {
    // Handle accounting reports
    console.log(`Accounting report received: ${JSON.stringify(message.payload)}`);
  }
}

// ------------------
// src/agent-swarm/agents/payment.ts - Payment agent implementation
// ------------------
import { BaseAgent } from './base-agent';
import { EventBus } from '../messaging/event-bus';
import { PaymentAgentConfig, AgentMessage } from '../types';
import { Connection } from '@solana/web3.js';
import { HelioPriceOracle } from '../integrations/helio';
import { SolanaPayAdapter } from '../integrations/solana-pay';
import { ShopifyIntegration } from '../integrations/shopify';

export class PaymentAgent extends BaseAgent {
  private config: PaymentAgentConfig;
  private connection: Connection;
  private priceOracle: HelioPriceOracle;
  private solanaPayAdapter: SolanaPayAdapter;
  private shopifyIntegration: ShopifyIntegration;
  
  constructor(
    eventBus: EventBus, 
    config: PaymentAgentConfig,
    dependencies: {
      connection: Connection;
      priceOracle: HelioPriceOracle;
      solanaPayAdapter: SolanaPayAdapter;
      shopifyIntegration: ShopifyIntegration;
    }
  ) {
    super(eventBus, config.id || `payment_${Date.now()}`, config.name || 'Payment Agent');
    this.config = config;
    this.connection = dependencies.connection;
    this.priceOracle = dependencies.priceOracle;
    this.solanaPayAdapter = dependencies.solanaPayAdapter;
    this.shopifyIntegration = dependencies.shopifyIntegration;
    
    // Register message handlers
    this.registerMessageHandler('payment.request', this.handlePaymentRequest.bind(this));
  }
  
  /**
   * Handle a payment request
   * @param message Payment request message
   */
  private async handlePaymentRequest(message: AgentMessage): Promise<void> {
    const { taskId, intent } = message.payload;
    
    console.log(`Processing payment request for task ${taskId}: ${JSON.stringify(intent)}`);
    
    try {
      // Check if token is supported
      if (!this.config.supportedTokens.includes(intent.token)) {
        throw new Error(`Unsupported token: ${intent.token}`);
      }
      
      // Check if amount is within limits
      if (intent.amount > this.config.maxPaymentAmount) {
        throw new Error(`Payment amount exceeds limit of ${this.config.maxPaymentAmount}`);
      }
      
      // Get current price for token
      const tokenPrice = await this.priceOracle.getPrice(intent.token);
      console.log(`Current price for ${intent.token}: $${tokenPrice}`);
      
      // Process payment using SolPay402 protocol
      const paymentResult = await this.processPayment(intent);
      
      // Send payment result
      await this.sendMessage(message.sender, 'payment.result', {
        taskId,
        result: {
          success: true,
          transactionId: paymentResult.transactionId,
          details: paymentResult
        }
      });
    } catch (error: any) {
      console.error(`Payment error for task ${taskId}:`, error);
      
      // Send payment failure
      await this.sendMessage(message.sender, 'payment.result', {
        taskId,
        result: {
          success: false,
          error: error.message
        }
      });
    }
  }
  
  /**
   * Process a payment
   * @param intent Payment intent to process
   * @returns Payment result
   */
  private async processPayment(intent: any): Promise<any> {
    // Simplified implementation - in a real system, this would interact with Solana
    const metadata = intent.metadata || {};
    
    if (metadata.source === 'shopify') {
      // Process via Shopify integration
      return await this.shopifyIntegration.createPayment(intent);
    } else {
      // Process via SolPay402 protocol
      const x402Response = await fetch(intent.recipient, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (x402Response.status === 402) {
        const paymentRequest = await x402Response.json();
        
        // Create and sign transaction
        const transaction = await this.solanaPayAdapter.createTransaction({
          amount: intent.amount,
          token: intent.token,
          recipient: intent.recipient
        });
        
        // Send transaction with payment header
        const paymentResponse = await fetch(intent.recipient, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-PAYMENT': JSON.stringify({
              version: '1.0',
              paymentId: intent.id,
              amount: intent.amount,
              token: intent.token,
              recipient: intent.recipient,
              transaction: transaction.serialize().toString('base64'),
              signature: 'signature' // Would be actual signature in real implementation
            })
          }
        });
        
        if (paymentResponse.ok) {
          return {
            transactionId: 'simulated-tx-id',
            status: 'confirmed',
            confirmations: 1
          };
        } else {
          throw new Error(`Payment failed with status: ${paymentResponse.status}`);
        }
      } else {
        throw new Error(`Unexpected response from recipient: ${x402Response.status}`);
      }
    }
  }
}

// ------------------
// src/agent-swarm/agents/discovery.ts - Discovery agent implementation
// ------------------
import { BaseAgent } from './base-agent';
import { EventBus } from '../messaging/event-bus';
import { DiscoveryAgentConfig, AgentMessage } from '../types';

export class DiscoveryAgent extends BaseAgent {
  private config: DiscoveryAgentConfig;
  private scanTimer: NodeJS.Timeout | null = null;
  
  constructor(eventBus: EventBus, config: DiscoveryAgentConfig) {
    super(eventBus, config.id || `discovery_${Date.now()}`, config.name || 'Discovery Agent');
    this.config = config;
    
    // Register message handlers
    this.registerMessageHandler('discovery.scan', this.handleScanRequest.bind(this));
  }
  
  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    await super.initialize();
    
    // Start regular scanning if interval is set
    if (this.config.scanInterval > 0) {
      this.scanTimer = setInterval(() => this.scanServices(), this.config.scanInterval);
    }
  }
  
  /**
   * Shutdown the agent
   */
  public async shutdown(): Promise<void> {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    
    await super.shutdown();
  }
  
  /**
   * Scan for available services
   */
  private async scanServices(): Promise<void> {
    console.log(`Agent ${this.name} scanning for services...`);
    
    const discoveries = [];
    
    // Scan configured API endpoints for x402 capabilities
    for (const endpoint of this.config.apiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'OPTIONS',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Check for x402 headers
        const supportsX402 = response.headers.has('X-PAYMENT-CAPABILITIES');
        
        if (supportsX402) {
          const capabilities = JSON.parse(response.headers.get('X-PAYMENT-CAPABILITIES') || '{}');
          
          discoveries.push({
            endpoint,
            supportsX402: true,
            capabilities
          });
        }
      } catch (error) {
        console.error(`Error scanning endpoint ${endpoint}:`, error);
      }
    }
    
    // Broadcast discoveries
    if (discoveries.length > 0) {
      await this.sendMessage(null, 'discovery.result', {
        discoveries,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Handle a scan request
   * @param message Scan request message
   */
  private async handleScanRequest(message: AgentMessage): Promise<void> {
    await this.scanServices();
  }
}

// ------------------
// src/agent-swarm/agents/policy.ts - Policy agent implementation
// ------------------
import { BaseAgent } from './base-agent';
import { EventBus } from '../messaging/event-bus';
import { PolicyAgentConfig, AgentMessage } from '../types';

export class PolicyAgent extends BaseAgent {
  private config: PolicyAgentConfig;
  private dailySpending: Map<string, number> = new Map();
  private lastResetDay: number = new Date().getDate();
  
  constructor(eventBus: EventBus, config: PolicyAgentConfig) {
    super(eventBus, config.id || `policy_${Date.now()}`, config.name || 'Policy Agent');
    this.config = config;
    
    // Register message handlers
    this.registerMessageHandler('policy.check', this.handlePolicyCheck.bind(this));
  }
  
  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    await super.initialize();
    
    // Reset daily spending counters if day has changed
    setInterval(() => this.checkDailyReset(), 60 * 60 * 1000); // Check every hour
  }
  
  /**
   * Check if daily spending should be reset
   */
  private checkDailyReset(): void {
    const currentDay = new Date().getDate();
    if (currentDay !== this.lastResetDay) {
      this.dailySpending.clear();
      this.lastResetDay = currentDay;
      console.log('Daily spending limits reset');
    }
  }
  
  /**
   * Handle a policy check request
   * @param message Policy check message
   */
  private async handlePolicyCheck(message: AgentMessage): Promise<void> {
    const { taskId, intent } = message.payload;
    
    console.log(`Checking policy for task ${taskId}: ${JSON.stringify(intent)}`);
    
    // Check token-specific spending limit
    const tokenLimit = this.config.spendingLimits[intent.token] || 0;
    if (tokenLimit > 0 && intent.amount > tokenLimit) {
      await this.sendMessage(message.sender, 'policy.decision', {
        taskId,
        approved: false,
        reason: `Amount exceeds token limit of ${tokenLimit} ${intent.token}`
      });
      return;
    }
    
    // Check daily spending limit
    const currentSpending = this.dailySpending.get(intent.token) || 0;
    if (currentSpending + intent.amount > this.config.dailyLimit) {
      await this.sendMessage(message.sender, 'policy.decision', {
        taskId,
        approved: false,
        reason: `Transaction would exceed daily limit of ${this.config.dailyLimit} ${intent.token}`
      });
      return;
    }
    
    // Update daily spending
    this.dailySpending.set(intent.token, currentSpending + intent.amount);
    
    // Approve the payment
    await this.sendMessage(message.sender, 'policy.decision', {
      taskId,
      approved: true
    });
  }
}

// ------------------
// src/agent-swarm/agents/accounting.ts - Accounting agent implementation
// ------------------
import { BaseAgent } from './base-agent';
import { EventBus } from '../messaging/event-bus';
import { AccountingAgentConfig, AgentMessage } from '../types';

export class AccountingAgent extends BaseAgent {
  private config: AccountingAgentConfig;
  private transactions: any[] = [];
  private reportTimer: NodeJS.Timeout | null = null;
  
  constructor(eventBus: EventBus, config: AccountingAgentConfig) {
    super(eventBus, config.id || `accounting_${Date.now()}`, config.name || 'Accounting Agent');
    this.config = config;
    
    // Register message handlers
    this.registerMessageHandler('accounting.record', this.handleRecordTransaction.bind(this));
    this.registerMessageHandler('accounting.query', this.handleQueryTransactions.bind(this));
  }
  
  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    await super.initialize();
    
    // Start regular reporting if interval is set
    if (this.config.reportingInterval > 0) {
      this.reportTimer = setInterval(() => this.generateReport(), this.config.reportingInterval);
    }
  }
  
  /**
   * Shutdown the agent
   */
  public async shutdown(): Promise<void> {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    
    await super.shutdown();
  }
  
  /**
   * Handle recording a transaction
   * @param message Record transaction message
   */
  private async handleRecordTransaction(message: AgentMessage): Promise<void> {
    const { taskId, intent, result } = message.payload;
    
    console.log(`Recording transaction for task ${taskId}`);
    
    // Record the transaction
    const transaction = {
      id: taskId,
      timestamp: Date.now(),
      intent,
      result,
      category: this.categorizeTransaction(intent)
    };
    
    this.transactions.push(transaction);
    
    // Acknowledge recording
    await this.sendMessage(message.sender, 'accounting.recorded', {
      taskId,
      recorded: true
    });
  }
  
  /**
   * Handle querying transactions
   * @param message Query transactions message
   */
  private async handleQueryTransactions(message: AgentMessage): Promise<void> {
    const { filters } = message.payload;
    
    console.log(`Querying transactions with filters: ${JSON.stringify(filters)}`);
    
    // Apply filters (simplified implementation)
    let filteredTransactions = this.transactions;
    
    if (filters) {
      if (filters.timeRange) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.timestamp >= filters.timeRange.start && tx.timestamp <= filters.timeRange.end
        );
      }
      
      if (filters.token) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.intent.token === filters.token
        );
      }
      
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.category === filters.category
        );
      }
      
      if (filters.success !== undefined) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.result.success === filters.success
        );
      }
    }
    
    // Send query results
    await this.sendMessage(message.sender, 'accounting.queryResult', {
      transactions: filteredTransactions,
      count: filteredTransactions.length,
      filters
    });
  }
  
  /**
   * Generate a transaction report
   */
  private async generateReport(): Promise<void> {
    console.log('Generating accounting report...');
    
    // Filter to recent transactions only
    const now = Date.now();
    const recentTransactions = this.transactions.filter(tx => 
      tx.timestamp > now - this.config.reportingInterval
    );
    
    // Group by token
    const tokenSummary = recentTransactions.reduce((summary: any, tx) => {
      const token = tx.intent.token;
      if (!summary[token]) {
        summary[token] = {
          count: 0,
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      
      summary[token].count++;
      summary[token].total += tx.intent.amount;
      
      if (tx.result.success) {
        summary[token].successful++;
      } else {
        summary[token].failed++;
      }
      
      return summary;
    }, {});
    
    // Group by category
    const categorySummary = recentTransactions.reduce((summary: any, tx) => {
      const category = tx.category;
      if (!summary[category]) {
        summary[category] = {
          count: 0,
          total: 0
        };
      }
      
      summary[category].count++;
      summary[category].total += tx.intent.amount;
      
      return summary;
    }, {});
    
    // Create report
    const report = {
      period: {
        start: now - this.config.reportingInterval,
        end: now
      },
      transactionCount: recentTransactions.length,
      tokenSummary,
      categorySummary
    };
    
    // Broadcast report
    await this.sendMessage(null, 'accounting.report', report);
  }
  
  /**
   * Categorize a transaction
   * @param intent Payment intent
   * @returns Category name
   */
  private categorizeTransaction(intent: any): string {
    const metadata = intent.metadata || {};
    
    if (metadata.category) {
      return metadata.category;
    }
    
    // Use description to guess category
    const description = intent.description || '';
    
    for (const category of this.config.categories) {
      if (description.toLowerCase().includes(category.toLowerCase())) {
        return category;
      }
    }
    
    return 'other';
  }
}

// ------------------
// src/agent-swarm/messaging/event-bus.ts - Event bus for agent communication
// ------------------
import { AgentMessage } from '../types';

export class EventBus {
  private messageHandlers: Map<string, (message: AgentMessage) => Promise<void>> = new Map();
  
  /**
   * Register an agent with the event bus
   * @param agent Agent to register
   */
  public register(agent: any): void {
    // This is a simple implementation - in a real system, agents might register specific message types
    // or have more complex registration logic
    console.log(`Agent ${agent.id} registered with event bus`);
  }
  
  /**
   * Register a message handler for a specific recipient
   * @param recipientId Recipient ID
   * @param handler Message handler function
   */
  public onMessage(recipientId: string, handler: (message: AgentMessage) => Promise<void>): void {
    this.messageHandlers.set(recipientId, handler);
  }
  
  /**
   * Publish a message to the event bus
   * @param message Message to publish
   */
  public async publish(message: AgentMessage): Promise<void> {
    console.log(`Publishing message: ${message.type} from ${message.sender} to ${message.recipient || 'broadcast'}`);
    
    if (message.recipient) {
      // Directed message
```
