import { useState } from "react"
import { useEngine } from "../hooks/useEngine"
import { useTimeframes, useInstrumentSearch } from "../hooks/useInstruments"
import type { Instrument } from "../types"

const card: React.CSSProperties = {
  background:   "#ffffff",
  border:       "1px solid #e2e8f0",
  borderRadius: 12,
  padding:      "20px",
  boxShadow:    "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
}

const fieldLabel: React.CSSProperties = {
  display:       "block",
  fontSize:      11,
  fontWeight:    600,
  color:         "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom:  6,
}

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "9px 12px",
  border:       "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize:     13,
  color:        "#0f172a",
  background:   "#f8fafc",
  outline:      "none",
  transition:   "border-color 0.15s",
  boxSizing:    "border-box",
}

function ActionBtn({ color, bg, border, children, onClick, disabled }: {
  color: string; bg: string; border: string
  children: React.ReactNode; onClick?: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex:         1,
        padding:      "9px 0",
        borderRadius: 8,
        border:       `1px solid ${disabled ? "#e2e8f0" : border}`,
        fontWeight:   600,
        fontSize:     13,
        cursor:       disabled ? "not-allowed" : "pointer",
        color:        disabled ? "#94a3b8" : color,
        background:   disabled ? "#f8fafc" : bg,
        transition:   "all 0.15s",
        opacity:      disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}

export default function EngineControls() {
  const timeframes               = useTimeframes()
  const { results, search }      = useInstrumentSearch()
  const { isRunning, isPaused, start, stop, pause, resume } = useEngine()

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
    setQuery(inst.symbol + " — " + inst.name)
    setShowDrop(false)
  }

  const handleStart = () => {
    if (!selected) return
    start({ symbol: selected.symbol, token: selected.token, qty, interval })
  }

  return (
    <div style={card}>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>⚙</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Engine Controls</span>
      </div>

      {/* Symbol Search */}
      <div style={{ marginBottom: 14, position: "relative" }}>
        <label style={fieldLabel}>Symbol</label>
        <input
          style={inputStyle}
          placeholder="Search e.g. RELIANCE, NIFTY"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        />
        {selected && (
          <div style={{
            position: "absolute", right: 10, top: 32,
            fontSize: 10, color: "#059669", fontWeight: 600,
          }}>✓ Selected</div>
        )}
        {showDrop && results.length > 0 && (
          <div style={{
            position:     "absolute",
            top:          "calc(100% + 4px)",
            left:         0, right: 0,
            background:   "#fff",
            border:       "1px solid #e2e8f0",
            borderRadius: 8,
            zIndex:       50,
            maxHeight:    200,
            overflowY:    "auto",
            boxShadow:    "0 8px 24px rgba(0,0,0,0.1)",
          }}>
            {results.map(inst => (
              <div
                key={inst.token}
                onMouseDown={() => handleSelect(inst)}
                style={{
                  padding:      "9px 14px",
                  cursor:       "pointer",
                  borderBottom: "1px solid #f1f5f9",
                  display:      "flex",
                  justifyContent: "space-between",
                  alignItems:   "center",
                  transition:   "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
              >
                <div>
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{inst.symbol}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11, marginLeft: 8 }}>{inst.name}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#2563eb",
                  background: "#eff6ff", padding: "1px 6px", borderRadius: 4,
                }}>{inst.exchange}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interval + Qty row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
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
          <label style={fieldLabel}>Quantity</label>
          <input
            style={inputStyle}
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0 14px" }} />

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {!isRunning && !isPaused && (
          <ActionBtn
            color="#fff" bg="#2563eb" border="#2563eb"
            onClick={handleStart} disabled={!selected}
          >
            ▶ Start Engine
          </ActionBtn>
        )}
        {isRunning && (
          <>
            <ActionBtn color="#92400e" bg="#fef3c7" border="#fde68a" onClick={pause}>
              ⏸ Pause
            </ActionBtn>
            <ActionBtn color="#fff" bg="#dc2626" border="#dc2626" onClick={stop}>
              ■ Stop
            </ActionBtn>
          </>
        )}
        {isPaused && (
          <>
            <ActionBtn color="#fff" bg="#059669" border="#059669" onClick={resume}>
              ▶ Resume
            </ActionBtn>
            <ActionBtn color="#fff" bg="#dc2626" border="#dc2626" onClick={stop}>
              ■ Stop
            </ActionBtn>
          </>
        )}
      </div>

    </div>
  )
}
