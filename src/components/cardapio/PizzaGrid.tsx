import { useEffect, useRef, useState } from 'react'
import { listarTamanhosComPreco, PIZZAS, type Tamanho } from '../../domain/cardapio'
import { formatarPreco } from '../../domain/moeda'
import { PizzaCard } from './PizzaCard'
import { FOTO_POR_PIZZA } from './fotosPizzas'

const TAMANHO_PADRAO: Tamanho = 'M'
const DURACAO_ADICIONADO_MS = 1400

export interface ItemParaAdicionar {
  key: string
  nome: string
  tam: Tamanho
  preco: number
}

export interface PizzaGridProps {
  onAdicionarAoCarrinho?: (item: ItemParaAdicionar) => void
}

export function PizzaGrid({ onAdicionarAoCarrinho }: PizzaGridProps = {}) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Record<string, Tamanho>>({})
  const [pizzaAdicionada, setPizzaAdicionada] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function handleAdicionar(pizzaId: string, nome: string, tamanho: Tamanho, preco: number) {
    setPizzaAdicionada(pizzaId)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setPizzaAdicionada(null), DURACAO_ADICIONADO_MS)
    onAdicionarAoCarrinho?.({ key: `${pizzaId}-${tamanho}`, nome, tam: tamanho, preco })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'var(--fs-title)',
            color: 'var(--text-title)',
          }}
        >
          Nossas pizzas
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Escolha o tamanho e adicione ao pedido
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--sp-6)',
          alignItems: 'start',
        }}
      >
        {PIZZAS.map((pizza) => {
          const tamanho = tamanhoSelecionado[pizza.id] ?? TAMANHO_PADRAO
          const precosPorTamanho = listarTamanhosComPreco(pizza.extra)
          const tamanhos = precosPorTamanho.map((t) => ({
            k: t.k,
            fatias: t.fatias,
            precoFormatado: formatarPreco(t.preco),
          }))
          const precoSelecionado = precosPorTamanho.find((t) => t.k === tamanho)!.preco

          return (
            <PizzaCard
              key={pizza.id}
              pizza={pizza}
              foto={FOTO_POR_PIZZA[pizza.id]}
              tamanhos={tamanhos}
              tamanhoSelecionado={tamanho}
              onSelecionarTamanho={(novoTamanho) =>
                setTamanhoSelecionado((atual) => ({ ...atual, [pizza.id]: novoTamanho }))
              }
              onAdicionar={() => handleAdicionar(pizza.id, pizza.nome, tamanho, precoSelecionado)}
              acabouDeAdicionar={pizzaAdicionada === pizza.id}
            />
          )
        })}
      </div>
    </div>
  )
}
