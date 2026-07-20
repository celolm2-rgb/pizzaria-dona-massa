import type { Tamanho } from '../../domain/cardapio'

export interface CartItemRowProps {
  nome: string
  tam: Tamanho
  qty: number
  precoUnitFormatado: string
  precoTotalFormatado: string
  onIncrementar: () => void
  onDecrementar: () => void
  onRemover: () => void
}

export function CartItemRow({
  nome,
  tam,
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
        justifyContent: 'space-between',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        paddingBottom: 'var(--sp-3)',
        borderBottom: '1px solid var(--massa-200)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontWeight: 'var(--fw-bold)', fontSize: '0.9375rem', color: 'var(--text-title)' }}>
          {nome}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Tamanho {tam} · {precoUnitFormatado} cada
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <button
            type="button"
            onClick={onDecrementar}
            aria-label="Diminuir quantidade"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid var(--border-soft)',
              background: 'var(--massa-50)',
              color: 'var(--text-title)',
              fontSize: '0.9375rem',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            −
          </button>
          <span
            style={{
              fontSize: 'var(--fs-small)',
              fontWeight: 'var(--fw-bold)',
              color: 'var(--text-title)',
              minWidth: '14px',
              textAlign: 'center',
            }}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={onIncrementar}
            aria-label="Aumentar quantidade"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid var(--border-soft)',
              background: 'var(--massa-50)',
              color: 'var(--text-title)',
              fontSize: '0.9375rem',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            +
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <button
          type="button"
          onClick={onRemover}
          title="Tirar do pedido"
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--carvao-300)',
            fontSize: 'var(--fs-body)',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          ×
        </button>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '0.9375rem',
            color: 'var(--text-title)',
          }}
        >
          {precoTotalFormatado}
        </span>
      </div>
    </div>
  )
}
