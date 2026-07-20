import fotoCalabresa from '../../assets/pizzas/pizza-calabresa.jpg'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export interface HomeHeroProps {
  onNavigateToCardapio: () => void
}

export function HomeHero({ onNavigateToCardapio }: HomeHeroProps) {
  return (
    <section
      className="home-hero"
      style={{ background: 'var(--action-primary)', padding: '72px 32px 88px' }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 'var(--sp-12)',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-6)' }}>
          <Badge tone="highlight">Forno aceso hoje até as 23h</Badge>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '3rem',
              lineHeight: 1.1,
              color: 'var(--text-on-primary)',
              textWrap: 'pretty',
            }}
          >
            Pizza artesanal, feita como em casa
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'var(--molho-100)',
              maxWidth: '480px',
              textWrap: 'pretty',
            }}
          >
            Massa de fermentação lenta, molho da casa e forno bem quente. Você escolhe o sabor, a
            gente cuida do resto — chega quentinha em uns 40 minutos.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <Button variant="onPrimary" size="lg" onClick={onNavigateToCardapio}>
              Ver o cardápio
            </Button>
            <span style={{ fontSize: '0.9375rem', color: 'var(--molho-100)' }}>
              Entrega grátis acima de R$ 100,00
            </span>
          </div>
        </div>
        <img
          src={fotoCalabresa}
          alt="Pizza saindo do forno"
          style={{
            width: '100%',
            height: '340px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-raised)',
          }}
        />
      </div>
    </section>
  )
}
