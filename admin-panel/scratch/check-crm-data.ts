
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const customers = await prisma.customer.findMany({
    include: { lead: true }
  })
  
  console.log(`Total Customers: ${customers.length}`)
  customers.forEach(c => {
    console.log(`Customer: ${c.name} | Lead ID: ${c.leadId} | Assigned To: ${c.lead?.assignedTo || 'NONE'}`)
  })

  const leads = await prisma.lead.findMany()
  console.log(`Total Leads: ${leads.length}`)
  leads.forEach(l => {
    console.log(`Lead: ${l.clientName} | Assigned To: ${l.assignedTo || 'NONE'}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
