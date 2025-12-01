'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'

interface Call {
  id: string
  caller_number: string
  assistant_name: string
  duration: string
  status: 'completed' | 'in-progress' | 'voicemail' | 'transferred' | 'abandoned'
  started_at: string
  ended_at: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  transcript: TranscriptEntry[]
  recording_url?: string
  actions: CallAction[]
}

interface TranscriptEntry {
  speaker: 'assistant' | 'caller'
  text: string
  timestamp: string
}

interface CallAction {
  type: string
  description: string
  timestamp: string
}

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [call, setCall] = useState<Call | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions'>('transcript')
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // TODO: Fetch from API
    setCall({
      id,
      caller_number: '+1 (555) 123-4567',
      assistant_name: 'Front Desk',
      duration: '2:34',
      status: 'completed',
      started_at: '2024-02-15T10:30:00Z',
      ended_at: '2024-02-15T10:32:34Z',
      summary: 'The caller requested to reschedule their appointment from March 5th to March 12th. The assistant successfully updated the appointment in the system and sent a confirmation text message to the caller.',
      sentiment: 'positive',
      recording_url: '/recordings/call-123.mp3',
      transcript: [
        { speaker: 'assistant', text: 'Thank you for calling Dr. Smith\'s office. This is your virtual assistant. How may I help you today?', timestamp: '0:00' },
        { speaker: 'caller', text: 'Hi, I need to reschedule my appointment.', timestamp: '0:05' },
        { speaker: 'assistant', text: 'Of course, I\'d be happy to help you reschedule. Can you please provide your name or phone number so I can look up your appointment?', timestamp: '0:08' },
        { speaker: 'caller', text: 'It\'s John Smith, phone number 555-123-4567.', timestamp: '0:15' },
        { speaker: 'assistant', text: 'Thank you, John. I found your appointment for March 5th at 2:00 PM. When would you like to reschedule to?', timestamp: '0:22' },
        { speaker: 'caller', text: 'Can you do March 12th around the same time?', timestamp: '0:30' },
        { speaker: 'assistant', text: 'Let me check availability for March 12th. I have openings at 1:30 PM and 2:30 PM. Which works better for you?', timestamp: '0:35' },
        { speaker: 'caller', text: '2:30 PM would be perfect.', timestamp: '0:45' },
        { speaker: 'assistant', text: 'Great! I\'ve rescheduled your appointment to March 12th at 2:30 PM. You\'ll receive a confirmation text shortly. Is there anything else I can help you with?', timestamp: '0:50' },
        { speaker: 'caller', text: 'No, that\'s all. Thank you!', timestamp: '1:00' },
        { speaker: 'assistant', text: 'You\'re welcome, John. Have a great day!', timestamp: '1:03' },
      ],
      actions: [
        { type: 'lookup', description: 'Retrieved patient record for John Smith', timestamp: '0:22' },
        { type: 'calendar_check', description: 'Checked availability for March 12th', timestamp: '0:35' },
        { type: 'appointment_update', description: 'Rescheduled appointment to March 12th at 2:30 PM', timestamp: '0:50' },
        { type: 'sms_sent', description: 'Sent confirmation SMS to +1 (555) 123-4567', timestamp: '0:52' },
      ],
    })
    setIsLoading(false)
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'voicemail':
        return 'bg-yellow-100 text-yellow-700'
      case 'transferred':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'lookup':
        return '🔍'
      case 'calendar_check':
        return '📅'
      case 'appointment_update':
        return '✏️'
      case 'sms_sent':
        return '💬'
      default:
        return '📋'
    }
  }

  if (isLoading || !call) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/calls" className="text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{call.caller_number}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                {call.status}
              </span>
            </div>
            <p className="text-gray-600">
              Handled by {call.assistant_name} • {new Date(call.started_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Call Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-xl font-bold text-gray-900">{call.duration}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Sentiment</p>
            <p className={`text-xl font-bold capitalize ${getSentimentColor(call.sentiment)}`}>
              {call.sentiment}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Actions Taken</p>
            <p className="text-xl font-bold text-gray-900">{call.actions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Assistant</p>
            <p className="text-xl font-bold text-gray-900">{call.assistant_name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Audio Player */}
      {call.recording_url && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: '35%' }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0:53</span>
                  <span>{call.duration}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <VolumeIcon className="w-5 h-5 text-gray-600" />
                </button>
                <select className="text-sm border-0 bg-transparent text-gray-600">
                  <option>1x</option>
                  <option>1.5x</option>
                  <option>2x</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'transcript', label: 'Transcript' },
            { id: 'summary', label: 'Summary' },
            { id: 'actions', label: 'Actions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Transcript Tab */}
      {activeTab === 'transcript' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {call.transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      entry.speaker === 'assistant'
                        ? 'bg-gray-100 rounded-br-2xl rounded-tr-2xl rounded-bl-2xl'
                        : 'bg-blue-600 text-white rounded-bl-2xl rounded-tl-2xl rounded-br-2xl'
                    } px-4 py-3`}
                  >
                    <p className={`text-xs mb-1 ${entry.speaker === 'assistant' ? 'text-gray-500' : 'text-blue-200'}`}>
                      {entry.speaker === 'assistant' ? '🤖 Assistant' : '👤 Caller'} • {entry.timestamp}
                    </p>
                    <p className={entry.speaker === 'assistant' ? 'text-gray-900' : 'text-white'}>
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{call.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Caller: John Smith',
                  'Request: Reschedule appointment',
                  'Original date: March 5th at 2:00 PM',
                  'New date: March 12th at 2:30 PM',
                  'Confirmation sent via SMS',
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {call.actions.map((action, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getActionIcon(action.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{action.description}</p>
                    <p className="text-sm text-gray-500">at {action.timestamp}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {action.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
