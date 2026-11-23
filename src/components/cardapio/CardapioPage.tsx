import {
  adicionarItem,
  alterarQuantidade,
  calcularFaltaParaFreteGratis,
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  calcularTotalDoItem,
  contarPizzas,
  ehFreteGratis,
  removerItem,
  type ItemCarrinho,
} from '../../domain/carrinho'
import { fatiasPorTamanho } from '../../domain/cardapio'
import { formatarPreco } from '../../domain/moeda'
import { CartPanel } from './CartPanel'
import { PizzaGrid, type ItemParaAdicionar } from './PizzaGrid'

export interface CardapioPageProps {
  carrinho: ItemCarrinho[]
  onCarrinhoChange: (atualizar: (atual: ItemCarrinho[]) => ItemCarrinho[]) => void
  onFinalizar: () => void
}

export function CardapioPage({ carrinho, onCarrinhoChange, onFinalizar }: CardapioPageProps) {
  function handleAdicionarAoCarrinho(item: ItemParaAdicionar) {
    onCarrinhoChange((atual) => adicionarItem(atual, item))
  }

  function handleIncrementar(chave: string) {
    onCarrinhoChange((atual) => alterarQuantidade(atual, chave, 1))
  }

  function handleDecrementar(chave: string) {
    onCarrinhoChange((atual) => alterarQuantidade(atual, chave, -1))
  }

  function handleRemover(chave: string) {
    onCarrinhoChange((atual) => removerItem(atual, chave))
  }

  const temItens = carrinho.length > 0
  const subtotal = calcularSubtotal(carrinho)
  const frete = calcularFrete(subtotal, temItens)
  const total = calcularTotal(subtotal, frete)
  const falta = calcularFaltaParaFreteGratis(subtotal)
  const gratis = ehFreteGratis(subtotal)
  const quantidadePizzas = contarPizzas(carrinho)

  return (
    <>
      <h1
        style={{
          margin: '0 0 var(--sp-2)',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-display)',
          lineHeight: 'var(--lh-display)',
          color: 'var(--text-title)',
        }}
      >
        Nossas pizzas
      </h1>
      <p
        style={{
          margin: '0 0 var(--sp-8)',
          maxWidth: '52ch',
          fontSize: 'var(--fs-body)',
          lineHeight: 'var(--lh-body)',
          color: 'var(--text-muted)',
          textWrap: 'pretty',
        }}
      >
        Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 'var(--sp-8)',
          alignItems: 'start',
        }}
      >
        <PizzaGrid onAdicionarAoCarrinho={handleAdicionarAoCarrinho} />
        <aside style={{ position: 'sticky', top: 'var(--sp-6)' }}>
          <CartPanel
            itens={carrinho.map((item) => ({
              key: item.key,
              nome: item.nome,
              tam: item.tam,
              fatias: fatiasPorTamanho(item.tam),
              qty: item.qty,
              precoUnitFormatado: formatarPreco(item.preco),
              precoTotalFormatado: formatarPreco(calcularTotalDoItem(item)),
            }))}
            quantidadePizzas={quantidadePizzas}
            subtotalFormatado={formatarPreco(subtotal)}
            freteFormatado={gratis ? 'Grátis' : formatarPreco(frete)}
            freteGratis={gratis}
            totalFormatado={formatarPreco(total)}
            faltaParaFreteGratisFormatado={formatarPreco(falta)}
            onIncrementar={handleIncrementar}
            onDecrementar={handleDecrementar}
            onRemover={handleRemover}
            onFinalizar={onFinalizar}
          />
        </aside>
      </div>
    </>
  )
}
