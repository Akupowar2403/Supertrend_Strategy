import { useEffect, useRef } from "react"
import { useLogs } from "../hooks/useLogs"

const LEVEL_META: Record<string, { color: string; bg: string; dot: string }> = {
  INFO:    { color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  WARNING: { color: "#b45309", bg: "#fef3c7", dot: "#f59e0b" },
  ERROR:   { color: "#b91c1c", bg: "#fee2e2", dot: "#ef4444" },
  DEBUG:   { color: "#475569", bg: "#f1f5f9", dot: "#94a3b8" },
}

export default function LogPanel() {
  const { logs, clear } = useLogs()
  const bottomRef       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const errors   = logs.filter(l => l.level === "ERROR").length
  const warnings = logs.filter(l => l.level === "WARNING").length

  return (
    <div style={{
      background:    "#ffffff",
      border:        "1px solid #e2e8f0",
      borderRadius:  12,
      overflow:      "hidden",
      display:       "flex",
      flexDirection: "column",
      height:        "100%",
      boxShadow:     "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
    }}>

      {/* Header */}
      <div style={{
        padding:        "14px 18px",
        borderBottom:   "1px solid #f1f5f9",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        flexShrink:     0,
        background:     "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>System Logs</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#64748b",
            background: "#f1f5f9", padding: "2px 8px", borderRadius: 10,
          }}>{logs.length}</span>
          {errors > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#b91c1c",
              background: "#fee2e2", padding: "2px 7px", borderRadius: 10,
            }}>{errors} errors</span>
          )}
          {warnings > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#b45309",
              background: "#fef3c7", padding: "2px 7px", borderRadius: 10,
            }}>{warnings} warn</span>
          )}
        </div>
        <button onClick={clear} style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
          padding: "5px 12px", cursor: "pointer", color: "#475569",
          fontSize: 12, fontWeight: 500,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecdd3" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#e2e8f0" }}
        >
          ✕ Clear
        </button>
      </div>

      {/* Log entries */}
      <div style={{ overflowY: "auto", flex: 1, padding: "6px 0", background: "#fafcff" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 20px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🖥</div>
            <div style={{ fontSize: 13 }}>Waiting for logs...</div>
          </div>
        ) : logs.map((log, i) => {
          const meta = LEVEL_META[log.level] ?? LEVEL_META.DEBUG
          return (
            <div key={i} style={{
              padding:      "6px 14px",
              display:      "flex",
              gap:          8,
              alignItems:   "flex-start",
              borderBottom: "1px solid #f1f5f9",
              transition:   "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span className="num" style={{
                color: "#94a3b8", fontSize: 10, whiteSpace: "nowrap",
                flexShrink: 0, marginTop: 2, fontFamily: "monospace",
              }}>
                {log.timestamp.split(" ")[1]}
              </span>
              <span style={{
                padding:      "1px 6px",
                borderRadius: 4,
                fontSize:     10,
                fontWeight:   700,
                flexShrink:   0,
                color:        meta.color,
                background:   meta.bg,
                letterSpacing:"0.3px",
              }}>
                {log.level}
              </span>
              <span style={{ color: "#1e293b", fontSize: 12, wordBreak: "break-word", lineHeight: 1.5 }}>
                {log.message}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

    </div>
  )
}
