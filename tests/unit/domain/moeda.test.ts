import { describe, expect, it } from 'vitest'
import { formatarPreco } from '../../../src/domain/moeda'

describe('formatarPreco', () => {
  it('formata um valor inteiro com vírgula decimal', () => {
    expect(formatarPreco(35)).toBe('R$ 35,00')
  })

  it('formata zero', () => {
    expect(formatarPreco(0)).toBe('R$ 0,00')
  })

  it('formata valores de dois dígitos e mais', () => {
    expect(formatarPreco(102)).toBe('R$ 102,00')
  })
})
