# X402 Solana Phantom Terminal - Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [X402 Payment Protocol](#x402-payment-protocol)
4. [Autonomous Trading](#autonomous-trading)
5. [Autonomous Shopping](#autonomous-shopping)
6. [Security Features](#security-features)
7. [Token Management](#token-management)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [Safety Guidelines](#safety-guidelines)

---

## Getting Started

### System Requirements
- **Wallet**: Phantom, Solflare, or Backpack wallet
- **Network**: Solana mainnet connection
- **Browser**: Chrome, Firefox, or Brave (latest version)
- **Minimum Balance**: 0.05 SOL for transaction fees

### Initial Setup

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the top right
   - Select your wallet provider
   - Approve the connection request

2. **Configure API Keys**
   - Navigate to Settings → API Configuration
   - Add required API keys:
     - Helius RPC URL (required)
     - OpenAI API Key (for AI features)
     - Bags API Key (for token launching)
     - BirdEye API Key (for market data)

3. **Set Spending Limits**
   - Go to Settings → Risk Management
   - Configure:
     - Max per transaction: Default 1.0 SOL
     - Daily limit: Default 10.0 SOL
     - Auto-approval threshold: Default 0.5 SOL

---

## Core Features

### Chat Interface

The terminal provides an AI-powered chat interface with multiple capabilities:

**Available Commands:**
- `/swap` - Open token swap interface
- `/portfolio` - View your token holdings
- `/help` - Show all available commands
- `/gpt4o` - Switch to GPT-4o model
- `/gpt4o-mini` - Switch to GPT-4o Mini (faster)

**Natural Language Queries:**
```
"What's my SOL balance?"
"Show me top gainers today"
"Analyze token [address]"
"Launch a token called [name]"
```

### Model Selection

Choose between multiple AI models:
- **GPT-4o**: Most capable, best for complex analysis
- **GPT-4o Mini**: Fast and efficient for daily use
- **O1 Models**: Advanced reasoning for deep analysis
- **Gemini**: Google's multimodal capabilities

---

## X402 Payment Protocol

### What is X402?

X402 leverages HTTP 402 "Payment Required" status code to enable:
- Instant payments embedded in web requests
- Sub-$0.00001 microtransactions
- ~400ms settlement on Solana
- Automatic payment verification

### How It Works

```
1. API Request → HTTP 402 Response
2. Agent Detects Payment Requirement
3. Evaluates Against Policy Limits
4. Executes SPL Token Transaction
5. Retries Request with Payment Proof
6. Resource Delivered
```

### X402 Token Tiers

Your X402 token balance determines API access:

| Tier | Balance | Monthly API Calls |
|------|---------|-------------------|
| Diamond 💎 | 100,000+ | Unlimited |
| Platinum 🏆 | 50,000+ | 10,000 |
| Gold 🥇 | 10,000+ | 5,000 |
| Silver 🥈 | 1,000+ | 1,000 |
| Bronze 🥉 | 1+ | 100 |

---

## Autonomous Trading

### Investment Council

The agent uses 4 legendary investor AI agents:

**Warren Buffett Agent (30% weight)**
- Focus: Value investing, economic moats
- Timeframe: Long-term (5+ years)
- Risk Profile: Conservative

**Peter Lynch Agent (25% weight)**
- Focus: Growth investing, "tenbaggers"
- Timeframe: Medium-term (1-3 years)
- Risk Profile: Moderate-aggressive

**Stanley Druckenmiller Agent (30% weight)**
- Focus: Macro trading, regime changes
- Timeframe: Short-term (weeks-months)
- Risk Profile: Aggressive

**Charlie Munger Agent (15% weight)**
- Focus: Risk assessment, margin of safety
- Timeframe: Long-term perspective
- Risk Profile: Risk-averse

### Trading Process

1. **Market Analysis**
   ```
   Agent → "Analyze token [address]"
   ```
   The system:
   - Runs security scans (OpSec, Rug Detection, Risk)
   - Consults all 4 investment council agents
   - Calculates weighted consensus score
   - Applies Kelly Criterion for position sizing

2. **Trade Execution**
   - Automatic execution if confidence > 70%
   - User approval required if confidence < 70%
   - Stop-loss set at -15%
   - Take-profit set at +30%

3. **Position Monitoring**
   - Real-time price tracking
   - Automatic stop-loss/take-profit execution
   - Portfolio rebalancing suggestions

### Risk Management

**Kelly Criterion Position Sizing:**
```
Position Size = (Probability × Payoff - (1 - Probability)) / Payoff × 25%
```

**Maximum Positions:**
- High risk tokens: 1% of portfolio
- Medium risk: 3% of portfolio
- Low risk: 5% of portfolio
- Very low risk: 8% of portfolio

---

## Autonomous Shopping

### How It Works

The shopping agent can:
- Search multiple merchants automatically
- Compare prices and quality ratings
- Verify merchant reputation
- Execute purchases with X402 tokens
- Track order fulfillment

### Shopping Process

1. **Product Search**
   ```
   Agent → "Find wireless headphones under $50"
   ```

2. **Scoring System**
   - 40% Price optimization
   - 30% Quality/ratings
   - 30% Merchant trust score

3. **Auto-Purchase**
   - Automatic for orders under $100
   - Requires approval for orders over $100
   - Payment via X402 tokens
   - Confirmation sent to your wallet

### Supported Platforms

- **Shopify**: Via Solana Pay integration
- **Custom X402 Merchants**: Direct payment protocol
- **Coming Soon**: Amazon, eBay integration

---

## Security Features

### Three-Layer Security System

**1. OpSec Agent**
- Checks if LP tokens are burned
- Verifies mint authority is revoked
- Analyzes holder distribution
- Confirms team verification
- Reviews contract audits

**2. Rug Pull Detector**
- Monitors suspicious transfers
- Detects liquidity drops
- Identifies social bot activity
- Tracks developer selling patterns

**3. Risk Analyzer**
- Calculates volatility metrics
- Assesses liquidity depth
- Analyzes holder concentration
- Evaluates trading volume patterns

### Security Scores

Tokens receive composite security scores (0-100):
- **80-100**: ✅ Security cleared
- **60-79**: ⚡ Proceed with caution
- **40-59**: ⚠️ Extreme caution
- **20-39**: ⛔ Do not trade
- **0-19**: 🚫 Blacklisted automatically

---

## Token Management

### Launching Tokens (Bags.fm Integration)

**Basic Token Launch:**
```
Agent → "Launch a token called 'Moon Cat' (MCAT)"
```

The agent will:
1. Create token metadata
2. Upload image to IPFS
3. Configure initial parameters
4. Execute launch transaction
5. Provide Bags.fm link

**Advanced Launch with Fee Sharing:**
```json
{
  "name": "Moon Cat",
  "symbol": "MCAT",
  "feeClaimerTwitterHandle": "influencer_name",
  "creatorFeeBps": 1000,    // 10%
  "feeClaimerFeeBps": 9000  // 90%
}
```

### Meteora Pool Creation

**Supported Pool Types:**

1. **DLMM (Dynamic Liquidity Market Maker)**
   - Concentrated liquidity
   - Custom price ranges
   - Dynamic fees

2. **DAMM (Dynamic AMM)**
   - Balanced or one-sided liquidity
   - Standard AMM mechanics
   - Lower gas costs

3. **DBC (Dynamic Bonding Curve)**
   - Fair launch mechanism
   - Progressive price discovery
   - Graduated liquidity

### Token Vesting (Streamflow Integration)

**Create Vesting Schedule:**
```
Agent → "Lock 50% of tokens for 12 months with 3-month cliff"
```

**Vesting Types:**
- Linear: Gradual unlock over time
- Cliff: All tokens unlock at specific date
- Monthly: Unlock in monthly batches

---

## Advanced Features

### Futarchy Governance

Decision-making through prediction markets:

1. **Create Proposal**
   ```
   "Propose: Increase max position size to 8%"
   ```

2. **Market Creation**
   - "AUM if adopted" market
   - "AUM if rejected" market

3. **Resolution**
   - Execute if EV(adopt) > EV(reject)
   - Automatic implementation
   - Community participation rewarded

### A2A Protocol (Agent-to-Agent)

Enables agents to:
- Discover payment-enabled services
- Share market intelligence
- Coordinate complex transactions
- Pool resources for better pricing

### Browser Automation

The agent can:
- Navigate DApp interfaces
- Connect wallets automatically
- Fill transaction forms
- Verify on-screen content with vision AI
- Extract confirmation details

---

## Troubleshooting

### Common Issues

**"Transaction Failed"**
- Check SOL balance for fees
- Verify network connection
- Try increasing slippage tolerance
- Check if RPC endpoint is operational

**"API Key Not Found"**
- Go to Settings → API Configuration
- Verify all required keys are entered
- Check key permissions and quotas
- Restart application after adding keys

**"Security Score Too Low"**
- Token flagged as high risk
- Review security report details
- Consider alternative tokens
- Do not override security warnings

**"Insufficient Funds"**
- Add SOL to your wallet
- Reduce transaction amount
- Check token balance accuracy
- Verify fee estimates

### Getting Help

1. Check console logs (F12 in browser)
2. Review transaction history
3. Consult documentation hub
4. Contact support with:
   - Transaction signature
   - Error message
   - Wallet address
   - Action attempted

---

## Safety Guidelines

### Critical Warnings

⚠️ **Investment Risk**: Cryptocurrency trading involves substantial risk of loss. Never invest more than you can afford to lose.

⚠️ **Smart Contract Risk**: Even audited contracts can have vulnerabilities. The agent cannot guarantee complete security.

⚠️ **Market Volatility**: Crypto markets are highly volatile. Prices can change dramatically in minutes.

⚠️ **No Financial Advice**: The agent provides analysis, not financial advice. Always do your own research (DYOR).

### Best Practices

1. **Start Small**
   - Test with minimal amounts first
   - Gradually increase as you gain confidence
   - Never invest emergency funds

2. **Verify Everything**
   - Check token contract addresses
   - Verify transaction details before approval
   - Review security scores carefully
   - Confirm recipient addresses

3. **Set Limits**
   - Use conservative spending limits initially
   - Enable two-factor approval for large transactions
   - Review daily/weekly spending regularly
   - Adjust limits based on experience

4. **Stay Informed**
   - Follow security alerts
   - Read transaction summaries
   - Understand fee structures
   - Monitor portfolio regularly

5. **Secure Your Wallet**
   - Use hardware wallet when possible
   - Never share private keys
   - Keep seed phrases offline
   - Use strong unique passwords

### Red Flags

Stop and reassess if you see:
- Pressure to act immediately
- "Too good to be true" returns
- Unverified team or project
- Extremely low liquidity
- High concentration of holders
- Suspicious social media activity
- Multiple security warnings

---

## Version Information

- **Current Version**: v2.0
- **Last Updated**: 2025-10-06
- **Supported Chains**: Solana (primary), Base, Bitcoin
- **Protocol**: HTTP 402 Payment Required (X402 Standard)

## Additional Resources

- [X402 Protocol Documentation](https://docs.x402.io)
- [Solana Developer Docs](https://docs.solana.com)
- [Bags.fm API Reference](https://docs.bags.fm)
- [Meteora Documentation](https://docs.meteora.ag)
- [Community Discord](https://discord.gg/x402)

---

**Remember**: The agent is a tool for empowerment, not speculation. Use responsibly, trade carefully, and prioritize your financial security above all else.