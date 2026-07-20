import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Card } from '../../src/components/ui/Card'

describe('Card', () => {
  it('renders its children on the card surface token', () => {
    render(<Card>Conteúdo</Card>)
    expect(screen.getByText('Conteúdo')).toHaveStyle({ background: 'var(--surface-card)' })
  })

  // jsdom's CSSOM does not resolve `var()` inside shorthand properties like `border`,
  // so these two assertions read the raw style attribute instead of the computed style.
  it('uses the resting card border when not selected', () => {
    render(<Card>Média</Card>)
    expect(screen.getByText('Média').getAttribute('style')).toContain('border: var(--border-card)')
  })

  it('shows the selected outline when selected', () => {
    render(<Card selected>Média</Card>)
    expect(screen.getByText('Média').getAttribute('style')).toContain(
      'border: 2px solid var(--action-primary)',
    )
  })

  it('elevates on hover when interactive', () => {
    render(<Card interactive>Conteúdo</Card>)
    const card = screen.getByText('Conteúdo')
    fireEvent.mouseEnter(card)
    expect(card).toHaveStyle({ transform: 'translateY(-2px)' })
  })

  it('does not elevate on hover when not interactive', () => {
    render(<Card>Conteúdo</Card>)
    const card = screen.getByText('Conteúdo')
    fireEvent.mouseEnter(card)
    expect(card).toHaveStyle({ transform: 'none' })
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Conteúdo</Card>)
    fireEvent.click(screen.getByText('Conteúdo'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
