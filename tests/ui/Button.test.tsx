import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../src/components/ui/Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Adicionar ao carrinho</Button>)
    expect(screen.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Comprar</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Comprar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses the primary action token by default', () => {
    render(<Button>Comprar</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ background: 'var(--action-primary)' })
  })

  it('darkens to the hover token on hover', () => {
    render(<Button>Comprar</Button>)
    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    expect(button).toHaveStyle({ background: 'var(--action-primary-hover)' })
  })

  it('uses a transparent background with an outline ring for the secondary variant', () => {
    render(<Button variant="secondary">Ver detalhes</Button>)
    expect(screen.getByRole('button')).toHaveStyle({
      background: 'transparent',
      boxShadow: 'inset 0 0 0 2px var(--action-primary)',
    })
  })

  it('stretches to fill the container when fullWidth is set', () => {
    render(<Button fullWidth>Comprar</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ width: '100%' })
  })

  it('uses a white background with the primary color and no shadow for the onPrimary variant', () => {
    render(<Button variant="onPrimary">Pedir agora</Button>)
    expect(screen.getByRole('button')).toHaveStyle({
      background: 'var(--branco)',
      color: 'var(--action-primary)',
      boxShadow: 'none',
    })
  })
})
