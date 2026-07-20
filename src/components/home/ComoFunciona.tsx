import { Card } from '../ui/Card'

interface Passo {
  num: string
  titulo: string
  texto: string
}

const PASSOS: Passo[] = [
  {
    num: '1',
    titulo: 'Escolha seu sabor',
    texto: 'Margherita, calabresa, quatro queijos — todas com massa de fermentação lenta.',
  },
  {
    num: '2',
    titulo: 'Monte do seu jeito',
    texto: 'Tamanho P, M ou G, com o preço na hora, sem surpresa no final.',
  },
  {
    num: '3',
    titulo: 'Receba quentinha',
    texto: 'Saiu do forno, saiu para entrega — em uns 40 minutos está na sua porta.',
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" style={{ padding: '64px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '1.75rem',
              color: 'var(--text-title)',
            }}
          >
            Como funciona
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            Do cardápio à sua porta em três passos
          </p>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--sp-6)' }}>
          {PASSOS.map((passo) => (
            <Card key={passo.num} padding="24px">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--surface-inset)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 400,
                      fontSize: '1.25rem',
                      color: 'var(--molho-600)',
                    }}
                  >
                    {passo.num}
                  </span>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: '1.125rem',
                    color: 'var(--text-title)',
                  }}
                >
                  {passo.titulo}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-muted)', textWrap: 'pretty' }}>
                  {passo.texto}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
