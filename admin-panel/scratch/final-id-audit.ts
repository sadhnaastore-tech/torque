
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const riya = await prisma.user.findFirst({ where: { email: 'riya@example.com' } })
  console.log('Riya ID:', riya?.id)

  const users = await prisma.user.findMany({
    include: { role: true }
  })
  
  console.log('--- All Users ---')
  users.forEach(u => {
    console.log(`${u.fullName} (${u.email}) | ID: ${u.id} | Role: ${u.role?.name} | ManagerID: ${u.managerId}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
