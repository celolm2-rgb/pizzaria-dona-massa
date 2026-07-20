import { Button } from '../ui/Button'

export interface HomeCTAProps {
  onNavigateToCardapio: () => void
}

export function HomeCTA({ onNavigateToCardapio }: HomeCTAProps) {
  return (
    <section style={{ padding: '0 32px 64px' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'var(--action-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sp-8)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '1.75rem',
              color: 'var(--text-on-primary)',
            }}
          >
            Bateu a fome?
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--fs-body)', color: 'var(--molho-100)' }}>
            O forno já está quente — sua pizza sai em uns 40 minutos.
          </p>
        </div>
        <Button variant="onPrimary" size="lg" onClick={onNavigateToCardapio}>
          Montar meu pedido
        </Button>
      </div>
    </section>
  )
}
