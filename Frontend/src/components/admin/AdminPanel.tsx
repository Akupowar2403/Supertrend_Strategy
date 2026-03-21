// components/admin/AdminPanel.tsx — Dark theme user management panel.

import UserTable         from "./UserTable"
import { useAdminUsers } from "../../hooks/useAdminUsers"

const STATS = [
  { key: "total",    label: "Total Users", icon: "👤", accent: "#94a3b8", bg: "#1e293b",  border: "#334155" },
  { key: "admins",   label: "Admins",      icon: "⛨",  accent: "#818cf8", bg: "#1e1b4b", border: "#312e81" },
  { key: "approve",  label: "Approved",    icon: "✅", accent: "#34d399", bg: "#052e16", border: "#064e3b" },
  { key: "revoke",   label: "Revoked",     icon: "🚫", accent: "#f87171", bg: "#1a0505", border: "#7f1d1d" },
  { key: "pending",  label: "Pending",     icon: "⏳", accent: "#fbbf24", bg: "#1c1500", border: "#451a03" },
]

export default function AdminPanel() {
  const { users, loading, error, assignRole, removeRole, setEnabled } = useAdminUsers()

  const counts: Record<string, number> = {
    total:   users.length,
    admins:  users.filter(u => u.roles.includes("admin")).length,
    approve: users.filter(u => u.roles.includes("approve")).length,
    revoke:  users.filter(u => u.roles.includes("revoke")).length,
    pending: users.filter(u => u.roles.includes("pending")).length,
  }

  return (
    <div style={{ padding: "20px 28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, fontSize: 13,
          background: "#1a0505", border: "1px solid #7f1d1d", color: "#f87171",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {STATS.map(s => (
          <div key={s.key} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 12, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.accent, lineHeight: 1 }}>
                {counts[s.key]}
              </div>
              <div style={{ fontSize: 11, color: s.accent, opacity: 0.6, marginTop: 4, fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #334155",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#162032",
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>All Users</div>
          <div style={{ fontSize: 12, color: "#475569" }}>
            {loading ? "Loading…" : `${users.length} total`}
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px", color: "#475569", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            Loading users…
          </div>
        ) : (
          <UserTable users={users} onAssign={assignRole} onRemove={removeRole} onToggle={setEnabled} />
        )}
      </div>

    </div>
  )
}
