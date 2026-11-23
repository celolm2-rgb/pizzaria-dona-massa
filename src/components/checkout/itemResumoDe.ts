import { fatiasPorTamanho, type Tamanho } from '../../domain/cardapio'
import { calcularTotalDoItem, type ItemCarrinho } from '../../domain/carrinho'
import { formatarPreco } from '../../domain/moeda'

export interface ItemResumoDados {
  key: string
  nome: string
  tam: Tamanho
  fatias: string
  qty: number
  precoTotalFormatado: string
}

export function itemResumoDe(item: ItemCarrinho): ItemResumoDados {
  return {
    key: item.key,
    nome: item.nome,
    tam: item.tam,
    fatias: fatiasPorTamanho(item.tam),
    qty: item.qty,
    precoTotalFormatado: formatarPreco(calcularTotalDoItem(item)),
  }
}
