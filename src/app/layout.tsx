// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Uniswap Simulator',
  description: 'Create wallets and simulate swaps on Uniswap',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-indigo-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="text-xl font-bold">Uniswap Simulator</a>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a href="/" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                    <a href="/wallets" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Wallets</a>
                    <a href="/swap-simulator" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Swap Simulator</a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="bg-white shadow-inner py-4 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Uniswap Simulator
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}