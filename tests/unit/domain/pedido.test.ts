import { describe, expect, it } from 'vitest'
import type { ItemCarrinho } from '../../../src/domain/carrinho'
import type { DadosCliente } from '../../../src/domain/cliente'
import {
  NUMERO_PEDIDO_INICIAL,
  montarPedido,
  proximoNumeroPedido,
  resumirConfirmacao,
} from '../../../src/domain/pedido'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const preenchido: DadosCliente = {
  nome: 'Ana Exemplo',
  telefone: '(11) 90000-0000',
  querCPF: true,
  cpf: '123.456.789-09',
}
const comErros: DadosCliente = { nome: '', telefone: '(11) 9000', querCPF: true, cpf: '123.456.789-00' }

function erroLancadoPor(f: () => unknown): Error {
  try {
    f()
  } catch (e) {
    return e as Error
  }
  throw new Error('a função não lançou')
}

describe('proximoNumeroPedido (P-1 -> A)', () => {
  it('começa em 1234 e soma 1', () => {
    expect(NUMERO_PEDIDO_INICIAL).toBe(1234)
    expect(proximoNumeroPedido(null)).toBe(1234)
    expect(proximoNumeroPedido(1234)).toBe(1235)
    expect(proximoNumeroPedido(1235)).toBe(1236)
  })
})

describe('montarPedido', () => {
  it('1 Margherita M + preset preenchido: frete pago, dados normalizados', () => {
    expect(montarPedido([margheritaM], preenchido, 1234)).toEqual({
      numero: 1234,
      itens: [margheritaM],
      subtotal: 45,
      frete: 12,
      total: 57,
      cliente: { nome: 'Ana Exemplo', telefone: '11900000000', cpf: '12345678909' },
    })
  })

  it('Margherita M + Calabresa G: subtotal 105, frete grátis', () => {
    const pedido = montarPedido([margheritaM, calabresaG], preenchido, 1234)
    expect(pedido.subtotal).toBe(105)
    expect(pedido.frete).toBe(0)
    expect(pedido.total).toBe(105)
  })

  it('sem querCPF, o CPF digitado não entra no pedido', () => {
    expect(montarPedido([margheritaM], { ...preenchido, querCPF: false }, 1234).cliente.cpf).toBeNull()
  })

  it('telefone com 12 dígitos: o pedido guarda só os 11 primeiros', () => {
    const pedido = montarPedido([margheritaM], { ...preenchido, telefone: '119000000001' }, 1234)
    expect(pedido.cliente.telefone).toBe('11900000000')
  })

  it('o nome vai com trim', () => {
    expect(montarPedido([margheritaM], { ...preenchido, nome: '  Ana Exemplo ' }, 1234).cliente.nome).toBe('Ana Exemplo')
  })

  it('carrinho vazio ou dados com erro lançam com mensagem fixa, sem dado pessoal', () => {
    const vazio = erroLancadoPor(() => montarPedido([], preenchido, 1234))
    const invalido = erroLancadoPor(() => montarPedido([margheritaM], comErros, 1234))
    for (const erro of [vazio, invalido]) {
      expect(erro.message).toBe('Pedido inválido')
      expect(erro.message).not.toMatch(/\d/)
    }
  })
})

describe('resumirConfirmacao', () => {
  it('com CPF: só numero, itens, total e CPF mascarado', () => {
    const resumo = resumirConfirmacao(montarPedido([margheritaM], preenchido, 1234))
    expect(resumo).toEqual({ numero: 1234, itens: [margheritaM], total: 57, cpfMascarado: '***.456.789-**' })
    expect(Object.keys(resumo)).toEqual(['numero', 'itens', 'total', 'cpfMascarado'])
    const serializado = JSON.stringify(resumo)
    expect(serializado).not.toContain('12345678909')
    expect(serializado).not.toContain('Ana Exemplo')
    expect(serializado).not.toContain('11900000000')
  })

  it('sem CPF: cpfMascarado null', () => {
    const resumo = resumirConfirmacao(montarPedido([margheritaM], { ...preenchido, querCPF: false }, 1234))
    expect(resumo.cpfMascarado).toBeNull()
  })
})
