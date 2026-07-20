import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PizzaCard } from '../../../src/components/cardapio/PizzaCard'

const pizzaComBadge = {
  id: 'calabresa',
  nome: 'Calabresa da Dona',
  ingredientes: 'Molho de tomate, muçarela, calabresa fatiada e orégano',
  extra: 5,
  badge: { tone: 'highlight' as const, label: 'Mais pedida' },
}

const pizzaSemBadge = {
  id: 'quatroqueijos',
  nome: 'Quatro queijos',
  ingredientes: 'Muçarela, provolone, parmesão e gorgonzola sobre molho de tomate',
  extra: 10,
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
    foto: 'pizza-calabresa.jpg',
    tamanhos,
    tamanhoSelecionado: 'M' as const,
    onSelecionarTamanho: vi.fn(),
    onAdicionar: vi.fn(),
    acabouDeAdicionar: false,
    ...overrides,
  }
  render(<PizzaCard {...props} />)
  return props
}

describe('PizzaCard', () => {
  it('renderiza nome e ingredientes da pizza', () => {
    renderCard()
    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(
      screen.getByText('Molho de tomate, muçarela, calabresa fatiada e orégano'),
    ).toBeInTheDocument()
  })

  it('renderiza o badge quando a pizza tem um', () => {
    renderCard()
    expect(screen.getByText('Mais pedida')).toBeInTheDocument()
  })

  it('não renderiza badge quando a pizza não tem um', () => {
    renderCard({ pizza: pizzaSemBadge })
    expect(screen.queryByText('Mais pedida')).not.toBeInTheDocument()
    expect(screen.queryByText('Vegetariana')).not.toBeInTheDocument()
  })

  it('renderiza a foto com alt igual ao nome da pizza', () => {
    renderCard()
    expect(screen.getByAltText('Calabresa da Dona')).toHaveAttribute('src', 'pizza-calabresa.jpg')
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
    expect(selecionado.getAttribute('style')).toContain('border: 2px solid var(--molho-600)')
  })

  it('chama onSelecionarTamanho com o tamanho clicado', async () => {
    const props = renderCard({ tamanhoSelecionado: 'M' })
    await userEvent.click(screen.getByRole('button', { name: /P\s+4 fatias/ }))
    expect(props.onSelecionarTamanho).toHaveBeenCalledWith('P')
  })

  it('mostra "Adicionar · {preço}" com o preço do tamanho selecionado', () => {
    renderCard({ tamanhoSelecionado: 'G' })
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 60,00' })).toBeInTheDocument()
  })

  it('chama onAdicionar ao clicar no botão de adicionar', async () => {
    const props = renderCard()
    await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }))
    expect(props.onAdicionar).toHaveBeenCalledTimes(1)
  })

  it('mostra "Adicionado ✓" quando acabouDeAdicionar é true', () => {
    renderCard({ acabouDeAdicionar: true })
    expect(screen.getByRole('button', { name: 'Adicionado ✓' })).toBeInTheDocument()
  })
})
