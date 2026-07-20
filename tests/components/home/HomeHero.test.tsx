import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomeHero } from '../../../src/components/home/HomeHero'

describe('HomeHero', () => {
  it('renderiza o badge, o título e a nota de frete grátis', () => {
    render(<HomeHero onNavigateToCardapio={() => {}} />)
    expect(screen.getByText('Forno aceso hoje até as 23h')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    expect(screen.getByText('Entrega grátis acima de R$ 100,00')).toBeInTheDocument()
  })

  it('renderiza a foto do hero com o alt correto', () => {
    render(<HomeHero onNavigateToCardapio={() => {}} />)
    expect(screen.getByAltText('Pizza saindo do forno')).toBeInTheDocument()
  })

  it('chama onNavigateToCardapio ao clicar em "Ver o cardápio"', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<HomeHero onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })
})
