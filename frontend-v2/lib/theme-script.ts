// ─────────────────────────────────────────────────────────────────────────────
// Theme blocking script — injected as an inline <script> in <head>.
// Runs synchronously before first paint so there is zero theme flash on reload.
// Reads the saved theme from localStorage and sets all --theme-* CSS vars on
// <html> before React hydrates.
// ─────────────────────────────────────────────────────────────────────────────

// Each entry: [gradient, glassCard, glassPanel, glassTopbar, glassBorder,
//   glassBorderStrong, glassShadow, textPrimary, textSecondary, textMuted,
//   textGhost, accent, accentSoft, accentBorder, accentGlow,
//   profit, profitBg, profitBorder, profitGlow,
//   loss, lossBg, lossBorder, lossGlow,
//   warn, warnBg, warnBorder,
//   inputBg, inputBorder, inputFocusBorder, inputFocusRing, inputText, inputPlaceholder]

const THEME_DATA: Record<string, string[]> = {
  midnight: [
    'linear-gradient(135deg,#0f0c29 0%,#1a1545 50%,#302b63 100%)',
    'rgba(129,140,248,0.06)','rgba(129,140,248,0.04)','rgba(15,12,41,0.75)',
    'rgba(255,255,255,0.10)','rgba(255,255,255,0.22)','0 4px 32px rgba(0,0,0,0.45)',
    '#ede9ff','#b0a8d8','#6c5fa0','#3d3566',
    '#818cf8','rgba(129,140,248,0.15)','rgba(129,140,248,0.38)','0 0 18px rgba(129,140,248,0.55)',
    '#34d399','rgba(52,211,153,0.12)','rgba(52,211,153,0.32)','0 0 14px rgba(52,211,153,0.50)',
    '#f87171','rgba(248,113,113,0.12)','rgba(248,113,113,0.32)','0 0 14px rgba(248,113,113,0.50)',
    '#fbbf24','rgba(251,191,36,0.12)','rgba(251,191,36,0.32)',
    'rgba(255,255,255,0.07)','rgba(255,255,255,0.13)','#818cf8','rgba(129,140,248,0.22)','#ede9ff','#6c5fa0',
  ],
  aurora: [
    'linear-gradient(135deg,#0d1b2a 0%,#0f2520 50%,#1b4332 100%)',
    'rgba(45,212,191,0.07)','rgba(45,212,191,0.04)','rgba(13,27,42,0.78)',
    'rgba(255,255,255,0.09)','rgba(255,255,255,0.20)','0 4px 32px rgba(0,0,0,0.48)',
    '#dcfce7','#99d6c0','#4aba96','#2a6b52',
    '#2dd4bf','rgba(45,212,191,0.14)','rgba(45,212,191,0.38)','0 0 18px rgba(45,212,191,0.55)',
    '#4ade80','rgba(74,222,128,0.12)','rgba(74,222,128,0.32)','0 0 14px rgba(74,222,128,0.50)',
    '#f87171','rgba(248,113,113,0.12)','rgba(248,113,113,0.32)','0 0 14px rgba(248,113,113,0.50)',
    '#fbbf24','rgba(251,191,36,0.12)','rgba(251,191,36,0.32)',
    'rgba(255,255,255,0.07)','rgba(255,255,255,0.11)','#2dd4bf','rgba(45,212,191,0.22)','#dcfce7','#4aba96',
  ],
  cosmic: [
    'linear-gradient(135deg,#0a0015 0%,#120828 50%,#1e0a40 100%)',
    'rgba(167,139,250,0.07)','rgba(167,139,250,0.04)','rgba(10,0,21,0.82)',
    'rgba(255,255,255,0.10)','rgba(255,255,255,0.22)','0 4px 32px rgba(0,0,0,0.58)',
    '#f3eeff','#c4b5fd','#8b70d4','#4a2d8a',
    '#a78bfa','rgba(167,139,250,0.15)','rgba(167,139,250,0.38)','0 0 18px rgba(167,139,250,0.58)',
    '#34d399','rgba(52,211,153,0.12)','rgba(52,211,153,0.32)','0 0 14px rgba(52,211,153,0.50)',
    '#f87171','rgba(248,113,113,0.12)','rgba(248,113,113,0.32)','0 0 14px rgba(248,113,113,0.50)',
    '#fbbf24','rgba(251,191,36,0.12)','rgba(251,191,36,0.32)',
    'rgba(255,255,255,0.07)','rgba(255,255,255,0.12)','#a78bfa','rgba(167,139,250,0.24)','#f3eeff','#8b70d4',
  ],
  ocean: [
    'linear-gradient(180deg,#0a1628 0%,#071322 55%,#030d1a 100%)',
    'rgba(56,189,248,0.06)','rgba(56,189,248,0.04)','rgba(10,22,40,0.82)',
    'rgba(255,255,255,0.09)','rgba(255,255,255,0.20)','0 4px 32px rgba(0,0,0,0.52)',
    '#e0f2fe','#7dd3fc','#3b82c4','#1e3a5f',
    '#38bdf8','rgba(56,189,248,0.13)','rgba(56,189,248,0.38)','0 0 18px rgba(56,189,248,0.52)',
    '#34d399','rgba(52,211,153,0.12)','rgba(52,211,153,0.32)','0 0 14px rgba(52,211,153,0.50)',
    '#f87171','rgba(248,113,113,0.12)','rgba(248,113,113,0.32)','0 0 14px rgba(248,113,113,0.50)',
    '#fbbf24','rgba(251,191,36,0.12)','rgba(251,191,36,0.32)',
    'rgba(255,255,255,0.07)','rgba(255,255,255,0.10)','#38bdf8','rgba(56,189,248,0.22)','#e0f2fe','#3b82c4',
  ],
  light: [
    'linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)',
    '#ffffff','#ffffff','#ffffff',
    '#e2e8f0','#cbd5e1','0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.05)',
    '#0f172a','#334155','#64748b','#94a3b8',
    '#2563eb','rgba(37,99,235,0.07)','rgba(37,99,235,0.22)','0 0 0 rgba(37,99,235,0)',
    '#059669','#ecfdf5','#a7f3d0','0 0 0 rgba(5,150,105,0)',
    '#dc2626','#fef2f2','#fecaca','0 0 0 rgba(220,38,38,0)',
    '#d97706','#fffbeb','#fde68a',
    '#f1f5f9','#e2e8f0','#2563eb','rgba(37,99,235,0.15)','#0f172a','#94a3b8',
  ],
}

