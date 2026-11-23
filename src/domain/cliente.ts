export type ErroNome = 'vazio'
export type ErroTelefone = 'vazio' | 'incompleto'
export type ErroCPF = 'invalido'

/** Valores do formulário, como o cliente vê (formatados). */
export interface DadosCliente {
  nome: string
  telefone: string
  querCPF: boolean
  cpf: string
}

export interface ErrosCliente {
  nome: ErroNome | null
  telefone: ErroTelefone | null
  cpf: ErroCPF | null
}

const MAX_DIGITOS = 11

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}

export function formatarTelefone(texto: string): string {
  const d = apenasDigitos(texto).slice(0, MAX_DIGITOS)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  const meio = d.length > 10 ? 5 : 4
  const a = d.slice(2, 2 + meio)
  const b = d.slice(2 + meio)
  return `(${d.slice(0, 2)}) ${a}${b ? `-${b}` : ''}`
}

export function validarTelefone(texto: string): ErroTelefone | null {
  const n = apenasDigitos(texto).slice(0, MAX_DIGITOS).length
  if (n === 0) return 'vazio'
  if (n < 10) return 'incompleto'
  return null
}

export function validarNome(nome: string): ErroNome | null {
  return nome.trim() ? null : 'vazio'
}

export function formatarCPF(texto: string): string {
  const d = apenasDigitos(texto).slice(0, MAX_DIGITOS)
  let r = d.slice(0, 3)
  if (d.length > 3) r += `.${d.slice(3, 6)}`
  if (d.length > 6) r += `.${d.slice(6, 9)}`
  if (d.length > 9) r += `-${d.slice(9)}`
  return r
}

export function validarCPF(texto: string): boolean {
  const d = apenasDigitos(texto)
  if (d.length !== MAX_DIGITOS || /^(\d)\1+$/.test(d)) return false
  const dv = (n: number): number => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

export function mascararCPF(texto: string): string | null {
  const d = apenasDigitos(texto)
  if (d.length !== MAX_DIGITOS) return null
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

export function validarDadosCliente(dados: DadosCliente): ErrosCliente {
  return {
    nome: validarNome(dados.nome),
    telefone: validarTelefone(dados.telefone),
    cpf: dados.querCPF && !validarCPF(dados.cpf) ? 'invalido' : null,
  }
}

export function temErros(erros: ErrosCliente): boolean {
  return erros.nome !== null || erros.telefone !== null || erros.cpf !== null
}
