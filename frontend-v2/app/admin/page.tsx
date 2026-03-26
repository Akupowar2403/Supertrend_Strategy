'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/store/AuthStore'
import AdminPanel from '@/components/admin/AdminPanel'

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL      || 'http://localhost:3000'
const ADMIN_URL    = `${APP_URL}/admin`

function getRoles(token: string): string[] {
  try {
    const p = token.split('.')[1]
    const payload = JSON.parse(atob(p + '='.repeat((4 - p.length % 4) % 4)))
    return payload?.realm_access?.roles ?? []
  } catch {
    return []
  }
}

export default function AdminPage() {
  const { state: auth, setAccessToken } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')

    if (code) {
      // Exchange code for token
      window.history.replaceState({}, '', '/admin')
      fetch('/api/auth/exchange', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, redirect_uri: ADMIN_URL }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.access_token) setAccessToken(data.access_token)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
      return
    }

    // No code — if we already have a token we're good
    setLoading(false)
  }, [setAccessToken])

  const token = auth.accessToken
  const roles = useMemo(() => getRoles(token), [token])
  const isAdmin = roles.includes('admin')

  function redirectToKeycloak() {
    const kp = new URLSearchParams({
      client_id:     'swts-frontend',
      redirect_uri:  ADMIN_URL,
      response_type: 'code',
      scope:         'openid',
    })
    window.location.href = `${KEYCLOAK_URL}/realms/SWTS/protocol/openid-connect/auth?${kp}`
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
        Loading…
      </div>
    )
  }

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>Admin access required</p>
        <button
          onClick={redirectToKeycloak}
          style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          Log in with Keycloak
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: '#f87171', fontSize: 15,
      }}>
        <div style={{ fontSize: 40 }}>⛔</div>
        <p>You need the <code style={{ color: '#818cf8' }}>admin</code> role to access this page.</p>
        <button
          onClick={redirectToKeycloak}
          style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}
        >
          Log in as a different user
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{
        padding: '16px 32px', borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0f172a', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⛨</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#e2e8f0' }}>Admin Panel</span>
          <span style={{ fontSize: 13, color: '#475569' }}>TrendEdge</span>
        </div>
        <a href="/dashboard" style={{ padding: '7px 18px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          ← Dashboard
        </a>
      </div>
      <AdminPanel />
    </div>
  )
}
