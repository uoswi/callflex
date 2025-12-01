import { createClient } from './supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }

  // Auth
  async signup(data: { email: string; password: string; fullName: string; organizationName: string }) {
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signin(data: { email: string; password: string }) {
    return this.request<{ session: any; user: any }>('/api/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe() {
    return this.request<{ user: any }>('/api/v1/auth/me')
  }

  // Assistants
  async getAssistants() {
    return this.request<{ assistants: any[] }>('/api/v1/assistants')
  }

  async getAssistant(id: string) {
    return this.request<{ assistant: any }>(`/api/v1/assistants/${id}`)
  }

  async createAssistant(data: any) {
    return this.request<{ assistant: any }>('/api/v1/assistants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAssistant(id: string, data: any) {
    return this.request<{ assistant: any }>(`/api/v1/assistants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteAssistant(id: string) {
    return this.request(`/api/v1/assistants/${id}`, {
      method: 'DELETE',
    })
  }

  // Phone Numbers
  async getPhoneNumbers() {
    return this.request<{ phoneNumbers: any[] }>('/api/v1/phone-numbers')
  }

  async searchPhoneNumbers(params: { type: string; areaCode?: string; contains?: string }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request<{ numbers: any[] }>(`/api/v1/phone-numbers/search?${query}`)
  }

  async purchasePhoneNumber(data: { number: string; friendlyName: string; assistantId?: string }) {
    return this.request<{ phoneNumber: any }>('/api/v1/phone-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePhoneNumber(id: string, data: any) {
    return this.request<{ phoneNumber: any }>(`/api/v1/phone-numbers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePhoneNumber(id: string) {
    return this.request(`/api/v1/phone-numbers/${id}`, {
      method: 'DELETE',
    })
  }

  // Calls
  async getCalls(params?: { limit?: number; offset?: number; status?: string }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return this.request<{ calls: any[]; total: number }>(`/api/v1/calls${query}`)
  }

  async getCall(id: string) {
    return this.request<{ call: any }>(`/api/v1/calls/${id}`)
  }

  async getCallStats() {
    return this.request<{ stats: any }>('/api/v1/calls/stats')
  }

  // Billing
  async getBillingInfo() {
    return this.request<{ billing: any }>('/api/v1/billing')
  }

  async createCheckoutSession(priceId: string) {
    return this.request<{ url: string }>('/api/v1/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    })
  }

  async createPortalSession() {
    return this.request<{ url: string }>('/api/v1/billing/portal', {
      method: 'POST',
    })
  }

  async getUsage() {
    return this.request<{ usage: any }>('/api/v1/billing/usage')
  }

  // Organizations
  async getOrganization() {
    return this.request<{ organization: any }>('/api/v1/organizations/current')
  }

  async updateOrganization(data: any) {
    return this.request<{ organization: any }>('/api/v1/organizations/current', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Templates
  async getTemplates() {
    return this.request<{ templates: any[] }>('/api/v1/templates')
  }
}

export const api = new ApiClient()
