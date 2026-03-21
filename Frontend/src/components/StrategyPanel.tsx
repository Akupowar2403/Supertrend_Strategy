import { useState } from "react"
import { emit } from "../socket/socket"

const card: React.CSSProperties = {
  background:   "#ffffff",
  border:       "1px solid #e2e8f0",
  borderRadius: 12,
  padding:      "20px",
  boxShadow:    "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
}

function Toggle({ label, description, enabled, onChange }: {
  label: string; description: string
  enabled: boolean; onChange: (val: boolean) => void
}) {
  return (
    <div
      onClick={() => onChange(!enabled)}
      style={{
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
        padding:       "12px 14px",
        borderRadius:  10,
        background:    enabled ? "#f0fdf4" : "#f8fafc",
        border:        `1px solid ${enabled ? "#bbf7d0" : "#e2e8f0"}`,
        marginBottom:  10,
        cursor:        "pointer",
        transition:    "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: enabled ? "#dcfce7" : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, transition: "background 0.2s",
        }}>
          {label === "Supertrend" ? "📈" : "〰️"}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, marginBottom: 1 }}>{label}</div>
          <div style={{ color: "#94a3b8", fontSize: 11 }}>{description}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
          padding: "2px 7px", borderRadius: 4,
          color:      enabled ? "#15803d" : "#94a3b8",
          background: enabled ? "#dcfce7"  : "#f1f5f9",
        }}>
          {enabled ? "ON" : "OFF"}
        </span>
        <div style={{
          width: 38, height: 22, borderRadius: 11,
          background:  enabled ? "#059669" : "#cbd5e1",
          position:    "relative", transition: "background 0.2s", flexShrink: 0,
        }}>
          <div style={{
            position:     "absolute",
            top:          3, left: enabled ? 19 : 3,
            width:        16, height: 16,
            borderRadius: "50%", background: "#fff",
            transition:   "left 0.2s",
            boxShadow:    "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </div>
      </div>
    </div>
  )
}

export default function StrategyPanel() {
  const [supertrend, setSupertrend] = useState(true)
  const [atr,        setAtr]        = useState(true)
  const [mode,       setMode]       = useState<"forward_test" | "live">("forward_test")

  const toggleST = (val: boolean) => {
    setSupertrend(val)
    emit.indicatorToggle({ name: "supertrend", enabled: val })
  }

  const toggleATR = (val: boolean) => {
    setAtr(val)
    emit.indicatorToggle({ name: "atr", enabled: val })
  }

  const switchMode = (m: "forward_test" | "live") => {
    setMode(m)
    emit.modeSwitch({ mode: m })
  }

  return (
    <div style={card}>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>📊</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Strategy</span>
      </div>

      <Toggle
        label="Supertrend"
        description="BUY when ST flips green"
        enabled={supertrend}
        onChange={toggleST}
      />
      <Toggle
        label="ATR Filter"
        description="Block entries on low volatility"
        enabled={atr}
        onChange={toggleATR}
      />

      {/* Mode Switch */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8,
        }}>
          Broker Mode
        </div>
        <div style={{
          display:      "flex",
          background:   "#f8fafc",
          border:       "1px solid #e2e8f0",
          borderRadius: 10,
          padding:      4,
          gap:          4,
        }}>
          {(["forward_test", "live"] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex:         1,
                padding:      "7px 0",
                borderRadius: 8,
                border:       "none",
                fontWeight:   600,
                fontSize:     12,
                cursor:       "pointer",
                transition:   "all 0.2s",
                background:
                  mode === m
                    ? m === "live" ? "#fee2e2" : "#eff6ff"
                    : "transparent",
                color:
                  mode === m
                    ? m === "live" ? "#dc2626" : "#2563eb"
                    : "#94a3b8",
                boxShadow:
                  mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "forward_test" ? "Forward Test" : "🔴 Live Trading"}
            </button>
          ))}
        </div>
        {mode === "live" && (
          <div style={{
            marginTop: 8, padding: "7px 10px", borderRadius: 7,
            background: "#fff7ed", border: "1px solid #fed7aa",
            fontSize: 11, color: "#c2410c", display: "flex", alignItems: "center", gap: 5,
          }}>
            ⚠️ Real orders will be placed. Use with caution.
          </div>
        )}
      </div>

    </div>
  )
}
