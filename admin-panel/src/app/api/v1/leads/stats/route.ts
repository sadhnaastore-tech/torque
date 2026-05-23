import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateAuth } from '@/lib/auth-guard'

export async function GET(req: NextRequest) {
  const { error, context } = await validateAuth(req, 'leads.view')
  if (error) return error

  try {
    const [
      totalLeads,
      assignedLeads,
      unassignedLeads,
      convertedLeads,
      pendingFollowups,
      notInterestedLeads,
      employeeStats
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { assignedTo: { not: null } } }),
      prisma.lead.count({ where: { assignedTo: null } }),
      prisma.lead.count({ where: { status: 'Converted' } }),
      prisma.lead.count({ where: { status: 'Follow-up' } }),
      prisma.lead.count({ where: { status: 'Not Interested' } }),
      prisma.user.findMany({
        where: {
          role: {
            name: { notIn: ['ADMIN'] }
          }
        },
        select: {
          id: true,
          fullName: true,
          _count: {
            select: {
              assignedLeads: true,
              calls: true,
            }
          },
          assignedLeads: {
            select: {
              status: true
            }
          }
        }
      })
    ])

    const formattedEmployeeStats = employeeStats.map(emp => {
      const converted = emp.assignedLeads.filter(l => l.status === 'Converted').length
      const pending = emp.assignedLeads.filter(l => l.status === 'New' || l.status === 'Follow-up').length
      return {
        id: emp.id,
        name: emp.fullName,
        assigned: emp._count.assignedLeads,
        called: emp._count.calls,
        pending: pending,
        converted: converted
      }
    })

    return NextResponse.json({
      summary: {
        total: totalLeads,
        assigned: assignedLeads,
        unassigned: unassignedLeads,
        converted: convertedLeads,
        followups: pendingFollowups,
        notInterested: notInterestedLeads
      },
      employees: formattedEmployeeStats
    })
  } catch (error: any) {
    console.error('Leads Stats Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
