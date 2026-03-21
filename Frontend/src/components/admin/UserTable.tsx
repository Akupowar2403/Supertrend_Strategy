// components/admin/UserTable.tsx — Dark theme filterable user list.

import { useState }       from "react"
import UserRow            from "./UserRow"
import type { AdminUser } from "../../hooks/useAdminUsers"

interface Props {
  users:    AdminUser[]
  onAssign: (userId: string, role: string) => void
  onRemove: (userId: string, role: string) => void
  onToggle: (userId: string, enabled: boolean) => void
}

const TH: React.CSSProperties = {
  padding:       "11px 20px",
  textAlign:     "left",
  fontSize:      11,
  fontWeight:    700,
  color:         "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  borderBottom:  "1px solid #334155",
  background:    "#162032",
  whiteSpace:    "nowrap",
}

const ROLE_FILTERS = [
  { value: "all",     label: "All"     },
  { value: "admin",   label: "Admin"   },
  { value: "approve", label: "Approve" },
  { value: "revoke",  label: "Revoke"  },
  { value: "pending", label: "Pending" },
  { value: "no-role", label: "No Role" },
]

export default function UserTable({ users, onAssign, onRemove, onToggle }: Props) {
  const [query,      setQuery]      = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filtered = users.filter(u => {
    const matchQ = !query ||
      u.username?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    const matchR =
      roleFilter === "all"     ? true :
      roleFilter === "no-role" ? u.roles.length === 0 :
      u.roles.includes(roleFilter)
    return matchQ && matchR
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 10, padding: "14px 20px",
        alignItems: "center", borderBottom: "1px solid #334155",
        background: "#1e293b",
      }}>
        {/* Search */}
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569", pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search username or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              borderRadius: 8, fontSize: 13, boxSizing: "border-box",
              border: "1px solid #334155", outline: "none",
              background: "#0f172a", color: "#e2e8f0",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={e =>  (e.currentTarget.style.borderColor = "#334155")}
          />
        </div>

        {/* Role filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {ROLE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${roleFilter === f.value ? "#6366f1" : "#334155"}`,
                background: roleFilter === f.value ? "#1e1b4b" : "#0f172a",
                color: roleFilter === f.value ? "#818cf8" : "#64748b",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Count */}
        <div style={{
          padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: "#0f172a", color: "#475569", border: "1px solid #334155",
          whiteSpace: "nowrap",
        }}>
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={TH}>User</th>
            <th style={TH}>Roles</th>
            <th style={TH}>Joined</th>
            <th style={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "48px", textAlign: "center", fontSize: 13, color: "#475569" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                No users match your search
              </td>
            </tr>
          ) : (
            filtered.map(u => (
              <UserRow key={u.id} user={u} onAssign={onAssign} onRemove={onRemove} onToggle={onToggle} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
