import { calcularFrete, calcularSubtotal, calcularTotal, type ItemCarrinho } from './carrinho'
import { apenasDigitos, mascararCPF, temErros, validarDadosCliente, type DadosCliente } from './cliente'

export const NUMERO_PEDIDO_INICIAL = 1234

export interface Pedido {
  numero: number
  itens: ItemCarrinho[]
  subtotal: number
  frete: number
  total: number
  cliente: {
    nome: string // trim
    telefone: string // só dígitos
    cpf: string | null // só dígitos; null sem querCPF
  }
}

export interface ResumoConfirmacao {
  numero: number
  itens: ItemCarrinho[]
  total: number
  cpfMascarado: string | null
}

export function proximoNumeroPedido(ultimo: number | null): number {
  return ultimo === null ? NUMERO_PEDIDO_INICIAL : ultimo + 1
}

export function montarPedido(carrinho: ItemCarrinho[], dados: DadosCliente, numero: number): Pedido {
  if (carrinho.length === 0 || temErros(validarDadosCliente(dados))) {
    throw new Error('Pedido inválido')
  }
  const subtotal = calcularSubtotal(carrinho)
  const frete = calcularFrete(subtotal, true)
  return {
    numero,
    itens: carrinho.map((item) => ({ ...item })),
    subtotal,
    frete,
    total: calcularTotal(subtotal, frete),
    cliente: {
      nome: dados.nome.trim(),
      telefone: apenasDigitos(dados.telefone).slice(0, 11),
      cpf: dados.querCPF ? apenasDigitos(dados.cpf) : null,
    },
  }
}

export function resumirConfirmacao(pedido: Pedido): ResumoConfirmacao {
  return {
    numero: pedido.numero,
    itens: pedido.itens,
    total: pedido.total,
    cpfMascarado: pedido.cliente.cpf ? mascararCPF(pedido.cliente.cpf) : null,
  }
}
