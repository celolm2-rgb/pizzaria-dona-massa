import './home.css'
import { ComoFunciona } from './ComoFunciona'
import { Favoritas } from './Favoritas'
import { HomeCTA } from './HomeCTA'
import { HomeFooter } from './HomeFooter'
import { HomeHeader } from './HomeHeader'
import { HomeHero } from './HomeHero'

export interface HomePageProps {
  onNavigateToCardapio: () => void
}

export function HomePage({ onNavigateToCardapio }: HomePageProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HomeHeader onNavigateToCardapio={onNavigateToCardapio} />
      <HomeHero onNavigateToCardapio={onNavigateToCardapio} />
      <ComoFunciona />
      <Favoritas onNavigateToCardapio={onNavigateToCardapio} />
      <HomeCTA onNavigateToCardapio={onNavigateToCardapio} />
      <HomeFooter />
    </div>
  )
}
