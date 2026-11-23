import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LinhaTotal, TotaisPedido } from '../../../../src/components/pedido/TotaisPedido'

describe('TotaisPedido', () => {
  it('frete grátis: rótulos, valores e "Grátis" em manjericão-700 bold', () => {
    const { container } = render(
      <TotaisPedido subtotalFormatado="R$ 105,00" freteFormatado="Grátis" freteGratis totalFormatado="R$ 105,00" />,
    )
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 105,00')).toHaveLength(2)
    expect(screen.getByText('Grátis')).toHaveStyle({ color: 'var(--manjericao-700)', fontWeight: 'var(--fw-bold)' })
    const raiz = container.firstElementChild as HTMLElement
    expect(raiz.tagName).toBe('DIV')
    expect(raiz.children).toHaveLength(3)
    expect(raiz).toHaveStyle({ display: 'flex', flexDirection: 'column' })
    expect(raiz.getAttribute('style')).toContain('gap: var(--sp-2)')
  })

  it('frete pago: valor sem estilo extra', () => {
    render(
      <TotaisPedido subtotalFormatado="R$ 90,00" freteFormatado="R$ 12,00" freteGratis={false} totalFormatado="R$ 102,00" />,
    )
    expect(screen.getByText('R$ 12,00').getAttribute('style')).toBeNull()
    expect(screen.getByText('R$ 102,00')).toBeInTheDocument()
  })
})

describe('LinhaTotal', () => {
  it('rótulo caixa alta muted bold; valor display title; borda superior e padding-top', () => {
    render(<LinhaTotal totalFormatado="R$ 57,00" />)
    expect(screen.getByText('Total')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
    })
    const valor = screen.getByText('R$ 57,00')
    expect(valor).toHaveStyle({
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-regular)',
      fontSize: 'var(--fs-title)',
      lineHeight: 'var(--lh-title)',
      color: 'var(--text-title)',
    })
    const linha = valor.parentElement as HTMLElement
    expect(linha.getAttribute('style')).toContain('border-top: var(--border-card)')
    expect(linha.getAttribute('style')).toContain('padding-top: var(--sp-3)')
    expect(linha).toHaveStyle({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })
  })
})
