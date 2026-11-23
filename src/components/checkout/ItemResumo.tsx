import type { ItemResumoDados } from './itemResumoDe'

export type ItemResumoProps = Omit<ItemResumoDados, 'key'> & { comDivisoria: boolean }

const textoDisplay = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-regular)',
  fontSize: 'var(--fs-body)',
  color: 'var(--text-title)',
} as const

export function ItemResumo({ nome, tam, fatias, qty, precoTotalFormatado, comDivisoria }: ItemResumoProps) {
  const detalhe = `Tamanho ${tam} · ${fatias}${qty > 1 ? ` · ${qty} unidades` : ''}`
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        ...(comDivisoria ? { paddingBottom: 'var(--sp-3)', borderBottom: 'var(--border-card)' } : {}),
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={textoDisplay}>{nome}</span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{detalhe}</span>
      </div>
      <span style={textoDisplay}>{precoTotalFormatado}</span>
    </div>
  )
}
