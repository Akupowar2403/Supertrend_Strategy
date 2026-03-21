import { useTick }   from "../hooks/useTick"
import { useEngine } from "../hooks/useEngine"

type Page = "dashboard" | "trades" | "logs" | "settings"

const PAGE_TITLE: Record<Page, string> = {
  dashboard: "Dashboard",
  trades:    "Trade History",
  logs:      "System Logs",
  settings:  "Settings",
}

export default function TopBar({ page }: { page: Page }) {
  const tick          = useTick()
  const { engineState } = useEngine()

  return (
    <div style={{
      height:         52,
      background:     "#ffffff",
      borderBottom:   "1px solid #e2e8f0",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 24px",
      position:       "sticky",
      top:            0,
      zIndex:         100,
      boxShadow:      "0 1px 3px rgba(0,0,0,0.04)",
    }}>

      {/* Page Title */}
      <div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{PAGE_TITLE[page]}</span>
        {engineState?.symbol && page === "dashboard" && (
          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 10 }}>· {engineState.symbol}</span>
        )}
      </div>

      {/* Live Tick Pill */}
      {tick && (
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          16,
          background:   "#f8fafc",
          border:       "1px solid #e2e8f0",
          borderRadius: 20,
          padding:      "5px 16px",
          fontSize:     13,
        }}>
          <span style={{ fontWeight: 700, color: "#0f172a" }}>{tick.symbol}</span>
          <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
          <span className="num" style={{ fontWeight: 700, color: "#0f172a" }}>₹{tick.close.toFixed(2)}</span>
          <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
          <span style={{
            fontWeight: 700, fontSize: 12,
            color: tick.direction === "GREEN" ? "#15803d" : tick.direction === "RED" ? "#b91c1c" : "#64748b",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", display: "inline-block",
              background: tick.direction === "GREEN" ? "#16a34a" : tick.direction === "RED" ? "#dc2626" : "#94a3b8",
            }} />
            ST {tick.direction}
          </span>
          {tick.atr && (
            <>
              <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
              <span style={{ color: "#64748b" }}>ATR <span className="num">{tick.atr.toFixed(2)}</span></span>
            </>
          )}
        </div>
      )}

      {/* Right — date/time */}
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
      </div>

    </div>
  )
}
