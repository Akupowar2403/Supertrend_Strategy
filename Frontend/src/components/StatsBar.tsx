import { useTrades }  from "../hooks/useTrades"
import { useEngine }  from "../hooks/useEngine"

function StatCard({ label, value, sub, accent }: {
  label:   string
  value:   React.ReactNode
  sub?:    string
  accent?: string
}) {
  return (
    <div style={{
      background:   "#ffffff",
      border:       "1px solid #e2e8f0",
      borderRadius: 10,
      padding:      "12px 18px",
      borderLeft:   accent ? `3px solid ${accent}` : undefined,
      boxShadow:    "0 1px 3px rgba(0,0,0,0.04)",
      flex:         1,
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function StatsBar() {
  const { trades }      = useTrades()
  const { engineState } = useEngine()

  const closed  = trades.filter(t => t.exit_price)
  const wins    = closed.filter(t => t.pnl_amount > 0)
  const losses  = closed.filter(t => t.pnl_amount <= 0)
  const totalPnl = closed.reduce((s, t) => s + (t.pnl_amount ?? 0), 0)
  const winRate  = closed.length ? Math.round((wins.length / closed.length) * 100) : 0

  const pnlColor = totalPnl >= 0 ? "#15803d" : "#b91c1c"
  const pnlAccent = totalPnl >= 0 ? "#16a34a" : "#dc2626"

  return (
    <div style={{
      display:       "flex",
      gap:           12,
      padding:       "12px 24px",
      background:    "#f8fafc",
      borderBottom:  "1px solid #e2e8f0",
    }}>

      <StatCard
        label="Total P&L"
        value={
          <span style={{ color: pnlColor }}>
            {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toFixed(2)}
          </span>
        }
        sub={`${closed.length} closed trades`}
        accent={pnlAccent}
      />

      <StatCard
        label="Win Rate"
        value={`${winRate}%`}
        sub={`${wins.length}W · ${losses.length}L`}
        accent="#2563eb"
      />

      <StatCard
        label="Total Trades"
        value={trades.length}
        sub="all time"
        accent="#7c3aed"
      />

      <StatCard
        label="Engine"
        value={
          <span style={{
            color: engineState?.state === "RUNNING" ? "#15803d"
                 : engineState?.state === "PAUSED"  ? "#a16207"
                 : "#475569",
          }}>
            {engineState?.state ?? "IDLE"}
          </span>
        }
        sub={engineState?.symbol ?? "—"}
        accent="#f59e0b"
      />

      <StatCard
        label="Interval"
        value={engineState?.interval ?? "—"}
        sub="candle timeframe"
        accent="#0891b2"
      />

    </div>
  )
}
