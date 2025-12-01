'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { api } from '@/lib/api'

interface Plan {
  id: string
  name: string
  price: number
  priceId: string
  minutes: number
  features: string[]
  popular?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  invoice_url?: string
}

interface BillingInfo {
  plan: {
    name: string
    price: number
  }
  usage: {
    minutesUsed: number
    minutesIncluded: number
  }
  renewalDate: string
  paymentMethod?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  invoices: Invoice[]
}

// Stripe price IDs from your env
const PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
  professional: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
  business: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || 'price_business',
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      priceId: PRICE_IDS.starter,
      minutes: 100,
      features: ['100 minutes/month', '1 phone number', '2 assistants', 'Email support', 'Basic analytics'],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      priceId: PRICE_IDS.professional,
      minutes: 500,
      features: ['500 minutes/month', '3 phone numbers', '10 assistants', 'Priority support', 'Advanced analytics', 'Custom integrations'],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: 199,
      priceId: PRICE_IDS.business,
      minutes: 2000,
      features: ['2000 minutes/month', '10 phone numbers', 'Unlimited assistants', 'Dedicated support', 'Full analytics suite', 'API access', 'SLA guarantee'],
    },
  ]

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const { billing: data } = await api.getBillingInfo()
        setBilling(data)
      } catch (err) {
        console.error('Failed to fetch billing info:', err)
        // Set default values if billing fails
        setBilling({
          plan: { name: 'Starter', price: 29 },
          usage: { minutesUsed: 0, minutesIncluded: 100 },
          renewalDate: new Date().toISOString(),
          invoices: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBilling()
  }, [])

  const handleUpgrade = async (priceId: string, planName: string) => {
    setIsUpgrading(planName)
    setError('')

    try {
      const { url } = await api.createCheckoutSession(priceId)
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setIsUpgrading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const { url } = await api.createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  const usagePercentage = billing
    ? (billing.usage.minutesUsed / billing.usage.minutesIncluded) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600">Manage your subscription and payment methods</p>
      </div>

      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{billing?.plan.name || 'Free'}</h3>
                <p className="text-gray-500">${billing?.plan.price || 0}/month</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-700">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Next billing date: {billing?.renewalDate ? new Date(billing.renewalDate).toLocaleDateString() : '-'}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleManageBilling}>Manage Billing</Button>
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
                <span className="font-medium">
                  {billing?.usage.minutesUsed || 0} / {billing?.usage.minutesIncluded || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    usagePercentage > 80 ? 'bg-warning-500' : 'bg-primary-600'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.max(0, (billing?.usage.minutesIncluded || 0) - (billing?.usage.minutesUsed || 0))} minutes remaining
            </p>
            {usagePercentage > 80 && (
              <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-sm text-warning-800">
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
              className={plan.popular ? 'border-primary-500 ring-2 ring-primary-200' : ''}
            >
              {plan.popular && (
                <div className="bg-primary-500 text-white text-center py-1 text-sm font-medium">
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
                      <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={billing?.plan.name === plan.name ? 'outline' : 'primary'}
                  disabled={billing?.plan.name === plan.name}
                  isLoading={isUpgrading === plan.name}
                  onClick={() => handleUpgrade(plan.priceId, plan.name)}
                >
                  {billing?.plan.name === plan.name ? 'Current Plan' : 'Upgrade'}
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
          <Button variant="outline" size="sm" onClick={handleManageBilling}>Update</Button>
        </CardHeader>
        <CardContent>
          {billing?.paymentMethod ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {billing.paymentMethod.brand.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-500">
                  Expires {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No payment method on file</p>
              <Button variant="outline" onClick={handleManageBilling}>
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Billing History</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleManageBilling}>View All</Button>
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
              {billing?.invoices && billing.invoices.length > 0 ? (
                billing.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{invoice.id}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-600">${invoice.amount.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-success-100 text-success-700'
                          : invoice.status === 'pending'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {invoice.invoice_url && (
                        <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">Download</Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No invoices yet
                  </td>
                </tr>
              )}
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
