import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { TotaisPedido } from '../pedido/TotaisPedido'
import { CartItemRow, type CartItemRowProps } from './CartItemRow'

export interface CartPanelItem extends Omit<CartItemRowProps, 'onIncrementar' | 'onDecrementar' | 'onRemover'> {
  key: string
}

export interface CartPanelProps {
  itens: CartPanelItem[]
  quantidadePizzas: number
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
  faltaParaFreteGratisFormatado: string
  onIncrementar: (chave: string) => void
  onDecrementar: (chave: string) => void
  onRemover: (chave: string) => void
  onFinalizar: () => void
}

function textoDoResumo(quantidadePizzas: number): string {
  if (quantidadePizzas === 0) return 'Nenhuma pizza ainda'
  if (quantidadePizzas === 1) return '1 pizza no carrinho'
  return `${quantidadePizzas} pizzas no carrinho`
}

export function CartPanel({
  itens,
  quantidadePizzas,
  subtotalFormatado,
  freteFormatado,
  freteGratis,
  totalFormatado,
  faltaParaFreteGratisFormatado,
  onIncrementar,
  onDecrementar,
  onRemover,
  onFinalizar,
}: CartPanelProps) {
  const carrinhoVazio = itens.length === 0

  return (
    <Card padding="var(--sp-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
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
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
          {textoDoResumo(quantidadePizzas)}
        </span>
      </div>

      {carrinhoVazio && (
        <p
          style={{
            margin: 0,
            padding: 'var(--sp-6) 0',
            fontSize: 'var(--fs-small)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            textWrap: 'pretty',
          }}
        >
          Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno.
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
                fatias={item.fatias}
                qty={item.qty}
                precoUnitFormatado={item.precoUnitFormatado}
                precoTotalFormatado={item.precoTotalFormatado}
                onIncrementar={() => onIncrementar(item.key)}
                onDecrementar={() => onDecrementar(item.key)}
                onRemover={() => onRemover(item.key)}
              />
            ))}
          </div>

          <TotaisPedido
            subtotalFormatado={subtotalFormatado}
            freteFormatado={freteFormatado}
            freteGratis={freteGratis}
            totalFormatado={totalFormatado}
          />

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-small)',
              lineHeight: 'var(--lh-body)',
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--radius-md)',
              textWrap: 'pretty',
              background: freteGratis ? 'var(--accent-success-bg)' : 'var(--accent-highlight-bg)',
              color: freteGratis ? 'var(--manjericao-700)' : 'var(--crosta-600)',
            }}
          >
            {freteGratis
              ? 'Frete grátis liberado! A entrega é por nossa conta.'
              : `Faltam ${faltaParaFreteGratisFormatado} para frete grátis`}
          </div>

          <Button variant="primary" size="md" fullWidth onClick={onFinalizar}>
            Finalizar pedido
          </Button>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Sai do forno e chega quentinha em uns 40 minutos.
          </span>
        </>
      )}
    </Card>
  )
}
