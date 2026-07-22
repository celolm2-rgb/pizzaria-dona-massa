import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../../../src/components/home/HomePage'

describe('HomePage', () => {
  it('compõe todas as seções da landing', () => {
    render(<HomePage onNavigateToCardapio={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Como funciona' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Favoritas da casa' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bateu a fome?' })).toBeInTheDocument()
    expect(
      screen.getByText('Aberto todos os dias, das 18h às 23h · Rua do Forno, 52 — Vila Mariana'),
    ).toBeInTheDocument()
  })

  it('repassa onNavigateToCardapio para os CTAs internos', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<HomePage onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByRole('button', { name: 'Montar meu pedido' }))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })
})
