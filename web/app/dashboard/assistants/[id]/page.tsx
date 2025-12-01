'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, StatusBadge } from '@/components/ui'
import { api } from '@/lib/api'

interface Assistant {
  id: string
  name: string
  template_name: string
  status: 'active' | 'inactive' | 'draft'
  greeting: string
  voice: string
  transfer_number: string
  calls_count: number
  created_at: string
  phone_number?: string
  business_hours?: {
    start: string
    end: string
  }
  features?: {
    voicemail: boolean
    transfer: boolean
    sms: boolean
    transcription: boolean
  }
}

interface RecentCall {
  id: string
  caller_number: string
  duration_seconds: number
  created_at: string
  status: 'completed' | 'voicemail' | 'transferred' | 'abandoned'
}

interface AssistantStats {
  total_calls: number
  avg_duration: number
  success_rate: number
  completed_percent: number
  transferred_percent: number
  voicemail_percent: number
  abandoned_percent: number
}

export default function AssistantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])
  const [stats, setStats] = useState<AssistantStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'analytics'>('overview')

  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const { assistant: data } = await api.getAssistant(id)
        setAssistant(data)

        // Fetch recent calls for this assistant
        try {
          const { calls } = await api.getCalls({ limit: 5 })
          // Filter calls by assistant if the API returns all calls
          setRecentCalls(calls || [])
        } catch {
          setRecentCalls([])
        }

        // Mock stats for now (API should provide these)
        setStats({
          total_calls: data.calls_count || 0,
          avg_duration: 154, // 2:34 in seconds
          success_rate: 94,
          completed_percent: 65,
          transferred_percent: 20,
          voicemail_percent: 10,
          abandoned_percent: 5,
        })
      } catch (err) {
        console.error('Failed to fetch assistant:', err)
        setError('Failed to load assistant')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssistant()
  }, [id])

  const handleSave = async () => {
    if (!assistant) return

    setIsSaving(true)
    setError('')

    try {
      const { assistant: updated } = await api.updateAssistant(id, {
        name: assistant.name,
        greeting: assistant.greeting,
        voice: assistant.voice,
        transfer_number: assistant.transfer_number,
        status: assistant.status,
        business_hours: assistant.business_hours,
        features: assistant.features,
      })
      setAssistant(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this assistant? This action cannot be undone.')) {
      return
    }

    try {
      await api.deleteAssistant(id)
      router.push('/dashboard/assistants')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assistant')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!assistant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assistant not found</p>
        <Link href="/dashboard/assistants" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to assistants
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/assistants" className="text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{assistant.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  assistant.status === 'active'
                    ? 'bg-success-100 text-success-700'
                    : assistant.status === 'draft'
                    ? 'bg-warning-100 text-warning-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {assistant.status}
              </span>
            </div>
            <p className="text-gray-600">Based on {assistant.template_name || 'Custom'} template</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'settings', label: 'Settings' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_calls || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">Avg Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? formatDuration(stats.avg_duration) : '-'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold text-success-600">{stats?.success_rate || 0}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Calls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Calls</CardTitle>
                <Link href="/dashboard/calls" className="text-sm text-primary-600 hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {recentCalls.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No calls yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentCalls.slice(0, 5).map((call) => (
                      <div key={call.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-gray-900">{call.caller_number}</p>
                          <p className="text-sm text-gray-500">{formatTime(call.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">{formatDuration(call.duration_seconds)}</p>
                          <StatusBadge status={call.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phone Number</CardTitle>
              </CardHeader>
              <CardContent>
                {assistant.phone_number ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{assistant.phone_number}</p>
                    <p className="text-sm text-success-600">Active</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-3">No phone number assigned</p>
                    <Link href="/dashboard/phone-numbers/new">
                      <Button size="sm">Assign Number</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Test Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Duplicate Assistant
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export Transcripts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Assistant Name"
                value={assistant.name}
                onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Message</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  value={assistant.greeting || ''}
                  onChange={(e) => setAssistant({ ...assistant, greeting: e.target.value })}
                />
              </div>

              <Input
                label="Transfer Number"
                type="tel"
                value={assistant.transfer_number || ''}
                onChange={(e) => setAssistant({ ...assistant, transfer_number: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'professional-female', name: 'Sarah (Professional)', gender: 'Female' },
                  { id: 'professional-male', name: 'James (Professional)', gender: 'Male' },
                  { id: 'friendly-female', name: 'Emma (Friendly)', gender: 'Female' },
                  { id: 'friendly-male', name: 'David (Friendly)', gender: 'Male' },
                ].map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      assistant.voice === voice.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAssistant({ ...assistant, voice: voice.id })}
                  >
                    <p className="font-medium text-gray-900">{voice.name}</p>
                    <p className="text-xs text-gray-500">{voice.gender}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {['active', 'inactive'].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      assistant.status === status
                        ? status === 'active'
                          ? 'border-success-500 bg-success-50 text-success-700'
                          : 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    onClick={() => setAssistant({ ...assistant, status: status as 'active' | 'inactive' })}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {assistant.status === 'active'
                  ? 'This assistant is currently taking calls.'
                  : 'This assistant is paused and will not take calls.'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Calls', value: String(stats?.total_calls || 0), change: '+12%' },
              { label: 'Avg Duration', value: stats ? formatDuration(stats.avg_duration) : '-', change: '+5%' },
              { label: 'Completed', value: `${stats?.success_rate || 0}%`, change: '+2%' },
              { label: 'Transferred', value: `${stats?.transferred_percent || 0}%`, change: '-3%' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span
                      className={`text-sm ${
                        stat.change.startsWith('+') ? 'text-success-600' : 'text-error-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                Chart placeholder - call volume over time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Completed', percentage: stats?.completed_percent || 0, color: 'bg-success-500' },
                  { label: 'Transferred', percentage: stats?.transferred_percent || 0, color: 'bg-primary-500' },
                  { label: 'Voicemail', percentage: stats?.voicemail_percent || 0, color: 'bg-warning-500' },
                  { label: 'Abandoned', percentage: stats?.abandoned_percent || 0, color: 'bg-error-500' },
                ].map((outcome) => (
                  <div key={outcome.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{outcome.label}</span>
                      <span className="font-medium">{outcome.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${outcome.color} h-2 rounded-full`}
                        style={{ width: `${outcome.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}
