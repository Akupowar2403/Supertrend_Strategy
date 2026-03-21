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

      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <div style={{
          height: 60, background: "#0f172a", borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 8px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>Admin</span>
            <span style={{ fontSize: 12, color: "#1e293b" }}>›</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{meta.title}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, color: "#475569",
              padding: "4px 12px", borderRadius: 6,
              background: "#1e293b", border: "1px solid #334155",
            }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() => setRefresh(r => r + 1)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "1px solid #334155", background: "#1e293b",
                color: "#94a3b8", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#293548"; e.currentTarget.style.color = "#e2e8f0" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8" }}
            >↺ Refresh</button>
          </div>
        </div>

        {/* Page heading */}
        <div style={{ padding: "24px 28px 0" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>{meta.title}</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{meta.subtitle}</div>
        </div>

        {page === "users" && <AdminPanel key={refresh} />}

      </div>
    </div>
  )
}
