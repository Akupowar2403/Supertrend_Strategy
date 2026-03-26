'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/AuthStore'
import { getStatus, authLogin } from '@/lib/api'

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL      || 'http://localhost:3000'

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
  const router = useRouter()
  const { state: auth, setAccessToken } = useAuth()
  const [checking, setChecking] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')

    // ── Case 1: Returning from Keycloak with ?code= ──────────────────────
    if (code) {
      window.history.replaceState({}, '', '/')
      authLogin(code, APP_URL)
        .then(status => {
          if (status.keycloak_token) setAccessToken(status.keycloak_token)
          if (status.logged_in) {
            router.replace('/dashboard')
          } else {
            redirectToKeycloak()
          }
        })
        .catch(err => {
          const reason = err?.response?.data?.reason
          const token  = err?.response?.data?.keycloak_token
          if (token) setAccessToken(token)
          if (reason === 'pending') {
            setError('Your account is pending admin approval. Please wait.')
          } else if (reason === 'revoked') {
            setError('Your account access has been revoked. Contact support.')
          } else {
            setError(err.message || 'Could not reach backend')
          }
          setChecking(false)
        })
      return
    }

    // ── Case 2: Valid Keycloak token in localStorage → skip round-trip ───
    if (isTokenValid(auth.accessToken)) {
      router.replace('/dashboard')
      return
    }

    // ── Case 3: Check if Zerodha session is active ───────────────────────
    getStatus()
      .then(status => {
        if (status.logged_in) {
          router.replace('/dashboard')
        } else {
          redirectToKeycloak()
        }
      })
      .catch(() => redirectToKeycloak())
  }, [router, setAccessToken, auth.accessToken])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Checking auth…
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
        <h1 className="text-xl font-bold mb-1">TrendEdge</h1>
        <p className="text-slate-500 text-sm mb-4">Supertrend & ATR Trading System</p>
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <button
          onClick={() => redirectToKeycloak()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
