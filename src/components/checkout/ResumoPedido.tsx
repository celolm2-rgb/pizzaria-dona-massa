import { useState } from 'react'
import { Card } from '../ui/Card'
import { TotaisPedido } from '../pedido/TotaisPedido'
import { ItemResumo } from './ItemResumo'
import type { ItemResumoDados } from './itemResumoDe'

export interface ResumoPedidoProps {
  itens: ItemResumoDados[]
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
  onAlterar: () => void
}

function BotaoAlterarPedido({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-small)',
        fontWeight: 'var(--fw-bold)',
        lineHeight: 'var(--lh-body)',
        color: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)',
        textDecoration: hover ? 'underline' : 'none',
      }}
    >
      Alterar pedido
    </button>
  )
}

export function ResumoPedido({
  itens,
  subtotalFormatado,
  freteFormatado,
  freteGratis,
  totalFormatado,
  onAlterar,
}: ResumoPedidoProps) {
  return (
    <Card padding="var(--sp-6)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
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
            Seu pedido
          </h2>
          <BotaoAlterarPedido onClick={onAlterar} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {itens.map(({ key, ...item }) => (
            <ItemResumo key={key} {...item} comDivisoria />
          ))}
        </div>
        <TotaisPedido
          subtotalFormatado={subtotalFormatado}
          freteFormatado={freteFormatado}
          freteGratis={freteGratis}
          totalFormatado={totalFormatado}
        />
      </div>
    </Card>
  )
}
