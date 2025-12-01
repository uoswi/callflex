'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button, Input, StatusBadge } from '@/components/ui'
import { api } from '@/lib/api'

interface Call {
  id: string
  caller_number: string
  assistant_name: string
  duration_seconds: number
  status: 'completed' | 'in-progress' | 'voicemail' | 'transferred' | 'abandoned'
  created_at: string
  summary?: string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'voicemail' | 'transferred'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    const fetchCalls = async () => {
      setIsLoading(true)
      try {
        const params: { limit: number; offset: number; status?: string } = {
          limit: pageSize,
          offset: page * pageSize,
        }
        if (filter !== 'all') {
          params.status = filter
        }
        const { calls: callsData, total: totalCount } = await api.getCalls(params)
        setCalls(callsData || [])
        setTotal(totalCount || 0)
      } catch (error) {
        console.error('Failed to fetch calls:', error)
        setCalls([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalls()
  }, [filter, page])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const filteredCalls = calls.filter((call) => {
    if (searchQuery === '') return true
    return (
      call.caller_number.includes(searchQuery) ||
      (call.assistant_name && call.assistant_name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.status === 'completed').length,
    voicemail: calls.filter((c) => c.status === 'voicemail').length,
    transferred: calls.filter((c) => c.status === 'transferred').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
        <p className="text-gray-600">View and manage all your call recordings and transcripts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by phone number or assistant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
            { id: 'voicemail', label: 'Voicemail' },
            { id: 'transferred', label: 'Transferred' },
          ].map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(f.id as typeof filter)
                setPage(0)
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Calls</p>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-success-600">{isLoading ? '-' : stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Voicemails</p>
            <p className="text-2xl font-bold text-warning-600">{isLoading ? '-' : stats.voicemail}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Transferred</p>
            <p className="text-2xl font-bold text-pro-600">{isLoading ? '-' : stats.transferred}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calls List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Caller</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Assistant</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Summary</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {searchQuery ? 'No calls found matching your search.' : 'No calls yet. Your call history will appear here.'}
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/dashboard/calls/${call.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {call.caller_number}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{call.assistant_name || 'Unknown'}</td>
                    <td className="py-4 px-6 text-gray-600 font-mono">{formatDuration(call.duration_seconds)}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{formatTime(call.created_at)}</td>
                    <td className="py-4 px-6 text-gray-500 text-sm max-w-xs truncate">
                      {call.summary || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/dashboard/calls/${call.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredCalls.length} of {total} calls
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(page + 1) * pageSize >= total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
