'use client'

// ─────────────────────────────────────────────────────────────────────────────
// TradeStore — Trade history + order log + signal feed + logs
//
// Manages:
//   - trades       (completed trades from DB via GET /api/trades)
//   - orders       (order log from order:placed events this session)
//   - signals      (buy signals this session from signal:buy)
//   - logs         (backend log stream — last MAX_LOGS entries)
//
// EventBus subscriptions:
//   ORDER_PLACED   → add to orders
//   SIGNAL_BUY     → add to signals
//   LOG_RECEIVED   → add to logs (capped at MAX_LOGS)
//
// NOTE: EXIT_TRIGGERED is NOT handled here.
//   The backend saves the trade to DB after emitting exit:triggered.
//   Components should call setTrades(await getTrades()) with a short delay
//   (≥500ms) after EXIT_TRIGGERED to pick up the committed DB row.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

import { eventBus } from '@/lib/eventBus'
import { EVENTS } from '@/types/types'
import type {
  Trade,
  OrderPlacedPayload,
  SignalBuyPayload,
  LogPayload,
} from '@/types/types'

// Max log entries kept in memory — prevents unbounded growth
const MAX_LOGS = 200

// ── State ─────────────────────────────────────────────────────────────────────

interface TradeStoreState {
  trades:  Trade[]
  orders:  OrderPlacedPayload[]
  signals: SignalBuyPayload[]
  logs:    LogPayload[]
}

const initialState: TradeStoreState = {
  trades:  [],
  orders:  [],
  signals: [],
  logs:    [],
}

// ── Actions ───────────────────────────────────────────────────────────────────

type TradeAction =
  | { type: 'SET_TRADES';    payload: Trade[] }
  | { type: 'ADD_ORDER';     payload: OrderPlacedPayload }
  | { type: 'ADD_SIGNAL';    payload: SignalBuyPayload }
  | { type: 'ADD_LOG';       payload: LogPayload }
  | { type: 'CLEAR_SESSION' }  // clears orders + signals (not DB trades)

// ── Reducer ───────────────────────────────────────────────────────────────────

function tradeReducer(state: TradeStoreState, action: TradeAction): TradeStoreState {
  switch (action.type) {

    // Full trade list loaded from REST API
    case 'SET_TRADES':
      return { ...state, trades: action.payload }

    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }

    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals] }

    case 'ADD_LOG':
      return {
        ...state,
        // Prepend new log, cap at MAX_LOGS
        logs: [action.payload, ...state.logs].slice(0, MAX_LOGS),
      }

    case 'CLEAR_SESSION':
      return { ...state, orders: [], signals: [] }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface TradeContextValue {
  state:    TradeStoreState
  dispatch: React.Dispatch<TradeAction>
  setTrades:    (trades: Trade[]) => void
  clearSession: () => void
}

const TradeContext = createContext<TradeContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function TradeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradeReducer, initialState)

  const setTrades    = useCallback((trades: Trade[]) => dispatch({ type: 'SET_TRADES', payload: trades }), [])
  const clearSession = useCallback(() => dispatch({ type: 'CLEAR_SESSION' }), [])

  // ── EventBus subscriptions ───────────────────────────────────────────────
  useEffect(() => {
    const onOrder  = (data: OrderPlacedPayload) => dispatch({ type: 'ADD_ORDER',  payload: data })
    const onSignal = (data: SignalBuyPayload)    => dispatch({ type: 'ADD_SIGNAL', payload: data })
    const onLog    = (data: LogPayload)          => dispatch({ type: 'ADD_LOG',    payload: data })

    eventBus.on(EVENTS.ORDER_PLACED,   onOrder)
    eventBus.on(EVENTS.SIGNAL_BUY,     onSignal)
    eventBus.on(EVENTS.LOG_RECEIVED,   onLog)

    return () => {
      eventBus.off(EVENTS.ORDER_PLACED,   onOrder)
      eventBus.off(EVENTS.SIGNAL_BUY,     onSignal)
      eventBus.off(EVENTS.LOG_RECEIVED,   onLog)
    }
  }, [])

  return (
    <TradeContext.Provider value={{ state, dispatch, setTrades, clearSession }}>
      {children}
    </TradeContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTrade(): TradeContextValue {
  const ctx = useContext(TradeContext)
  if (!ctx) {
    throw new Error('useTrade() must be used inside <TradeProvider>')
  }
  return ctx
}
