import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComoFunciona } from '../../../../src/components/home/ComoFunciona'

describe('ComoFunciona', () => {
  it('renderiza o título e o subtítulo da seção', () => {
    render(<ComoFunciona />)
    expect(screen.getByRole('heading', { name: 'Como funciona' })).toBeInTheDocument()
    expect(screen.getByText('Do cardápio à sua porta em três passos')).toBeInTheDocument()
  })

  it('renderiza os 3 passos, com número, título e texto corretos', () => {
    render(<ComoFunciona />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Escolha seu sabor' })).toBeInTheDocument()
    expect(
      screen.getByText('Margherita, calabresa, quatro queijos — todas com massa de fermentação lenta.'),
    ).toBeInTheDocument()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Monte do seu jeito' })).toBeInTheDocument()
    expect(screen.getByText('Tamanho P, M ou G, com o preço na hora, sem surpresa no final.')).toBeInTheDocument()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Receba quentinha' })).toBeInTheDocument()
    expect(
      screen.getByText('Saiu do forno, saiu para entrega — em uns 40 minutos está na sua porta.'),
    ).toBeInTheDocument()
  })
})
