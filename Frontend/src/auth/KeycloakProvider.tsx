import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import keycloak from "./keycloak"

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  token:    string | undefined
  username: string | undefined
  roles:    string[]
  logout:   () => void
  hasRole:  (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside KeycloakProvider")
  return ctx
}

// ── Shared layout for blocked screens ─────────────────────────────────────────

function BlockedScreen({
  icon, title, subtitle, note, logoutLabel = "Sign out", extraButton,
}: {
  icon:         string
  title:        string
  subtitle:     string
  note?:        string
  logoutLabel?: string
  extraButton?: ReactNode
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#0f172a", fontFamily: "system-ui, sans-serif",
      padding: "0 24px",
    }}>
      <div style={{
        background: "#1e293b", border: "1px solid #334155", borderRadius: 16,
        padding: "40px 48px", maxWidth: 420, width: "100%", textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: note ? 12 : 24 }}>{subtitle}</div>
        {note && (
          <div style={{
            fontSize: 12, color: "#64748b", background: "#0f172a",
            border: "1px solid #334155", borderRadius: 8,
            padding: "8px 14px", marginBottom: 24, lineHeight: 1.5,
          }}>{note}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {extraButton}
          <button
            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
            style={{
              padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 600,
              border: "1px solid #334155", background: "#0f172a",
              color: "#64748b", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = "#94a3b8" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#64748b" }}
          >{logoutLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── Provider ──────────────────────────────────────────────────────────────────

export default function KeycloakProvider({ children }: { children: ReactNode }) {
  const [ready,    setReady]    = useState(false)
  const [token,    setToken]    = useState<string | undefined>()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required", checkLoginIframe: false })
      .then((authenticated) => {
        if (authenticated) {
          setToken(keycloak.token)
          setReady(true)
          setInterval(() => {
            keycloak.updateToken(60).then((refreshed) => {
              if (refreshed) setToken(keycloak.token)
            })
          }, 60_000)
        }
      })
      .catch(() => console.error("Keycloak init failed"))
  }, [])

  // Force token refresh — used on "Check again" button so role changes reflect immediately
  const recheckAccess = async () => {
    setChecking(true)
    try {
      await keycloak.updateToken(-1)
      setToken(keycloak.token)
    } finally {
      setChecking(false)
    }
  }

  if (!ready) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0f172a", color: "#94a3b8",
        fontFamily: "system-ui, sans-serif", fontSize: 14, gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>⏳</span> Connecting to auth server…
      </div>
    )
  }

  const roles    = keycloak.tokenParsed?.realm_access?.roles ?? []
  const username = keycloak.tokenParsed?.preferred_username ?? ""

  const value: AuthContextValue = {
    token,
    username,
    roles,
    logout:  () => keycloak.logout({ redirectUri: window.location.origin }),
    hasRole: (role) => roles.includes(role),
  }

  // ── Access control logic ───────────────────────────────────────────────────

  // Full access
  if (roles.includes("admin") || roles.includes("approve")) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }

  // Pending — waiting for admin approval
  if (roles.includes("pending")) {
    return (
      <BlockedScreen
        icon="⏳"
        title="Awaiting Approval"
        subtitle={
          `Hi ${username}, your account has been registered and is pending admin approval.`
        }
        note="Once an admin approves your account you will have full access. You can check again without signing out."
        extraButton={
          <button
            onClick={recheckAccess}
            disabled={checking}
            style={{
              padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 700,
              border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff", cursor: checking ? "not-allowed" : "pointer",
              opacity: checking ? 0.7 : 1, transition: "opacity 0.15s",
            }}
          >
            {checking ? "Checking…" : "✓ Check Again"}
          </button>
        }
      />
    )
  }

  // Revoked — admin has explicitly revoked access
  if (roles.includes("revoke")) {
    return (
      <BlockedScreen
        icon="🚫"
        title="Access Revoked"
        subtitle={`Access for ${username} has been revoked by an administrator.`}
        note="If you believe this is a mistake, please contact your admin."
        logoutLabel="Sign out"
      />
    )
  }

  // No role at all
  return (
    <BlockedScreen
      icon="🔒"
      title="No Access"
      subtitle={`Your account (${username}) has no role assigned yet.`}
      note="Contact an admin to assign you a role."
      logoutLabel="Sign out"
    />
  )
}
