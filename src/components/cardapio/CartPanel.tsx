import { Card } from '../ui/Card'
import { CartItemRow, type CartItemRowProps } from './CartItemRow'

export interface CartPanelItem extends Omit<CartItemRowProps, 'onIncrementar' | 'onDecrementar' | 'onRemover'> {
  key: string
}

export interface CartPanelProps {
  itens: CartPanelItem[]
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
  faltaParaFreteGratisFormatado: string
  mostraAviso: boolean
  mostraGratis: boolean
  onIncrementar: (chave: string) => void
  onDecrementar: (chave: string) => void
  onRemover: (chave: string) => void
}

export function CartPanel({
  itens,
  subtotalFormatado,
  freteFormatado,
  freteGratis,
  totalFormatado,
  faltaParaFreteGratisFormatado,
  mostraAviso,
  mostraGratis,
  onIncrementar,
  onDecrementar,
  onRemover,
}: CartPanelProps) {
  const carrinhoVazio = itens.length === 0

  return (
    <Card padding="24px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'var(--fs-heading)',
            color: 'var(--text-title)',
          }}
        >
          Seu pedido
        </h2>

        {carrinhoVazio && (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--fs-small)',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
              textWrap: 'pretty',
            }}
          >
            Seu pedido está vazio — escolha uma pizza ao lado que a gente já acende o forno.
          </p>
        )}

        {!carrinhoVazio && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {itens.map((item) => (
                <CartItemRow
                  key={item.key}
                  nome={item.nome}
                  tam={item.tam}
                  qty={item.qty}
                  precoUnitFormatado={item.precoUnitFormatado}
                  precoTotalFormatado={item.precoTotalFormatado}
                  onIncrementar={() => onIncrementar(item.key)}
                  onDecrementar={() => onDecrementar(item.key)}
                  onRemover={() => onRemover(item.key)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
                <span>Subtotal</span>
                <span>{subtotalFormatado}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
                <span>Frete</span>
                <span style={freteGratis ? { color: 'var(--accent-success)', fontWeight: 'var(--fw-bold)' } : undefined}>
                  {freteFormatado}
                </span>
              </div>

              {mostraAviso && (
                <div
                  style={{
                    background: 'var(--accent-highlight-bg)',
                    color: 'var(--carvao-700)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    fontSize: '0.8125rem',
                    lineHeight: 1.4,
                    textWrap: 'pretty',
                  }}
                >
                  Faltam <strong>{faltaParaFreteGratisFormatado}</strong> para o frete grátis
                </div>
              )}

              {mostraGratis && (
                <div
                  style={{
                    background: 'var(--accent-success-bg)',
                    color: 'var(--manjericao-700)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    fontSize: '0.8125rem',
                    lineHeight: 1.4,
                  }}
                >
                  Você ganhou frete grátis ✓
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '1px solid var(--massa-300)',
                  paddingTop: '10px',
                  marginTop: '2px',
                }}
              >
                <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-title)' }}>Total</span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'var(--fs-heading)',
                    color: 'var(--molho-600)',
                  }}
                >
                  {totalFormatado}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
