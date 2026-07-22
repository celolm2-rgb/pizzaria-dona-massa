import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PizzaGrid } from '../../../../src/components/cardapio/PizzaGrid'

describe('PizzaGrid', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza o título e o subtítulo da seção', () => {
    render(<PizzaGrid />)
    expect(screen.getByRole('heading', { name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(screen.getByText('Escolha o tamanho e adicione ao pedido')).toBeInTheDocument()
  })

  it('renderiza as 3 pizzas do catálogo', () => {
    render(<PizzaGrid />)
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(screen.getByText('Quatro queijos')).toBeInTheDocument()
  })

  it('cada pizza começa com o tamanho M selecionado, com preço já somando o extra do sabor', () => {
    render(<PizzaGrid />)
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 45,00' })).toBeInTheDocument() // Margherita M (extra 0)
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 50,00' })).toBeInTheDocument() // Calabresa M (extra 5)
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 55,00' })).toBeInTheDocument() // Quatro queijos M (extra 10)
  })

  it('selecionar um tamanho em uma pizza não afeta as outras', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<PizzaGrid />)
    const botoesP = screen.getAllByRole('button', { name: /^P\s/ })
    await user.click(botoesP[0]) // seleciona P na Margherita

    expect(screen.getByRole('button', { name: 'Adicionar · R$ 35,00' })).toBeInTheDocument() // Margherita agora em P
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 50,00' })).toBeInTheDocument() // Calabresa continua em M
    expect(screen.getByRole('button', { name: 'Adicionar · R$ 55,00' })).toBeInTheDocument() // Quatro queijos continua em M
  })

  it('mostra "Adicionado ✓" ao clicar em Adicionar e volta ao normal depois de um tempo', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<PizzaGrid />)
    await user.click(screen.getByRole('button', { name: 'Adicionar · R$ 45,00' }))

    expect(screen.getByRole('button', { name: 'Adicionado ✓' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByRole('button', { name: 'Adicionar · R$ 45,00' })).toBeInTheDocument()
  })
})
