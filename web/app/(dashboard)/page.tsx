'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your calls.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Calls Today"
          value="12"
          change="+3 from yesterday"
          trend="up"
          icon={<PhoneIcon />}
        />
        <StatCard
          title="Minutes Used"
          value="45"
          subtitle="of 100 included"
          icon={<ClockIcon />}
        />
        <StatCard
          title="Active Assistants"
          value="2"
          subtitle="1 draft"
          icon={<BotIcon />}
        />
        <StatCard
          title="Phone Numbers"
          value="1"
          subtitle="All active"
          icon={<HashIcon />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/assistants/new">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
          <Link href="/dashboard/calls" className="text-sm text-blue-600 hover:underline">
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
              {[
                { caller: '+1 (555) 123-4567', assistant: 'Front Desk', duration: '2:34', status: 'completed', time: '5 min ago' },
                { caller: '+1 (555) 987-6543', assistant: 'Front Desk', duration: '1:12', status: 'completed', time: '23 min ago' },
                { caller: '+1 (555) 456-7890', assistant: 'After Hours', duration: '0:45', status: 'voicemail', time: '1 hour ago' },
              ].map((call, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{call.caller}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{call.assistant}</td>
                  <td className="py-4 px-6 text-gray-600">{call.duration}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{call.time}</td>
                </tr>
              ))}
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
}: {
  title: string
  value: string
  change?: string
  subtitle?: string
  trend?: 'up' | 'down'
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
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
