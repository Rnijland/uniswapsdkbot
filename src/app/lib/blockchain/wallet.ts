// app/lib/blockchain/wallet.ts
import { ethers } from 'ethers';
import { getProvider } from './provider';
import { loadWalletsData, saveWalletsData } from '../fs-adapter';

// Ensure wallet directory exists
export const initializeWalletStorage = () => {
  try {
    // The adapter will handle directory creation
    return true;
  } catch (error) {
    console.error('Error initializing wallet storage:', error);
    return false;
  }
};

// Load existing wallets
export const loadWallets = (): Record<string, any> => {
  return loadWalletsData();
};

// Save wallets to file
export const saveWallets = (wallets: Record<string, any>): void => {
  saveWalletsData(wallets);
};

// Create a new wallet
export const createWallet = (name: string): {
  address: string;
  privateKey: string;
  mnemonic: string;
} => {
  // Create a random wallet with mnemonic
  const wallet = ethers.Wallet.createRandom();
  
  // Extract wallet data
  const walletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase || "No mnemonic available"
  };
  
  // Save wallet data
  const wallets = loadWallets();
  wallets[name] = {
    ...walletData,
    createdAt: new Date().toISOString()
  };
  saveWallets(wallets);
  
  console.log(`Created new wallet "${name}" with address ${wallet.address}`);
  
  return walletData;
};

// Get a wallet by name
export const getWallet = (name: string): ethers.Wallet | null => {
  try {
    const wallets = loadWallets();
    const walletData = wallets[name];
    
    if (!walletData) {
      console.error(`Wallet "${name}" not found`);
      return null;
    }
    
    // Create a wallet instance from the private key
    const wallet = new ethers.Wallet(walletData.privateKey, getProvider());
    return wallet;
  } catch (error) {
    console.error(`Error getting wallet:`, error);
    return null;
  }
};

// List all available wallets
export const listWallets = (): Array<{ name: string; address: string; createdAt: string }> => {
  try {
    const wallets = loadWallets();
    return Object.entries(wallets).map(([name, data]: [string, any]) => ({
      name,
      address: data.address,
      createdAt: data.createdAt || 'Unknown'
    }));
  } catch (error) {
    console.error(`Error listing wallets:`, error);
    return [];
  }
};

// Delete a wallet
export const deleteWallet = (name: string): boolean => {
  try {
    const wallets = loadWallets();
    
    if (!wallets[name]) {
      console.error(`Wallet "${name}" not found`);
      return false;
    }
    
    delete wallets[name];
    saveWallets(wallets);
    
    console.log(`Deleted wallet "${name}"`);
    return true;
  } catch (error) {
    console.error(`Error deleting wallet:`, error);
    return false;
  }
};