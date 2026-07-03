'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Tenant {
  id: string
  name: string
  domain: string
  isActive: boolean
  users: any[]
  posts: any[]
  _count: {
    users: number
    posts: number
  }
}

interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

interface Post {
  id: string
  title: string
  published: boolean
  createdAt: string
}

export default function Home() {
  const [tenant, setTenant] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateTenant, setShowCreateTenant] = useState(false)
  const [newTenant, setNewTenant] = useState({ name: '', domain: '' })

  useEffect(() => {
    detectTenant()
    fetchTenants()
  }, [])

  const detectTenant = async () => {
    try {
      // Try to get tenant from current URL subdomain
      const host = window.location.hostname
      const subdomain = host.split('.')[0]
      
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
        setTenant(subdomain)
        setTenantName(subdomain)
        await fetchTenantData(subdomain)
      } else {
        // For local development, simulate tenant detection
        await fetchTenantData('demo')
      }
    } catch (err) {
      setError('Failed to detect tenant')
      setLoading(false)
    }
  }

  const fetchTenantData = async (tenantDomain: string) => {
    try {
      // Add tenant headers to request
      const headers = {
        'x-tenant-id': tenantDomain,
        'x-tenant-name': tenantDomain,
        'x-tenant-domain': tenantDomain
      }

      const [usersRes, postsRes] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/posts', { headers })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData)
      }
    } catch (err) {
      setError('Failed to fetch tenant data')
    }
    setLoading(false)
  }

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data)
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    }
  }

  const createTenant = async () => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant)
      })

      if (response.ok) {
        setShowCreateTenant(false)
        setNewTenant({ name: '', domain: '' })
        fetchTenants()
      }
    } catch (err) {
      setError('Failed to create tenant')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Multi-Tenant SaaS Dashboard</h1>
          <p className="text-muted-foreground">
            Current Tenant: <Badge variant="outline">{tenant || 'Unknown'}</Badge>
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="tenants">Tenant Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Total users in this tenant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Posts</CardTitle>
                  <CardDescription>Total posts in this tenant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{posts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Tenants</CardTitle>
                  <CardDescription>Total tenants in system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tenants.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest posts and users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {post.published ? 'Published' : 'Draft'} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={post.published ? 'default' : 'secondary'}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Users in this tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
                <CardDescription>Posts in this tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          <Badge variant={post.published ? 'default' : 'secondary'}>
                            {post.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tenant Management</h2>
              <Button onClick={() => setShowCreateTenant(true)}>
                Create New Tenant
              </Button>
            </div>

            {showCreateTenant && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tenant-name">Name</Label>
                      <Input
                        id="tenant-name"
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                        placeholder="Tenant name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenant-domain">Domain</Label>
                      <Input
                        id="tenant-domain"
                        value={newTenant.domain}
                        onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                        placeholder="tenant-domain"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={createTenant}>Create Tenant</Button>
                    <Button variant="outline" onClick={() => setShowCreateTenant(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Tenants</CardTitle>
                <CardDescription>Manage all tenants in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Posts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>{tenant.domain}</TableCell>
                        <TableCell>
                          <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                            {tenant.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{tenant._count.users}</TableCell>
                        <TableCell>{tenant._count.posts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}