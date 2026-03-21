import { useSocket }  from "../hooks/useSocket"
import { useTick }    from "../hooks/useTick"
import { useEngine }  from "../hooks/useEngine"
import { useAuth }    from "../auth/KeycloakProvider"

const STATE_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  RUNNING: { bg: "#dcfce7", color: "#15803d", dot: "#16a34a" },
  PAUSED:  { bg: "#fef9c3", color: "#a16207", dot: "#ca8a04" },
  STOPPED: { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
  IDLE:    { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
}

export default function Header() {
  const { connected }   = useSocket()
  const tick            = useTick()
  const { engineState } = useEngine()
  const { username, logout } = useAuth()

  const state     = engineState?.state ?? "IDLE"
  const stateStyle = STATE_STYLE[state] ?? STATE_STYLE.IDLE

  return (
    <header style={{
      background:    "#ffffff",
      borderBottom:  "1px solid #e2e8f0",
      padding:       "0 24px",
      height:        56,
      display:       "flex",
      alignItems:    "center",
      justifyContent:"space-between",
      position:      "sticky",
      top:           0,
      zIndex:        100,
      boxShadow:     "0 1px 3px rgba(0,0,0,0.06)",
    }}>

      {/* Left — Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.5px",
          boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
        }}>S</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", letterSpacing: "-0.3px" }}>SWTS</div>
          <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>Supertrend Strategy</div>
        </div>
      </div>

      {/* Center — Live tick */}
      {tick ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "6px 18px",
        }}>
          <div>
            <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 1 }}>Symbol</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{tick.symbol}</span>
          </div>
          <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
          <div>
            <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 1 }}>LTP</span>
            <span className="num" style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>₹{tick.close.toFixed(2)}</span>
          </div>
          <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
          <div>
            <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 1 }}>Supertrend</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontWeight: 700, fontSize: 12,
              color: tick.direction === "GREEN" ? "#15803d" : tick.direction === "RED" ? "#b91c1c" : "#64748b",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: tick.direction === "GREEN" ? "#16a34a" : tick.direction === "RED" ? "#dc2626" : "#94a3b8",
                display: "inline-block",
              }} />
              {tick.direction}
            </span>
          </div>
          {tick.atr && (
            <>
              <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 1 }}>ATR</span>
                <span className="num" style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>{tick.atr.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{
          fontSize: 12, color: "#94a3b8",
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "8px 20px",
        }}>
          Awaiting market data...
        </div>
      )}

      {/* Right — Status + User */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Engine state badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 20,
          background: stateStyle.bg, border: `1px solid ${stateStyle.color}30`,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: stateStyle.dot,
            boxShadow: state === "RUNNING" ? `0 0 0 3px ${stateStyle.dot}30` : "none",
            display: "inline-block",
            animation: state === "RUNNING" ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: stateStyle.color, letterSpacing: "0.5px" }}>
            {state}
          </span>
        </div>

        {/* Socket connection */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: connected ? "#16a34a" : "#dc2626",
          }} />
          <span style={{ fontSize: 12, color: "#64748b" }}>{connected ? "Live" : "Offline"}</span>
        </div>

        <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#1d4ed8",
          }}>
            {username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{username}</span>
          <button onClick={logout} style={{
            padding: "4px 12px", borderRadius: 6,
            border: "1px solid #e2e8f0", background: "#f8fafc",
            color: "#64748b", fontSize: 12, cursor: "pointer",
            fontWeight: 500, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecaca" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0" }}
          >
            Logout
          </button>
        </div>
      </div>

    </header>
  )
}
