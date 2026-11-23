import type { Tamanho } from './cardapio'

export interface ItemCarrinho {
  key: string
  nome: string
  tam: Tamanho
  preco: number
  qty: number
}

export type NovoItemCarrinho = Omit<ItemCarrinho, 'qty'>

export const LIMIAR_FRETE_GRATIS = 100
export const VALOR_FRETE = 12

export function calcularSubtotal(carrinho: ItemCarrinho[]): number {
  return carrinho.reduce((total, item) => total + item.preco * item.qty, 0)
}

export function ehFreteGratis(subtotal: number): boolean {
  return subtotal >= LIMIAR_FRETE_GRATIS
}

export function calcularFrete(subtotal: number, temItens: boolean): number {
  if (!temItens || ehFreteGratis(subtotal)) {
    return 0
  }
  return VALOR_FRETE
}

export function calcularFaltaParaFreteGratis(subtotal: number): number {
  return Math.max(0, LIMIAR_FRETE_GRATIS - subtotal)
}

export function adicionarItem(
  carrinho: ItemCarrinho[],
  novoItem: NovoItemCarrinho,
): ItemCarrinho[] {
  const jaExiste = carrinho.some((item) => item.key === novoItem.key)
  if (jaExiste) {
    return carrinho.map((item) =>
      item.key === novoItem.key ? { ...item, qty: item.qty + 1 } : item,
    )
  }
  return [...carrinho, { ...novoItem, qty: 1 }]
}

export function alterarQuantidade(
  carrinho: ItemCarrinho[],
  chave: string,
  delta: number,
): ItemCarrinho[] {
  return carrinho
    .map((item) => (item.key === chave ? { ...item, qty: item.qty + delta } : item))
    .filter((item) => item.qty > 0)
}

export function removerItem(carrinho: ItemCarrinho[], chave: string): ItemCarrinho[] {
  return carrinho.filter((item) => item.key !== chave)
}

export function calcularTotal(subtotal: number, frete: number): number {
  return subtotal + frete
}

export function contarPizzas(carrinho: ItemCarrinho[]): number {
  return carrinho.reduce((total, item) => total + item.qty, 0)
}

export function calcularTotalDoItem(item: ItemCarrinho): number {
  return item.preco * item.qty
}
