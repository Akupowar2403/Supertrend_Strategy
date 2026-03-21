// hooks/useAdminUsers.ts — Fetch and manage users via the admin REST API.

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../auth/KeycloakProvider"

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

export function useAdminUsers() {
  const { token } = useAuth()
  const [state, setState] = useState<State>({ users: [], loading: true, error: null })

  const fetchUsers = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data: AdminUser[] = await res.json()
      setState({ users: data, loading: false, error: null })
    } catch (err: unknown) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [token])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const assignRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}/roles`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ role }),
    })
    fetchUsers()
  }

  const removeRole = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}/roles/${role}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchUsers()
  }

  const setEnabled = async (userId: string, enabled: boolean) => {
    await fetch(`/api/admin/users/${userId}/status`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ enabled }),
    })
    fetchUsers()
  }

  return { ...state, refresh: fetchUsers, assignRole, removeRole, setEnabled }
}
