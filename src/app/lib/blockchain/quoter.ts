// app/lib/blockchain/quoter.ts
import { ethers } from 'ethers';
import { getProvider } from './provider';

// Constants
const UNISWAP_V3_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'; // Mainnet address
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // Mainnet WETH

// ABIs
const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

export class QuoterService {
  private quoter: ethers.Contract;
  
  constructor(private provider = getProvider()) {
    this.quoter = new ethers.Contract(
      UNISWAP_V3_QUOTER_ADDRESS,
      QUOTER_ABI,
      this.provider
    );
    
    console.log('QuoterService initialized');
  }
  
  /**
   * Get a quote for swapping an exact amount of input token for output token
   * @param tokenIn Input token address
   * @param tokenOut Output token address
   * @param fee Pool fee (500, 3000, or 10000)
   * @param amountIn Amount of input token (as a string, e.g. "1.0")
   * @param decimalsIn Decimals of the input token
   * @returns Expected output amount as a string
   */
  async quoteExactInputSingle(
    tokenIn: string,
    tokenOut: string,
    fee: number,
    amountIn: string,
    decimalsIn: number
  ): Promise<string> {
    try {
      // Convert the input amount to the proper format based on token decimals
      const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
      
      // Call the quoter contract
      // Note: Even though the function is marked as "returns" in Solidity,
      // we can call it as a view function in ethers.js
      const amountOut = await this.quoter.quoteExactInputSingle.staticCall(
        tokenIn,
        tokenOut,
        fee,
        amountInWei,
        0 // No price limit
      );
      
      // Get the output token's decimals to format the result
      const tokenContract = new ethers.Contract(
        tokenOut,
        ['function decimals() view returns (uint8)'],
        this.provider
      );
      const decimalsOut = await tokenContract.decimals();
      
      // Format the output amount based on token decimals
      const formattedAmountOut = ethers.formatUnits(amountOut, decimalsOut);
      
      console.log(`Quote: ${amountIn} of token ${tokenIn} → ${formattedAmountOut} of token ${tokenOut}`);
      
      return formattedAmountOut;
    } catch (error: any) {
      console.error(`Error getting quote: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a quote with fallback through WETH if direct quote fails
   * @param tokenIn Input token address
   * @param tokenOut Output token address
   * @param fee Pool fee (500, 3000, or 10000)
   * @param amountIn Amount of input token (as a string, e.g. "1.0")
   * @param decimalsIn Decimals of the input token
   * @returns Expected output amount as a string
   */
  async quoteExactInputSingleWithFallback(
    tokenIn: string,
    tokenOut: string,
    fee: number,
    amountIn: string,
    decimalsIn: number
  ): Promise<string> {
    try {
      // Try direct quote first
      return await this.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, decimalsIn);
    } catch (error: any) {
      console.warn(`Direct quote failed, trying fallback through WETH: ${error.message}`);
      
      // If direct quote fails, try routing through WETH
      try {
        // Get decimals for WETH (should be 18)
        const wethDecimals = 18;
        
        // First hop: tokenIn -> WETH
        const wethAmountOut = await this.quoteExactInputSingle(
          tokenIn, 
          WETH_ADDRESS, 
          3000, // Use 0.3% fee for WETH pairs
          amountIn,
          decimalsIn
        );
        
        // Second hop: WETH -> tokenOut
        return await this.quoteExactInputSingle(
          WETH_ADDRESS,
          tokenOut,
          3000, // Use 0.3% fee for WETH pairs
          wethAmountOut,
          wethDecimals
        );
      } catch (fallbackError: any) {
        console.error(`Fallback quote also failed: ${fallbackError.message}`);
        throw new Error(`Could not get quote for ${tokenIn} to ${tokenOut}: ${error.message}`);
      }
    }
  }
}