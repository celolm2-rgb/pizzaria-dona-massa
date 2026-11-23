import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Favoritas } from '../../../../src/components/home/Favoritas'

describe('Favoritas', () => {
  it('renderiza o título e o subtítulo da seção', () => {
    render(<Favoritas onNavigateToCardapio={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Favoritas da casa' })).toBeInTheDocument()
    expect(screen.getByText('As mais pedidas da vizinhança')).toBeInTheDocument()
  })

  it('renderiza as 3 pizzas do catálogo com o preço "a partir de" derivado do domínio', () => {
    render(<Favoritas onNavigateToCardapio={() => {}} />)

    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 35,00')).toBeInTheDocument()
    expect(screen.getByText('Mais pedida')).toBeInTheDocument()

    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 40,00')).toBeInTheDocument()
    expect(
      screen.getByText('Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.'),
    ).toBeInTheDocument()

    expect(screen.getByText('Quatro queijos')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 45,00')).toBeInTheDocument()
    expect(screen.getByText('Da casa')).toBeInTheDocument()
  })

  it('não mostra badge para a pizza sem badge no catálogo', () => {
    render(<Favoritas onNavigateToCardapio={() => {}} />)
    expect(screen.queryByText('Vegetariana')).not.toBeInTheDocument()
    // Calabresa tem badge null no catálogo — só 2 badges devem existir no total
    expect(screen.getAllByText(/Mais pedida|Da casa/)).toHaveLength(2)
  })

  it('chama onNavigateToCardapio ao clicar em uma pizza favorita', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<Favoritas onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByText('Margherita da casa'))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })

  it('chama onNavigateToCardapio ao clicar em "Ver cardápio completo"', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<Favoritas onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByRole('link', { name: 'Ver cardápio completo →' }))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })
})
