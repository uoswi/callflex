'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button } from '@/components/ui'
import { api } from '@/lib/api'

interface PhoneNumber {
  id: string
  number: string
  friendly_name: string
  assistant_name?: string
  assistant_id?: string
  status: 'active' | 'inactive'
  calls_count: number
  created_at: string
}

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const { phoneNumbers: data } = await api.getPhoneNumbers()
        setPhoneNumbers(data || [])
      } catch (error) {
        console.error('Failed to fetch phone numbers:', error)
        setPhoneNumbers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhoneNumbers()
  }, [])

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
          <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
          <p className="text-gray-600">Manage your phone numbers and their assistant assignments</p>
        </div>
        <Link href="/dashboard/phone-numbers/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Number
          </Button>
        </Link>
      </div>

      {/* Phone Numbers List */}
      {phoneNumbers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No phone numbers yet</h3>
            <p className="text-gray-500 mb-4">
              Get a phone number to start receiving calls
            </p>
            <Link href="/dashboard/phone-numbers/new">
              <Button>Get your first number</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {phoneNumbers.map((phone) => (
            <Card key={phone.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-6 h-6 text-success-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{phone.number}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            phone.status === 'active'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {phone.status}
                        </span>
                      </div>
                      <p className="text-gray-500">{phone.friendly_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Assistant</p>
                      <p className="font-medium text-gray-900">{phone.assistant_name || 'None'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Calls</p>
                      <p className="font-medium text-gray-900">{phone.calls_count || 0}</p>
                    </div>
                    <Link href={`/dashboard/phone-numbers/${phone.id}`}>
                      <Button variant="outline">Configure</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <InfoIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-primary-900">Phone Number Pricing</h4>
              <p className="text-primary-700 text-sm mt-1">
                Local numbers are $2/month. Toll-free numbers are $3/month. All incoming calls are charged at $0.02/minute.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
