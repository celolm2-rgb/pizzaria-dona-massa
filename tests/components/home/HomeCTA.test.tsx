import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HomeCTA } from '../../../src/components/home/HomeCTA'

describe('HomeCTA', () => {
  it('renderiza o título e o texto do banner', () => {
    render(<HomeCTA onNavigateToCardapio={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Bateu a fome?' })).toBeInTheDocument()
    expect(screen.getByText('O forno já está quente — sua pizza sai em uns 40 minutos.')).toBeInTheDocument()
  })

  it('chama onNavigateToCardapio ao clicar em "Montar meu pedido"', async () => {
    const onNavigateToCardapio = vi.fn()
    const user = userEvent.setup()
    render(<HomeCTA onNavigateToCardapio={onNavigateToCardapio} />)
    await user.click(screen.getByRole('button', { name: 'Montar meu pedido' }))
    expect(onNavigateToCardapio).toHaveBeenCalledTimes(1)
  })
})
