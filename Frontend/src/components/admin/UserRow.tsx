// components/admin/UserRow.tsx — Dark theme single user row.

import { useState }       from "react"
import RoleBadge          from "./RoleBadge"
import type { AdminUser } from "../../hooks/useAdminUsers"

const ASSIGNABLE_ROLES = ["admin", "approve", "revoke", "pending"] as const

interface Props {
  user:     AdminUser
  onAssign: (userId: string, role: string) => void
  onRemove: (userId: string, role: string) => void
  onToggle: (userId: string, enabled: boolean) => void
}

export default function UserRow({ user, onAssign, onRemove, onToggle }: Props) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const unassigned = ASSIGNABLE_ROLES.filter(r => !user.roles.includes(r))

  return (
    <tr
      style={{ borderBottom: "1px solid #1e293b", transition: "background 0.1s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#162032")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Avatar + name */}
      <td style={{ padding: "13px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #312e81, #4338ca)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#a5b4fc",
            border: "2px solid #3730a3",
          }}>
            {user.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>{user.username}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{user.email || "—"}</div>
          </div>
        </div>
      </td>

      {/* Roles */}
      <td style={{ padding: "13px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {user.roles.length === 0
            ? <span style={{ fontSize: 12, color: "#334155", fontStyle: "italic" }}>No role</span>
            : user.roles.map(r => (
                <RoleBadge key={r} role={r} onRemove={() => onRemove(user.id, r)} />
              ))
          }

          {unassigned.length > 0 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowRoleMenu(v => !v)}
                style={{
                  padding: "3px 9px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                  border: "1px dashed #334155", background: "transparent",
                  color: "#475569", cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#818cf8" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#475569" }}
              >+ role</button>

              {showRoleMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
                  background: "#1e293b", border: "1px solid #334155", borderRadius: 9,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)", minWidth: 110, overflow: "hidden",
                }}>
                  {unassigned.map(r => (
                    <div
                      key={r}
                      onMouseDown={() => { onAssign(user.id, r); setShowRoleMenu(false) }}
                      style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#94a3b8", transition: "all 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#2d3f55"; e.currentTarget.style.color = "#e2e8f0" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8" }}
                    >{r}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Joined */}
      <td style={{ padding: "13px 20px", fontSize: 12, color: "#475569" }}>
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—"}
      </td>

      {/* Status toggle */}
      <td style={{ padding: "13px 20px" }}>
        <button
          onClick={() => onToggle(user.id, !user.enabled)}
          style={{
            padding: "4px 13px", borderRadius: 12,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            background:  user.enabled ? "#052e16" : "#1a0505",
            color:       user.enabled ? "#34d399"  : "#f87171",
            border:      `1px solid ${user.enabled ? "#064e3b" : "#7f1d1d"}`,
            transition:  "all 0.15s",
          }}
        >
          {user.enabled ? "● Active" : "○ Disabled"}
        </button>
      </td>
    </tr>
  )
}
