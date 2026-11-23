import { useState, type ReactNode } from 'react'
import type { Tamanho } from '../../domain/cardapio'

export interface CartItemRowProps {
  nome: string
  tam: Tamanho
  fatias: string
  qty: number
  precoUnitFormatado: string
  precoTotalFormatado: string
  onIncrementar: () => void
  onDecrementar: () => void
  onRemover: () => void
}

interface BotaoStepperProps {
  rotulo: string
  onClick: () => void
  children: ReactNode
}

function BotaoStepper({ rotulo, onClick, children }: BotaoStepperProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-soft)'}`,
        background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
        color: 'var(--text-title)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body)',
        lineHeight: 1,
        cursor: 'pointer',
        transition: 'background .15s ease, border-color .15s ease',
      }}
    >
      {children}
    </button>
  )
}

function BotaoTirar({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginLeft: 'var(--sp-2)',
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-caption)',
        color: hover ? 'var(--action-primary)' : 'var(--text-muted)',
        textDecoration: 'underline',
      }}
    >
      tirar
    </button>
  )
}

export function CartItemRow({
  nome,
  tam,
  fatias,
  qty,
  precoUnitFormatado,
  precoTotalFormatado,
  onIncrementar,
  onDecrementar,
  onRemover,
}: CartItemRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        paddingBottom: 'var(--sp-3)',
        borderBottom: 'var(--border-card)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-body)',
            color: 'var(--text-title)',
          }}
        >
          {nome}
        </span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          Tamanho {tam} · {fatias} · {precoUnitFormatado} cada
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <BotaoStepper rotulo="Diminuir quantidade" onClick={onDecrementar}>
            −
          </BotaoStepper>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-small)',
              fontWeight: 'var(--fw-bold)',
              color: 'var(--text-title)',
              minWidth: '14px',
              textAlign: 'center',
            }}
          >
            {qty}
          </span>
          <BotaoStepper rotulo="Aumentar quantidade" onClick={onIncrementar}>
            +
          </BotaoStepper>
          <BotaoTirar onClick={onRemover} />
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-body)',
          color: 'var(--text-title)',
        }}
      >
        {precoTotalFormatado}
      </span>
    </div>
  )
}
