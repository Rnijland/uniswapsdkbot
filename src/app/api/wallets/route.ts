// app/api/wallets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createWallet, listWallets } from '@/app/lib/blockchain/wallet';

export async function GET() {
  try {
    const wallets = listWallets();
    return NextResponse.json({ success: true, wallets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Wallet name is required' },
        { status: 400 }
      );
    }
    
    const walletData = createWallet(name);
    return NextResponse.json({ success: true, wallet: walletData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}