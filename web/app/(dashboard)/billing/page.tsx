'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'

interface Plan {
  id: string
  name: string
  price: number
  minutes: number
  features: string[]
  popular?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
}

export default function BillingPage() {
  const [currentPlan] = useState({
    name: 'Starter',
    price: 29,
    minutesUsed: 45,
    minutesTotal: 100,
    renewalDate: '2024-03-01',
  })

  const [invoices] = useState<Invoice[]>([
    { id: 'inv_001', date: '2024-02-01', amount: 29.00, status: 'paid' },
    { id: 'inv_002', date: '2024-01-01', amount: 29.00, status: 'paid' },
    { id: 'inv_003', date: '2023-12-01', amount: 29.00, status: 'paid' },
  ])

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      minutes: 100,
      features: ['100 minutes/month', '1 phone number', '2 assistants', 'Email support', 'Basic analytics'],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      minutes: 500,
      features: ['500 minutes/month', '3 phone numbers', '10 assistants', 'Priority support', 'Advanced analytics', 'Custom integrations'],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: 199,
      minutes: 2000,
      features: ['2000 minutes/month', '10 phone numbers', 'Unlimited assistants', 'Dedicated support', 'Full analytics suite', 'API access', 'SLA guarantee'],
    },
  ]

  const usagePercentage = (currentPlan.minutesUsed / currentPlan.minutesTotal) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h3>
                <p className="text-gray-500">${currentPlan.price}/month</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Next billing date: {new Date(currentPlan.renewalDate).toLocaleDateString()}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline">Change Plan</Button>
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Minutes used</span>
                <span className="font-medium">{currentPlan.minutesUsed} / {currentPlan.minutesTotal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${usagePercentage > 80 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {currentPlan.minutesTotal - currentPlan.minutesUsed} minutes remaining
            </p>
            {usagePercentage > 80 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You&apos;ve used {usagePercentage.toFixed(0)}% of your minutes. Consider upgrading to avoid overages.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : ''}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={currentPlan.name === plan.name ? 'outline' : 'primary'}
                  disabled={currentPlan.name === plan.name}
                >
                  {currentPlan.name === plan.name ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Method</CardTitle>
          <Button variant="outline" size="sm">Update</Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Visa ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Billing History</CardTitle>
          <Button variant="ghost" size="sm">Download All</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{invoice.id}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-gray-600">${invoice.amount.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Button variant="ghost" size="sm">Download</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
