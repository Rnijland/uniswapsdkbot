// app/api/wallets/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getWallet, deleteWallet, loadWallets } from '@/app/lib/blockchain/wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Ensure the param exists
    if (!params || !params.name) {
      return NextResponse.json(
        { success: false, error: 'Wallet name is required' },
        { status: 400 }
      );
    }
    
    // Get the wallet name safely
    const walletName = String(params.name);
    
    const wallet = getWallet(walletName);
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }
    
    // Get balance in ETH
    const balance = await wallet.provider?.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance || 0n);
    
    // Get the full wallet data including private key and mnemonic
    const wallets = loadWallets();
    const walletData = wallets[walletName];
    
    if (!walletData) {
      return NextResponse.json(
        { success: false, error: 'Wallet data not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      wallet: {
        name: walletName,
        address: wallet.address,
        balance: ethBalance,
        privateKey: walletData.privateKey,
        mnemonic: walletData.mnemonic,
        createdAt: walletData.createdAt
      }
    });
  } catch (error: any) {
    console.error(`Error getting wallet:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // Ensure the param exists
    if (!params || !params.name) {
      return NextResponse.json(
        { success: false, error: 'Wallet name is required' },
        { status: 400 }
      );
    }
    
    // Get the wallet name safely
    const walletName = String(params.name);
    
    const success = deleteWallet(walletName);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting wallet:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}