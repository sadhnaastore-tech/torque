import { validateAuth } from '@/lib/auth-guard'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { context, error } = await validateAuth(req)
  if (error) return error

  try {
    const body = await req.json()
    const { leads } = body

    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: 'leads array is required' }, { status: 400 })
    }

    let importedCount = 0
    let updatedCount = 0

    // Process leads sequentially to ensure unique checks
    for (const item of leads) {
      const {
        clientName, clientPhone, clientEmail, vehicleNo,
        expiryDate, registrationDate, gvw, address, city
      } = item

      if (!clientName) continue // Name is required in schema

      const parsedExpiry = expiryDate ? new Date(expiryDate) : null
      const parsedRegDate = registrationDate ? new Date(registrationDate) : null

      // Check if a Lead already exists with the same vehicle registration number or client phone
      let existingLead = null

      if (vehicleNo) {
        existingLead = await prisma.lead.findFirst({
          where: { vehicleNo: { equals: vehicleNo, mode: 'insensitive' } }
        })
      }

      if (!existingLead && clientPhone) {
        existingLead = await prisma.lead.findFirst({
          where: { clientPhone: { equals: clientPhone } }
        })
      }

      if (existingLead) {
        // Update existing lead
        await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            clientName,
            clientEmail: clientEmail || existingLead.clientEmail,
            clientPhone: clientPhone || existingLead.clientPhone,
            vehicleNo: vehicleNo || existingLead.vehicleNo,
            expiryDate: parsedExpiry || existingLead.expiryDate,
            registrationDate: parsedRegDate || existingLead.registrationDate,
            gvw: gvw || existingLead.gvw,
            address: address || existingLead.address,
            city: city || existingLead.city,
            updatedAt: new Date()
          }
        })
        updatedCount++
      } else {
        // Create new lead
        await prisma.lead.create({
          data: {
            clientName,
            clientPhone: clientPhone || null,
            clientEmail: clientEmail || null,
            vehicleNo: vehicleNo || null,
            expiryDate: parsedExpiry,
            registrationDate: parsedRegDate,
            gvw: gvw || null,
            address: address || null,
            city: city || null,
            status: 'New'
          }
        })
        importedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${leads.length} leads.`,
      importedCount,
      updatedCount
    })
  } catch (err: any) {
    console.error('Lead Import POST Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
