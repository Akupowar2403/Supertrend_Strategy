'use client'

import { useMemo } from 'react'
import { useAuth } from '@/store/AuthStore'
import AdminPanel from '@/components/admin/AdminPanel'

function hasAdminRole(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return (payload?.realm_access?.roles ?? []).includes('admin')
  } catch {
    return false
  }
}

export default function AdminPage() {
  const { state: auth } = useAuth()
  const isAdmin = useMemo(() => hasAdminRole(auth.accessToken), [auth.accessToken])

  if (!auth.accessToken) {
    return (
      <div style={{ padding: 48, color: '#64748b', fontSize: 15, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        Session token not available. Please log out and log back in.
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 48, color: '#f87171', fontSize: 15, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⛔</div>
        You need the <code style={{ color: '#818cf8' }}>admin</code> role to access this page.
      </div>
    )
  }

  return <AdminPanel />
}
