import { describe, expect, it } from 'vitest'
import { fatiasPorTamanho, listarTamanhosComPreco, PIZZAS, precoPorTamanho } from '../../../src/domain/cardapio'

describe('precoPorTamanho', () => {
  it('P sem extra de sabor (Margherita) → R$35', () => {
    expect(precoPorTamanho('P', 0)).toBe(35)
  })

  it('M sem extra de sabor (Margherita) → R$45', () => {
    expect(precoPorTamanho('M', 0)).toBe(45)
  })

  it('G sem extra de sabor (Margherita) → R$55', () => {
    expect(precoPorTamanho('G', 0)).toBe(55)
  })

  it('P com +R$5 de sabor (Calabresa) → R$40', () => {
    expect(precoPorTamanho('P', 5)).toBe(40)
  })

  it('M com +R$10 de sabor (Quatro queijos) → R$55', () => {
    expect(precoPorTamanho('M', 10)).toBe(55)
  })

  it('G com +R$10 de sabor (Quatro queijos) → R$65', () => {
    expect(precoPorTamanho('G', 10)).toBe(65)
  })
})

describe('listarTamanhosComPreco', () => {
  it('retorna os 3 tamanhos na ordem P/M/G com fatias e preço corretos', () => {
    expect(listarTamanhosComPreco(0)).toEqual([
      { k: 'P', fatias: '4 fatias', preco: 35 },
      { k: 'M', fatias: '6 fatias', preco: 45 },
      { k: 'G', fatias: '8 fatias', preco: 55 },
    ])
  })

  it('aplica o extra do sabor em todos os tamanhos', () => {
    expect(listarTamanhosComPreco(10)).toEqual([
      { k: 'P', fatias: '4 fatias', preco: 45 },
      { k: 'M', fatias: '6 fatias', preco: 55 },
      { k: 'G', fatias: '8 fatias', preco: 65 },
    ])
  })
})

describe('fatiasPorTamanho', () => {
  it("P → '4 fatias'", () => {
    expect(fatiasPorTamanho('P')).toBe('4 fatias')
  })

  it("M → '6 fatias'", () => {
    expect(fatiasPorTamanho('M')).toBe('6 fatias')
  })

  it("G → '8 fatias'", () => {
    expect(fatiasPorTamanho('G')).toBe('8 fatias')
  })
})

describe('PIZZAS (catálogo)', () => {
  it('tem exatamente 3 pizzas, fielmente extraídas do Cardapio.dc.html redesenhado (02dc2137)', () => {
    expect(PIZZAS).toEqual([
      {
        id: 'margherita',
        nome: 'Margherita da casa',
        ingredientes: 'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
        extra: 0,
        badge: { tone: 'highlight', label: 'Mais pedida' },
      },
      {
        id: 'calabresa',
        nome: 'Calabresa da Dona',
        ingredientes: 'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
        extra: 5,
        badge: null,
      },
      {
        id: 'quatroqueijos',
        nome: 'Quatro queijos',
        ingredientes: 'Muçarela, provolone, parmesão e gorgonzola derretidos juntos.',
        extra: 10,
        badge: { tone: 'success', label: 'Da casa' },
      },
    ])
  })
})
