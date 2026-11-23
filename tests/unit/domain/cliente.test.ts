import { describe, expect, it } from 'vitest'
import {
  apenasDigitos,
  formatarCPF,
  formatarTelefone,
  mascararCPF,
  temErros,
  validarCPF,
  validarDadosCliente,
  validarNome,
  validarTelefone,
  type DadosCliente,
  type ErroNome,
  type ErroTelefone,
} from '../../../src/domain/cliente'

const preenchido: DadosCliente = {
  nome: 'Ana Exemplo',
  telefone: '(11) 90000-0000',
  querCPF: true,
  cpf: '123.456.789-09',
}

describe('apenasDigitos', () => {
  const casos: Array<[string, string]> = [
    ['(11) 90000-0000', '11900000000'],
    ['abc', ''],
    ['', ''],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(apenasDigitos(entrada)).toBe(esperado)
  })
})

describe('formatarTelefone (= maskTel, Checkout L143-150)', () => {
  const casos: Array<[string, string]> = [
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['119000', '(11) 9000'],
    ['1190000', '(11) 9000-0'],
    ['1100000000', '(11) 0000-0000'],
    ['11900000000', '(11) 90000-0000'],
    ['119000000001', '(11) 90000-0000'],
    ['(11) 90000-0000', '(11) 90000-0000'],
    ['abc', ''],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(formatarTelefone(entrada)).toBe(esperado)
  })
})

describe('validarTelefone', () => {
  const casos: Array<[string, ErroTelefone | null]> = [
    ['', 'vazio'],
    ['abc', 'vazio'],
    ['(11', 'incompleto'],
    ['(11) 9000', 'incompleto'],
    ['119000000', 'incompleto'],
    ['(11) 0000-0000', null],
    ['(11) 90000-0000', null],
    ['11900000000', null],
    ['119000000001', null],
  ]
  it.each(casos)('%j -> %j (sem checagem de DDD; corta em 11 dígitos)', (entrada, esperado) => {
    expect(validarTelefone(entrada)).toBe(esperado)
  })
})

describe('validarNome', () => {
  const casos: Array<[string, ErroNome | null]> = [
    ['', 'vazio'],
    ['   ', 'vazio'],
    ['Ana Exemplo', null],
    [' A ', null],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(validarNome(entrada)).toBe(esperado)
  })
})

describe('formatarCPF (= maskCpf, Checkout L151-158)', () => {
  const casos: Array<[string, string]> = [
    ['', ''],
    ['1', '1'],
    ['123', '123'],
    ['1234', '123.4'],
    ['123456', '123.456'],
    ['1234567', '123.456.7'],
    ['123456789', '123.456.789'],
    ['1234567890', '123.456.789-0'],
    ['12345678909', '123.456.789-09'],
    ['123456789091', '123.456.789-09'],
    ['123.456.789-09', '123.456.789-09'],
    ['a1b2', '12'],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(formatarCPF(entrada)).toBe(esperado)
  })
})

describe('validarCPF (= cpfValido, Checkout L159-169)', () => {
  it.each(['123.456.789-09', '12345678909', ' 123.456.789-09 '])('%j é válido', (entrada) => {
    expect(validarCPF(entrada)).toBe(true)
  })

  it.each([
    '123.456.789-00', // 1º DV certo, 2º errado (preset erros)
    '123.456.789-08', // 2º DV errado
    '123.456.789-19', // 1º DV errado
    '111.111.111-11', // repetido (passaria no DV)
    '000.000.000-00', // repetido
    '',
    '123.456.789', // 9 dígitos
    '1234567890', // 10
    '123456789091', // 12
  ])('%j é inválido', (entrada) => {
    expect(validarCPF(entrada)).toBe(false)
  })
})

describe('mascararCPF', () => {
  it.each(['123.456.789-09', '12345678909'])('%j -> ***.456.789-** (sem os dígitos 0-2 e 9-10)', (entrada) => {
    const mascarado = mascararCPF(entrada)
    expect(mascarado).toBe('***.456.789-**')
    expect(mascarado).not.toContain('123')
    expect(mascarado?.endsWith('09')).toBe(false)
  })

  it.each(['123.456.789', ''])('%j -> null (não tem 11 dígitos)', (entrada) => {
    expect(mascararCPF(entrada)).toBeNull()
  })
})

describe('validarDadosCliente (= erros(), Checkout L193-201)', () => {
  it('preset erros: os três campos com erro', () => {
    expect(
      validarDadosCliente({ nome: '', telefone: '(11) 9000', querCPF: true, cpf: '123.456.789-00' }),
    ).toEqual({ nome: 'vazio', telefone: 'incompleto', cpf: 'invalido' })
  })

  it('preset preenchido: nenhum erro', () => {
    expect(validarDadosCliente(preenchido)).toEqual({ nome: null, telefone: null, cpf: null })
  })

  it('CPF só é avaliado com querCPF', () => {
    expect(validarDadosCliente({ ...preenchido, querCPF: false, cpf: '' }).cpf).toBeNull()
    expect(validarDadosCliente({ ...preenchido, querCPF: false, cpf: '123' }).cpf).toBeNull()
    expect(validarDadosCliente({ ...preenchido, querCPF: true, cpf: '' }).cpf).toBe('invalido')
  })

  it('telefone vazio -> vazio', () => {
    expect(validarDadosCliente({ ...preenchido, telefone: '' }).telefone).toBe('vazio')
  })
})

describe('temErros', () => {
  it('todos null -> false; um não nulo -> true', () => {
    expect(temErros({ nome: null, telefone: null, cpf: null })).toBe(false)
    expect(temErros({ nome: null, telefone: null, cpf: 'invalido' })).toBe(true)
    expect(temErros({ nome: 'vazio', telefone: null, cpf: null })).toBe(true)
  })
})
