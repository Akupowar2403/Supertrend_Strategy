import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import keycloak from "./keycloak"

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

// ── Pending Approval Screen ────────────────────────────────────────────────────

function PendingScreen({ username, onCheck, checking }: {
  username: string
  onCheck:  () => void
  checking: boolean
}) {
  return (
    <div style={{
      minHeight: "100vh", background: "#ffffff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "24px",
    }}>

      <div style={{
        width: "100%", maxWidth: 440, position: "relative",
      }}>
        {/* Card */}
        <div style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
        }}>
          {/* Top accent bar */}
          <div style={{
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
          }} />

          <div style={{ padding: "40px 40px 36px" }}>
            {/* Icon + Title — centred */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                border: "1px solid #3730a3",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
                boxShadow: "0 8px 24px rgba(99,102,241,0.2)",
              }}>⏳</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.4px" }}>
                Pending Approval
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 28 }}>
              Your account{" "}
              <span style={{
                color: "#a5b4fc", fontWeight: 600,
                background: "#1e1b4b", padding: "1px 8px",
                borderRadius: 6, fontSize: 13,
              }}>{username}</span>
              {" "}has been registered successfully. An administrator needs to approve your access before you can continue.
            </div>

            {/* Status steps */}
            <div style={{
              background: "#0f172a", borderRadius: 12, padding: "16px 18px",
              border: "1px solid #1f2937", marginBottom: 28,
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {[
                { icon: "✓", label: "Account created",       done: true  },
                { icon: "⏳", label: "Awaiting admin approval", done: false },
                { icon: "→", label: "Access granted",         done: false },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: step.done ? "#052e16" : i === 1 ? "#1e1b4b" : "#1f2937",
                    color:      step.done ? "#34d399" : i === 1 ? "#818cf8" : "#4b5563",
                    border:     `1px solid ${step.done ? "#064e3b" : i === 1 ? "#3730a3" : "#374151"}`,
                  }}>{step.icon}</div>
                  <span style={{
                    fontSize: 13, fontWeight: step.done || i === 1 ? 600 : 400,
                    color: step.done ? "#34d399" : i === 1 ? "#c7d2fe" : "#4b5563",
                  }}>{step.label}</span>
                  {i === 1 && (
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      color: "#6366f1", background: "#1e1b4b",
                      padding: "2px 8px", borderRadius: 20,
                      border: "1px solid #3730a3",
                    }}>IN PROGRESS</span>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={onCheck}
                disabled={checking}
                style={{
                  padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  border: "none", cursor: checking ? "not-allowed" : "pointer",
                  background: checking
                    ? "#1f2937"
                    : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: checking ? "#4b5563" : "#fff",
                  transition: "all 0.2s",
                  boxShadow: checking ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {checking ? "Checking…" : "✓ I've been approved — Check Now"}
              </button>

              <button
                onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
                style={{
                  padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: "1px solid #1f2937", background: "transparent",
                  color: "#4b5563", cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#6b7280" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f2937"; e.currentTarget.style.color = "#4b5563" }}
              >Sign out</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
          SWTS — Super Trend Trading System
        </div>
      </div>
    </div>
  )
}

// ── Revoked Screen ─────────────────────────────────────────────────────────────

function RevokedScreen({ username }: { username: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#ffffff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "24px",
    }}>

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <div style={{
          background: "#111827", border: "1px solid #1f2937", borderRadius: 20, overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1)",
        }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, #dc2626, #ef4444, #f97316)" }} />

          <div style={{ padding: "40px 40px 36px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #1a0505, #450a0a)",
                border: "1px solid #7f1d1d",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, boxShadow: "0 8px 24px rgba(220,38,38,0.2)",
              }}>🚫</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.4px" }}>
                Access Revoked
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 28 }}>
              Access for{" "}
              <span style={{
                color: "#fca5a5", fontWeight: 600,
                background: "#1a0505", padding: "1px 8px",
                borderRadius: 6, fontSize: 13,
              }}>{username}</span>
              {" "}has been revoked by an administrator. Please contact support if you believe this is a mistake.
            </div>

            <div style={{
              background: "#0f172a", borderRadius: 12, padding: "14px 18px",
              border: "1px solid #7f1d1d", marginBottom: 28,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>⚠️</span>
              <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                Your session has been terminated. Contact your administrator to restore access.
              </span>
            </div>

            <button
              onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
              style={{
                width: "100%", padding: "12px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                border: "1px solid #7f1d1d", background: "#1a0505",
                color: "#f87171", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#450a0a" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a0505" }}
            >Sign out</button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
          SWTS — Super Trend Trading System
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
        height: "100vh", background: "#0a0f1e", color: "#4b5563",
        fontFamily: "system-ui, sans-serif", fontSize: 14, gap: 10,
      }}>
        <span style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>⏳</span>
        Connecting to auth server…
      </div>
    )
  }

  const roles    = keycloak.tokenParsed?.realm_access?.roles ?? []
  const username = keycloak.tokenParsed?.preferred_username
               ?? keycloak.tokenParsed?.email
               ?? "unknown"

  const value: AuthContextValue = {
    token, username, roles,
    logout:  () => keycloak.logout({ redirectUri: window.location.origin }),
    hasRole: (role) => roles.includes(role),
  }

  // Full access
  if (roles.includes("admin") || roles.includes("approve")) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }

  // Revoked
  if (roles.includes("revoke")) {
    return <RevokedScreen username={username} />
  }

  // Pending OR no role yet (new user before setup-realm runs) — both show pending screen
  return <PendingScreen username={username} onCheck={recheckAccess} checking={checking} />
}
