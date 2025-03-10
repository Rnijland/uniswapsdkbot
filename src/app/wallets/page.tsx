'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the Wallet type
type Wallet = {
  name: string;
  address: string;
  createdAt: string;
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const router = useRouter();

  // Fetch wallets on component mount
  useEffect(() => {
    fetchWallets();
  }, []);

  // Function to fetch wallets from API
  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallets');
      const data = await response.json();
      
      if (data.success) {
        setWallets(data.wallets);
      } else {
        setError(data.error || 'Failed to fetch wallets');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new wallet
  const createWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWalletName.trim()) {
      return;
    }
    
    try {
      setCreating(true);
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newWalletName }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCreateModalOpen(false);
        setNewWalletName('');
        // Redirect to wallet details page
        router.push(`/wallets/${newWalletName}`);
      } else {
        setError(data.error || 'Failed to create wallet');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Function to delete a wallet
  const deleteWallet = async (name: string) => {
    if (!confirm(`Are you sure you want to delete wallet "${name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/wallets/${name}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchWallets(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete wallet');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Wallets</h1>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
          onClick={() => setCreateModalOpen(true)}
        >
          Create New Wallet
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2">Loading wallets...</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center">
          <p className="text-lg mb-4">No wallets found</p>
          <p className="mb-4">Create your first wallet to get started.</p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => setCreateModalOpen(true)}
          >
            Create Wallet
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wallets.map((wallet) => (
                <tr key={wallet.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{wallet.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono break-all">{wallet.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(wallet.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/wallets/${wallet.name}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </a>
                    <button
                      onClick={() => deleteWallet(wallet.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Wallet Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Wallet</h2>
            <form onSubmit={createWallet}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wallet-name">
                  Wallet Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="wallet-name"
                  type="text"
                  placeholder="My Wallet"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}