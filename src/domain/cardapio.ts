export type Tamanho = 'P' | 'M' | 'G'

interface DefinicaoTamanho {
  k: Tamanho
  base: number
  fatias: string
}

export const TAMANHOS: DefinicaoTamanho[] = [
  { k: 'P', base: 35, fatias: '4 fatias' },
  { k: 'M', base: 45, fatias: '6 fatias' },
  { k: 'G', base: 55, fatias: '8 fatias' },
]

export function precoPorTamanho(tamanho: Tamanho, extraSabor: number): number {
  const definicao = TAMANHOS.find((t) => t.k === tamanho)!
  return definicao.base + extraSabor
}

export function listarTamanhosComPreco(extraSabor: number) {
  return TAMANHOS.map(({ k, fatias }) => ({
    k,
    fatias,
    preco: precoPorTamanho(k, extraSabor),
  }))
}

export type BadgeTone = 'success' | 'highlight' | 'danger' | 'neutral'

export interface Badge {
  tone: BadgeTone
  label: string
}

export interface Pizza {
  id: string
  nome: string
  ingredientes: string
  extra: number
  badge: Badge | null
}

export const PIZZAS: Pizza[] = [
  {
    id: 'margherita',
    nome: 'Margherita da casa',
    ingredientes: 'Molho de tomate, muçarela, tomate fresco e manjericão da horta',
    extra: 0,
    badge: { tone: 'success', label: 'Vegetariana' },
  },
  {
    id: 'calabresa',
    nome: 'Calabresa da Dona',
    ingredientes: 'Molho de tomate, muçarela, calabresa fatiada e orégano',
    extra: 5,
    badge: { tone: 'highlight', label: 'Mais pedida' },
  },
  {
    id: 'quatroqueijos',
    nome: 'Quatro queijos',
    ingredientes: 'Muçarela, provolone, parmesão e gorgonzola sobre molho de tomate',
    extra: 10,
    badge: null,
  },
]
