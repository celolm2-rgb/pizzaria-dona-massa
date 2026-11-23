export interface TotaisPedidoProps {
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
}

export function LinhaTotal({ totalFormatado }: { totalFormatado: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingTop: 'var(--sp-3)',
        borderTop: 'var(--border-card)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-small)',
          fontWeight: 'var(--fw-bold)',
          letterSpacing: 'var(--ls-caps)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        Total
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-title)',
          lineHeight: 'var(--lh-title)',
          color: 'var(--text-title)',
        }}
      >
        {totalFormatado}
      </span>
    </div>
  )
}

export function TotaisPedido({ subtotalFormatado, freteFormatado, freteGratis, totalFormatado }: TotaisPedidoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
        <span>Subtotal</span>
        <span>{subtotalFormatado}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
        <span>Entrega</span>
        <span style={freteGratis ? { color: 'var(--manjericao-700)', fontWeight: 'var(--fw-bold)' } : undefined}>
          {freteFormatado}
        </span>
      </div>
      <LinhaTotal totalFormatado={totalFormatado} />
    </div>
  )
}
