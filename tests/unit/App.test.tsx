import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

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

  async function irAoCardapioEAdicionarMargherita(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M = R$ 45
  }

  async function finalizarEConfirmar(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido · R$ 57,00' }))
  }

  it('fluxo completo: Cardápio -> checkout -> "Pedido #1234", com o header e sem dados pessoais na tela', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    expect(screen.getByRole('heading', { name: 'Quase lá — falta só a gente saber quem é você' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Nossas pizzas' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido · R$ 57,00' }))
    expect(screen.getByRole('heading', { name: 'Sua pizza já vai pro forno!' })).toBeInTheDocument()
    expect(screen.getByText('Pedido #1234')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pizzaria Dona Massa' })).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Ana Exemplo')
    expect(document.body.textContent).not.toContain('90000-0000')
  })

  it('"Voltar para o início" vai para a Home (P-2); o carrinho foi esvaziado ao confirmar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    await user.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('Nenhuma pizza ainda')).toBeInTheDocument()
  })

  it('2º pedido na mesma sessão é "Pedido #1235" (P-1)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    await user.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    expect(screen.getByText('Pedido #1235')).toBeInTheDocument()
  })

  it('o carrinho sobrevive à ida e volta Home <-> Cardápio (P-6)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('"← Voltar ao cardápio" preserva o carrinho', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.click(screen.getByRole('button', { name: '← Voltar ao cardápio' }))
    expect(screen.getByRole('heading', { name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('FR-2: wordmark no checkout -> Home -> Cardápio preserva o carrinho (P-6)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })
})
