// components/admin/AdminSidebar.tsx — Dark theme sidebar for admin panel.

import { useState } from "react"
import { useAuth }  from "../../auth/KeycloakProvider"

type AdminPage = "users"

interface Props {
  page:    AdminPage
  setPage: (p: AdminPage) => void
}

const NAV: { id: AdminPage; icon: string; label: string }[] = [
  { id: "users", icon: "👥", label: "Users" },
]

export default function AdminSidebar({ page, setPage }: Props) {
  const { username, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <aside style={{
      width: 240, minHeight: "100vh",
      background: "#0f172a",
      borderRight: "1px solid #1e293b",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 200,
      boxShadow: "2px 0 16px rgba(0,0,0,0.3)",
    }}>

      {/* Brand */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>A</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9", letterSpacing: "-0.2px" }}>SWTS Admin</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Management Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "14px 12px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 8px", marginBottom: 8 }}>
          Menu
        </div>

        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 9, cursor: "pointer", marginBottom: 2,
              background:  page === item.id ? "#1e293b" : "transparent",
              color:       page === item.id ? "#818cf8" : "#64748b",
              fontWeight:  page === item.id ? 600 : 500,
              fontSize:    13,
              borderLeft:  page === item.id ? "3px solid #6366f1" : "3px solid transparent",
              transition:  "all 0.15s",
            }}
            onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8" } }}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b" } }}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: "#1e293b", margin: "14px 0" }} />

        {/* Back to App button */}
        <button
          onClick={() => { window.history.pushState({}, "", "/"); window.location.reload() }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 9, cursor: "pointer",
            border: "1px solid #1e293b", background: "#0f172a",
            color: "#64748b", fontSize: 13, fontWeight: 500,
            transition: "all 0.15s", textAlign: "left",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#64748b" }}
        >
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: "#1e293b",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
          }}>←</span>
          Back to App
        </button>
      </nav>

      {/* Profile section */}
      <div style={{ borderTop: "1px solid #1e293b", position: "relative" }}>

        {/* Sign out — only shows when profile is clicked */}
        {profileOpen && (
          <button
            onClick={logout}
            style={{
              width: "100%", padding: "11px 16px",
              background: "#1a0a0a",
              border: "none", borderTop: "1px solid #7f1d1d",
              color: "#f87171", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#27131a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1a0a0a")}
          >
            <span style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: "#7f1d1d",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            }}>⇥</span>
            Sign out
          </button>
        )}

        {/* Profile row */}
        <div
          onClick={() => setProfileOpen(v => !v)}
          style={{
            padding: "13px 16px", display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", transition: "background 0.15s",
            background: profileOpen ? "#1e293b" : "transparent",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
          onMouseLeave={e => (e.currentTarget.style.background = profileOpen ? "#1e293b" : "transparent")}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #312e81, #4338ca)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#a5b4fc",
            border: "2px solid #3730a3",
          }}>
            {username?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username}
            </div>
            <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 600 }}>Administrator</div>
          </div>
          <span style={{
            fontSize: 9, color: "#334155",
            transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s", display: "inline-block",
          }}>▼</span>
        </div>

      </div>
    </aside>
  )
}
