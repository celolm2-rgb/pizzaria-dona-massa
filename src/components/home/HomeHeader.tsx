import { useState, type CSSProperties } from 'react'
import { Button } from '../ui/Button'

export interface HomeHeaderProps {
  onNavigateToCardapio: () => void
}

function NavLink({ href, children }: { href: string; children: string }) {
  const [hover, setHover] = useState(false)
  const style: CSSProperties = {
    color: hover ? 'var(--branco)' : 'var(--molho-100)',
    textDecoration: 'none',
    fontSize: '0.9375rem',
  }
  return (
    <a href={href} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </a>
  )
}

export function HomeHeader({ onNavigateToCardapio }: HomeHeaderProps) {
  return (
    <header style={{ background: 'var(--action-primary)', padding: '16px 32px' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-6)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '1.375rem',
            color: 'var(--text-on-primary)',
          }}
        >
          Pizzaria Dona Massa
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
          <NavLink href="#como-funciona">Como funciona</NavLink>
          <NavLink href="#favoritas">Favoritas da casa</NavLink>
          <Button variant="onPrimary" size="sm" onClick={onNavigateToCardapio}>
            Pedir agora
          </Button>
        </nav>
      </div>
    </header>
  )
}
