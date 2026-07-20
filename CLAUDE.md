# Pizzaria Dona Massa

## Comandos
- Testes: `npm test`
- Dev server: `npm run dev`
- Screenshot das páginas: `npm run screenshot` (gera design/atual-home.png e
  design/atual-cardapio.png — navega da Home para o Cardápio automaticamente)

## Regras da casa (obrigatórias)
1. TDD sempre: testes primeiro, nada é "pronto" sem suíte verde.
2. UI usa exclusivamente os tokens de src/styles/tokens.css e compõe
   com os componentes base de src/components/ui — nenhum valor hardcoded.
3. Camadas: regras de negócio só em src/domain (funções puras, zero UI);
   componentes em src/components nunca calculam preço ou frete.
4. Fidelidade visual: toda mudança de UI é validada com npm run
   screenshot comparado ao design do Claude Design (origem em
   design/design-system.md).
