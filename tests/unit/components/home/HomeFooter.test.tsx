import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomeFooter } from '../../../../src/components/home/HomeFooter'

describe('HomeFooter', () => {
  it('renderiza o nome da marca e o horário/endereço', () => {
    render(<HomeFooter />)
    expect(screen.getByText('Pizzaria Dona Massa')).toBeInTheDocument()
    expect(
      screen.getByText('Aberto todos os dias, das 18h às 23h · Rua do Forno, 52 — Vila Mariana'),
    ).toBeInTheDocument()
  })
})
