import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomeHeader } from '../../../src/components/home/HomeHeader'

describe('HomeHeader', () => {
  it('renderiza o wordmark da marca', () => {
    render(<HomeHeader onNavigateToCardapio={() => {}} />)
    expect(screen.getByText('Pizzaria Dona Massa')).toBeInTheDocument()
  })

  it('renderiza os links de navegação para as âncoras da própria página', () => {
    render(<HomeHeader onNavigateToCardapio={() => {}} />)
    expect(screen.getByRole('link', { name: 'Como funciona' })).toHaveAttribute('href', '#como-funciona')
    expect(screen.getByRole('link', { name: 'Favoritas da casa' })).toHaveAttribute('href', '#favoritas')
  })

  it('chama onNavigateToCardapio ao clicar em "Pedir agora"', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<HomeHeader onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByRole('button', { name: 'Pedir agora' }))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })
})
