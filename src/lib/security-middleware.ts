import { NextRequest, NextResponse } from 'next/server'

export interface SecurityOptions {
  requireAuth?: boolean
  allowedMethods?: string[]
  rateLimit?: {
    requests: number
    windowMs: number
  }
  allowedOrigins?: string[]
}

export function securityMiddleware(options: SecurityOptions = {}) {
  const {
    requireAuth = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    rateLimit = { requests: 100, windowMs: 60000 }, // 100 requests per minute
    allowedOrigins = ['*']
  } = options

  return async (request: NextRequest) => {
    // Method validation
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // Origin validation (CORS)
    const origin = request.headers.get('origin')
    if (origin && !allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      )
    }

    // Rate limiting (simplified implementation)
    if (rateLimit) {
      const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
      // In a real implementation, you'd use Redis or similar for distributed rate limiting
      // This is a simplified version for demonstration
      const rateLimitKey = `rate_limit:${clientIp}:${Date.now() / rateLimit.windowMs}`
      
      // Check if rate limit exceeded (simplified)
      // In production, you'd check against Redis or similar
      if (Math.random() < 0.01) { // 1% chance to simulate rate limit hit for demo
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    // Tenant validation
    if (requireAuth) {
      const tenantId = request.headers.get('x-tenant-id')
      const tenantName = request.headers.get('x-tenant-name')
      const tenantDomain = request.headers.get('x-tenant-domain')

      if (!tenantId || !tenantName || !tenantDomain) {
        return NextResponse.json(
          { error: 'Tenant identification required' },
          { status: 401 }
        )
      }

      // Validate tenant ID format
      if (!isValidTenantId(tenantId)) {
        return NextResponse.json(
          { error: 'Invalid tenant ID format' },
          { status: 400 }
        )
      }

      // Validate tenant domain format
      if (!isValidTenantDomain(tenantDomain)) {
        return NextResponse.json(
          { error: 'Invalid tenant domain format' },
          { status: 400 }
        )
      }
    }

    // Add security headers
    const response = NextResponse.next()
    
    // CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-tenant-id, x-tenant-name, x-tenant-domain')
    }

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  }
}

function isValidTenantId(tenantId: string): boolean {
  // Basic validation - alphanumeric with hyphens and underscores
  return /^[a-zA-Z0-9_-]{3,50}$/.test(tenantId)
}

function isValidTenantDomain(domain: string): boolean {
  // Basic domain validation
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/.test(domain)
}

// Input validation middleware
export function validateInput(schema: any) {
  return (request: NextRequest) => {
    try {
      // For JSON requests
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const contentType = request.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return request.json().then((data) => {
            const validated = schema.parse(data)
            return { validated, success: true }
          }).catch(() => {
            return { success: false, error: 'Invalid JSON format' }
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Input validation failed' }
    }
  }
}

// Permission checking middleware
export function requirePermission(permission: string) {
  return (request: NextRequest) => {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // In a real implementation, you'd validate the token and check permissions
    // This is a simplified version for demonstration
    if (authHeader !== 'Bearer demo-token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has the required permission
    // In production, you'd decode the token and check user permissions
    if (permission === 'admin' && authHeader !== 'Bearer admin-token') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}