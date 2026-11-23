import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartPanel, type CartPanelProps } from '../../../../src/components/cardapio/CartPanel'

const margheritaM = {
  key: 'margherita-M',
  nome: 'Margherita da casa',
  tam: 'M' as const,
  fatias: '6 fatias',
  qty: 1,
  precoUnitFormatado: 'R$ 45,00',
  precoTotalFormatado: 'R$ 45,00',
}

function renderPanel(overrides: Partial<CartPanelProps> = {}) {
  const props: CartPanelProps = {
    itens: [margheritaM],
    quantidadePizzas: 1,
    subtotalFormatado: 'R$ 45,00',
    freteFormatado: 'R$ 12,00',
    freteGratis: false,
    totalFormatado: 'R$ 57,00',
    faltaParaFreteGratisFormatado: 'R$ 55,00',
    onIncrementar: vi.fn(),
    onDecrementar: vi.fn(),
    onRemover: vi.fn(),
    onFinalizar: vi.fn(),
    ...overrides,
  }
  render(<CartPanel {...props} />)
  return props
}

const vazio: Partial<CartPanelProps> = {
  itens: [],
  quantidadePizzas: 0,
  subtotalFormatado: 'R$ 0,00',
  freteFormatado: 'R$ 0,00',
  totalFormatado: 'R$ 0,00',
  faltaParaFreteGratisFormatado: 'R$ 100,00',
}

describe('CartPanel', () => {
  it('vazio: resumo "Nenhuma pizza ainda", mensagem de vazio, sem subtotal e sem aviso', () => {
    renderPanel(vazio)
    expect(screen.getByRole('heading', { name: 'Seu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Nenhuma pizza ainda')).toBeInTheDocument()
    expect(
      screen.getByText('Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument()
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Frete grátis liberado/)).not.toBeInTheDocument()
  })

  it('resumo no singular com 1 pizza', () => {
    renderPanel({ quantidadePizzas: 1 })
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('resumo no plural com 3 pizzas', () => {
    renderPanel({
      itens: [{ ...margheritaM, qty: 3, precoTotalFormatado: 'R$ 135,00' }],
      quantidadePizzas: 3,
    })
    expect(screen.getByText('3 pizzas no carrinho')).toBeInTheDocument()
  })

  it('frete pago: linha "Entrega" com o valor e aviso "Faltam … para frete grátis"', () => {
    renderPanel()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('R$ 12,00')).toBeInTheDocument()
    expect(screen.getByText('Faltam R$ 55,00 para frete grátis')).toHaveStyle({
      background: 'var(--accent-highlight-bg)',
      color: 'var(--crosta-600)',
    })
    expect(screen.queryByText(/Frete grátis liberado/)).not.toBeInTheDocument()
  })

  it('frete grátis: "Grátis" em manjericão-700 e aviso de frete grátis liberado', () => {
    renderPanel({
      itens: [{ ...margheritaM, qty: 3, precoTotalFormatado: 'R$ 135,00' }],
      quantidadePizzas: 3,
      subtotalFormatado: 'R$ 135,00',
      freteFormatado: 'Grátis',
      freteGratis: true,
      totalFormatado: 'R$ 135,00',
      faltaParaFreteGratisFormatado: 'R$ 0,00',
    })
    expect(screen.getByText('Grátis')).toHaveStyle({ color: 'var(--manjericao-700)' })
    expect(screen.getByText('Frete grátis liberado! A entrega é por nossa conta.')).toHaveStyle({
      background: 'var(--accent-success-bg)',
      color: 'var(--manjericao-700)',
    })
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument()
  })

  it('o aviso de frete vem DEPOIS do total', () => {
    renderPanel()
    const total = screen.getByText('Total')
    const aviso = screen.getByText('Faltam R$ 55,00 para frete grátis')
    expect(total.compareDocumentPosition(aviso) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('com itens: "Finalizar pedido" depois do aviso e a frase de entrega depois do botão; clique chama onFinalizar', async () => {
    const props = renderPanel()
    const aviso = screen.getByText('Faltam R$ 55,00 para frete grátis')
    const botao = screen.getByRole('button', { name: 'Finalizar pedido' })
    const frase = screen.getByText('Sai do forno e chega quentinha em uns 40 minutos.')
    expect(aviso.compareDocumentPosition(botao) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(botao.compareDocumentPosition(frase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(botao).toHaveStyle({ width: '100%', background: 'var(--action-primary)' })
    expect(frase.tagName).toBe('SPAN')
    expect(frase).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-muted)',
      textAlign: 'center',
    })
    await userEvent.click(botao)
    expect(props.onFinalizar).toHaveBeenCalledTimes(1)
  })

  it('com itens, o card tem 6 blocos (cabeçalho, itens, somas, aviso, botão, frase)', () => {
    renderPanel()
    const card = (screen.getByRole('heading', { name: 'Seu pedido' }).parentElement as HTMLElement).parentElement as HTMLElement
    expect(card.children).toHaveLength(6)
  })

  it('vazio: sem "Finalizar pedido" e sem a frase', () => {
    renderPanel(vazio)
    expect(screen.queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Sai do forno/)).not.toBeInTheDocument()
  })
})
