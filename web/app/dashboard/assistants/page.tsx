'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button } from '@/components/ui'
import { api } from '@/lib/api'

interface Assistant {
  id: string
  name: string
  template_name: string
  status: 'active' | 'inactive' | 'draft'
  calls_count: number
  created_at: string
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const { assistants: data } = await api.getAssistants()
        setAssistants(data || [])
      } catch (error) {
        console.error('Failed to fetch assistants:', error)
        setAssistants([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssistants()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistants</h1>
          <p className="text-gray-600">Create and manage your AI voice assistants</p>
        </div>
        <Link href="/dashboard/assistants/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Assistant
          </Button>
        </Link>
      </div>

      {/* Assistants Grid */}
      {assistants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BotIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first AI assistant to start handling calls
            </p>
            <Link href="/dashboard/assistants/new">
              <Button>Create your first assistant</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((assistant) => (
            <Link key={assistant.id} href={`/dashboard/assistants/${assistant.id}`}>
              <Card className="hover:border-primary-300 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BotIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        assistant.status
                      )}`}
                    >
                      {assistant.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{assistant.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">Based on {assistant.template_name || 'Custom'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      <PhoneIcon className="w-4 h-4 inline mr-1" />
                      {assistant.calls_count || 0} calls
                    </span>
                    <span className="text-gray-400">
                      Created {new Date(assistant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
}
