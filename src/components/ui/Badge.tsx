import type { CSSProperties, ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'success' | 'highlight' | 'danger'

export interface BadgeProps {
  tone?: BadgeTone
  children?: ReactNode
  style?: CSSProperties
}

const tones: Record<BadgeTone, CSSProperties> = {
  neutral: { background: 'var(--surface-inset)', color: 'var(--carvao-700)' },
  success: { background: 'var(--accent-success-bg)', color: 'var(--manjericao-700)' },
  highlight: { background: 'var(--accent-highlight-bg)', color: 'var(--crosta-600)' },
  danger: { background: 'var(--danger-bg)', color: 'var(--molho-700)' },
}

export function Badge({ tone = 'neutral', children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--sp-1)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-bold)',
        letterSpacing: 'var(--ls-caps)',
        textTransform: 'uppercase',
        lineHeight: 1.4,
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
