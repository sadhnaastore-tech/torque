
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      manager: true,
      teamMembers: true
    }
  })

  console.log('--- User Assignment Audit ---')
  users.forEach(u => {
    console.log(`User: ${u.fullName} (${u.email})`)
    console.log(`  Role: ${u.role?.name || 'NONE'}`)
    console.log(`  Reports To: ${u.manager?.fullName || 'DIRECT'}`)
    console.log(`  Team Size: ${u.teamMembers.length}`)
    if (u.teamMembers.length > 0) {
      console.log(`  Team: ${u.teamMembers.map(m => m.fullName).join(', ')}`)
    }
    console.log('---------------------------')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
