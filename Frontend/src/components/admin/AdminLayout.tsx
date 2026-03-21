// components/admin/AdminLayout.tsx — Dark theme layout for admin panel.

import { useState }  from "react"
import AdminSidebar  from "./AdminSidebar"
import AdminPanel    from "./AdminPanel"

type AdminPage = "users"

const PAGE_META: Record<AdminPage, { title: string; subtitle: string }> = {
  users: { title: "User Management", subtitle: "Manage accounts, roles and access" },
}

export default function AdminLayout() {
  const [page, setPage]       = useState<AdminPage>("users")
  const [refresh, setRefresh] = useState(0)
  const meta = PAGE_META[page]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>

      <AdminSidebar page={page} setPage={setPage} />

      <div style={{ marginLeft: 260, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <div style={{
          height: 68, background: "#0f172a", borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 8px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Admin</span>
            <span style={{ fontSize: 14, color: "#334155" }}>›</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{meta.title}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontSize: 13, color: "#475569",
              padding: "6px 14px", borderRadius: 8,
              background: "#1e293b", border: "1px solid #334155",
            }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() => setRefresh(r => r + 1)}
              style={{
                padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                border: "1px solid #334155", background: "#1e293b",
                color: "#94a3b8", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#293548"; e.currentTarget.style.color = "#e2e8f0" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8" }}
            >↺ Refresh</button>
          </div>
        </div>

        {/* Page heading */}
        <div style={{ padding: "28px 32px 0" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>{meta.title}</div>
          <div style={{ fontSize: 15, color: "#475569", marginTop: 6 }}>{meta.subtitle}</div>
        </div>

        {page === "users" && <AdminPanel key={refresh} />}

      </div>
    </div>
  )
}
