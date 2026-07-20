import type { CSSProperties } from 'react'
import type { Pizza, Tamanho } from '../../domain/cardapio'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export interface TamanhoExibido {
  k: Tamanho
  fatias: string
  precoFormatado: string
}

export interface PizzaCardProps {
  pizza: Pizza
  foto: string
  tamanhos: TamanhoExibido[]
  tamanhoSelecionado: Tamanho
  onSelecionarTamanho: (tamanho: Tamanho) => void
  onAdicionar: () => void
  acabouDeAdicionar: boolean
}

export function PizzaCard({
  pizza,
  foto,
  tamanhos,
  tamanhoSelecionado,
  onSelecionarTamanho,
  onAdicionar,
  acabouDeAdicionar,
}: PizzaCardProps) {
  const precoSelecionado = tamanhos.find((t) => t.k === tamanhoSelecionado)?.precoFormatado ?? ''

  return (
    <Card padding="0">
      <img
        src={foto}
        alt={pizza.nome}
        style={{
          width: '100%',
          height: '190px',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}
      />
      <div
        style={{
          padding: 'var(--sp-5) var(--sp-6) var(--sp-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
          {pizza.badge && <Badge tone={pizza.badge.tone}>{pizza.badge.label}</Badge>}
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '1.375rem',
              color: 'var(--text-title)',
            }}
          >
            {pizza.nome}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--fs-small)',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
              textWrap: 'pretty',
            }}
          >
            {pizza.ingredientes}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-caps)',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Escolha o tamanho
          </span>
          {tamanhos.map((tamanho) => {
            const selecionado = tamanho.k === tamanhoSelecionado
            const linhaStyle: CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              width: '100%',
              padding: selecionado ? '9px 13px' : '10px 14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 120ms ease, box-shadow 120ms ease, background 120ms ease',
              border: selecionado ? '2px solid var(--molho-600)' : '1px solid var(--border-soft)',
              boxShadow: selecionado ? '0 0 0 3px var(--molho-100)' : 'none',
              background: selecionado ? 'var(--branco)' : 'var(--massa-50)',
              font: 'inherit',
              textAlign: 'left',
            }
            const dotStyle: CSSProperties = {
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              flex: 'none',
              boxSizing: 'border-box',
              border: selecionado ? '5px solid var(--molho-600)' : '2px solid var(--carvao-300)',
              background: 'var(--branco)',
              transition: 'border 120ms ease',
            }
            const precoStyle: CSSProperties = {
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--fs-body)',
              color: selecionado ? 'var(--molho-600)' : 'var(--text-title)',
            }

            return (
              <button
                key={tamanho.k}
                type="button"
                aria-pressed={selecionado}
                onClick={() => onSelecionarTamanho(tamanho.k)}
                style={linhaStyle}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={dotStyle} />
                  <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-title)' }}>{tamanho.k}</span>{' '}
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{tamanho.fatias}</span>
                </span>{' '}
                <span style={precoStyle}>{tamanho.precoFormatado}</span>
              </button>
            )
          })}
        </div>

        <Button variant="primary" size="md" fullWidth onClick={onAdicionar}>
          {acabouDeAdicionar ? 'Adicionado ✓' : `Adicionar · ${precoSelecionado}`}
        </Button>
      </div>
    </Card>
  )
}
