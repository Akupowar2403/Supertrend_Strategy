import { useState }          from "react"
import { useSocket }          from "../hooks/useSocket"
import { useEngine }          from "../hooks/useEngine"
import { useTimeframes, useInstrumentSearch } from "../hooks/useInstruments"
import { useAuth }            from "../auth/KeycloakProvider"
import type { Instrument }    from "../types"

type Page = "dashboard" | "trades" | "logs" | "settings"

interface Props {
  page:    Page
  setPage: (p: Page) => void
}

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "trades",    icon: "↕", label: "Trades"    },
  { id: "logs",      icon: "≡", label: "Logs"      },
  { id: "settings",  icon: "⚙", label: "Settings"  },
]

const fieldLabel: React.CSSProperties = {
  display:       "block",
  fontSize:      10,
  fontWeight:    700,
  color:         "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom:  5,
}

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "7px 10px",
  border:       "1px solid #e2e8f0",
  borderRadius: 7,
  fontSize:     12,
  color:        "#0f172a",
  background:   "#f8fafc",
  outline:      "none",
  boxSizing:    "border-box",
}

export default function Sidebar({ page, setPage }: Props) {
  const { connected }   = useSocket()
  const { username, logout, hasRole } = useAuth()
  const { isRunning, isPaused, start, stop, pause, resume } = useEngine()
  const timeframes               = useTimeframes()
  const { results, search }      = useInstrumentSearch()

  const [query,    setQuery]    = useState("")
  const [selected, setSelected] = useState<Instrument | null>(null)
  const [interval, setInterval] = useState("5minute")
  const [qty,      setQty]      = useState(1)
  const [showDrop, setShowDrop] = useState(false)

  const handleSearch = (val: string) => {
    setQuery(val)
    setSelected(null)
    setShowDrop(true)
    search({ query: val, exchange: "NSE" })
  }

  const handleSelect = (inst: Instrument) => {
    setSelected(inst)
    setQuery(inst.symbol)
    setShowDrop(false)
  }

  const handleStart = () => {
    if (!selected) return
    start({ symbol: selected.symbol, token: selected.token, qty, interval })
  }

  return (
    <aside style={{
      width:         240,
      minHeight:     "100vh",
      background:    "#ffffff",
      borderRight:   "1px solid #e2e8f0",
      display:       "flex",
      flexDirection: "column",
      position:      "fixed",
      top:           0, left: 0,
      zIndex:        200,
      boxShadow:     "2px 0 8px rgba(0,0,0,0.04)",
      overflowY:     "auto",
    }}>

      {/* Brand */}
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 15,
            boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
          }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>SWTS</div>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.5px" }}>Supertrend Strategy</div>
          </div>
        </div>
      </div>

      {/* ── Engine Controls ── */}
      <div style={{ padding: "14px 14px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
          Engine Controls
        </div>

        {/* Symbol */}
        <div style={{ marginBottom: 10, position: "relative" }}>
          <label style={fieldLabel}>Symbol</label>
          <input
            style={inputStyle}
            placeholder="Search e.g. RELIANCE"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
          />
          {selected && (
            <span style={{ position: "absolute", right: 8, top: 26, fontSize: 9, color: "#059669", fontWeight: 700 }}>✓</span>
          )}
          {showDrop && results.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
              zIndex: 300, maxHeight: 160, overflowY: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}>
              {results.map(inst => (
                <div
                  key={inst.token}
                  onMouseDown={() => handleSelect(inst)}
                  style={{
                    padding: "8px 10px", cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 12 }}>{inst.symbol}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{inst.exchange}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interval + Qty */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <label style={fieldLabel}>Interval</label>
            <select
              style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
              value={interval}
              onChange={e => setInterval(e.target.value)}
            >
              {timeframes.map(tf => (
                <option key={tf.interval} value={tf.interval}>{tf.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Qty</label>
            <input
              style={inputStyle}
              type="number" min={1} value={qty}
              onChange={e => setQty(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {!isRunning && !isPaused && (
            <button
              onClick={handleStart} disabled={!selected}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                fontWeight: 700, fontSize: 12, cursor: selected ? "pointer" : "not-allowed",
                background: selected ? "#2563eb" : "#f1f5f9",
                color:      selected ? "#fff"    : "#94a3b8",
                transition: "all 0.15s",
              }}
            >▶ Start</button>
          )}
          {isRunning && (
            <>
              <button onClick={pause} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: "#fef3c7", color: "#92400e",
              }}>⏸ Pause</button>
              <button onClick={stop} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: "#fee2e2", color: "#b91c1c",
              }}>■ Stop</button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={resume} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: "#dcfce7", color: "#15803d",
              }}>▶ Resume</button>
              <button onClick={stop} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: "#fee2e2", color: "#b91c1c",
              }}>■ Stop</button>
            </>
          )}
        </div>

        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 14 }} />
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: "0 10px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "1px", padding: "0 10px", marginBottom: 6 }}>
          Navigation
        </div>
        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
              background:  page === item.id ? "#eff6ff" : "transparent",
              color:       page === item.id ? "#2563eb" : "#475569",
              fontWeight:  page === item.id ? 600 : 500,
              fontSize:    13,
              borderLeft:  page === item.id ? "3px solid #2563eb" : "3px solid transparent",
              transition:  "all 0.15s",
            }}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = "#f8fafc" }}
            onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent" }}
          >
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* ── Bottom — Connection + User ── */}
      <div style={{ padding: "14px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 8, marginBottom: 10,
          background: connected ? "#f0fdf4" : "#fff1f2",
          border: `1px solid ${connected ? "#bbf7d0" : "#fecdd3"}`,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#16a34a" : "#dc2626" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: connected ? "#15803d" : "#b91c1c" }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#1d4ed8",
          }}>
            {username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{hasRole("admin") ? "Admin" : "Trader"}</div>
          </div>
          <button
            onClick={logout} title="Logout"
            style={{
              width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0",
              background: "#f8fafc", cursor: "pointer", fontSize: 12, color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b" }}
          >⇥</button>
        </div>
      </div>

    </aside>
  )
}
