import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers }     from '@/components/providers'
import { themeScript }   from '@/lib/theme-script'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Inter      → body / UI text
// Jakarta    → headings / display numbers
// JetBrains  → prices, timestamps, tabular data

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-jakarta',
  display:  'swap',
})

const mono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains',
  display:  'swap',
})

export const metadata: Metadata = {
  title: 'TrendEdge — Supertrend & ATR Trading System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <head>
        {/* Blocking script — sets CSS vars from localStorage before first paint.
            Eliminates theme flash on reload. Must be inline, not async/defer. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
