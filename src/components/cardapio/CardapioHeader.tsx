export interface CardapioHeaderProps {
  onNavigateToHome: () => void
}

export function CardapioHeader({ onNavigateToHome }: CardapioHeaderProps) {
  return (
    <header style={{ background: 'var(--action-primary)', padding: '28px 32px' }}>
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-1)',
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
            alignSelf: 'flex-start',
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '2rem',
            lineHeight: 1.1,
            color: 'var(--text-on-primary)',
          }}
        >
          Pizzaria Dona Massa
        </button>
        <span style={{ fontSize: '0.9375rem', color: 'var(--molho-100)' }}>
          Pizza artesanal de bairro, direto do nosso forno
        </span>
      </div>
    </header>
  )
}
