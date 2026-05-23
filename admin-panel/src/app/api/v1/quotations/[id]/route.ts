
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateAuth } from '@/lib/auth-guard'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { context, error } = await validateAuth(req, 'quotations.approve')
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const quote = await prisma.quotation.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quotation PATCH Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
