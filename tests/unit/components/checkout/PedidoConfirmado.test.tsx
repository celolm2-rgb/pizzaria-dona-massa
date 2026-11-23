import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PedidoConfirmado } from '../../../../src/components/checkout/PedidoConfirmado'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'
import type { ResumoConfirmacao } from '../../../../src/domain/pedido'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const comCPF: ResumoConfirmacao = { numero: 1234, itens: [margheritaM, calabresaG], total: 105, cpfMascarado: '***.456.789-**' }

describe('PedidoConfirmado', () => {
  it('badge, título, número, prazo, itens e total', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    expect(screen.getByText('Pedido confirmado')).toHaveStyle({ background: 'var(--accent-success-bg)' })
    expect(screen.getByRole('heading', { level: 1, name: 'Sua pizza já vai pro forno!' })).toBeInTheDocument()
    expect(screen.getByText('Pedido #1234')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-title)',
    })
    expect(screen.getByText('Chega quentinha em uns 40 minutos.')).toHaveStyle({
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-body)',
    })
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Tamanho G · 8 fatias')).toBeInTheDocument()
    expect(screen.getByText('R$ 60,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 105,00')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('o número vem da confirmação, não do literal do mockup', () => {
    render(<PedidoConfirmado confirmacao={{ ...comCPF, numero: 1235 }} onInicio={vi.fn()} />)
    expect(screen.getByText('Pedido #1235')).toBeInTheDocument()
    expect(screen.queryByText('Pedido #1234')).not.toBeInTheDocument()
  })

  it('com cpfMascarado: "CPF na nota: ***.456.789-**" (guarda: nunca o completo)', () => {
    const { container } = render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    expect(screen.getByText('CPF na nota: ***.456.789-**')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      color: 'var(--text-muted)',
    })
    expect(container.textContent).not.toContain('123.456.789-09')
  })

  it('sem CPF: não há "CPF na nota"', () => {
    render(<PedidoConfirmado confirmacao={{ ...comCPF, cpfMascarado: null }} onInicio={vi.fn()} />)
    expect(screen.queryByText(/CPF na nota/)).not.toBeInTheDocument()
  })

  it('itens sem divisória; bloco de itens com borda superior e padding-top sp-4', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    const linha = (screen.getByText('Margherita da casa').parentElement as HTMLElement).parentElement as HTMLElement
    expect(linha.getAttribute('style')).not.toContain('border-bottom')
    expect(linha.getAttribute('style')).not.toContain('padding-bottom')
    const bloco = linha.parentElement as HTMLElement
    expect(bloco.getAttribute('style')).toContain('border-top: var(--border-card)')
    expect(bloco.getAttribute('style')).toContain('padding-top: var(--sp-4)')
  })

  it('layout: main 1200px centralizado; conteúdo max 520px', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    const main = screen.getByRole('main')
    expect(main).toHaveStyle({ maxWidth: '1200px', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' })
    expect(main.getAttribute('style')).toContain('padding: var(--sp-8)')
    expect(main.firstElementChild).toHaveStyle({ width: '100%', maxWidth: '520px' })
  })

  it('"Voltar para o início" chama onInicio', async () => {
    const onInicio = vi.fn()
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={onInicio} />)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    expect(onInicio).toHaveBeenCalledTimes(1)
  })
})
