# X402 Solana Flow

```
sequenceDiagram
    autonumber
    participant Client
    participant ResourceServer as Resource Server
    participant Facilitator
    participant Blockchain as Solana Blockchain

    %% Step 1: Initial Request
    Client ->> ResourceServer: GET /resource
    ResourceServer -->> Client: 402 Payment Required + JSON {paymentRequirements}

    %% Step 2: Payment Payload Construction
    Note left of Client: Select payment method<br/>Create payment payload (X-PAYMENT header)

    %% Step 3: Send Payment Payload
    Client ->> ResourceServer: GET /resource + X-PAYMENT header (base64 encoded payload)

    %% Step 4: Verify Payment
    ResourceServer ->> Facilitator: POST /verify {x402Version, paymentHeader, paymentRequirements}
    Facilitator -->> ResourceServer: Verification response {isValid: true/false, invalidReason}

    %% Step 5: Conditional Resource Fulfillment
    alt Payment Valid
        ResourceServer ->> ResourceServer: Fulfill resource request (internal work)
        
        %% Step 6: Settle Payment on Blockchain
        ResourceServer ->> Facilitator: POST /settle {x402Version, paymentHeader, paymentRequirements}
        Facilitator ->> Blockchain: Submit transaction (e.g., USDC transfer via Helio/Solana Pay)
        Blockchain -->> Facilitator: Transaction confirmed (txHash, confirmed status)
        Facilitator -->> ResourceServer: Payment Execution Response {success:true, txHash}
        
        %% Step 7: Return Successful Resource Response
        ResourceServer -->> Client: 200 OK + Resource data + X-PAYMENT-RESPONSE header (tx details encoded)
    else Payment Invalid
        ResourceServer -->> Client: 402 Payment Required + JSON {error: invalidReason}
    end

    %% Optional Step 8: Blockchain Confirmation async webhook
    Facilitator ->> ResourceServer: Async webhook (payment settled confirmation)

    Note over Facilitator,Blockchain: Facilitator handles settlement independently,<br/> abstracting gas and RPC complexity.

    Note right of ResourceServer: Optional async webhook<br/>improves responsiveness.

    Note over Client,ResourceServer: X402 fully HTTP-native,<br/> seamless, trust-minimized payments.

```
