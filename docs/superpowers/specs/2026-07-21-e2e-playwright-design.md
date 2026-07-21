# Testes E2E com Playwright — Design

## Contexto

O projeto hoje tem apenas testes unitários/componentes (Vitest + Testing
Library, pasta `tests/`). O pacote `playwright` já é devDependency, mas só é
usado por `scripts/screenshot.mjs` para gerar screenshots de fidelidade
visual — não há suíte E2E nem `@playwright/test` instalado.

A aplicação é uma SPA de tela única: `App.tsx` alterna entre `'home'` e
`'cardapio'` via `useState`, sem router. Fluxo principal: Home → clicar
"Ver o cardápio" → tela Cardápio (grid de pizzas + carrinho) → adicionar
pizzas ao carrinho → ver subtotal/frete/total → voltar para Home.

## Objetivo

Criar uma suíte E2E com Playwright, isolada da suíte unitária, cobrindo os
fluxos de navegação e carrinho de compras ponta a ponta contra a aplicação
real rodando em um browser.

## Escopo

Cobre 4 fluxos (decisão do usuário):
1. Navegação Home → Cardápio.
2. Adicionar item ao carrinho.
3. Cálculo de frete/total no carrinho (pago e grátis).
4. Voltar do Cardápio para Home.

Fora de escopo nesta primeira leva: checkout/finalização de pedido (não
existe na aplicação atual), testes cross-browser (Firefox/WebKit), CI.

## Decisões

- **Browser**: apenas Chromium (`devices['Desktop Chrome']`). Mais rápido e
  suficiente para validar comportamento; expandir para outros engines é
  trivial depois (novo `projects` no config) se necessário.
- **Localização**: pasta `e2e/` na raiz, separada de `tests/` (Vitest) para
  não misturar runners/configs distintos.
- **Comando**: `npm run test:e2e` → `playwright test`. `npm test` (Vitest)
  continua intocado.
- **Web server**: `playwright.config.ts` sobe `npm run dev` automaticamente
  via `webServer` (com `reuseExistingServer: !process.env.CI`), então um
  único comando roda tudo — não é preciso deixar o dev server no ar
  manualmente.
- **Sem Page Object Model**: os seletores já são simples e acessíveis
  (roles, aria-label, title) e a suíte inicial são 2 arquivos. POM seria
  abstração prematura; revisitar se a suíte crescer.

## Estrutura de arquivos

```
playwright.config.ts          # novo
e2e/
  navegacao.spec.ts           # novo
  carrinho.spec.ts            # novo
```

`package.json`:
- devDependency nova: `@playwright/test` (mesma major/minor de `playwright`,
  já instalado).
- script novo: `"test:e2e": "playwright test"`.

## Config do Playwright

- `testDir: './e2e'`
- `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`
- `use.baseURL` apontando para a porta do dev server do Vite.
- `webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI }`

## Seletores usados (já existentes no código, sem `data-testid` novo)

- Home → Cardápio: `getByRole('button', { name: 'Ver o cardápio' })`
  (`HomeHero.tsx`).
- Cardápio → Home: `getByRole('button', { name: 'Pizzaria Dona Massa' })`
  (`CardapioHeader.tsx`).
- Adicionar pizza: dentro do `Card` que contém o nome da pizza (ex.
  "Margherita da casa"), `getByRole('button', { name: /Adicionar/ })`
  (`PizzaCard.tsx`). Tamanho padrão selecionado é `M`.
- Carrinho (`CartPanel.tsx` / `CartItemRow.tsx`):
  - Vazio: texto "Seu pedido está vazio".
  - Incrementar: `getByRole('button', { name: 'Aumentar quantidade' })`.
  - Decrementar: `getByRole('button', { name: 'Diminuir quantidade' })`.
  - Remover: `getByTitle('Tirar do pedido')`.
  - Aviso frete pago: texto "para o frete grátis".
  - Confirmação frete grátis: texto "Você ganhou frete grátis".

## Dados de referência (de `src/domain/cardapio.ts` e `src/domain/carrinho.ts`)

- Margherita da casa, tamanho M = R$ 45,00 (`base 45 + extra 0`).
- `LIMIAR_FRETE_GRATIS = 100`, `VALOR_FRETE = 12`.
- 1× Margherita M → subtotal R$ 45,00 → frete R$ 12,00 (pago) → total
  R$ 57,00 → aviso "Faltam R$ 55,00 para o frete grátis".
- 3× Margherita M (via 2 incrementos) → subtotal R$ 135,00 → frete grátis →
  total R$ 135,00 → "Você ganhou frete grátis".

## Casos de teste

### `e2e/navegacao.spec.ts`

1. Home carrega e exibe o hero ("Pizza artesanal, feita como em casa").
2. Clicar em "Ver o cardápio" navega para o Cardápio (header "Pizzaria Dona
   Massa" e grid "Nossas pizzas" visíveis).
3. Clicar no título "Pizzaria Dona Massa" no Cardápio volta para a Home.

### `e2e/carrinho.spec.ts`

1. Carrinho começa vazio ("Seu pedido está vazio").
2. Adicionar 1 Margherita M → item aparece no carrinho com nome, "Tamanho
   M", preço unitário e total R$ 45,00; subtotal R$ 45,00; frete R$ 12,00;
   total R$ 57,00; aviso de frete grátis visível.
3. Incrementar quantidade 2× (total 3 unidades) → subtotal R$ 135,00;
   mensagem de frete grátis visível; frete exibido como "Grátis"; total
   R$ 135,00.
4. Decrementar quantidade 1× (volta a 2 unidades) → subtotal recalculado
   para R$ 90,00; frete volta a ser pago (R$ 12,00).
5. Remover o item → carrinho volta ao estado vazio.

## Erros e edge cases

- Nenhum caso de erro de rede/API — a aplicação é 100% client-side, sem
  chamadas externas. Não há estados de loading/erro a cobrir.
- Timeout de navegação/timing do `webServer` é responsabilidade do
  Playwright (retry automático até o servidor responder).

## Testagem

A própria suíte E2E é o "teste" desta feature de infraestrutura — não há
lógica de produção sendo criada, só configuração e specs. Verificação de
sucesso: `npm run test:e2e` roda os 2 arquivos de spec e todos os testes
passam contra o dev server real.
