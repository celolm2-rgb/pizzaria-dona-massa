import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CardapioPage } from '../../../../src/components/cardapio/CardapioPage'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }

// o carrinho agora mora no App (P-6); o teste faz o papel do App
function CardapioComEstado({ inicial = [], onFinalizar = () => {} }: { inicial?: ItemCarrinho[]; onFinalizar?: () => void }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(inicial)
  return <CardapioPage carrinho={carrinho} onCarrinhoChange={setCarrinho} onFinalizar={onFinalizar} />
}

describe('CardapioPage — integração listagem + carrinho', () => {
  it('adicionar uma pizza G ao carrinho atualiza o total e o aviso de frete grátis', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)

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
    expect(aviso.textContent).toContain('para frete grátis')
  })

  it('a linha do item mostra tamanho, fatias e preço unitário; "tirar" remove o item', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    const carrinho = screen.getByRole('complementary')

    // Margherita é a 1ª pizza (índice 0), tamanho padrão M = R$ 45
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])

    expect(within(carrinho).getByText('Tamanho M · 6 fatias · R$ 45,00 cada')).toBeInTheDocument()

    await user.click(within(carrinho).getByRole('button', { name: 'tirar' }))

    expect(within(carrinho).queryByText('Margherita da casa')).not.toBeInTheDocument()
    expect(within(carrinho).getByText(/vazio/)).toBeInTheDocument()
  })

  it('o botão "tirar" usa só font-family, sem font: inherit nem line-height (Decisões, item 6)', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])

    const estilo = within(screen.getByRole('complementary')).getByRole('button', { name: 'tirar' }).getAttribute('style') ?? ''
    expect(estilo).toContain('font-family: var(--font-body)')
    expect(estilo).toContain('font-size: var(--fs-caption)')
    expect(estilo).not.toMatch(/(^|;)\s*font:/)
    expect(estilo).not.toContain('line-height')
  })

  it('o resumo do carrinho soma as quantidades: nenhuma → 1 → 2 pizzas', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    const carrinho = screen.getByRole('complementary')

    expect(within(carrinho).getByText('Nenhuma pizza ainda')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    expect(within(carrinho).getByText('1 pizza no carrinho')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // mesma chave → qty 2
    expect(within(carrinho).getByText('2 pizzas no carrinho')).toBeInTheDocument()
    expect(within(carrinho).getByText('Entrega')).toBeInTheDocument()
  })

  it('mesmo sabor em 2 tamanhos vira 2 linhas e o resumo conta 2 pizzas', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    const carrinho = screen.getByRole('complementary')

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    await user.click(screen.getAllByRole('button', { name: /^G/ })[0]) // Margherita → G
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita G

    expect(within(carrinho).getAllByRole('button', { name: 'tirar' })).toHaveLength(2)
    expect(within(carrinho).getByText('2 pizzas no carrinho')).toBeInTheDocument()
  })

  it('subtotal exatamente R$ 100,00 libera frete grátis (limiar inclusivo)', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    const carrinho = screen.getByRole('complementary')

    // Calabresa é a 2ª pizza (índice 1); M = 45 + 5 = R$ 50; 2 × 50 = R$ 100
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[1])
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[1])

    expect(within(carrinho).getByText('Grátis')).toBeInTheDocument()
    expect(
      within(carrinho).getByText('Frete grátis liberado! A entrega é por nossa conta.'),
    ).toBeInTheDocument()
    expect(within(carrinho).queryByText(/Faltam/)).not.toBeInTheDocument()
  })

  it('diminuir até zero remove a linha e volta ao estado vazio, sem aviso de frete', async () => {
    const user = userEvent.setup()
    render(<CardapioComEstado />)
    const carrinho = screen.getByRole('complementary')

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])
    await user.click(within(carrinho).getByRole('button', { name: 'Diminuir quantidade' }))

    expect(within(carrinho).getByText('Nenhuma pizza ainda')).toBeInTheDocument()
    expect(within(carrinho).getByText(/vazio/)).toBeInTheDocument()
    expect(within(carrinho).queryByText(/Faltam/)).not.toBeInTheDocument()
  })
})

describe('CardapioPage — título e layout', () => {
  it('renderiza o h1 "Nossas pizzas" e a intro literal do mockup', () => {
    render(<CardapioComEstado />)
    expect(screen.getByRole('heading', { level: 1, name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa.',
      ),
    ).toBeInTheDocument()
  })

  it('o título fica fora da grade de 2 colunas (largura total, acima de pizzas e pedido)', () => {
    render(<CardapioComEstado />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Nossas pizzas' })
    const gradeDeColunas = screen.getByRole('complementary').parentElement!
    expect(gradeDeColunas.contains(h1)).toBe(false)
    expect(gradeDeColunas).toHaveStyle({ display: 'grid' })
  })
})

describe('CardapioPage — carrinho por props (P-6)', () => {
  it('mostra o carrinho recebido por prop', () => {
    render(<CardapioComEstado inicial={[margheritaM]} />)
    expect(within(screen.getByRole('complementary')).getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('adicionar chama onCarrinhoChange com uma função de atualização (o estado não é local)', async () => {
    const user = userEvent.setup()
    const onCarrinhoChange = vi.fn()
    render(<CardapioPage carrinho={[]} onCarrinhoChange={onCarrinhoChange} onFinalizar={vi.fn()} />)
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    expect(onCarrinhoChange).toHaveBeenCalledTimes(1)
    const atualizar = onCarrinhoChange.mock.calls[0][0] as (atual: ItemCarrinho[]) => ItemCarrinho[]
    expect(atualizar([])).toEqual([margheritaM])
    expect(within(screen.getByRole('complementary')).getByText('Nenhuma pizza ainda')).toBeInTheDocument()
  })

  it('"Finalizar pedido" chama onFinalizar', async () => {
    const user = userEvent.setup()
    const onFinalizar = vi.fn()
    render(<CardapioComEstado inicial={[margheritaM]} onFinalizar={onFinalizar} />)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    expect(onFinalizar).toHaveBeenCalledTimes(1)
  })
})
