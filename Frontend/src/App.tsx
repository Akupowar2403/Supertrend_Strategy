import { useState } from "react"
import Sidebar       from "./components/Sidebar"
import TopBar        from "./components/TopBar"
import StatsBar      from "./components/StatsBar"
import StrategyPanel  from "./components/StrategyPanel"
import PositionPanel  from "./components/PositionPanel"
import TradeLog       from "./components/TradeLog"
import LogPanel       from "./components/LogPanel"

type Page = "dashboard" | "trades" | "logs" | "settings"

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
  const [page, setPage] = useState<Page>("dashboard")

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <Sidebar page={page} setPage={setPage} />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        <TopBar page={page} />

        {page === "dashboard" && (
          <>
            <StatsBar />
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Row 1 — Strategy + Position */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <StrategyPanel />
                <PositionPanel />
              </div>

              {/* Row 2 — Trade Log + Logs */}
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
