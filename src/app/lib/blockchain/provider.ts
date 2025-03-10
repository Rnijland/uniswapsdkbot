// app/lib/blockchain/provider.ts
import { ethers } from 'ethers';

// Environment variables
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'mainnet';

// Create JSON-RPC provider
export const createJsonRpcProvider = (): ethers.JsonRpcProvider => {
  if (!INFURA_API_KEY) {
    throw new Error('INFURA_API_KEY is not defined in environment variables');
  }

  const url = `https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_API_KEY}`;
  const provider = new ethers.JsonRpcProvider(url);
  
  console.log(`JSON-RPC provider initialized for ${ETHEREUM_NETWORK}`);
  return provider;
};

// Default provider for general use (lazy loaded to avoid server/client mismatch)
let provider: ethers.JsonRpcProvider | null = null;

export const getProvider = () => {
  if (!provider) {
    provider = createJsonRpcProvider();
  }
  return provider;
};