// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts — All TypeScript types for SWTS Socket.IO events
// Mirrors the exact payloads emitted by the backend.
// ─────────────────────────────────────────────────────────────────────────────


// ── Server → Client events ───────────────────────────────────────────────────

/** Emitted every poll cycle (~1s) with latest indicator values */
export interface Tick {
  timestamp:  string        // "HH:MM:SS"
  symbol:     string        // "RELIANCE"
  close:      number        // 2450.75
  supertrend: number | null // null if supertrend disabled
  atr:        number | null // null if atr disabled
  direction:  "GREEN" | "RED" | "?"
}

/** Emitted when Supertrend flips green — BUY signal generated */
export interface SignalBuy {
  symbol: string  // "RELIANCE"
  price:  number  // 2450.75
  time:   string  // "09:32:15"
}

/** Emitted after every BUY or SELL order is placed */
export interface OrderPlaced {
  type:     "BUY" | "SELL"
  symbol:   string
  qty:      number
  price:    number
  order_id: string
}

/** Emitted every tick while a position is open */
export interface PositionUpdate {
  symbol:         string
  entry_price:    number
  current_price:  number
  peak_price:     number
  unrealized_pnl: number  // (current - entry) × qty
}

/** Emitted when an exit condition is triggered */
export interface ExitTriggered {
  reason:      "SESSION_END" | "FIXED_SL" | "TRAILING_SL" | "TARGET" | "ST_RED"
  entry_price: number
  exit_price:  number
  pnl_points:  number  // per share
  pnl_amount:  number  // pnl_points × qty
  result:      "PROFIT" | "LOSS"
}

/** Emitted on connect and on every engine state change */
export interface EngineState {
  state:             "IDLE" | "RUNNING" | "PAUSED" | "STOPPED"
  symbol:            string
  interval:          string
  timestamp?:        string       // last candle timestamp
  close?:            number
  supertrend?:       number | null
  st_direction?:     number | null // +1 green | -1 red
  atr?:              number | null
  last_signal?:      "BUY" | "EXIT" | "HOLD"
  last_exit_reason?: string
  position?:         ActivePosition | null
  last_error?:       string
}

/** Current open position — part of EngineState */
export interface ActivePosition {
  symbol:      string
  qty:         number
  entry_price: number
  peak_price:  number
}

/** One timeframe option — emitted as array on connect */
export interface Timeframe {
  interval: string  // "5minute" — passed to engine:start
  label:    string  // "5 Minutes" — shown in dropdown
  minutes:  number  // 5 — for sorting
}

/** One instrument from search results */
export interface Instrument {
  symbol:   string  // "RELIANCE" — passed to engine:start
  token:    number  // 738561 — instrument_token for Zerodha
  name:     string  // "Reliance Industries Ltd"
  exchange: string  // "NSE"
  segment:  string  // "NSE_EQ"
  lot_size: number  // 1 for equity
}

/** One completed trade from DB — returned in trades:history array */
export interface Trade {
  id:          number
  symbol:      string
  qty:         number
  entry_price: number
  exit_price:  number
  pnl_points:  number
  pnl_amount:  number
  result:      "PROFIT" | "LOSS"
  exit_reason: "SESSION_END" | "FIXED_SL" | "TRAILING_SL" | "TARGET" | "ST_RED"
  broker_mode: "forward_test" | "live"
  interval:    string
  entry_time:  string | null  // ISO string
  exit_time:   string | null  // ISO string
}

/** One log entry — emitted for every log.info/warning/error in backend */
export interface LogEntry {
  level:     "DEBUG" | "INFO" | "WARNING" | "ERROR"
  logger:    string   // "engine.trading_engine"
  message:   string   // "[ENGINE] BUY signal ..."
  timestamp: string   // "2026-03-18 09:32:15"
}

/** Emitted when indicator is toggled */
export interface IndicatorState {
  name:    "supertrend" | "atr"
  enabled: boolean
}

/** Emitted when broker mode is switched */
export interface ModeState {
  mode: "forward_test" | "live"
}

/** Error emitted by backend on invalid commands */
export interface ServerError {
  message: string
}


// ── Client → Server events ───────────────────────────────────────────────────

export interface EngineStartPayload {
  symbol:    string
  token:     number
  qty:       number
  interval?: string  // defaults to settings.timeframe on backend
}

export interface IndicatorTogglePayload {
  name:    "supertrend" | "atr"
  enabled: boolean
}

export interface ModeSwitchPayload {
  mode: "forward_test" | "live"
}

export interface InstrumentSearchPayload {
  query:     string
  exchange?: string  // "NSE" | "NFO" | "BSE"
}

export interface TradesHistoryPayload {
  limit?: number  // default 100
}
