// components/admin/UserTable.tsx — Dark theme filterable user list.

import { useState }                            from "react"
import UserRow                                 from "./UserRow"
import { isEffectivelyPending, type AdminUser } from "../../hooks/useAdminUsers"

interface Props {
  users:        AdminUser[]
  activeFilter: string
  onAssign:     (userId: string, role: string) => void
  onRemove:     (userId: string, role: string) => void
  onDelete:     (userId: string) => void
}

const TH: React.CSSProperties = {
  padding:       "13px 22px",
  textAlign:     "left",
  fontSize:      12,
  fontWeight:    700,
  color:         "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  borderBottom:  "1px solid #334155",
  background:    "#162032",
  whiteSpace:    "nowrap",
}


export default function UserTable({ users, activeFilter, onAssign, onRemove, onDelete }: Props) {
  const [query, setQuery] = useState("")

  const filtered = users.filter(u => {
    const matchQ = !query ||
      u.username?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    const matchR =
      activeFilter === "all"     ? true :
      activeFilter === "pending" ? isEffectivelyPending(u) :
      activeFilter === "no-role" ? u.roles.length === 0 :
      u.roles.includes(activeFilter)
    return matchQ && matchR
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: "flex", gap: 12, padding: "16px 22px",
        alignItems: "center", borderBottom: "1px solid #334155",
        background: "#1e293b",
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#475569", pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search username or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 38px",
              borderRadius: 9, fontSize: 14, boxSizing: "border-box",
              border: "1px solid #334155", outline: "none",
              background: "#0f172a", color: "#e2e8f0",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={e =>  (e.currentTarget.style.borderColor = "#334155")}
          />
        </div>
        <div style={{
          padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700,
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
            <th style={TH}>Status</th>
            <th style={TH}>Joining</th>
            <th style={TH}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "56px", textAlign: "center", fontSize: 15, color: "#475569" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                No users match your search
              </td>
            </tr>
          ) : (
            filtered.map(u => (
              <UserRow
                key={u.id}
                user={u}
                activeFilter={activeFilter}
                onAssign={onAssign}
                onRemove={onRemove}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
