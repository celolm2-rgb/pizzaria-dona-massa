import { useState, type CSSProperties, type ReactNode } from 'react'

export interface CardProps {
  selected?: boolean
  interactive?: boolean
  padding?: string
  onClick?: () => void
  children?: ReactNode
  style?: CSSProperties
}

export function Card({
  selected = false,
  interactive = false,
  padding = 'var(--sp-5)',
  children,
  onClick,
  style,
}: CardProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        padding,
        border: selected ? '2px solid var(--action-primary)' : 'var(--border-card)',
        boxShadow: selected
          ? '0 0 0 3px var(--molho-100), var(--shadow-card)'
          : interactive && hover
            ? 'var(--shadow-raised)'
            : 'var(--shadow-card)',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .15s ease, transform .15s ease, border-color .15s ease',
        cursor: interactive || onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
