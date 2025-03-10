// app/lib/constants.ts

// Common tokens on Ethereum mainnet with their addresses and decimals
export const COMMON_TOKENS: Record<string, { address: string; decimals: number }> = {
    'WETH': {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    'USDC': {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6
    },
    'USDT': {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6
    },
    'DAI': {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18
    },
    'WBTC': {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8
    },
    'UNI': {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18
    },
    'LINK': {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18
    },
    'AAVE': {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      decimals: 18
    }
  };
  
  // Fee tiers for Uniswap V3
  export const FEE_TIERS = [
    { value: "500", label: "0.05%" },
    { value: "3000", label: "0.3%" },
    { value: "10000", label: "1%" }
  ];