// ─────────────────────────────────────────────────────────────────────────────
// socket/events.ts — All Socket.IO event name constants
// Never use raw strings like "engine:start" anywhere else in the codebase.
// Always import from here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Server → Client ───────────────────────────────────────────────────────────
export const EVT_TICK               = "tick"
export const EVT_SIGNAL_BUY         = "signal:buy"
export const EVT_ORDER_PLACED       = "order:placed"
export const EVT_POSITION_UPDATE    = "position:update"
export const EVT_EXIT_TRIGGERED     = "exit:triggered"
export const EVT_ENGINE_STATE       = "engine:state"
export const EVT_TIMEFRAMES         = "timeframes"
export const EVT_INSTRUMENTS_RESULTS = "instruments:results"
export const EVT_TRADES_HISTORY     = "trades:history"
export const EVT_LOG                = "log"
export const EVT_INDICATOR_STATE    = "indicator:state"
export const EVT_MODE_STATE         = "mode:state"
export const EVT_ERROR              = "error"

// ── Client → Server ───────────────────────────────────────────────────────────
export const CMD_ENGINE_START       = "engine:start"
export const CMD_ENGINE_STOP        = "engine:stop"
export const CMD_ENGINE_PAUSE       = "engine:pause"
export const CMD_ENGINE_RESUME      = "engine:resume"
export const CMD_INDICATOR_TOGGLE   = "indicator:toggle"
export const CMD_MODE_SWITCH        = "mode:switch"
export const CMD_INSTRUMENTS_SEARCH = "instruments:search"
export const CMD_TRADES_HISTORY     = "trades:history"
