import { useState, type CSSProperties } from 'react'
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
  precoSelecionadoFormatado: string
  fatiasSelecionadas: string
  onSelecionarTamanho: (tamanho: Tamanho) => void
  onAdicionar: () => void
}

interface PilulaTamanhoProps {
  tamanho: TamanhoExibido
  selecionado: boolean
  onClick: () => void
}

const textoDisplay: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-regular)',
  fontSize: 'var(--fs-body)',
  color: 'var(--text-title)',
}

function PilulaTamanho({ tamanho, selecionado, onClick }: PilulaTamanhoProps) {
  const [hover, setHover] = useState(false)
  const comHover = hover && !selecionado

  const estilo: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--sp-3)',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    padding: '10px 16px',
    borderRadius: 'var(--radius-pill)',
    background: selecionado ? 'var(--massa-50)' : comHover ? 'var(--surface-raised)' : 'var(--surface-card)',
    border: selecionado
      ? '2px solid var(--action-primary)'
      : `1px solid ${comHover ? 'var(--border-strong)' : 'var(--border-soft)'}`,
    boxShadow: selecionado ? '0 0 0 3px var(--molho-100)' : 'none',
    fontFamily: 'var(--font-body)',
    transition: 'background .15s ease, border-color .15s ease, box-shadow .15s ease',
  }

  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={estilo}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <span style={textoDisplay}>{tamanho.k}</span>{' '}
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{tamanho.fatias}</span>
      </span>{' '}
      <span style={textoDisplay}>{tamanho.precoFormatado}</span>
    </button>
  )
}

export function PizzaCard({
  pizza,
  foto,
  tamanhos,
  tamanhoSelecionado,
  precoSelecionadoFormatado,
  fatiasSelecionadas,
  onSelecionarTamanho,
  onAdicionar,
}: PizzaCardProps) {
  return (
    <Card padding="var(--sp-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div
        style={{
          height: '180px',
          background: 'var(--surface-inset)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <img
          src={foto}
          alt={pizza.nome}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--fw-regular)',
              fontSize: 'var(--fs-heading)',
              lineHeight: 'var(--lh-title)',
              color: 'var(--text-title)',
            }}
          >
            {pizza.nome}
          </h2>
          {pizza.badge && <Badge tone={pizza.badge.tone}>{pizza.badge.label}</Badge>}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--fs-small)',
            lineHeight: 'var(--lh-body)',
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
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-caps)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Tamanho
        </span>
        <div style={{ display: 'grid', gap: 'var(--sp-2)' }}>
          {tamanhos.map((tamanho) => (
            <PilulaTamanho
              key={tamanho.k}
              tamanho={tamanho}
              selecionado={tamanho.k === tamanhoSelecionado}
              onClick={() => onSelecionarTamanho(tamanho.k)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--sp-3)',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
          Tamanho {tamanhoSelecionado} · {fatiasSelecionadas}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-heading)',
            color: 'var(--text-title)',
          }}
        >
          {precoSelecionadoFormatado}
        </span>
      </div>

      <Button variant="primary" size="md" fullWidth onClick={onAdicionar}>
        Adicionar
      </Button>
    </Card>
  )
}
