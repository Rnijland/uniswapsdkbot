// app/lib/fs-adapter.ts
import fs from 'fs';
import path from 'path';

// Define paths relative to the project root
const PROJECT_ROOT = process.cwd();
const WALLETS_DIR = path.join(PROJECT_ROOT, 'wallets');
const WALLETS_FILE = path.join(WALLETS_DIR, 'wallets.json');

// In-memory fallback for environments that don't support file system operations
let inMemoryWallets: Record<string, any> = {};
let isUsingMemory = false;

/**
 * Create necessary directories for wallet storage
 */
export function ensureDirectories(): boolean {
  try {
    if (!fs.existsSync(WALLETS_DIR)) {
      fs.mkdirSync(WALLETS_DIR, { recursive: true });
    }
    return true;
  } catch (error) {
    console.warn('Warning: Using in-memory storage as file system operations failed', error);
    isUsingMemory = true;
    return false;
  }
}

/**
 * Load wallets data - falls back to memory if file system operations fail
 */
export function loadWalletsData(): Record<string, any> {
  try {
    ensureDirectories();
    
    if (isUsingMemory) {
      return { ...inMemoryWallets };
    }
    
    if (!fs.existsSync(WALLETS_FILE)) {
      fs.writeFileSync(WALLETS_FILE, '{}', 'utf8');
      return {};
    }
    
    const data = fs.readFileSync(WALLETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Warning: Using in-memory storage as file system operations failed', error);
    isUsingMemory = true;
    return { ...inMemoryWallets };
  }
}

/**
 * Save wallets data - falls back to memory if file system operations fail
 */
export function saveWalletsData(wallets: Record<string, any>): void {
  try {
    if (isUsingMemory) {
      inMemoryWallets = { ...wallets };
      return;
    }
    
    ensureDirectories();
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
  } catch (error) {
    console.warn('Warning: Using in-memory storage as file system operations failed', error);
    isUsingMemory = true;
    inMemoryWallets = { ...wallets };
  }
}