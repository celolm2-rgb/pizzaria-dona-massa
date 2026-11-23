import { useState } from 'react'
import { CardapioHeader } from './components/cardapio/CardapioHeader'
import { CardapioPage } from './components/cardapio/CardapioPage'
import { CheckoutPage } from './components/checkout/CheckoutPage'
import { PedidoConfirmado } from './components/checkout/PedidoConfirmado'
import { HomePage } from './components/home/HomePage'
import type { ItemCarrinho } from './domain/carrinho'
import type { DadosCliente } from './domain/cliente'
import { montarPedido, proximoNumeroPedido, resumirConfirmacao, type ResumoConfirmacao } from './domain/pedido'

type Tela = 'home' | 'cardapio' | 'checkout' | 'confirmacao'

function App() {
  const [tela, setTela] = useState<Tela>('home')
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]) // P-6: sobrevive Home <-> Cardápio
  const [ultimoNumeroPedido, setUltimoNumeroPedido] = useState<number | null>(null) // P-1
  const [confirmacao, setConfirmacao] = useState<ResumoConfirmacao | null>(null) // sem nome/telefone/CPF completo

  function irParaHome() {
    setConfirmacao(null)
    setTela('home')
  }

  function handleConfirmar(dados: DadosCliente) {
    const numero = proximoNumeroPedido(ultimoNumeroPedido)
    const pedido = montarPedido(carrinho, dados, numero) // payload local, descartado ao fim do handler
    setUltimoNumeroPedido(numero)
    setConfirmacao(resumirConfirmacao(pedido))
    setCarrinho([])
    setTela('confirmacao')
  }

  if (tela === 'home') {
    return <HomePage onNavigateToCardapio={() => setTela('cardapio')} />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-body)',
      }}
    >
      <CardapioHeader onNavigateToHome={irParaHome} />
      {tela === 'cardapio' && (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--sp-10) var(--sp-8) var(--sp-16)' }}>
          <CardapioPage carrinho={carrinho} onCarrinhoChange={setCarrinho} onFinalizar={() => setTela('checkout')} />
        </main>
      )}
      {tela === 'checkout' && (
        <CheckoutPage carrinho={carrinho} onVoltar={() => setTela('cardapio')} onConfirmar={handleConfirmar} />
      )}
      {tela === 'confirmacao' && confirmacao && <PedidoConfirmado confirmacao={confirmacao} onInicio={irParaHome} />}
    </div>
  )
}

export default App
