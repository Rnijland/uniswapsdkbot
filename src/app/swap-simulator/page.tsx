'use client';

import { useState } from 'react';
import { COMMON_TOKENS, FEE_TIERS } from '@/app/lib/constants';

export default function SwapSimulatorPage() {
  // Form state
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [customTokenIn, setCustomTokenIn] = useState('');
  const [customTokenOut, setCustomTokenOut] = useState('');
  const [fee, setFee] = useState('3000'); // Default to 0.3%
  const [amountIn, setAmountIn] = useState('');
  
  // UI state
  const [isCustomTokenIn, setIsCustomTokenIn] = useState(false);
  const [isCustomTokenOut, setIsCustomTokenOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteResult, setQuoteResult] = useState<any>(null);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQuoteResult(null);
    
    // Get actual token addresses
    const actualTokenIn = isCustomTokenIn ? customTokenIn : tokenIn;
    const actualTokenOut = isCustomTokenOut ? customTokenOut : tokenOut;
    
    // Validate inputs
    if (!actualTokenIn || !actualTokenOut || !fee || !amountIn) {
      setError('All fields are required');
      return;
    }
    
    // Validate addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(actualTokenIn) || !addressRegex.test(actualTokenOut)) {
      setError('Invalid token address format');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenIn: actualTokenIn,
          tokenOut: actualTokenOut,
          fee,
          amountIn,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuoteResult(data);
      } else {
        setError(data.error || 'Failed to get quote');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get token symbol
  const getTokenSymbol = (address: string) => {
    for (const [symbol, token] of Object.entries(COMMON_TOKENS)) {
      if (token.address.toLowerCase() === address.toLowerCase()) {
        return symbol;
      }
    }
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  // Format USD value
  const formatUSD = (value: number) => {
    if (value < 0.01 && value > 0) {
      return '< $0.01';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
          <h1 className="text-2xl font-bold mb-6">Swap Simulator</h1>
          
          <form onSubmit={handleSubmit}>
            {/* Token In */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">From Token</label>
              {isCustomTokenIn ? (
                <div className="mb-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Token Address (0x...)"
                    value={customTokenIn}
                    onChange={(e) => setCustomTokenIn(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="mb-2">
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={tokenIn}
                    onChange={(e) => setTokenIn(e.target.value)}
                    required
                  >
                    <option value="">Select a token</option>
                    {Object.entries(COMMON_TOKENS).map(([symbol, token]) => (
                      <option key={`in-${token.address}`} value={token.address}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={() => {
                    setIsCustomTokenIn(!isCustomTokenIn);
                    if (isCustomTokenIn) {
                      setCustomTokenIn('');
                    } else {
                      setTokenIn('');
                    }
                  }}
                >
                  {isCustomTokenIn ? 'Use Common Token' : 'Use Custom Token'}
                </button>
              </div>
            </div>
            
            {/* Token Out */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">To Token</label>
              {isCustomTokenOut ? (
                <div className="mb-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Token Address (0x...)"
                    value={customTokenOut}
                    onChange={(e) => setCustomTokenOut(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="mb-2">
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={tokenOut}
                    onChange={(e) => setTokenOut(e.target.value)}
                    required
                  >
                    <option value="">Select a token</option>
                    {Object.entries(COMMON_TOKENS).map(([symbol, token]) => (
                      <option key={`out-${token.address}`} value={token.address}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={() => {
                    setIsCustomTokenOut(!isCustomTokenOut);
                    if (isCustomTokenOut) {
                      setCustomTokenOut('');
                    } else {
                      setTokenOut('');
                    }
                  }}
                >
                  {isCustomTokenOut ? 'Use Common Token' : 'Use Custom Token'}
                </button>
              </div>
            </div>
            
            {/* Fee Tier */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Fee Tier</label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
              >
                {FEE_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Amount */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Amount</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.0"
                step="0.000001"
                min="0.000001"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                required
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Getting Quote...' : 'Get Quote'}
            </button>
          </form>
        </div>
        
        {/* Right side - Results */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Quote Result</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              
              <div className="mt-2">
                <p className="font-bold text-sm">Suggestions:</p>
                <ul className="list-disc ml-5 text-sm">
                  <li>Try a different fee tier</li>
                  <li>Verify the token addresses are correct</li>
                  <li>The pool might have insufficient liquidity</li>
                </ul>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="py-10 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-2">Getting quote...</p>
            </div>
          )}
          
          {!loading && !error && !quoteResult && (
            <div className="bg-gray-50 rounded-lg p-10 text-center">
              <p className="text-lg text-gray-500">
                Fill out the form to get a swap quote
              </p>
            </div>
          )}
          
          {quoteResult && (
            <div>
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">You pay</p>
                    <p className="text-xl">
                      {quoteResult.amountIn} {getTokenSymbol(quoteResult.tokenIn)}
                    </p>
                    {quoteResult.amountInUsd && (
                      <p className="text-sm">
                        ≈ {formatUSD(quoteResult.amountInUsd)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">You receive</p>
                    <p className="text-xl">
                      {parseFloat(quoteResult.amountOut).toFixed(6)} {getTokenSymbol(quoteResult.tokenOut)}
                    </p>
                    {quoteResult.amountOutUsd && (
                      <p className="text-sm">
                        ≈ {formatUSD(quoteResult.amountOutUsd)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-300">
                  <p className="font-bold">Exchange Rate</p>
                  <p>
                    1 {getTokenSymbol(quoteResult.tokenIn)} = {' '}
                    {(parseFloat(quoteResult.amountOut) / parseFloat(quoteResult.amountIn)).toFixed(6)}{' '}
                    {getTokenSymbol(quoteResult.tokenOut)}
                  </p>
                </div>
                
                {quoteResult.tokenInUsdPrice && quoteResult.tokenOutUsdPrice && (
                  <div className="mt-4 pt-4 border-t border-green-300 bg-green-50 p-3 rounded">
                    <p className="font-bold mb-2">Token Prices</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm">
                          1 {getTokenSymbol(quoteResult.tokenIn)} = {formatUSD(quoteResult.tokenInUsdPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          1 {getTokenSymbol(quoteResult.tokenOut)} = {formatUSD(quoteResult.tokenOutUsdPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-100 rounded p-4 text-sm">
                <p>
                  <span className="font-bold">Note:</span> This is a simulated swap. No actual transaction will be executed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}