'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from './supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  fullName: string
  organization?: {
    id: string
    name: string
    slug: string
    status: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchUserData = async (authUser: User) => {
    try {
      const { data } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          organization_members (
            role,
            organization:organizations (
              id,
              name,
              slug,
              status
            )
          )
        `)
        .eq('auth_id', authUser.id)
        .single()

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orgMember = data.organization_members?.[0] as any
        const org = orgMember?.organization
        setUser({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          organization: org ? {
            id: org.id,
            name: org.name,
            slug: org.slug,
            status: org.status,
          } : undefined,
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)

        if (session?.user) {
          await fetchUserData(session.user)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      await fetchUserData(data.user)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserData(session.user)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
