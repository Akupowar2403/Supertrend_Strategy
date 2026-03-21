import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts"
import { useTrades } from "../hooks/useTrades"

interface ChartPoint {
  trade:      number
  pnl:        number
  cumulative: number
  symbol:     string
  reason:     string
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{d.symbol}</div>
      <div style={{ color: "#64748b", marginBottom: 2 }}>Trade #{d.trade} · {d.reason}</div>
      <div style={{ color: d.pnl >= 0 ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
        P&L: {d.pnl >= 0 ? "+" : ""}₹{d.pnl.toFixed(2)}
      </div>
      <div style={{ color: d.cumulative >= 0 ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
        Cumulative: {d.cumulative >= 0 ? "+" : ""}₹{d.cumulative.toFixed(2)}
      </div>
    </div>
  )
}

export default function PnLChart() {
  const { trades } = useTrades()

  const data: ChartPoint[] = []
  let cumulative = 0
  trades.forEach((t, i) => {
    if (t.exit_price) {
      cumulative += t.pnl_amount ?? 0
      data.push({
        trade:      i + 1,
        pnl:        t.pnl_amount ?? 0,
        cumulative: parseFloat(cumulative.toFixed(2)),
        symbol:     t.symbol,
        reason:     t.exit_reason,
      })
    }
  })

  const isPositive = cumulative >= 0
  const gradientId = isPositive ? "greenGrad" : "redGrad"
  const lineColor  = isPositive ? "#059669" : "#dc2626"

  return (
    <div style={{
      background:   "#ffffff",
      border:       "1px solid #e2e8f0",
      borderRadius: 12,
      padding:      "20px",
      boxShadow:    "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>📈</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Cumulative P&L</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
            <div className="num" style={{
              fontSize: 18, fontWeight: 800,
              color: isPositive ? "#15803d" : "#b91c1c",
            }}>
              {cumulative >= 0 ? "+" : ""}₹{cumulative.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trades</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{data.length}</div>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{
          height: 200, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "#94a3b8", border: "1px dashed #e2e8f0", borderRadius: 8,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📉</div>
          <div style={{ fontSize: 13 }}>No closed trades yet</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Chart will appear after first trade exits</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="trade"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={{ stroke: "#f1f5f9" }}
              label={{ value: "Trade #", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${v}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ fill: lineColor, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: lineColor, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

    </div>
  )
}
