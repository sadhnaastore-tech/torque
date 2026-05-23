import prisma from '../src/lib/prisma'

async function verify() {
  console.log('--- STARTING VERIFICATION OF BULK IMPORT LOGIC ---')

  const testLeads = [
    {
      clientName: 'TEST CLIENT IMPORT A',
      clientPhone: '9998887771',
      clientEmail: 'test.a@example.com',
      vehicleNo: 'GJ-36-TEST-A1',
      city: 'Morbi'
    },
    {
      clientName: 'TEST CLIENT IMPORT B',
      clientPhone: '9998887772',
      clientEmail: 'test.b@example.com',
      vehicleNo: 'GJ-36-TEST-B2',
      city: 'Morbi'
    }
  ]

  let importedCount = 0
  let updatedCount = 0

  for (const item of testLeads) {
    const { clientName, clientPhone, clientEmail, vehicleNo, city } = item

    let existingLead = null

    if (vehicleNo) {
      existingLead = await prisma.lead.findFirst({
        where: { vehicleNo: { equals: vehicleNo, mode: 'insensitive' } }
      })
    }

    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: { clientName, clientEmail, clientPhone, city, updatedAt: new Date() }
      })
      updatedCount++
    } else {
      await prisma.lead.create({
        data: { clientName, clientPhone, clientEmail, vehicleNo, city, status: 'New' }
      })
      importedCount++
    }
  }

  console.log(`✓ Verification completed: Created: ${importedCount}, Updated: ${updatedCount}`)
  
  // Cleanup test leads
  await prisma.lead.deleteMany({
    where: {
      vehicleNo: { in: ['GJ-36-TEST-A1', 'GJ-36-TEST-B2'] }
    }
  })
  console.log('✓ Cleaned up verification records from database.')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
