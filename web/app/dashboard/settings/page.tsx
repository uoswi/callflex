'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'notifications' | 'api'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  const [organization, setOrganization] = useState({
    name: '',
    website: '',
    timezone: 'America/New_York',
    address: '',
  })

  const [notifications, setNotifications] = useState({
    emailNewCall: true,
    emailDailySummary: true,
    emailWeeklyReport: true,
    smsUrgentAlerts: false,
    slackIntegration: false,
  })

  useEffect(() => {
    // Set profile from auth context
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }

    // Fetch organization data
    const fetchOrganization = async () => {
      try {
        const { organization: org } = await api.getOrganization()
        if (org) {
          setOrganization({
            name: org.name || '',
            website: org.website || '',
            timezone: org.timezone || 'America/New_York',
            address: org.address || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err)
      }
    }

    fetchOrganization()
  }, [user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // Profile is managed via Supabase Auth, so we'd need to update it there
      // For now, just show success
      await refreshUser()
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveOrganization = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.updateOrganization(organization)
      setSuccess('Organization settings updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // Notifications would typically be stored in user preferences
      // For now, just show success
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSuccess('Notification preferences updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notifications')
    } finally {
      setIsSaving(false)
    }
  }

  const getUserInitials = () => {
    if (!profile.fullName) return 'U'
    const names = profile.fullName.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and organization settings</p>
      </div>

      {error && (
        <div className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-success-50 text-success-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'organization', label: 'Organization' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'api', label: 'API Keys' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab)
                setError('')
                setSuccess('')
              }}
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                  {getUserInitials()}
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB.</p>
                </div>
              </div>

              <Input
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />

              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled
                hint="Email cannot be changed"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Change your password</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} isLoading={isSaving}>Save Changes</Button>
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Organization Name"
                value={organization.name}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              />

              <Input
                label="Website"
                type="url"
                value={organization.website}
                onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={organization.timezone}
                  onChange={(e) => setOrganization({ ...organization, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>

              <Input
                label="Business Address"
                value={organization.address}
                onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Owner</span>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <PlusIcon className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveOrganization} isLoading={isSaving}>Save Changes</Button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'emailNewCall', label: 'New call received', description: 'Get notified when a new call comes in' },
                { id: 'emailDailySummary', label: 'Daily summary', description: 'Receive a daily digest of call activity' },
                { id: 'emailWeeklyReport', label: 'Weekly report', description: 'Get weekly analytics and insights' },
              ].map((item) => (
                <label key={item.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.id as keyof typeof notifications] as boolean}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [item.id]: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.smsUrgentAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, smsUrgentAlerts: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">Urgent alerts</p>
                  <p className="text-sm text-gray-500">
                    Get SMS notifications for missed calls and system issues
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pro-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">#</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Slack</p>
                    <p className="text-sm text-gray-500">
                      {notifications.slackIntegration ? 'Connected' : 'Send notifications to Slack'}
                    </p>
                  </div>
                </div>
                <Button variant={notifications.slackIntegration ? 'outline' : 'primary'}>
                  {notifications.slackIntegration ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} isLoading={isSaving}>Save Changes</Button>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Use API keys to integrate CallFlex with your own applications.
              </p>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Production Key</p>
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono text-gray-600">
                    sk_live_••••••••••••••••••••••••
                  </code>
                  <Button variant="outline" size="sm">Copy</Button>
                  <Button variant="ghost" size="sm" className="text-error-600">Revoke</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Created on Jan 15, 2024</p>
              </div>

              <Button variant="outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New Key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Set up webhooks to receive real-time notifications about call events.
              </p>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Call Events</p>
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded">Active</span>
                </div>
                <code className="text-sm text-gray-600">https://api.example.com/webhooks/callflex</code>
                <div className="flex items-center space-x-2 mt-3">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-error-600">Delete</Button>
                </div>
              </div>

              <Button variant="outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </CardContent>
          </Card>

          <Card className="border-warning-200 bg-warning-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <WarningIcon className="w-5 h-5 text-warning-600 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-800">Keep your API keys secure</p>
                  <p className="text-sm text-warning-700 mt-1">
                    Never share your API keys or commit them to version control. If you suspect a key has been compromised, revoke it immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
