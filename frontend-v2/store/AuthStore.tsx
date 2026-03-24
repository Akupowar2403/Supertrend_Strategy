'use client'

// ─────────────────────────────────────────────────────────────────────────────
// AuthStore — Authentication + WebSocket connection state
//
// Manages:
//   - isLoggedIn, userName, userId  (from GET /status)
//   - wsConnected                   (from Socket.IO connect/disconnect)
//   - tickerStatus                  (from GET /ticker/status)
//
// EventBus subscriptions:
//   WS_CONNECTED    → set wsConnected = true
//   WS_DISCONNECTED → set wsConnected = false
//   SOCKET_ERROR    → set wsConnected = false
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
import type { TickerStatus } from '@/types/types'

// ── State ─────────────────────────────────────────────────────────────────────

interface AuthState {
  isLoggedIn:   boolean
  userName:     string
  userId:       string
  wsConnected:  boolean
  tickerStatus: TickerStatus | null
}

const initialState: AuthState = {
  isLoggedIn:   false,
  userName:     '',
  userId:       '',
  wsConnected:  false,
  tickerStatus: null,
}

// ── Actions ───────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'SET_AUTH';          payload: { isLoggedIn: boolean; userName: string; userId: string } }
  | { type: 'SET_WS_CONNECTED';  payload: boolean }
  | { type: 'SET_TICKER_STATUS'; payload: TickerStatus }
  | { type: 'LOGOUT' }

// ── Reducer ───────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {

    case 'SET_AUTH':
      return {
        ...state,
        isLoggedIn: action.payload.isLoggedIn,
        userName:   action.payload.userName,
        userId:     action.payload.userId,
      }

    case 'SET_WS_CONNECTED':
      return { ...state, wsConnected: action.payload }

    case 'SET_TICKER_STATUS':
      return { ...state, tickerStatus: action.payload }

    case 'LOGOUT':
      return { ...initialState }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state:    AuthState
  dispatch: React.Dispatch<AuthAction>
  // Convenience setters
  setAuth:         (isLoggedIn: boolean, userName: string, userId: string) => void
  setTickerStatus: (status: TickerStatus) => void
  logout:          () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ── Convenience setters ──────────────────────────────────────────────────
  const setAuth = useCallback(
    (isLoggedIn: boolean, userName: string, userId: string) =>
      dispatch({ type: 'SET_AUTH', payload: { isLoggedIn, userName, userId } }),
    []
  )

  const setTickerStatus = useCallback(
    (status: TickerStatus) =>
      dispatch({ type: 'SET_TICKER_STATUS', payload: status }),
    []
  )

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [])

  // ── EventBus subscriptions ───────────────────────────────────────────────
  useEffect(() => {
    const onConnected    = () => dispatch({ type: 'SET_WS_CONNECTED', payload: true })
    const onDisconnected = () => dispatch({ type: 'SET_WS_CONNECTED', payload: false })
    const onError        = () => dispatch({ type: 'SET_WS_CONNECTED', payload: false })

    eventBus.on(EVENTS.WS_CONNECTED,    onConnected)
    eventBus.on(EVENTS.WS_DISCONNECTED, onDisconnected)
    eventBus.on(EVENTS.SOCKET_ERROR,    onError)

    return () => {
      eventBus.off(EVENTS.WS_CONNECTED,    onConnected)
      eventBus.off(EVENTS.WS_DISCONNECTED, onDisconnected)
      eventBus.off(EVENTS.SOCKET_ERROR,    onError)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ state, dispatch, setAuth, setTickerStatus, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>')
  }
  return ctx
}
