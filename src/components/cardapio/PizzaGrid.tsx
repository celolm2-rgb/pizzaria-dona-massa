import { useState } from 'react'
import { fatiasPorTamanho, listarTamanhosComPreco, PIZZAS, type Tamanho } from '../../domain/cardapio'
import { formatarPreco } from '../../domain/moeda'
import { PizzaCard } from './PizzaCard'
import { FOTO_POR_PIZZA } from './fotosPizzas'

const TAMANHO_PADRAO: Tamanho = 'M'

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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--sp-6)',
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
            precoSelecionadoFormatado={formatarPreco(precoSelecionado)}
            fatiasSelecionadas={fatiasPorTamanho(tamanho)}
            onSelecionarTamanho={(novoTamanho) =>
              setTamanhoSelecionado((atual) => ({ ...atual, [pizza.id]: novoTamanho }))
            }
            onAdicionar={() =>
              onAdicionarAoCarrinho?.({
                key: `${pizza.id}-${tamanho}`,
                nome: pizza.nome,
                tam: tamanho,
                preco: precoSelecionado,
              })
            }
          />
        )
      })}
    </div>
  )
}
