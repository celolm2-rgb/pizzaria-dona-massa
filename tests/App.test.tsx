import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('App', () => {
  it('abre na tela Home', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
  })

  it('navega para o Cardápio ao clicar em um CTA da Home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))

    expect(screen.getByRole('heading', { name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).not.toBeInTheDocument()
  })

  it('volta para a Home ao clicar no título da marca na tela de Cardápio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByRole('heading', { name: 'Nossas pizzas' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))

    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Nossas pizzas' })).not.toBeInTheDocument()
  })
})
