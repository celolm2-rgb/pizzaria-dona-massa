import { useState } from 'react'
import { CardapioHeader } from './components/cardapio/CardapioHeader'
import { CardapioPage } from './components/cardapio/CardapioPage'
import { HomePage } from './components/home/HomePage'

type Tela = 'home' | 'cardapio'

function App() {
  const [tela, setTela] = useState<Tela>('home')

  if (tela === 'home') {
    return <HomePage onNavigateToCardapio={() => setTela('cardapio')} />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <CardapioHeader onNavigateToHome={() => setTela('home')} />
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 32px 64px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 'var(--sp-8)',
          alignItems: 'start',
        }}
      >
        <CardapioPage />
      </main>
    </div>
  )
}

export default App
