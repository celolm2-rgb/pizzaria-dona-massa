import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CardapioHeader } from '../../../../src/components/cardapio/CardapioHeader'

describe('CardapioHeader', () => {
  it('renderiza o wordmark e a tagline da marca', () => {
    render(<CardapioHeader onNavigateToHome={() => {}} />)
    expect(screen.getByText('Pizzaria Dona Massa')).toBeInTheDocument()
    expect(screen.getByText('Aberto hoje até 23h · entrega em uns 40 minutos')).toBeInTheDocument()
  })

  it('chama onNavigateToHome ao clicar no título da marca', async () => {
    const onNavigateToHome = vi.fn()
    const user = userEvent.setup()
    render(<CardapioHeader onNavigateToHome={onNavigateToHome} />)
    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))
    expect(onNavigateToHome).toHaveBeenCalledTimes(1)
  })
})
