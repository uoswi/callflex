'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button, Input } from '@/components/ui'

interface Call {
  id: string
  caller_number: string
  assistant_name: string
  duration: string
  status: 'completed' | 'in-progress' | 'voicemail' | 'transferred' | 'abandoned'
  started_at: string
  summary?: string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'voicemail' | 'transferred'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // TODO: Fetch from API
    setCalls([
      {
        id: '1',
        caller_number: '+1 (555) 123-4567',
        assistant_name: 'Front Desk',
        duration: '2:34',
        status: 'completed',
        started_at: '2024-02-15T10:30:00Z',
        summary: 'Patient called to reschedule appointment from March 5th to March 12th.',
      },
      {
        id: '2',
        caller_number: '+1 (555) 987-6543',
        assistant_name: 'Front Desk',
        duration: '1:12',
        status: 'completed',
        started_at: '2024-02-15T10:07:00Z',
        summary: 'New patient inquiry about services and pricing.',
      },
      {
        id: '3',
        caller_number: '+1 (555) 456-7890',
        assistant_name: 'After Hours',
        duration: '0:45',
        status: 'voicemail',
        started_at: '2024-02-15T09:45:00Z',
        summary: 'Caller left voicemail about prescription refill request.',
      },
      {
        id: '4',
        caller_number: '+1 (555) 321-9876',
        assistant_name: 'Front Desk',
        duration: '3:21',
        status: 'transferred',
        started_at: '2024-02-15T09:15:00Z',
        summary: 'Complex billing question - transferred to billing department.',
      },
      {
        id: '5',
        caller_number: '+1 (555) 654-3210',
        assistant_name: 'Front Desk',
        duration: '0:23',
        status: 'abandoned',
        started_at: '2024-02-15T08:45:00Z',
      },
      {
        id: '6',
        caller_number: '+1 (555) 789-0123',
        assistant_name: 'After Hours',
        duration: '1:56',
        status: 'completed',
        started_at: '2024-02-14T22:30:00Z',
        summary: 'Emergency call about office hours and directions.',
      },
    ])
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'voicemail':
        return 'bg-yellow-100 text-yellow-700'
      case 'transferred':
        return 'bg-purple-100 text-purple-700'
      case 'abandoned':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const filteredCalls = calls.filter((call) => {
    const matchesFilter = filter === 'all' || call.status === filter
    const matchesSearch =
      searchQuery === '' ||
      call.caller_number.includes(searchQuery) ||
      call.assistant_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
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
              onClick={() => setFilter(f.id as typeof filter)}
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
            <p className="text-2xl font-bold text-gray-900">{calls.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {calls.filter((c) => c.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Voicemails</p>
            <p className="text-2xl font-bold text-yellow-600">
              {calls.filter((c) => c.status === 'voicemail').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Transferred</p>
            <p className="text-2xl font-bold text-purple-600">
              {calls.filter((c) => c.status === 'transferred').length}
            </p>
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
              {filteredCalls.map((call) => (
                <tr key={call.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{call.caller_number}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{call.assistant_name}</td>
                  <td className="py-4 px-6 text-gray-600">{call.duration}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        call.status
                      )}`}
                    >
                      {call.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{formatTime(call.started_at)}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalls.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No calls found matching your criteria.</p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredCalls.length} of {calls.length} calls
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
