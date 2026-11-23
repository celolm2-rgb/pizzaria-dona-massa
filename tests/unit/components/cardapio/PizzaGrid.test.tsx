import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PizzaGrid } from '../../../../src/components/cardapio/PizzaGrid'

describe('PizzaGrid', () => {
  it('renderiza as 3 pizzas do catálogo', () => {
    render(<PizzaGrid />)
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(screen.getByText('Quatro queijos')).toBeInTheDocument()
  })

  it('cada pizza começa com o tamanho M selecionado, com preço já somando o extra do sabor', () => {
    render(<PizzaGrid />)
    const resumos = screen.getAllByText('Tamanho M · 6 fatias')
    expect(resumos).toHaveLength(3)
    expect(within(resumos[0].parentElement!).getByText('R$ 45,00')).toBeInTheDocument() // Margherita M (extra 0)
    expect(within(resumos[1].parentElement!).getByText('R$ 50,00')).toBeInTheDocument() // Calabresa M (extra 5)
    expect(within(resumos[2].parentElement!).getByText('R$ 55,00')).toBeInTheDocument() // Quatro queijos M (extra 10)
  })

  it('selecionar um tamanho em uma pizza não afeta as outras', async () => {
    const user = userEvent.setup()
    render(<PizzaGrid />)
    await user.click(screen.getAllByRole('button', { name: /^P\s/ })[0]) // P na Margherita

    expect(within(screen.getByText('Tamanho P · 4 fatias').parentElement!).getByText('R$ 35,00')).toBeInTheDocument()
    const resumosM = screen.getAllByText('Tamanho M · 6 fatias')
    expect(resumosM).toHaveLength(2)
    expect(within(resumosM[0].parentElement!).getByText('R$ 50,00')).toBeInTheDocument() // Calabresa continua em M
    expect(within(resumosM[1].parentElement!).getByText('R$ 55,00')).toBeInTheDocument() // Quatro queijos continua em M
  })

  it('os botões de adicionar têm copy fixa "Adicionar" (sem preço, sem "Adicionado ✓")', async () => {
    const user = userEvent.setup()
    render(<PizzaGrid />)
    const botoes = screen.getAllByRole('button', { name: 'Adicionar' })
    expect(botoes).toHaveLength(3)
    await user.click(botoes[0])
    expect(screen.getAllByRole('button', { name: 'Adicionar' })).toHaveLength(3)
    expect(screen.queryByText('Adicionado ✓')).not.toBeInTheDocument()
  })
})
