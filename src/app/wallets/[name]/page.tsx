'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define Wallet type
type WalletDetails = {
  name: string;
  address: string;
  balance: string;
  privateKey?: string;
  mnemonic?: string;
  createdAt?: string;
};

// Create a client component wrapper that accepts a prop
export default function WalletDetailsPage({ params }: { params: { name: string } }) {
  // Get wallet name from the URL
  const walletName = params.name;

  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const router = useRouter();

  // Fetch wallet details on component mount
  useEffect(() => {
    if (walletName) {
      fetchWalletDetails(walletName);
    }
  }, [walletName]);

  // Function to fetch wallet details from API
  const fetchWalletDetails = async (name: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wallets/${name}`);
      const data = await response.json();
      
      if (data.success) {
        setWallet(data.wallet);
      } else {
        setError(data.error || 'Failed to fetch wallet details');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete wallet
  const deleteWallet = async () => {
    if (!walletName || !confirm(`Are you sure you want to delete wallet "${walletName}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/wallets/${walletName}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/wallets');
      } else {
        setError(data.error || 'Failed to delete wallet');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2">Loading wallet details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <a href="/wallets" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Wallets
        </a>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Wallet not found
        </div>
        <a href="/wallets" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Wallets
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Wallet: {walletName}</h1>
        <div className="flex space-x-2">
          <button
            onClick={deleteWallet}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Delete Wallet
          </button>
          <a
            href="/wallets"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Back to Wallets
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Address</h2>
          <p className="font-mono break-all bg-white p-3 rounded border border-gray-200">
            {wallet.address}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Balance</h2>
          <p className="font-mono text-xl bg-white p-3 rounded border border-gray-200">
            {wallet.balance} ETH
          </p>
        </div>
      </div>

      {wallet.privateKey && (
        <div className="mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Private Key</h2>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-1 px-2 rounded"
              >
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {showPrivateKey ? (
              <p className="font-mono break-all bg-white p-3 rounded border border-gray-200">
                {wallet.privateKey}
              </p>
            ) : (
              <p className="bg-white p-3 rounded border border-gray-200">
                ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
              </p>
            )}
            <p className="mt-2 text-sm text-red-600">
              <strong>Important:</strong> Never share your private key with anyone!
            </p>
          </div>
        </div>
      )}

      {wallet.mnemonic && (
        <div className="mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Mnemonic Phrase</h2>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-1 px-2 rounded"
              >
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {showPrivateKey ? (
              <p className="font-mono bg-white p-3 rounded border border-gray-200">
                {wallet.mnemonic}
              </p>
            ) : (
              <p className="bg-white p-3 rounded border border-gray-200">
                •••••• •••••• •••••• •••••• •••••• •••••• •••••• •••••• •••••• •••••• •••••• ••••••
              </p>
            )}
            <p className="mt-2 text-sm text-red-600">
              <strong>Important:</strong> Store this phrase securely! Anyone with this phrase can access your wallet.
            </p>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">What's Next?</h2>
        <p className="mb-4">
          You can use this wallet to simulate swaps on Uniswap or view token balances.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/swap-simulator"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
          >
            Simulate Swaps
          </a>
        </div>
      </div>
    </div>
  );
}