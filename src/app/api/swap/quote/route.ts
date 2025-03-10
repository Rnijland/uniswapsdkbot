// app/api/swap/quote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { QuoterService } from '@/app/lib/blockchain/quoter';
import { getProvider } from '@/app/lib/blockchain/provider';
import { COMMON_TOKENS } from '@/app/lib/constants';

// USDC address for USD price calculations
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_DECIMALS = 6;

/**
 * Helper function to ensure all BigInt values are converted to strings
 */
function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJson);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = sanitizeForJson(obj[key]);
    }
    return result;
  }

  return obj;
}

/**
 * Get the USD price of a token using USDC pairs
 * @param tokenAddress The token address to get the price for
 * @param decimals The token's decimals
 * @returns The USD price per token
 */
async function getTokenUsdPrice(tokenAddress: string, decimals: number): Promise<number> {
  try {
    // If the token is USDC, return 1
    if (tokenAddress.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
      return 1.0;
    }
    
    // Use the quoter service to get the price in USDC
    const quoterService = new QuoterService();
    
    // Get how much USDC you get for 1 token
    const oneToken = '1';
    const usdcAmount = await quoterService.quoteExactInputSingleWithFallback(
      tokenAddress,
      USDC_ADDRESS,
      3000, // 0.3% fee tier
      oneToken,
      decimals
    );
    
    // Parse the USDC amount to a number
    return parseFloat(usdcAmount);
  } catch (error: any) {
    console.error(`Error getting USD price for token ${tokenAddress}: ${error.message}`);
    return 0; // Return 0 if we can't get the price
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenIn, tokenOut, fee, amountIn } = body;
    
    if (!tokenIn || !tokenOut || !fee || !amountIn) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get token decimals (either from our list or fetch from contract)
    let decimalsIn = 18; // Default to 18
    
    // Check if it's a common token
    const tokenInInfo = Object.values(COMMON_TOKENS).find(
      token => token.address.toLowerCase() === tokenIn.toLowerCase()
    );
    
    if (tokenInInfo) {
      decimalsIn = tokenInInfo.decimals;
    } else {
      // Fetch decimals from contract
      try {
        const tokenContract = new ethers.Contract(
          tokenIn,
          ['function decimals() view returns (uint8)'],
          getProvider()
        );
        const decimalsResult = await tokenContract.decimals();
        decimalsIn = Number(decimalsResult);
      } catch (error) {
        console.error(`Error fetching token decimals: ${error}`);
        // Keep default of 18 if we can't fetch
      }
    }
    
    // Initialize quoter service
    const quoterService = new QuoterService();
    
    // Get quote
    let amountOut;
    try {
      amountOut = await quoterService.quoteExactInputSingleWithFallback(
        tokenIn,
        tokenOut,
        parseInt(fee),
        amountIn,
        decimalsIn
      );
    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to get quote: ${error.message}`,
          details: error.stack
        },
        { status: 400 }
      );
    }
    
    // Get USD prices for tokens
    const amountInNumber = parseFloat(amountIn);
    const amountOutNumber = parseFloat(amountOut);
    
    // Get USD price for input token
    const tokenInUsdPrice = await getTokenUsdPrice(tokenIn, decimalsIn);
    const amountInUsd = amountInNumber * tokenInUsdPrice;
    
    // Get USD price for output token
    let tokenOutDecimals = 18; // Default
    try {
      // Try to get decimals from contract
      const tokenContract = new ethers.Contract(
        tokenOut,
        ['function decimals() view returns (uint8)'],
        getProvider()
      );
      const decimalsResult = await tokenContract.decimals();
      tokenOutDecimals = Number(decimalsResult);
    } catch (error) {
      // If we can't get decimals, check if it's a common token
      const tokenOutInfo = Object.values(COMMON_TOKENS).find(
        token => token.address.toLowerCase() === tokenOut.toLowerCase()
      );
      if (tokenOutInfo) {
        tokenOutDecimals = tokenOutInfo.decimals;
      }
      // Otherwise use default of 18
    }
    
    const tokenOutUsdPrice = await getTokenUsdPrice(tokenOut, tokenOutDecimals);
    const amountOutUsd = amountOutNumber * tokenOutUsdPrice;
    
    // Prepare response data, ensuring no BigInt values
    const responseData = sanitizeForJson({
      success: true,
      amountIn,
      amountOut,
      amountInUsd,
      amountOutUsd,
      tokenInUsdPrice,
      tokenOutUsdPrice,
      tokenIn,
      tokenOut,
      fee,
      decimalsIn,
      decimalsOut: tokenOutDecimals
    });
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Swap quote error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Unknown error occurred",
        stack: error.stack ? error.stack.toString() : undefined
      },
      { status: 500 }
    );
  }
}