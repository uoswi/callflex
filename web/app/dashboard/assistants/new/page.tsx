'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { api } from '@/lib/api'

interface Template {
  id: string
  name: string
  industry: string
  description: string
  features: string[]
  popularity: number
}

type Step = 'template' | 'configure' | 'customize'

// Default templates in case API fails or returns empty
const defaultTemplates: Template[] = [
  {
    id: 'medical-office',
    name: 'Medical Office',
    industry: 'Healthcare',
    description: 'Perfect for medical practices, clinics, and healthcare providers. Handles appointment scheduling, patient inquiries, and after-hours calls.',
    features: ['Appointment scheduling', 'Patient inquiries', 'Insurance questions', 'Prescription refills'],
    popularity: 95,
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    industry: 'Legal',
    description: 'Designed for law offices to screen potential clients, schedule consultations, and handle general inquiries professionally.',
    features: ['Client intake', 'Consultation scheduling', 'Case status updates', 'Emergency routing'],
    popularity: 88,
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    industry: 'Real Estate',
    description: 'Ideal for real estate agents and brokerages. Captures leads, schedules showings, and provides property information.',
    features: ['Lead capture', 'Showing scheduling', 'Property inquiries', 'Agent routing'],
    popularity: 82,
  },
  {
    id: 'home-services',
    name: 'Home Services',
    industry: 'Services',
    description: 'Built for HVAC, plumbing, electrical, and other home service businesses. Books appointments and handles service requests.',
    features: ['Service booking', 'Emergency dispatch', 'Quote requests', 'Follow-up calls'],
    popularity: 79,
  },
  {
    id: 'dental-office',
    name: 'Dental Office',
    industry: 'Healthcare',
    description: 'Specialized for dental practices. Manages appointments, handles insurance verification, and patient reminders.',
    features: ['Appointment booking', 'Insurance verification', 'Procedure inquiries', 'Emergency routing'],
    popularity: 85,
  },
  {
    id: 'custom',
    name: 'Custom',
    industry: 'Any',
    description: 'Start from scratch with a blank template. Perfect for unique business needs or specialized industries.',
    features: ['Fully customizable', 'Any industry', 'Custom workflows', 'Flexible prompts'],
    popularity: 70,
  },
]

export default function NewAssistantPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('template')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [config, setConfig] = useState({
    name: '',
    greeting: '',
    voice: 'professional-female',
    transferNumber: '',
    businessHours: {
      start: '09:00',
      end: '17:00',
    },
    features: {
      voicemail: true,
      transfer: true,
      sms: false,
      transcription: true,
    },
  })

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { templates: data } = await api.getTemplates()
        if (data && data.length > 0) {
          setTemplates(data)
        } else {
          setTemplates(defaultTemplates)
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
        setTemplates(defaultTemplates)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setConfig({
      ...config,
      name: `${template.name} Assistant`,
      greeting: `Thank you for calling. This is your ${template.name.toLowerCase()} assistant. How may I help you today?`,
    })
    setStep('configure')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      await api.createAssistant({
        name: config.name,
        template_id: selectedTemplate?.id,
        template_name: selectedTemplate?.name,
        greeting: config.greeting,
        voice: config.voice,
        transfer_number: config.transferNumber,
        business_hours: config.businessHours,
        features: config.features,
        status: 'draft',
      })
      router.push('/dashboard/assistants')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assistant')
      setIsSaving(false)
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[
          { key: 'template', label: 'Choose Template' },
          { key: 'configure', label: 'Configure' },
          { key: 'customize', label: 'Customize' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key
                  ? 'bg-primary-600 text-white'
                  : ['template'].indexOf(step) < ['template', 'configure', 'customize'].indexOf(s.key)
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-success-500 text-white'
              }`}
            >
              {i + 1}
            </div>
            <span className={`ml-2 text-sm ${step === s.key ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Template Selection */}
      {step === 'template' && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Choose a template</h1>
            <p className="text-gray-600 mt-2">Select an industry template to get started quickly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:border-primary-300 ${
                  selectedTemplate?.id === template.id ? 'border-primary-500 ring-2 ring-primary-200' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="text-xs text-gray-500">{template.industry}</span>
                    </div>
                    <span className="text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
                      {template.popularity}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span className="text-xs text-gray-400">+{template.features.length - 3} more</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configure your assistant</h1>
              <p className="text-gray-600 mt-1">Based on {selectedTemplate?.name} template</p>
            </div>
            <Button variant="ghost" onClick={() => setStep('template')}>
              Change template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Assistant Name"
                placeholder="e.g., Front Desk Assistant"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
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
                        config.voice === voice.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setConfig({ ...config, voice: voice.id })}
                    >
                      <p className="font-medium text-gray-900">{voice.name}</p>
                      <p className="text-xs text-gray-500">{voice.gender}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Message</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="What should your assistant say when answering?"
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                />
              </div>

              <Input
                label="Transfer Number (optional)"
                type="tel"
                placeholder="+1 (555) 123-4567"
                hint="Calls can be transferred to this number when needed"
                value={config.transferNumber}
                onChange={(e) => setConfig({ ...config, transferNumber: e.target.value })}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('template')}>
              Back
            </Button>
            <Button onClick={() => setStep('customize')}>Continue</Button>
          </div>
        </>
      )}

      {/* Step 3: Customize */}
      {step === 'customize' && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customize behavior</h1>
            <p className="text-gray-600 mt-1">Fine-tune how your assistant handles calls</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opens at</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={config.businessHours.start}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        businessHours: { ...config.businessHours, start: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closes at</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={config.businessHours.end}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        businessHours: { ...config.businessHours, end: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Outside these hours, your assistant will follow the after-hours script.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: 'voicemail',
                  title: 'Take voicemails',
                  description: 'Allow callers to leave a voicemail when needed',
                },
                {
                  id: 'transfer',
                  title: 'Allow call transfers',
                  description: 'Let the assistant transfer calls to your team',
                },
                {
                  id: 'sms',
                  title: 'Send SMS confirmations',
                  description: 'Text callers to confirm appointments or provide info',
                },
                {
                  id: 'transcription',
                  title: 'Transcribe all calls',
                  description: 'Save transcripts for every call',
                },
              ].map((option) => (
                <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.features[option.id as keyof typeof config.features]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, [option.id]: e.target.checked },
                      })
                    }
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.title}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('configure')}>
              Back
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Create Assistant
            </Button>
          </div>
        </>
      )}

      {/* Cancel link */}
      <div className="text-center">
        <Link href="/dashboard/assistants" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel and go back
        </Link>
      </div>
    </div>
  )
}
