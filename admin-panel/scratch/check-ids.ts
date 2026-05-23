
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      manager: true
    }
  })

  console.log('--- User ID Audit ---')
  users.forEach(u => {
    console.log(`User: ${u.fullName} | ID: ${u.id} | Email: ${u.email}`)
    console.log(`  Role: ${u.role?.name || 'NONE'}`)
    console.log(`  Reports To ID: ${u.managerId || 'DIRECT'}`)
    console.log('---------------------------')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
