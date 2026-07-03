import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { tenantMiddleware } from '@/lib/tenant-middleware'
import { securityMiddleware } from '@/lib/security-middleware'

export async function middleware(request: NextRequest) {
  // Apply tenant middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // First apply tenant middleware
    const tenantResponse = await tenantMiddleware(request)
    if (tenantResponse.status !== 200) {
      return tenantResponse
    }
    
    // Then apply security middleware
    return securityMiddleware({
      requireAuth: true,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      rateLimit: {
        requests: 100,
        windowMs: 60000
      }
    })(request)
  }
  
  // For non-API routes, you might want to handle tenant-specific pages
  // For now, just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    // Add other routes that need tenant identification
  ],
}