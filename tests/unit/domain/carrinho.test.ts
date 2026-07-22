import { describe, expect, it } from 'vitest'
import {
  adicionarItem,
  alterarQuantidade,
  calcularFaltaParaFreteGratis,
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  ehFreteGratis,
  removerItem,
} from '../../../src/domain/carrinho'

const item = (key: string, preco: number, qty: number) => ({
  key,
  nome: 'Pizza',
  tam: 'M' as const,
  preco,
  qty,
})

describe('calcularSubtotal', () => {
  it('carrinho vazio → 0', () => {
    expect(calcularSubtotal([])).toBe(0)
  })

  it('soma preco * qty de múltiplos itens', () => {
    const carrinho = [item('a', 45, 2), item('b', 55, 1)]
    expect(calcularSubtotal(carrinho)).toBe(145)
  })
})

describe('ehFreteGratis (limiar de R$100)', () => {
  it('abaixo de R$100 → false', () => {
    expect(ehFreteGratis(99)).toBe(false)
  })

  it('exatamente R$100 → true (limiar é inclusivo)', () => {
    expect(ehFreteGratis(100)).toBe(true)
  })

  it('acima de R$100 → true', () => {
    expect(ehFreteGratis(150)).toBe(true)
  })
})

describe('calcularFrete', () => {
  it('carrinho vazio → 0, mesmo com subtotal 0', () => {
    expect(calcularFrete(0, false)).toBe(0)
  })

  it('abaixo do limiar → cobra R$12', () => {
    expect(calcularFrete(99, true)).toBe(12)
  })

  it('exatamente no limiar (R$100) → grátis', () => {
    expect(calcularFrete(100, true)).toBe(0)
  })

  it('acima do limiar → grátis', () => {
    expect(calcularFrete(150, true)).toBe(0)
  })
})

describe('calcularFaltaParaFreteGratis', () => {
  it('abaixo do limiar → diferença exata', () => {
    expect(calcularFaltaParaFreteGratis(63)).toBe(37)
  })

  it('exatamente no limiar → 0', () => {
    expect(calcularFaltaParaFreteGratis(100)).toBe(0)
  })

  it('acima do limiar → 0 (nunca negativo)', () => {
    expect(calcularFaltaParaFreteGratis(150)).toBe(0)
  })
})

describe('adicionarItem', () => {
  const novoItem = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M' as const, preco: 45 }

  it('carrinho vazio + item novo → 1 item com qty 1', () => {
    expect(adicionarItem([], novoItem)).toEqual([{ ...novoItem, qty: 1 }])
  })

  it('mesma chave (mesmo sabor + tamanho) já no carrinho → incrementa qty em vez de duplicar', () => {
    const carrinho = [{ ...novoItem, qty: 1 }]
    expect(adicionarItem(carrinho, novoItem)).toEqual([{ ...novoItem, qty: 2 }])
  })

  it('mesmo sabor em tamanho diferente → dois itens distintos', () => {
    const carrinho = [{ ...novoItem, qty: 1 }]
    const outroTamanho = { key: 'margherita-G', nome: 'Margherita da casa', tam: 'G' as const, preco: 55 }
    expect(adicionarItem(carrinho, outroTamanho)).toEqual([
      { ...novoItem, qty: 1 },
      { ...outroTamanho, qty: 1 },
    ])
  })
})

describe('alterarQuantidade', () => {
  const item = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M' as const, preco: 45, qty: 1 }

  it('+1 → qty do item aumenta', () => {
    expect(alterarQuantidade([item], 'margherita-M', 1)).toEqual([{ ...item, qty: 2 }])
  })

  it('-1 quando qty é 1 → item é removido do carrinho', () => {
    expect(alterarQuantidade([item], 'margherita-M', -1)).toEqual([])
  })

  it('chave inexistente → carrinho retorna inalterado', () => {
    expect(alterarQuantidade([item], 'inexistente', 1)).toEqual([item])
  })
})

describe('removerItem', () => {
  it('remove só o item da chave indicada, mantendo os demais', () => {
    const a = { key: 'a', nome: 'A', tam: 'M' as const, preco: 45, qty: 1 }
    const b = { key: 'b', nome: 'B', tam: 'G' as const, preco: 55, qty: 2 }
    expect(removerItem([a, b], 'a')).toEqual([b])
  })
})

describe('calcularTotal', () => {
  it('subtotal + frete cobrado', () => {
    expect(calcularTotal(90, 12)).toBe(102)
  })

  it('subtotal + frete grátis', () => {
    expect(calcularTotal(150, 0)).toBe(150)
  })
})
