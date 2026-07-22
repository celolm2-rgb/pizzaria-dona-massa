import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CardapioPage } from '../../../../src/components/cardapio/CardapioPage'

describe('CardapioPage — integração listagem + carrinho', () => {
  it('adicionar uma pizza G ao carrinho atualiza o total e o aviso de frete grátis', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)

    const carrinho = screen.getByRole('complementary')
    expect(within(carrinho).getByText(/vazio/)).toBeInTheDocument()

    // "Quatro queijos" é a 3ª pizza da grade (índice 2); extra +R$10 → G = R$65
    await user.click(screen.getAllByRole('button', { name: /^G/ })[2])
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[2])

    expect(within(carrinho).getByText('Quatro queijos')).toBeInTheDocument()
    expect(within(carrinho).getByText(/Tamanho G/)).toBeInTheDocument()

    // subtotal 65 + frete 12 (abaixo do limiar de R$100) = total 77
    expect(within(carrinho).getByText('R$ 77,00')).toBeInTheDocument()

    const aviso = within(carrinho).getByText(/Faltam/)
    expect(aviso.textContent).toContain('R$ 35,00')
    expect(aviso.textContent).toContain('para o frete grátis')
  })
})
