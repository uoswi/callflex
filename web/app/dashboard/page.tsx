'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@/components/ui'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface DashboardStats {
  callsToday: number
  callsYesterday: number
  minutesUsed: number
  minutesIncluded: number
  activeAssistants: number
  draftAssistants: number
  phoneNumbers: number
}

interface RecentCall {
  id: string
  caller_number: string
  assistant_name: string
  duration_seconds: number
  status: 'completed' | 'voicemail' | 'transferred' | 'abandoned' | 'in-progress'
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, callsRes] = await Promise.all([
          api.getCallStats().catch(() => ({ stats: null })),
          api.getCalls({ limit: 5 }).catch(() => ({ calls: [] })),
        ])

        if (statsRes.stats) {
          setStats(statsRes.stats)
        }
        setRecentCalls(callsRes.calls || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! Here&apos;s what&apos;s happening with your calls.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Calls Today"
          value={isLoading ? '-' : String(stats?.callsToday || 0)}
          change={stats && stats.callsToday > stats.callsYesterday ? `+${stats.callsToday - stats.callsYesterday} from yesterday` : undefined}
          trend={stats && stats.callsToday > stats.callsYesterday ? 'up' : undefined}
          icon={<PhoneIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Minutes Used"
          value={isLoading ? '-' : String(stats?.minutesUsed || 0)}
          subtitle={stats ? `of ${stats.minutesIncluded} included` : undefined}
          icon={<ClockIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Assistants"
          value={isLoading ? '-' : String(stats?.activeAssistants || 0)}
          subtitle={stats?.draftAssistants ? `${stats.draftAssistants} draft` : undefined}
          icon={<BotIcon />}
          isLoading={isLoading}
        />
        <StatCard
          title="Phone Numbers"
          value={isLoading ? '-' : String(stats?.phoneNumbers || 0)}
          subtitle="All active"
          icon={<HashIcon />}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/assistants/new">
          <Card className="hover:border-primary-300 cursor-pointer h-full transition-colors">
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Assistant</h3>
                <p className="text-sm text-gray-500">Set up a new AI receptionist</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/phone-numbers/new">
          <Card className="hover:border-success-500 cursor-pointer h-full transition-colors">
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Phone Number</h3>
                <p className="text-sm text-gray-500">Add a new phone number</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/calls">
          <Card className="hover:border-pro-500 cursor-pointer h-full transition-colors">
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-pro-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Transcripts</h3>
                <p className="text-sm text-gray-500">See all call recordings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Calls</CardTitle>
          <Link href="/dashboard/calls" className="text-sm text-primary-600 hover:text-primary-700 hover:underline">
            View all
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Caller</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Assistant</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : recentCalls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No calls yet. Your call activity will appear here.
                  </td>
                </tr>
              ) : (
                recentCalls.map((call) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  subtitle,
  trend,
  icon,
  isLoading,
}: {
  title: string
  value: string
  change?: string
  subtitle?: string
  trend?: 'up' | 'down'
  icon: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-3xl font-bold text-navy mt-1 ${isLoading ? 'animate-pulse' : ''}`}>{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                {change}
              </p>
            )}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PhoneIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function HashIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  )
}