const KEYS = [
  '--theme-gradient',
  '--theme-glass-card','--theme-glass-panel','--theme-glass-topbar',
  '--theme-glass-border','--theme-glass-border-strong','--theme-glass-shadow',
  '--theme-text-primary','--theme-text-secondary','--theme-text-muted','--theme-text-ghost',
  '--theme-accent','--theme-accent-soft','--theme-accent-border','--theme-accent-glow',
  '--theme-profit','--theme-profit-bg','--theme-profit-border','--theme-profit-glow',
  '--theme-loss','--theme-loss-bg','--theme-loss-border','--theme-loss-glow',
  '--theme-warn','--theme-warn-bg','--theme-warn-border',
  '--theme-input-bg','--theme-input-border','--theme-input-focus-border',
  '--theme-input-focus-ring','--theme-input-text','--theme-input-placeholder',
]

// Serialise THEME_DATA and KEYS into a self-contained IIFE string.
// This is injected as a blocking <script> in <head> — runs before first paint.
export const themeScript = `(function(){
  var S='swts-theme';
  var D='midnight';
  var data=${JSON.stringify(THEME_DATA)};
  var keys=${JSON.stringify(KEYS)};
  var id;
  try { id = localStorage.getItem(S) || D; } catch(e) { id = D; }
  var vals = data[id] || data[D];
  var root = document.documentElement;
  root.setAttribute('data-theme', id);
  for(var i=0;i<keys.length;i++){
    root.style.setProperty(keys[i], vals[i]);
  }
})();`
