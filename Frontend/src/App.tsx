import { useState }    from "react"
import Sidebar          from "./components/Sidebar"
import TopBar           from "./components/TopBar"
import StatsBar         from "./components/StatsBar"
import StrategyPanel    from "./components/StrategyPanel"
import PositionPanel    from "./components/PositionPanel"
import TradeLog         from "./components/TradeLog"
import LogPanel         from "./components/LogPanel"
import AdminLayout      from "./components/admin/AdminLayout"
import { useAuth }      from "./auth/KeycloakProvider"

export type Page = "dashboard" | "trades" | "logs" | "settings"

function SettingsPage() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
      padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      color: "#94a3b8", textAlign: "center",
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>Settings</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>Coming soon</div>
    </div>
  )
}

export default function App() {
  const { hasRole } = useAuth()
  const [page, setPage] = useState<Page>("dashboard")

  // Admin route — render completely separate layout, no main sidebar/topbar
  if (window.location.pathname === "/admin") {
    if (!hasRole("admin")) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100vh", background: "#0f172a", color: "#94a3b8",
          fontFamily: "system-ui, sans-serif", gap: 12,
        }}>
          <div style={{ fontSize: 20, color: "#f1f5f9", fontWeight: 600 }}>Access Denied</div>
          <div style={{ fontSize: 13 }}>You need the <code style={{ color: "#818cf8" }}>admin</code> role to access this page.</div>
          <button
            onClick={() => window.history.pushState({}, "", "/")}
            style={{
              marginTop: 8, padding: "6px 20px", borderRadius: 6,
              border: "1px solid #334155", background: "#1e293b",
              color: "#94a3b8", fontSize: 13, cursor: "pointer",
            }}
          >Go back</button>
        </div>
      )
    }
    return <AdminLayout />
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>

      <Sidebar page={page} setPage={setPage} />

      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        <TopBar page={page} />

        {page === "dashboard" && (
          <>
            <StatsBar />
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <StrategyPanel />
                <PositionPanel />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "58fr 42fr", gap: 16, minHeight: 360 }}>
                <TradeLog />
                <LogPanel />
              </div>
            </div>
          </>
        )}

        {page === "trades" && (
          <div style={{ padding: "20px 24px", flex: 1 }}>
            <TradeLog />
          </div>
        )}

        {page === "logs" && (
          <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: "calc(100vh - 120px)" }}>
              <LogPanel />
            </div>
          </div>
        )}

        {page === "settings" && (
          <div style={{ padding: "20px 24px" }}>
            <SettingsPage />
          </div>
        )}

      </div>
    </div>
  )
}
