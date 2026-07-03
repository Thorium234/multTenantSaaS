import { PrismaClient } from '@prisma/client'

// Global cache for tenant-specific Prisma clients
const tenantClients = new Map<string, PrismaClient>()

// Get or create a tenant-specific Prisma client
export function getTenantClient(tenantId: string): PrismaClient {
  if (tenantClients.has(tenantId)) {
    return tenantClients.get(tenantId)!
  }
  
  // Create new client for this tenant
  const client = new PrismaClient({
    log: ['query'],
    // You can add tenant-specific configuration here if needed
  })
  
  tenantClients.set(tenantId, client)
  return client
}

// Get the current tenant from request headers
export function getCurrentTenant(request: Request): { tenantId: string; tenantName: string; tenantDomain: string } | null {
  const headers = request.headers as any
  const tenantId = headers.get('x-tenant-id')
  const tenantName = headers.get('x-tenant-name')
  const tenantDomain = headers.get('x-tenant-domain')
  
  if (tenantId && tenantName && tenantDomain) {
    return { tenantId, tenantName, tenantDomain }
  }
  
  return null
}

// Create a tenant-aware Prisma client with automatic filtering
export class TenantAwarePrisma {
  private prisma: PrismaClient
  private tenant: { tenantId: string; tenantName: string; tenantDomain: string } | null
  
  constructor(tenant: { tenantId: string; tenantName: string; tenantDomain: string } | null) {
    this.tenant = tenant
    this.prisma = tenant ? getTenantClient(tenant.tenantId) : new PrismaClient()
  }
  
  // Automatically add tenantId to create operations
  async create<T>(model: { create: (args: any) => T }, args: any): Promise<T> {
    if (!this.tenant) {
      throw new Error('Tenant context is required for create operations')
    }
    
    // Add tenantId to create data if not already present
    const createData = Array.isArray(args) 
      ? args.map(arg => ({ ...arg, tenantId: this.tenant!.tenantId }))
      : { ...args, tenantId: this.tenant!.tenantId }
    
    return model.create(createData)
  }
  
  // Automatically filter by tenantId for find operations
  findMany<T>(model: { findMany: (args: any) => Promise<T[]>, findUnique: (args: any) => Promise<T | null> }, args: any = {}): Promise<T[]> {
    if (!this.tenant) {
      throw new Error('Tenant context is required for find operations')
    }
    
    const where = args.where ? { ...args.where, tenantId: this.tenant.tenantId } : { tenantId: this.tenant.tenantId }
    
    return model.findMany({ ...args, where })
  }
  
  findUnique<T>(model: { findUnique: (args: any) => Promise<T | null> }, args: any): Promise<T | null> {
    if (!this.tenant) {
      throw new Error('Tenant context is required for find operations')
    }
    
    const where = args.where ? { ...args.where, tenantId: this.tenant.tenantId } : { tenantId: this.tenant.tenantId }
    
    return model.findUnique({ ...args, where })
  }
  
  // Automatically filter by tenantId for update operations
  update<T>(model: { update: (args: any) => Promise<T> }, args: any): Promise<T> {
    if (!this.tenant) {
      throw new Error('Tenant context is required for update operations')
    }
    
    const where = args.where ? { ...args.where, tenantId: this.tenant.tenantId } : { tenantId: this.tenant.tenantId }
    
    return model.update({ ...args, where })
  }
  
  // Automatically filter by tenantId for delete operations
  delete<T>(model: { delete: (args: any) => Promise<T> }, args: any): Promise<T> {
    if (!this.tenant) {
      throw new Error('Tenant context is required for delete operations')
    }
    
    const where = args.where ? { ...args.where, tenantId: this.tenant.tenantId } : { tenantId: this.tenant.tenantId }
    
    return model.delete({ ...args, where })
  }
  
  // Expose the underlying Prisma client for direct access when needed
  get client() {
    return this.prisma
  }
}

// Create a tenant-aware instance from request
export function getTenantDb(request: Request): TenantAwarePrisma {
  const tenant = getCurrentTenant(request)
  return new TenantAwarePrisma(tenant)
}

// Cleanup function for testing or shutdown
export function cleanupTenantClients() {
  tenantClients.forEach(client => {
    client.$disconnect()
  })
  tenantClients.clear()
}