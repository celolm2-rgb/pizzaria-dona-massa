import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PizzaCard } from '../../../../src/components/cardapio/PizzaCard'

const pizzaComBadge = {
  id: 'margherita',
  nome: 'Margherita da casa',
  ingredientes: 'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
  extra: 0,
  badge: { tone: 'highlight' as const, label: 'Mais pedida' },
}

const pizzaSemBadge = {
  id: 'calabresa',
  nome: 'Calabresa da Dona',
  ingredientes: 'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
  extra: 5,
  badge: null,
}

const tamanhos = [
  { k: 'P' as const, fatias: '4 fatias', precoFormatado: 'R$ 40,00' },
  { k: 'M' as const, fatias: '6 fatias', precoFormatado: 'R$ 50,00' },
  { k: 'G' as const, fatias: '8 fatias', precoFormatado: 'R$ 60,00' },
]

function renderCard(overrides = {}) {
  const props = {
    pizza: pizzaComBadge,
    foto: 'pizza-margherita.jpg',
    tamanhos,
    tamanhoSelecionado: 'M' as const,
    precoSelecionadoFormatado: 'R$ 50,00',
    fatiasSelecionadas: '6 fatias',
    onSelecionarTamanho: vi.fn(),
    onAdicionar: vi.fn(),
    ...overrides,
  }
  render(<PizzaCard {...props} />)
  return props
}

describe('PizzaCard', () => {
  it('renderiza nome e ingredientes da pizza', () => {
    renderCard()
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(
      screen.getByText('Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.'),
    ).toBeInTheDocument()
  })

  it('renderiza o badge quando a pizza tem um', () => {
    renderCard()
    expect(screen.getByText('Mais pedida')).toBeInTheDocument()
  })

  it('não renderiza badge quando a pizza não tem um', () => {
    renderCard({ pizza: pizzaSemBadge })
    expect(screen.queryByText('Mais pedida')).not.toBeInTheDocument()
    expect(screen.queryByText('Da casa')).not.toBeInTheDocument()
  })

  it('selo fica à direita do nome, na mesma linha', () => {
    renderCard()
    const nome = screen.getByRole('heading', { name: 'Margherita da casa' })
    expect(nome.nextElementSibling).toBe(screen.getByText('Mais pedida'))
    expect(nome.parentElement).toHaveStyle({ display: 'flex', justifyContent: 'space-between' })
  })

  it('renderiza a foto com alt igual ao nome da pizza', () => {
    renderCard()
    expect(screen.getByAltText('Margherita da casa')).toHaveAttribute('src', 'pizza-margherita.jpg')
  })

  it('renderiza os 3 tamanhos na ordem P/M/G com fatias e preço já formatados', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /P\s+4 fatias/ })).toHaveTextContent('R$ 40,00')
    expect(screen.getByRole('button', { name: /M\s+6 fatias/ })).toHaveTextContent('R$ 50,00')
    expect(screen.getByRole('button', { name: /G\s+8 fatias/ })).toHaveTextContent('R$ 60,00')
  })

  it('marca visualmente o tamanho selecionado', () => {
    renderCard({ tamanhoSelecionado: 'M' })
    const selecionado = screen.getByRole('button', { name: /M\s+6 fatias/, pressed: true })
    expect(selecionado.getAttribute('style')).toContain('border: 2px solid var(--action-primary)')
  })

  it('pílula usa só font-family, sem font: inherit nem line-height (Decisões, item 6)', () => {
    renderCard()
    const estilo = screen.getByRole('button', { name: /P\s+4 fatias/ }).getAttribute('style') ?? ''
    expect(estilo).toContain('font-family: var(--font-body)')
    expect(estilo).not.toMatch(/(^|;)\s*font:/)
    expect(estilo).not.toContain('line-height')
  })

  it('hover na pílula não selecionada usa surface-raised; a selecionada não tem hover', () => {
    renderCard({ tamanhoSelecionado: 'M' })
    const naoSelecionada = screen.getByRole('button', { name: /P\s+4 fatias/ })
    fireEvent.mouseEnter(naoSelecionada)
    expect(naoSelecionada).toHaveStyle({ background: 'var(--surface-raised)' })

    const selecionada = screen.getByRole('button', { name: /M\s+6 fatias/, pressed: true })
    fireEvent.mouseEnter(selecionada)
    expect(selecionada).toHaveStyle({ background: 'var(--massa-50)' })
    // --surface-raised e --massa-50 têm a mesma cor: conferir também a borda da selecionada
    expect(selecionada.getAttribute('style')).toContain('border: 2px solid var(--action-primary)')
  })

  it('chama onSelecionarTamanho com o tamanho clicado', async () => {
    const props = renderCard({ tamanhoSelecionado: 'M' })
    await userEvent.click(screen.getByRole('button', { name: /P\s+4 fatias/ }))
    expect(props.onSelecionarTamanho).toHaveBeenCalledWith('P')
  })

  it('mostra o resumo do tamanho selecionado com o preço atual e o botão "Adicionar"', () => {
    renderCard({ tamanhoSelecionado: 'G', precoSelecionadoFormatado: 'R$ 60,00', fatiasSelecionadas: '8 fatias' })
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument()
    // "R$ 60,00" aparece 2 vezes (pílula G e resumo): proibido getByText('R$ 60,00') solto
    expect(within(screen.getByText('Tamanho G · 8 fatias').parentElement!).getByText('R$ 60,00')).toBeInTheDocument()
  })

  it('chama onAdicionar ao clicar no botão de adicionar', async () => {
    const props = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(props.onAdicionar).toHaveBeenCalledTimes(1)
  })
})
