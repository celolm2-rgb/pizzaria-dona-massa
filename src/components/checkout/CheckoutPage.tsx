import { useState } from 'react'
import {
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  ehFreteGratis,
  type ItemCarrinho,
} from '../../domain/carrinho'
import {
  formatarCPF,
  formatarTelefone,
  temErros,
  validarDadosCliente,
  type DadosCliente,
  type ErrosCliente,
} from '../../domain/cliente'
import { formatarPreco } from '../../domain/moeda'
import { Button } from '../ui/Button'
import { FormularioCliente } from './FormularioCliente'
import { ResumoPedido } from './ResumoPedido'
import { itemResumoDe } from './itemResumoDe'

export interface CheckoutPageProps {
  carrinho: ItemCarrinho[]
  onVoltar: () => void
  onConfirmar: (dados: DadosCliente) => void
}

const SEM_ERROS: ErrosCliente = { nome: null, telefone: null, cpf: null }

export function CheckoutPage({ carrinho, onVoltar, onConfirmar }: CheckoutPageProps) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [querCPF, setQuerCPF] = useState(false)
  const [cpf, setCpf] = useState('')
  const [tentou, setTentou] = useState(false)

  const dados: DadosCliente = { nome, telefone, querCPF, cpf }
  const erros = validarDadosCliente(dados)

  const subtotal = calcularSubtotal(carrinho)
  const frete = calcularFrete(subtotal, carrinho.length > 0)
  const gratis = ehFreteGratis(subtotal)
  const total = calcularTotal(subtotal, frete)

  function handleQuerCPF(marcado: boolean) {
    setQuerCPF(marcado)
    if (!marcado) setCpf('') // P-3 -> A: descarta o CPF (minimização)
  }

  function handleConfirmar() {
    if (temErros(erros)) {
      setTentou(true)
      return
    }
    onConfirmar(dados)
  }

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--sp-6) var(--sp-8) var(--sp-10)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 'var(--sp-5)' }}>
        <Button variant="secondary" size="sm" onClick={onVoltar}>
          ← Voltar ao cardápio
        </Button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 'var(--sp-8)',
          alignItems: 'start',
        }}
      >
        <FormularioCliente
          valores={dados}
          erros={tentou ? erros : SEM_ERROS}
          rotuloConfirmar={`Confirmar pedido · ${formatarPreco(total)}`}
          onNome={setNome}
          onTelefone={(v) => setTelefone(formatarTelefone(v))}
          onQuerCPF={handleQuerCPF}
          onCPF={(v) => setCpf(formatarCPF(v))}
          onConfirmar={handleConfirmar}
        />
        <aside style={{ position: 'sticky', top: 'var(--sp-6)' }}>
          <ResumoPedido
            itens={carrinho.map(itemResumoDe)}
            subtotalFormatado={formatarPreco(subtotal)}
            freteFormatado={gratis ? 'Grátis' : formatarPreco(frete)}
            freteGratis={gratis}
            totalFormatado={formatarPreco(total)}
            onAlterar={onVoltar}
          />
        </aside>
      </div>
    </main>
  )
}
