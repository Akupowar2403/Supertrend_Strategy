'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ZerodhaConnect — Zerodha broker connection card for Settings page.
//
// States:
//   loading      — fetching /api/zerodha/status
//   connected    — token valid, show user info + Disconnect button
//   form         — no credentials in DB, show credential entry form
//   saving       — form submitted, waiting for TOTP login response
//   totp_failed  — TOTP failed, show OAuth redirect button
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/store/AuthStore'
import {
  getZerodhaStatus,
  saveZerodhaCredentials,
  logoutUser,
} from '@/lib/api'
import type { ZerodhaStatus } from '@/types/types'

type ViewState = 'loading' | 'connected' | 'form' | 'saving' | 'totp_failed'

const EMPTY_FORM = {
  api_key:    '',
  api_secret: '',
  user_id:    '',
  password:   '',
  totp_key:   '',
}

export function ZerodhaConnect() {
  const { setAuth, logout } = useAuth()

  const [view,      setView]      = useState<ViewState>('loading')
  const [status,    setStatus]    = useState<ZerodhaStatus | null>(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [showPass,  setShowPass]  = useState(false)
  const [showTotp,  setShowTotp]  = useState(false)
  const [loginUrl,  setLoginUrl]  = useState('')
  const [error,     setError]     = useState('')
  const [disconnecting, setDisconnecting] = useState(false)

  // ── Load status on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    setView('loading')
    try {
      const s = await getZerodhaStatus()
      setStatus(s)
      if (s.connected) {
        setView('connected')
        setAuth(true, s.user_name ?? '', s.user_id ?? '')
      } else {
        setView('form')
      }
    } catch {
      setView('form')
    }
  }

  // ── Submit credentials ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setView('saving')

    try {
      const res = await saveZerodhaCredentials(form)
      if (res.connected) {
        setAuth(true, res.user_name ?? '', res.user_id ?? '')
        await fetchStatus()
      } else {
        // TOTP failed — show OAuth fallback
        setLoginUrl(res.login_url ?? '')
        setError(res.error ?? 'TOTP login failed')
        setView('totp_failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save credentials'
      setError(msg)
      setView('form')
    }
  }

  // ── Disconnect ─────────────────────────────────────────────────────────────
  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await logoutUser()
    } catch { /* ignore */ }
    logout()
    setForm(EMPTY_FORM)
    setStatus(null)
    setView('form')
    setDisconnecting(false)
  }

  function handleField(key: keyof typeof EMPTY_FORM, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (view === 'loading') {
    return (
      <div
        className="rounded-2xl p-5 flex items-center gap-3"
        style={{ background: 'var(--theme-glass-card)', border: '1px solid var(--theme-glass-border)' }}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
          style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}
        />
        <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
          Checking Zerodha connection…
        </span>
      </div>
    )
  }

  if (view === 'connected' && status) {
    const lastLogin = status.last_login_at
      ? new Date(status.last_login_at).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
      : null

    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--theme-glass-card)', border: '1px solid var(--theme-glass-border)' }}
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Green status dot */}
            <div className="relative shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--theme-profit)', boxShadow: '0 0 8px var(--theme-profit)' }}
              />
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{ background: 'var(--theme-profit)' }}
              />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--theme-profit)' }}>
                Connected to Zerodha
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                TOTP Auto-login · Refreshes daily at 8:30 AM
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: 'var(--theme-loss-bg)',
              border:     '1px solid var(--theme-loss-border)',
              color:      'var(--theme-loss)',
              opacity:    disconnecting ? 0.6 : 1,
            }}
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>

        {/* User info row */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'var(--theme-profit-bg)', border: '1px solid var(--theme-profit-border)' }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
            style={{ background: 'var(--theme-profit-border)', color: 'var(--theme-profit)' }}
          >
            {(status.user_name ?? 'Z').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--theme-text-primary)' }}>
              {status.user_name ?? '—'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              {status.user_id ?? '—'}
              {lastLogin && <span className="ml-2 opacity-70">· Last login: {lastLogin}</span>}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'totp_failed') {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--theme-glass-card)', border: '1px solid var(--theme-loss-border)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-loss-bg)', border: '1px solid var(--theme-loss-border)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"
              style={{ color: 'var(--theme-loss)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--theme-loss)' }}>
              TOTP Auto-login Failed
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
              {error}
            </p>
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
          Your credentials were saved. You can connect manually via Zerodha's login page.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => { if (loginUrl) window.location.href = loginUrl }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'var(--theme-accent)',
              color:      '#fff',
              boxShadow:  'var(--theme-accent-glow)',
            }}
          >
            Connect via Zerodha →
          </button>
          <button
            onClick={() => { setView('form'); setError('') }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'var(--theme-glass-card)',
              border:     '1px solid var(--theme-glass-border)',
              color:      'var(--theme-text-muted)',
            }}
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  // ── Form (default + saving state) ──────────────────────────────────────────
  const isSaving = view === 'saving'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--theme-glass-card)', border: '1px solid var(--theme-glass-border)' }}
    >
      {/* Form header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid var(--theme-glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--theme-accent-soft)', border: '1px solid var(--theme-accent-border)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"
              style={{ color: 'var(--theme-accent)' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              Connect Zerodha Account
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
              Credentials are encrypted and stored securely
            </p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 flex flex-col gap-3">

        {error && (
          <div
            className="px-3 py-2 rounded-xl text-xs"
            style={{ background: 'var(--theme-loss-bg)', border: '1px solid var(--theme-loss-border)', color: 'var(--theme-loss)' }}
          >
            {error}
          </div>
        )}

        <Field label="API Key" hint="From developer.zerodha.com">
          <input
            type="text"
            value={form.api_key}
            onChange={e => handleField('api_key', e.target.value)}
            placeholder="e.g. abc123xyz789"
            disabled={isSaving}
            required
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
            style={inputStyle}
          />
        </Field>

        <Field label="API Secret" hint="From developer.zerodha.com">
          <input
            type="password"
            value={form.api_secret}
            onChange={e => handleField('api_secret', e.target.value)}
            placeholder="••••••••••••••••"
            disabled={isSaving}
            required
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
            style={inputStyle}
          />
        </Field>

        <Field label="Client ID" hint="Your Zerodha user ID e.g. BG9107">
          <input
            type="text"
            value={form.user_id}
            onChange={e => handleField('user_id', e.target.value.toUpperCase())}
            placeholder="e.g. BG9107"
            disabled={isSaving}
            required
            className="w-full rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none transition-all"
            style={inputStyle}
          />
        </Field>

        <Field label="Password" hint="Your Zerodha login password">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => handleField('password', e.target.value)}
              placeholder="••••••••"
              disabled={isSaving}
              required
              className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none transition-all"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                {showPass
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
        </Field>

        <Field label="TOTP Secret Key" hint="Base32 key from Zerodha 2FA setup page">
          <div className="relative">
            <input
              type={showTotp ? 'text' : 'password'}
              value={form.totp_key}
              onChange={e => handleField('totp_key', e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PQ"
              disabled={isSaving}
              required
              className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm font-mono focus:outline-none transition-all"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowTotp(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                {showTotp
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }
              </svg>
            </button>
          </div>
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all mt-1 flex items-center justify-center gap-2"
          style={{
            background: isSaving ? 'var(--theme-glass-card)' : 'var(--theme-accent)',
            border:     isSaving ? '1px solid var(--theme-glass-border)' : 'none',
            color:      isSaving ? 'var(--theme-text-muted)' : '#fff',
            boxShadow:  isSaving ? 'none' : 'var(--theme-accent-glow)',
          }}
        >
          {isSaving && (
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--theme-text-muted)', borderTopColor: 'transparent' }}
            />
          )}
          {isSaving ? 'Connecting…' : 'Save & Connect'}
        </button>

      </div>
    </form>
  )
}

// ── Field wrapper ──────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
  label:    string
  hint?:    string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          {label}
        </label>
        {hint && (
          <span className="text-2xs" style={{ color: 'var(--theme-text-ghost)' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Shared input style ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background:  'var(--theme-input-bg)',
  border:      '1px solid var(--theme-input-border)',
  color:       'var(--theme-input-text)',
}
