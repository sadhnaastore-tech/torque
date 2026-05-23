"use client"
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import { Search, Filter, Plus, MoreVertical, ExternalLink, Download, Upload, CheckCircle, AlertCircle, Users, Calendar, RefreshCw, Phone, MessageCircle } from 'lucide-react'

export default function LeadsPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const initialSearch = searchParams?.get('search') || ''

  const [leads, setLeads] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [importing, setImporting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({ clientName: '', clientPhone: '', vehicleNo: '', clientEmail: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date Range State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      params.append('limit', '100')

      const [leadsData, statsData] = await Promise.all([
        fetchApi(`/api/v1/leads?${params}`),
        fetchApi('/api/v1/leads/stats')
      ])
      
      setLeads(leadsData.leads || [])
      setStats(statsData.summary || null)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await fetchApi('/api/v1/leads/import', {
        method: 'POST',
        body: formData,
      })
      alert(`Import Summary:\n- Total Rows: ${result.stats.total}\n- Imported: ${result.stats.assignedCount}\n- Errors: ${result.stats.errors}\n- Duplicates: ${result.stats.duplicates}`)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi('/api/v1/leads', {
        method: 'POST',
        body: JSON.stringify(newLead)
      })
      setShowAddModal(false)
      setNewLead({ clientName: '', clientPhone: '', vehicleNo: '', clientEmail: '' })
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to add lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredLeads = leads.filter(l => 
    l.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    l.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
    l.clientPhone?.includes(search)
  )

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track monthly renewals and employee performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" id="csv-import" className="hidden" accept=".csv,.xlsx" onChange={handleImport} />
          <label htmlFor="csv-import" className="cursor-pointer px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
            <Upload size={16} />
            {importing ? 'Importing...' : 'Import Leads'}
          </label>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus size={18} />
            New Lead
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard title="Total Leads" value={stats?.total || 0} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Assigned" value={stats?.assigned || 0} icon={<CheckCircle className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Converted" value={stats?.converted || 0} icon={<CheckCircle className="text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Followups" value={stats?.followups || 0} icon={<AlertCircle className="text-amber-600" />} color="bg-amber-50" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone or vehicle number..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
          <Calendar size={16} className="text-gray-400" />
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="text-xs font-semibold outline-none bg-transparent w-28"
          />
          <span className="text-gray-300">—</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className="text-xs font-semibold outline-none bg-transparent w-28"
          />
          {(startDate || endDate) && (
            <button onClick={() => {setStartDate(''); setEndDate('')}} className="text-gray-400 hover:text-red-500 ml-1">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vehicle & Owner</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No leads found in this period.</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-bold text-gray-900">{lead.clientName}</div>
                        <div className="text-xs text-gray-500">{lead.vehicleNo}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href={`tel:${lead.clientPhone}`}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Call now"
                        >
                          <Phone size={14} />
                        </a>
                        <a 
                          href={`https://wa.me/91${lead.clientPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="WhatsApp message"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                        {lead.assignee?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-gray-600">{lead.assignee?.fullName || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add New Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner Name *</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={newLead.clientName} onChange={e => setNewLead({...newLead, clientName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number *</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={newLead.clientPhone} onChange={e => setNewLead({...newLead, clientPhone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Number *</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={newLead.vehicleNo} onChange={e => setNewLead({...newLead, vehicleNo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Optional)</label>
                <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={newLead.clientEmail} onChange={e => setNewLead({...newLead, clientEmail: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
                  {isSubmitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`p-6 rounded-2xl border border-gray-100 shadow-sm ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}
