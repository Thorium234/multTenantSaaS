import { NextRequest, NextResponse } from 'next/server'

export interface TenantContext {
  tenantId: string
  tenantName: string
  tenantDomain: string
}

export function getTenantFromRequest(request: NextRequest): TenantContext | null {
  // Try to get tenant from subdomain first
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0]
  
  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
    return {
      tenantId: subdomain,
      tenantName: subdomain,
      tenantDomain: subdomain
    }
  }
  
  // Fallback to header (for API calls or testing)
  const tenantHeader = request.headers.get('x-tenant-id')
  const tenantNameHeader = request.headers.get('x-tenant-name')
  const tenantDomainHeader = request.headers.get('x-tenant-domain')
  
  if (tenantHeader && tenantNameHeader && tenantDomainHeader) {
    return {
      tenantId: tenantHeader,
      tenantName: tenantNameHeader,
      tenantDomain: tenantDomainHeader
    }
  }
  
  return null
}

export function tenantMiddleware(request: NextRequest) {
  const tenant = getTenantFromRequest(request)
  
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant not identified. Please provide a valid subdomain or tenant headers.' },
      { status: 401 }
    )
  }
  
  // Add tenant to request headers for downstream processing
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenant.tenantId)
  requestHeaders.set('x-tenant-name', tenant.tenantName)
  requestHeaders.set('x-tenant-domain', tenant.tenantDomain)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}