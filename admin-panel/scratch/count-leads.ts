
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const riyaId = '63dc9d54-e8b2-4326-a809-8d794db5d2e7'
  const user2Id = 'c63f0ab8-e3bc-4dce-a6f8-5eaa0960c2cb'
  
  const riyaLeads = await prisma.lead.count({ where: { assignedTo: riyaId } })
  const user2Leads = await prisma.lead.count({ where: { assignedTo: user2Id } })
  const unassignedLeads = await prisma.lead.count({ where: { assignedTo: null } })
  const totalLeads = await prisma.lead.count()

  console.log(`Riya Leads: ${riyaLeads}`)
  console.log(`User2 Leads: ${user2Leads}`)
  console.log(`Unassigned Leads: ${unassignedLeads}`)
  console.log(`Total Leads: ${totalLeads}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
