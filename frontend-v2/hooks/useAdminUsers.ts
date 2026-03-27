'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/store/AuthStore'

export interface AdminUser {
  id:        string
  username:  string
  email:     string
  firstName: string
  lastName:  string
  enabled:   boolean
  roles:     string[]
  createdAt: number | null
}

interface State {
  users:   AdminUser[]
  loading: boolean
  error:   string | null
}

export const MANAGED_ROLES = ['admin', 'approve', 'revoke', 'pending'] as const

export function isEffectivelyPending(user: AdminUser): boolean {
  return user.roles.includes('pending') ||
    !user.roles.some(r => MANAGED_ROLES.includes(r as typeof MANAGED_ROLES[number]))
}

export function useAdminUsers() {
  const { state: auth } = useAuth()
  const token = auth.accessToken
  const [state, setState] = useState<State>({ users: [], loading: true, error: null })

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setState({ users: [], loading: false, error: 'No auth token — please log out and log back in.' })
      return
    }
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data: AdminUser[] = await res.json()
      setState({ users: data, loading: false, error: null })
    } catch (err: unknown) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/setup-realm', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    fetchUsers()
  }, [fetchUsers, token])

  const assignRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}/roles`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ role }),
    })
    fetchUsers()
  }

  const removeRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}/roles/${role}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUsers()
  }

  const deleteUser = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUsers()
  }

  return { ...state, refresh: fetchUsers, assignRole, removeRole, deleteUser }
}
