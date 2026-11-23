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

export function fatiasPorTamanho(tamanho: Tamanho): string {
  return TAMANHOS.find((t) => t.k === tamanho)!.fatias
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
    ingredientes: 'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
    extra: 0,
    badge: { tone: 'highlight', label: 'Mais pedida' },
  },
  {
    id: 'calabresa',
    nome: 'Calabresa da Dona',
    ingredientes: 'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
    extra: 5,
    badge: null,
  },
  {
    id: 'quatroqueijos',
    nome: 'Quatro queijos',
    ingredientes: 'Muçarela, provolone, parmesão e gorgonzola derretidos juntos.',
    extra: 10,
    badge: { tone: 'success', label: 'Da casa' },
  },
]
