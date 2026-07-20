import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '../../src/components/ui/Badge'

describe('Badge', () => {
  it('renders its content in uppercase pill styling', () => {
    render(<Badge>Vegetariana</Badge>)
    const badge = screen.getByText('Vegetariana')
    expect(badge).toHaveStyle({
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-pill)',
    })
  })

  it('defaults to the neutral tone', () => {
    render(<Badge>Info</Badge>)
    expect(screen.getByText('Info')).toHaveStyle({
      background: 'var(--surface-inset)',
      color: 'var(--carvao-700)',
    })
  })

  it('maps the success tone to the manjericão semantic tokens', () => {
    render(<Badge tone="success">Vegetariana</Badge>)
    expect(screen.getByText('Vegetariana')).toHaveStyle({
      background: 'var(--accent-success-bg)',
      color: 'var(--manjericao-700)',
    })
  })

  it('maps the highlight tone to the crosta semantic tokens', () => {
    render(<Badge tone="highlight">Mais pedida</Badge>)
    expect(screen.getByText('Mais pedida')).toHaveStyle({
      background: 'var(--accent-highlight-bg)',
      color: 'var(--crosta-600)',
    })
  })

  it('maps the danger tone to the molho semantic tokens', () => {
    render(<Badge tone="danger">Esgotada</Badge>)
    expect(screen.getByText('Esgotada')).toHaveStyle({
      background: 'var(--danger-bg)',
      color: 'var(--molho-700)',
    })
  })
})
