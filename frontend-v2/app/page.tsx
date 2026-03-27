'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/AuthStore'
import { authLogin } from '@/lib/api'

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL      || 'http://localhost:3000'
const TOKEN_KEY    = 'swts_access_token'

function isTokenValid(token: string): boolean {
  try {
    const p       = token.split('.')[1]
    const payload = JSON.parse(atob(p + '='.repeat((4 - p.length % 4) % 4)))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function redirectToKeycloak() {
  const kp = new URLSearchParams({
    client_id:     'swts-frontend',
    redirect_uri:  APP_URL,
    response_type: 'code',
    scope:         'openid',
  })
  window.location.href = `${KEYCLOAK_URL}/realms/SWTS/protocol/openid-connect/auth?${kp}`
}

export default function HomePage() {
  const router          = useRouter()
  const { setAccessToken } = useAuth()
  const ran             = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')

    // ── Case 0: Already showing error (pending/revoked) — do nothing ─────
    if (params.get('error')) return

    // ── Case 1: Returning from Keycloak with ?code= ──────────────────────
    if (code) {
      window.history.replaceState({}, '', '/')
      authLogin(code, APP_URL)
        .then(status => {
          if (status.keycloak_token) setAccessToken(status.keycloak_token)
          router.replace('/dashboard')
        })
        .catch(err => {
          const reason = err?.response?.data?.reason
          const token  = err?.response?.data?.keycloak_token
          if (reason === 'pending' || reason === 'revoked') {
            // Clear any stored token so the localStorage check below doesn't
            // redirect a pending/revoked user straight to /dashboard on reload.
            localStorage.removeItem(TOKEN_KEY)
            window.location.replace(`/?error=${reason}`)
          } else {
            if (token) setAccessToken(token)
            redirectToKeycloak()
          }
        })
      return
    }

    // ── Case 2: Valid token in localStorage → go straight to dashboard ───
    const stored = localStorage.getItem(TOKEN_KEY) ?? ''
    if (isTokenValid(stored)) {
      router.replace('/dashboard')
      return
    }

    // ── Case 3: No valid KC token → must re-authenticate via Keycloak ───
    // Cannot go directly to /dashboard here — dashboard requires a valid KC
    // token. Sending the user there without one causes a redirect loop:
    // dashboard bounces back to / because isTokenValid() fails, which then
    // sends them back to dashboard, ad infinitum.
    redirectToKeycloak()
  }, [router, setAccessToken])

  // Show error from ?error= param (pending / revoked)
  const errorParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('error')
    : null

  if (errorParam === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
          <h1 className="text-xl font-bold mb-1">TrendEdge</h1>
          <p className="text-amber-600 text-sm mt-3 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Your account is pending admin approval. Please wait.
          </p>
        </div>
      </div>
    )
  }

  if (errorParam === 'revoked') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
          <h1 className="text-xl font-bold mb-1">TrendEdge</h1>
          <p className="text-red-500 text-sm mt-3 bg-red-50 border border-red-200 rounded px-3 py-2">
            Your account access has been revoked. Contact support.
          </p>
        </div>
      </div>
    )
  }

  // Blank while redirecting — no visible flash
  return null
}
