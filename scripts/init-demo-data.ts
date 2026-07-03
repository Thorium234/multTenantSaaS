import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initializing demo data...')

  // Create demo tenants
  const companyA = await prisma.tenant.upsert({
    where: { domain: 'company-a' },
    update: {},
    create: {
      name: 'Company A',
      domain: 'company-a',
      isActive: true,
    },
  })

  const companyB = await prisma.tenant.upsert({
    where: { domain: 'company-b' },
    update: {},
    create: {
      name: 'Company B',
      domain: 'company-b',
      isActive: true,
    },
  })

  const companyC = await prisma.tenant.upsert({
    where: { domain: 'company-c' },
    update: {},
    create: {
      name: 'Company C',
      domain: 'company-c',
      isActive: true,
    },
  })

  console.log('✅ Created tenants:', [companyA.name, companyB.name, companyC.name])

  // Create demo users for each tenant
  const companyAUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@company-a.com',
        name: 'John Doe',
        tenantId: companyA.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@company-a.com',
        name: 'Jane Smith',
        tenantId: companyA.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@company-a.com',
        name: 'Bob Johnson',
        tenantId: companyA.id,
      },
    }),
  ])

  const companyBUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@company-b.com',
        name: 'Alice Brown',
        tenantId: companyB.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@company-b.com',
        name: 'Charlie Wilson',
        tenantId: companyB.id,
      },
    }),
  ])

  const companyCUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'diana@company-c.com',
        name: 'Diana Davis',
        tenantId: companyC.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'evan@company-c.com',
        name: 'Evan Miller',
        tenantId: companyC.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'fiona@company-c.com',
        name: 'Fiona Garcia',
        tenantId: companyC.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'george@company-c.com',
        name: 'George Martinez',
        tenantId: companyC.id,
      },
    }),
  ])

  console.log('✅ Created users:', [
    ...companyAUsers.map(u => u.email),
    ...companyBUsers.map(u => u.email),
    ...companyCUsers.map(u => u.email),
  ])

  // Create demo posts for each tenant
  const companyAPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Welcome to Company A',
        content: 'This is our first blog post at Company A. We are excited to share our journey with you.',
        published: true,
        authorId: companyAUsers[0].id,
        tenantId: companyA.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Project Alpha Launch',
        content: 'We are proud to announce the successful launch of Project Alpha. This represents a major milestone for our company.',
        published: true,
        authorId: companyAUsers[1].id,
        tenantId: companyA.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Team Building Event',
        content: 'Join us for our annual team building event next month. It will be a great opportunity to connect with colleagues.',
        published: false,
        authorId: companyAUsers[2].id,
        tenantId: companyA.id,
      },
    }),
  ])

  const companyBPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Company B Quarterly Report',
        content: 'Check out our latest quarterly report. We\'ve achieved record growth this quarter!',
        published: true,
        authorId: companyBUsers[0].id,
        tenantId: companyB.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'New Product Launch',
        content: 'We\'re thrilled to announce the launch of our new product line. Innovation is at the heart of everything we do.',
        published: true,
        authorId: companyBUsers[1].id,
        tenantId: companyB.id,
      },
    }),
  ])

  const companyCPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Company Culture Update',
        content: 'We\'ve been working hard to improve our company culture. Here\'s what we\'ve accomplished so far.',
        published: true,
        authorId: companyCUsers[0].id,
        tenantId: companyC.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Sustainability Initiatives',
        content: 'Learn about our new sustainability initiatives and how we\'re working to reduce our environmental impact.',
        published: true,
        authorId: companyCUsers[1].id,
        tenantId: companyC.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Holiday Party 2024',
        content: 'Get ready for our annual holiday party! More details to come soon.',
        published: false,
        authorId: companyCUsers[2].id,
        tenantId: companyC.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Office Renovation',
        content: 'We\'re renovating our office space to create a better working environment for everyone.',
        published: true,
        authorId: companyCUsers[3].id,
        tenantId: companyC.id,
      },
    }),
  ])

  console.log('✅ Created posts:', [
    ...companyAPosts.map(p => p.title),
    ...companyBPosts.map(p => p.title),
    ...companyCPosts.map(p => p.title),
  ])

  console.log('🎉 Demo data initialization complete!')
  console.log('\n📊 Summary:')
  console.log(`- Tenants: 3 (Company A, Company B, Company C)`)
  console.log(`- Users: ${companyAUsers.length + companyBUsers.length + companyCUsers.length}`)
  console.log(`- Posts: ${companyAPosts.length + companyBPosts.length + companyCPosts.length}`)
  console.log('\n🔗 Test URLs:')
  console.log('- Company A: http://company-a.localhost:3000')
  console.log('- Company B: http://company-b.localhost:3000')
  console.log('- Company C: http://company-c.localhost:3000')
  console.log('- Demo: http://localhost:3000 (uses demo tenant)')
}

main()
  .catch((e) => {
    console.error('❌ Error initializing demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })