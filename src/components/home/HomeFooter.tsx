export function HomeFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--massa-300)', padding: '24px 32px' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-4)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'var(--fs-body)',
            color: 'var(--text-title)',
          }}
        >
          Pizzaria Dona Massa
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Aberto todos os dias, das 18h às 23h · Rua do Forno, 52 — Vila Mariana
        </span>
      </div>
    </footer>
  )
}
