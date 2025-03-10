import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures that our API routes have proper CORS headers
// and handles any global route requirements
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Apply CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  // Continue with the request for non-API routes
  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    // Apply this middleware to all API routes
    '/api/:path*',
  ],
};