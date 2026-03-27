const COLORS: Record<string, { bg: string; color: string; border: string }> = {
  admin:   { bg: '#1e1b4b', color: '#818cf8', border: '#312e81' },
  approve: { bg: '#052e16', color: '#34d399', border: '#064e3b' },
  revoke:  { bg: '#1a0505', color: '#f87171', border: '#7f1d1d' },
  pending: { bg: '#1c1500', color: '#fbbf24', border: '#451a03' },
}
const DEFAULT = { bg: '#1e293b', color: '#64748b', border: '#334155' }

interface Props {
  role:      string
  onRemove?: () => void
}

export default function RoleBadge({ role, onRemove }: Props) {
  const c = COLORS[role] ?? DEFAULT
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 14,
      fontSize: 13, fontWeight: 700,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.3px',
    }}>
      {role}
      {onRemove && (
        <span
          onClick={e => { e.stopPropagation(); onRemove() }}
          title={`Remove ${role}`}
          style={{ cursor: 'pointer', fontSize: 11, opacity: 0.5, marginLeft: 2 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
        >✕</span>
      )}
    </span>
  )
}
