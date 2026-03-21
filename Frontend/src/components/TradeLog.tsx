import { useTrades } from "../hooks/useTrades"

const REASON_META: Record<string, { color: string; bg: string; label: string }> = {
  TARGET:      { color: "#15803d", bg: "#dcfce7", label: "Target" },
  FIXED_SL:    { color: "#b91c1c", bg: "#fee2e2", label: "Fixed SL" },
  TRAILING_SL: { color: "#b45309", bg: "#fef3c7", label: "Trail SL" },
  SESSION_END: { color: "#475569", bg: "#f1f5f9", label: "Session" },
  ST_RED:      { color: "#7c3aed", bg: "#ede9fe", label: "ST Red" },
}

export default function TradeLog() {
  const { trades, refresh } = useTrades()

  const wins   = trades.filter(t => t.pnl_amount > 0).length
  const losses = trades.filter(t => t.pnl_amount <= 0 && t.exit_price).length

  return (
    <div style={{
      background:    "#ffffff",
      border:        "1px solid #e2e8f0",
      borderRadius:  12,
      overflow:      "hidden",
      display:       "flex",
      flexDirection: "column",
      boxShadow:     "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
    }}>

      {/* Header */}
      <div style={{
        padding:        "14px 18px",
        borderBottom:   "1px solid #f1f5f9",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        background:     "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Trade Log</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#64748b",
            background: "#f1f5f9", padding: "2px 8px", borderRadius: 10,
          }}>{trades.length} trades</span>
          {wins > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#15803d",
              background: "#dcfce7", padding: "2px 8px", borderRadius: 10,
            }}>{wins}W</span>
          )}
          {losses > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#b91c1c",
              background: "#fee2e2", padding: "2px 8px", borderRadius: 10,
            }}>{losses}L</span>
          )}
        </div>
        <button onClick={refresh} style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
          padding: "5px 12px", cursor: "pointer", color: "#475569",
          fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
              {["#", "Symbol", "Entry ₹", "Exit ₹", "Points", "P&L", "Reason", "Mode", "Time"].map(h => (
                <th key={h} style={{
                  padding:       "9px 14px",
                  textAlign:     "left",
                  fontSize:      10,
                  fontWeight:    700,
                  color:         "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom:  "2px solid #e2e8f0",
                  whiteSpace:    "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 13 }}>No trades yet</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Trades will appear here once the engine executes</div>
                </td>
              </tr>
            ) : trades.map((t, idx) => {
              const reason = REASON_META[t.exit_reason] ?? { color: "#64748b", bg: "#f1f5f9", label: t.exit_reason }
              const isWin  = t.pnl_amount > 0
              return (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                  <td style={{ padding: "9px 14px", color: "#cbd5e1", fontSize: 11 }}>{idx + 1}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{t.symbol}</span>
                  </td>
                  <td className="num" style={{ padding: "9px 14px", color: "#475569", fontSize: 13 }}>
                    {t.entry_price.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "9px 14px", color: "#475569", fontSize: 13 }}>
                    {t.exit_price.toFixed(2)}
                  </td>
                  <td className="num" style={{
                    padding: "9px 14px", fontWeight: 700, fontSize: 13,
                    color:   t.pnl_points >= 0 ? "#15803d" : "#b91c1c",
                  }}>
                    {t.pnl_points >= 0 ? "+" : ""}{t.pnl_points.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "9px 14px" }}>
                    <span style={{
                      fontWeight: 800, fontSize: 13,
                      color: isWin ? "#15803d" : "#b91c1c",
                    }}>
                      {t.pnl_amount >= 0 ? "+" : ""}₹{t.pnl_amount.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: 5,
                      fontSize: 11, fontWeight: 700,
                      color: reason.color, background: reason.bg,
                    }}>
                      {reason.label}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: 5,
                      fontSize: 11, fontWeight: 600,
                      background: t.broker_mode === "live" ? "#fee2e2" : "#eff6ff",
                      color:      t.broker_mode === "live" ? "#dc2626" : "#2563eb",
                    }}>
                      {t.broker_mode === "live" ? "LIVE" : "FT"}
                    </span>
                  </td>
                  <td className="num" style={{ padding: "9px 14px", color: "#94a3b8", fontSize: 11, whiteSpace: "nowrap" }}>
                    {t.exit_time ? new Date(t.exit_time).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
