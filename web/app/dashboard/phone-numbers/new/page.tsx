'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'

interface AvailableNumber {
  number: string
  type: 'local' | 'toll-free'
  location: string
  monthlyPrice: number
}

export default function NewPhoneNumberPage() {
  const router = useRouter()
  const [step, setStep] = useState<'search' | 'configure'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [numberType, setNumberType] = useState<'local' | 'toll-free'>('local')
  const [areaCode, setAreaCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null)
  const [friendlyName, setFriendlyName] = useState('')
  const [selectedAssistant, setSelectedAssistant] = useState('')
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    // TODO: Call API to search available numbers
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockNumbers: AvailableNumber[] = [
      { number: '+1 (555) 234-5678', type: 'local', location: 'New York, NY', monthlyPrice: 2 },
      { number: '+1 (555) 345-6789', type: 'local', location: 'New York, NY', monthlyPrice: 2 },
      { number: '+1 (555) 456-7890', type: 'local', location: 'New York, NY', monthlyPrice: 2 },
      { number: '+1 (555) 567-8901', type: 'local', location: 'Newark, NJ', monthlyPrice: 2 },
      { number: '+1 (800) 234-5678', type: 'toll-free', location: 'United States', monthlyPrice: 3 },
    ]
    setAvailableNumbers(mockNumbers.filter((n) => numberType === 'local' ? n.type === 'local' : n.type === 'toll-free'))

    setIsSearching(false)
  }

  const handleSelectNumber = (num: AvailableNumber) => {
    setSelectedNumber(num)
    setFriendlyName(`${num.location} Line`)
    setStep('configure')
  }

  const handlePurchase = async () => {
    setIsPurchasing(true)
    // TODO: Call API to purchase number
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push('/dashboard/phone-numbers')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/phone-numbers" className="text-gray-400 hover:text-gray-600">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Get a Phone Number</h1>
          <p className="text-gray-600">Search and purchase a new phone number</p>
        </div>
      </div>

      {/* Step 1: Search */}
      {step === 'search' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Search for Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Number Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      numberType === 'local'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setNumberType('local')}
                  >
                    <p className="font-medium text-gray-900">Local Number</p>
                    <p className="text-sm text-gray-500">$2/month</p>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      numberType === 'toll-free'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setNumberType('toll-free')}
                  >
                    <p className="font-medium text-gray-900">Toll-Free Number</p>
                    <p className="text-sm text-gray-500">$3/month</p>
                  </button>
                </div>
              </div>

              {/* Area Code */}
              {numberType === 'local' && (
                <Input
                  label="Area Code (optional)"
                  placeholder="e.g., 212, 415, 310"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  hint="Enter a specific area code or leave blank to see all available numbers"
                />
              )}

              {/* Search by digits */}
              <Input
                label="Contains (optional)"
                placeholder="e.g., 1234"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                hint="Search for numbers containing specific digits"
              />

              <Button onClick={handleSearch} isLoading={isSearching} className="w-full">
                Search Available Numbers
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {availableNumbers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableNumbers.map((num) => (
                    <button
                      key={num.number}
                      className="w-full p-4 border rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      onClick={() => handleSelectNumber(num)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{num.number}</p>
                          <p className="text-sm text-gray-500">{num.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${num.monthlyPrice}/mo</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            num.type === 'toll-free'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {num.type}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && selectedNumber && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Number</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Number */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Selected Number</p>
                <p className="text-xl font-bold text-gray-900">{selectedNumber.number}</p>
                <p className="text-sm text-gray-500">{selectedNumber.location}</p>
              </div>

              {/* Friendly Name */}
              <Input
                label="Friendly Name"
                placeholder="e.g., Main Office, Support Line"
                value={friendlyName}
                onChange={(e) => setFriendlyName(e.target.value)}
                hint="A name to help you identify this number"
              />

              {/* Assign Assistant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Assistant (optional)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                >
                  <option value="">Select an assistant</option>
                  <option value="1">Front Desk Assistant</option>
                  <option value="2">After Hours Support</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  You can also assign this later from the phone number settings
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number</span>
                  <span className="font-medium">{selectedNumber.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Fee</span>
                  <span className="font-medium">${selectedNumber.monthlyPrice}/month</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Due Today</span>
                    <span className="font-bold text-lg">${selectedNumber.monthlyPrice}.00</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Incoming calls are charged at $0.02/minute. The monthly fee will be prorated for the first month.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('search')}>
              Back
            </Button>
            <Button onClick={handlePurchase} isLoading={isPurchasing}>
              Purchase Number
            </Button>
          </div>
        </>
      )}

      {/* Cancel link */}
      <div className="text-center">
        <Link href="/dashboard/phone-numbers" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>
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
