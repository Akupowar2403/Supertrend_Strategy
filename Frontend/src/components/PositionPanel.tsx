import { usePosition } from "../hooks/usePosition"

const card: React.CSSProperties = {
  background:   "#ffffff",
  border:       "1px solid #e2e8f0",
  borderRadius: 12,
  padding:      "20px",
  boxShadow:    "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "center",
      padding:        "7px 0",
      borderBottom:   "1px solid #f8fafc",
    }}>
      <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>
      <span className="num" style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{value}</span>
    </div>
  )
}

export default function PositionPanel() {
  const { position, lastExit, lastOrder } = usePosition()

  const isProfit = position
    ? position.unrealized_pnl >= 0
    : lastExit?.result === "PROFIT"

  return (
    <div style={card}>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "linear-gradient(135deg, #fdf4ff, #ede9fe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>💼</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Position</span>
        {position && (
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700,
            padding: "2px 8px", borderRadius: 20,
            background: "#dcfce7", color: "#15803d",
            border: "1px solid #bbf7d0",
          }}>● OPEN</span>
        )}
      </div>

      {position ? (
        <>
          {/* P&L Banner */}
          <div style={{
            padding:      "14px",
            borderRadius: 10,
            background:   isProfit ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "linear-gradient(135deg, #fff1f2, #fee2e2)",
            border:       `1px solid ${isProfit ? "#bbf7d0" : "#fecdd3"}`,
            marginBottom: 14,
            textAlign:    "center",
          }}>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>Unrealized P&L</p>
            <p className="num" style={{
              fontSize: 26, fontWeight: 800,
              color:    isProfit ? "#15803d" : "#b91c1c",
              letterSpacing: "-0.5px",
            }}>
              {position.unrealized_pnl >= 0 ? "+" : ""}₹{position.unrealized_pnl.toFixed(2)}
            </p>
          </div>

          <MetricRow label="Symbol"        value={position.symbol} />
          <MetricRow label="Entry Price"   value={`₹${position.entry_price.toFixed(2)}`} />
          <MetricRow label="Current Price" value={`₹${position.current_price.toFixed(2)}`} />
          <MetricRow label="Peak Price"    value={`₹${position.peak_price.toFixed(2)}`} />
        </>
      ) : lastExit ? (
        <div style={{
          padding:      "14px",
          borderRadius: 10,
          background:   isProfit ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "linear-gradient(135deg, #fff1f2, #fee2e2)",
          border:       `1px solid ${isProfit ? "#bbf7d0" : "#fecdd3"}`,
          textAlign:    "center",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Last Exit · {lastExit.reason}
          </div>
          <p className="num" style={{
            fontSize: 24, fontWeight: 800,
            color:    isProfit ? "#15803d" : "#b91c1c",
            letterSpacing: "-0.5px",
          }}>
            {lastExit.result === "PROFIT" ? "+" : ""}₹{lastExit.pnl_amount.toFixed(2)}
          </p>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
            ₹{lastExit.entry_price.toFixed(2)} → ₹{lastExit.exit_price.toFixed(2)}
            &nbsp;
            <span style={{ color: isProfit ? "#15803d" : "#b91c1c" }}>
              ({lastExit.pnl_points >= 0 ? "+" : ""}{lastExit.pnl_points.toFixed(2)} pts)
            </span>
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: "28px 0", color: "#94a3b8",
          border: "1px dashed #e2e8f0", borderRadius: 10,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13 }}>No open position</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Start engine to begin trading</div>
        </div>
      )}

      {/* Last Order Badge */}
      {lastOrder && (
        <div style={{
          marginTop:    12,
          padding:      "8px 12px",
          borderRadius: 8,
          background:   lastOrder.type === "BUY" ? "#eff6ff" : "#fff1f2",
          border:       `1px solid ${lastOrder.type === "BUY" ? "#bfdbfe" : "#fecdd3"}`,
          display:      "flex",
          justifyContent: "space-between",
          alignItems:   "center",
        }}>
          <span style={{
            fontWeight: 700, fontSize: 12,
            color: lastOrder.type === "BUY" ? "#2563eb" : "#dc2626",
            background: lastOrder.type === "BUY" ? "#dbeafe" : "#fee2e2",
            padding: "2px 8px", borderRadius: 4,
          }}>
            {lastOrder.type}
          </span>
          <span className="num" style={{ color: "#0f172a", fontSize: 13, fontWeight: 600 }}>
            {lastOrder.qty} × ₹{lastOrder.price.toFixed(2)}
          </span>
          <span style={{ color: "#94a3b8", fontSize: 11 }}>#{lastOrder.order_id}</span>
        </div>
      )}

    </div>
  )
}
