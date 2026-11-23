export interface CardapioHeaderProps {
  onNavigateToHome: () => void
}

export function CardapioHeader({ onNavigateToHome }: CardapioHeaderProps) {
  return (
    <header style={{ background: 'var(--action-primary)', padding: 'var(--sp-6) var(--sp-8)' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--sp-6)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onNavigateToHome}
          style={{
            font: 'inherit',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-title)',
            lineHeight: 'var(--lh-title)',
            color: 'var(--text-on-primary)',
          }}
        >
          Pizzaria Dona Massa
        </button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-small)', color: 'var(--molho-100)' }}>
          Aberto hoje até 23h · entrega em uns 40 minutos
        </span>
      </div>
    </header>
  )
}
