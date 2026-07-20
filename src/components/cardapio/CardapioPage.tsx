import { useState } from 'react'
import {
  adicionarItem,
  alterarQuantidade,
  calcularFaltaParaFreteGratis,
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  ehFreteGratis,
  removerItem,
  type ItemCarrinho,
} from '../../domain/carrinho'
import { formatarPreco } from '../../domain/moeda'
import { CartPanel } from './CartPanel'
import { PizzaGrid, type ItemParaAdicionar } from './PizzaGrid'

export function CardapioPage() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  function handleAdicionarAoCarrinho(item: ItemParaAdicionar) {
    setCarrinho((atual) => adicionarItem(atual, item))
  }

  function handleIncrementar(chave: string) {
    setCarrinho((atual) => alterarQuantidade(atual, chave, 1))
  }

  function handleDecrementar(chave: string) {
    setCarrinho((atual) => alterarQuantidade(atual, chave, -1))
  }

  function handleRemover(chave: string) {
    setCarrinho((atual) => removerItem(atual, chave))
  }

  const temItens = carrinho.length > 0
  const subtotal = calcularSubtotal(carrinho)
  const frete = calcularFrete(subtotal, temItens)
  const total = calcularTotal(subtotal, frete)
  const falta = calcularFaltaParaFreteGratis(subtotal)
  const gratis = ehFreteGratis(subtotal)

  return (
    <>
      <PizzaGrid onAdicionarAoCarrinho={handleAdicionarAoCarrinho} />
      <aside style={{ position: 'sticky', top: '24px' }}>
        <CartPanel
          itens={carrinho.map((item) => ({
            key: item.key,
            nome: item.nome,
            tam: item.tam,
            qty: item.qty,
            precoUnitFormatado: formatarPreco(item.preco),
            precoTotalFormatado: formatarPreco(item.preco * item.qty),
          }))}
          subtotalFormatado={formatarPreco(subtotal)}
          freteFormatado={gratis ? 'Grátis' : formatarPreco(frete)}
          freteGratis={gratis}
          totalFormatado={formatarPreco(total)}
          faltaParaFreteGratisFormatado={formatarPreco(falta)}
          mostraAviso={temItens && !gratis}
          mostraGratis={temItens && gratis}
          onIncrementar={handleIncrementar}
          onDecrementar={handleDecrementar}
          onRemover={handleRemover}
        />
      </aside>
    </>
  )
}
