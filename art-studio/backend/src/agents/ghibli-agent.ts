import dotenv from 'dotenv';
import fs from 'fs/promises';
import { RateLimiter } from 'limiter';
import OpenAI from 'openai';
import path from 'path';

import { Metaplex } from '@metaplex-foundation/js';
import {
  Connection,
  Keypair,
} from '@solana/web3.js';

dotenv.config();

interface GhibliTheme {
  theme: string;
  name: string;
  description: string;
}

interface MintResult {
  mintAddress: string;
  imageUrl: string;
  metadataUrl: string;
  transactionSignature: string;
}

export class GhibliNFTAgent {
  private connection: Connection;
  private metaplex: Metaplex;
  private openai: OpenAI;
  private wallet: Keypair;
  private imageLimiter: RateLimiter;
  private rpcLimiter: RateLimiter;

  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(process.env.HELIUS_RPC_URL || '');
    
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize rate limiters
    this.imageLimiter = new RateLimiter({
      tokensPerInterval: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '5'),
      interval: 'minute'
    });

    this.rpcLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'second'
    });

    // Initialize wallet
    this.initializeWallet();
  }

  private async initializeWallet() {
    try {
      if (process.env.WALLET_SECRET_KEY) {
        const secretKey = Uint8Array.from(JSON.parse(process.env.WALLET_SECRET_KEY));
        this.wallet = Keypair.fromSecretKey(secretKey);
      } else {
        const keyPath = path.join(process.cwd(), 'wallet-key.json');
        try {
          const keyData = await fs.readFile(keyPath, 'utf-8');
          const secretKey = Uint8Array.from(JSON.parse(keyData));
          this.wallet = Keypair.fromSecretKey(secretKey);
        } catch {
          // Generate new wallet if none exists
          this.wallet = Keypair.generate();
          await fs.writeFile(keyPath, JSON.stringify(Array.from(this.wallet.secretKey)));
          console.log('Generated new wallet and saved to wallet-key.json');
        }
      }

      // Initialize Metaplex with the wallet
      this.metaplex = Metaplex.make(this.connection).use({
        identity: this.wallet
      });

    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      throw error;
    }
  }

  async generateGhibliArt(theme: string): Promise<string> {
    await this.imageLimiter.removeTokens(1);

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a Studio Ghibli style illustration of ${theme}. The art should be in the distinctive Ghibli style with soft colors, detailed backgrounds, and whimsical elements.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      return response.data[0].url;
    } catch (error) {
      console.error('Failed to generate art:', error);
      throw error;
    }
  }

  async mintNFT(theme: GhibliTheme): Promise<MintResult> {
    try {
      // Generate the art
      const imageUrl = await this.generateGhibliArt(theme.theme);

      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload image to Arweave
      const { uri: imageUri } = await this.metaplex.nfts().uploadMetadata({
        name: theme.name,
        description: theme.description,
        image: Buffer.from(imageBuffer),
        properties: {
          category: 'image',
          files: [{
            uri: imageUrl,
            type: 'image/png'
          }]
        }
      });

      // Create NFT
      const { nft } = await this.metaplex.nfts().create({
        uri: imageUri,
        name: theme.name,
        sellerFeeBasisPoints: parseInt(process.env.NFT_SELLER_FEE_BASIS_POINTS || '500'),
        symbol: process.env.NFT_SYMBOL || 'GHIBLI',
        isMutable: true,
        updateAuthority: this.wallet.publicKey,
        mintAuthority: this.wallet.publicKey,
        tokenStandard: 0, // NonFungible
      });

      return {
        mintAddress: nft.address.toString(),
        imageUrl,
        metadataUrl: imageUri,
        transactionSignature: nft.mintAddress.toString()
      };

    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  async mintFromThemes(themes: GhibliTheme[]): Promise<MintResult[]> {
    const results: MintResult[] = [];

    for (const theme of themes) {
      try {
        const result = await this.mintNFT(theme);
        results.push(result);
        console.log(`Successfully minted NFT for theme: ${theme.name}`);
      } catch (error) {
        console.error(`Failed to mint NFT for theme ${theme.name}:`, error);
      }
    }

    return results;
  }

  async getWalletBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }
}

// Example usage
async function main() {
  const agent = new GhibliNFTAgent();
  
  const themes: GhibliTheme[] = [
    {
      theme: "A floating castle in the sky with airships",
      name: "Castle in the Sky",
      description: "A majestic floating castle inspired by Laputa, surrounded by clouds and visiting airships."
    },
    {
      theme: "A giant forest spirit walking through ancient trees",
      name: "Forest Spirit",
      description: "A towering forest spirit brings life to an ancient forest filled with mystical creatures."
    }
  ];

  try {
    const results = await agent.mintFromThemes(themes);
    console.log('Minting results:', results);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 