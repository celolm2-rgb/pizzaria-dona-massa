import type { MouseEvent } from 'react'
import { PIZZAS, precoPorTamanho } from '../../domain/cardapio'
import { formatarPreco } from '../../domain/moeda'
import { FOTO_POR_PIZZA } from '../cardapio/fotosPizzas'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export interface FavoritasProps {
  onNavigateToCardapio: () => void
}

export function Favoritas({ onNavigateToCardapio }: FavoritasProps) {
  function handleClick(event: MouseEvent) {
    event.preventDefault()
    onNavigateToCardapio()
  }

  return (
    <section id="favoritas" style={{ padding: '16px 32px 64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sp-6)' }}>
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
              Favoritas da casa
            </h2>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              As mais pedidas da vizinhança
            </p>
          </div>
          <a href="#" onClick={handleClick} style={{ fontSize: '0.9375rem', fontWeight: 'var(--fw-bold)' }}>
            Ver cardápio completo →
          </a>
        </div>
        <div className="home-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--sp-6)' }}>
          {PIZZAS.map((pizza) => {
            const preco = formatarPreco(precoPorTamanho('P', pizza.extra))
            return (
              <a key={pizza.id} href="#" onClick={handleClick} style={{ textDecoration: 'none' }}>
                <Card padding="0" interactive>
                  <img
                    src={FOTO_POR_PIZZA[pizza.id]}
                    alt={pizza.nome}
                    style={{
                      width: '100%',
                      height: '170px',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    }}
                  />
                  <div
                    style={{
                      padding: '20px 24px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-2)',
                      alignItems: 'flex-start',
                    }}
                  >
                    {pizza.badge && <Badge tone={pizza.badge.tone}>{pizza.badge.label}</Badge>}
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 400,
                        fontSize: '1.25rem',
                        color: 'var(--text-title)',
                      }}
                    >
                      {pizza.nome}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        color: 'var(--text-muted)',
                        textWrap: 'pretty',
                      }}
                    >
                      {pizza.ingredientes}
                    </p>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 400,
                        fontSize: 'var(--fs-body)',
                        color: 'var(--molho-600)',
                      }}
                    >
                      A partir de {preco}
                    </span>
                  </div>
                </Card>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
