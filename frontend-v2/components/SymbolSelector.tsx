'use client'

import { useState, useEffect, useRef } from 'react'
import { searchInstruments } from '@/lib/api'
import type { Instrument } from '@/types/types'

type Exchange = 'NSE' | 'BSE' | 'NFO' | 'MCX'
type SubType  = 'FUT' | 'CE' | 'PE'

interface Props {
  selected: Instrument | null
  onSelect: (inst: Instrument) => void
}

const EXCHANGES: Exchange[] = ['NSE', 'BSE', 'NFO', 'MCX']

const EXCHANGE_META: Record<Exchange, { color: string; bg: string; desc: string }> = {
  NSE: { color: 'text-brand-600',     bg: 'bg-brand-50 border-brand-200',     desc: 'Equities' },
  BSE: { color: 'text-amber-600',     bg: 'bg-amber-50 border-amber-200',     desc: 'Equities' },
  NFO: { color: 'text-violet-600',    bg: 'bg-violet-50 border-violet-200',   desc: 'F&O' },
  MCX: { color: 'text-emerald-600',   bg: 'bg-emerald-50 border-emerald-200', desc: 'Commodities' },
}

export function SymbolSelector({ selected, onSelect }: Props) {
  const [open,      setOpen]      = useState(false)
  const [exchange,  setExchange]  = useState<Exchange>('NSE')
  const [subType,   setSubType]   = useState<SubType>('FUT')
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState<Instrument[]>([])
  const [searching, setSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus search when panel opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const params: Parameters<typeof searchInstruments>[0] = {
        query: q.trim(),
        exchange,
        limit: 20,
      }
      if (exchange === 'NFO' || exchange === 'MCX') params.type = subType
      setResults(await searchInstruments(params))
    } catch { /* ignore */ }
    setSearching(false)
  }

  function handleSelect(inst: Instrument) {
    onSelect(inst)
    setOpen(false)
  }

  function handleExchangeChange(ex: Exchange) {
    setExchange(ex)
    setResults([])
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const showSubType = exchange === 'NFO' || exchange === 'MCX'
  const meta = EXCHANGE_META[exchange]

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all min-w-[240px] group"
      >
        {selected ? (
          <span className="font-display text-sm font-bold text-ink truncate flex-1 text-left">
            {selected.symbol}
          </span>
        ) : (
          <span className="text-sm font-medium text-subtle flex-1 text-left">Select symbol</span>
        )}
        <svg className="w-3.5 h-3.5 text-muted shrink-0 group-hover:text-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </button>

      {/* ── Glass panel ────────────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-in">
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-[0_32px_80px_-8px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.5)] overflow-hidden">

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display text-base font-black text-ink tracking-tight">Select Instrument</p>
                    <p className="text-xs text-muted mt-0.5">NSE · BSE · NFO · MCX</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-slate-100 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Exchange tabs */}
                <div className="flex gap-1.5">
                  {EXCHANGES.map(ex => {
                    const m = EXCHANGE_META[ex]
                    const active = exchange === ex
                    return (
                      <button
                        key={ex}
                        onClick={() => handleExchangeChange(ex)}
                        className={`flex-1 flex flex-col items-center py-2 px-2 rounded-xl border text-center transition-all ${
                          active
                            ? `${m.bg} ${m.color} border-current/20 shadow-sm`
                            : 'border-slate-100 bg-slate-50/60 text-subtle hover:bg-slate-100 hover:text-muted'
                        }`}
                      >
                        <span className={`text-xs font-black tracking-wide ${active ? m.color : ''}`}>{ex}</span>
                        <span className={`text-2xs mt-0.5 ${active ? m.color + '/70' : 'text-ghost'}`}>{m.desc}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Sub-type filter */}
                {showSubType && (
                  <div className="flex gap-1.5 mt-3">
                    {(['FUT', 'CE', 'PE'] as SubType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => { setSubType(t); setResults([]); setTimeout(() => inputRef.current?.focus(), 50) }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          subType === t
                            ? t === 'CE' ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                              : t === 'PE' ? 'bg-red-100 text-red-700 shadow-sm'
                              : 'bg-brand-100 text-brand-700 shadow-sm'
                            : 'bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                      >
                        {t === 'FUT' ? 'Futures' : t === 'CE' ? 'Call (CE)' : 'Put (PE)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search input */}
              <div className="px-5 py-3 border-b border-slate-100/80">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder={
                      exchange === 'NSE' ? 'Search e.g. RELIANCE, INFY…' :
                      exchange === 'BSE' ? 'Search e.g. TCS, HDFC…' :
                      exchange === 'NFO' ? 'Search e.g. NIFTY, BANKNIFTY…' :
                      'Search e.g. GOLD, CRUDEOIL…'
                    }
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink placeholder-subtle focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 focus:bg-white transition-all"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {!searching && results.length === 0 && query.trim().length < 2 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span className="text-3xl text-ghost">⌕</span>
                    <p className="text-xs text-subtle">Type at least 2 characters to search</p>
                  </div>
                )}

                {!searching && query.trim().length >= 2 && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span className="text-3xl text-ghost">○</span>
                    <p className="text-xs text-subtle">No instruments found</p>
                  </div>
                )}

                {results.map((r, i) => (
                  <button
                    key={r.token}
                    onClick={() => handleSelect(r)}
                    className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-brand-50/60 transition-colors text-left ${
                      i !== results.length - 1 ? 'border-b border-slate-100/80' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-ink truncate">{r.symbol}</span>
                        <TypeBadge type={r.type} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {r.name && <span className="text-2xs text-subtle truncate">{r.name}</span>}
                        {r.expiry && (
                          <>
                            {r.name && <span className="text-2xs text-ghost">·</span>}
                            <span className="text-2xs text-subtle">{r.expiry}</span>
                          </>
                        )}
                        {r.strike && (
                          <>
                            <span className="text-2xs text-ghost">·</span>
                            <span className="text-2xs text-subtle">@ ₹{r.strike}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-2xs font-bold text-muted">{r.lot_size} lot</span>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`text-2xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
      type === 'CE'  ? 'bg-emerald-100 text-emerald-700' :
      type === 'PE'  ? 'bg-red-100     text-red-700'     :
      type === 'FUT' ? 'bg-brand-100   text-brand-700'   :
                       'bg-slate-100   text-slate-600'
    }`}>{type}</span>
  )
}
