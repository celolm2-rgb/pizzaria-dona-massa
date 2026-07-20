import { useState, type CSSProperties, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'onPrimary'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  children?: ReactNode
  style?: CSSProperties
}

const base: CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-bold)',
  fontSize: 'var(--fs-body)',
  border: 'none',
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--sp-2)',
  transition: 'background .15s ease, color .15s ease, transform .1s ease, box-shadow .15s ease',
  lineHeight: 1,
}

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '10px 16px', fontSize: 'var(--fs-small)' },
  md: { padding: '14px 24px' },
  lg: { padding: '18px 32px', fontSize: 'var(--fs-heading)' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  style,
}: ButtonProps) {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)

  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: press
        ? 'var(--action-primary-active)'
        : hover
          ? 'var(--action-primary-hover)'
          : 'var(--action-primary)',
      color: 'var(--text-on-primary)',
      boxShadow: hover && !press ? 'var(--shadow-card)' : 'none',
    },
    secondary: {
      background: press ? 'var(--surface-inset)' : hover ? 'var(--massa-50)' : 'transparent',
      color: 'var(--action-primary)',
      boxShadow: 'inset 0 0 0 2px var(--action-primary)',
    },
    onPrimary: {
      background: 'var(--branco)',
      color: 'var(--action-primary)',
      boxShadow: 'none',
    },
  }

  const disabledStyle: CSSProperties = disabled
    ? {
        background: 'var(--surface-inset)',
        color: 'var(--text-muted)',
        boxShadow: 'none',
        cursor: 'not-allowed',
      }
    : {}

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPress(false)
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        ...(fullWidth ? { width: '100%' } : {}),
        transform: press && !disabled ? 'scale(.98)' : 'none',
        ...disabledStyle,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
