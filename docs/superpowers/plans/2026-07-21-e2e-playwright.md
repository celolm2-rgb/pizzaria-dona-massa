# Testes E2E com Playwright Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma suíte de testes E2E com Playwright que cubra navegação Home ↔ Cardápio e o fluxo de carrinho (adicionar, incrementar/decrementar, remover, frete pago vs. grátis), rodando contra a aplicação real em Chromium.

**Architecture:** `@playwright/test` como test runner, isolado do Vitest (`tests/`). `playwright.config.ts` na raiz sobe `npm run dev` automaticamente via `webServer` e roda os specs da pasta `e2e/` em um único projeto Chromium. Sem Page Object Model — seletores acessíveis (role, aria-label, title) usados diretamente nos specs.

**Tech Stack:** `@playwright/test` ^1.61.1 (Chromium já instalado em cache local, usado por `scripts/screenshot.mjs`), Vite dev server (porta padrão 5173).

## Global Constraints

- UI usa exclusivamente os tokens de `src/styles/tokens.css` e componentes de `src/components/ui` — não aplicável aqui (nenhum código de produção é criado, só specs/config).
- Regras de negócio só em `src/domain` — não aplicável (specs apenas leem preços já definidos em `src/domain/cardapio.ts` e `src/domain/carrinho.ts` como dados de referência, não recalculam nada).
- TDD sempre: cada spec é escrito e roda vermelho→verde antes do commit.
- Não modificar `tests/` (Vitest) nem `scripts/screenshot.mjs`.
- Comando de teste unitário (`npm test`) permanece intocado; novo comando E2E é `npm run test:e2e`.

---

### Task 1: Setup do Playwright + `e2e/navegacao.spec.ts`

**Files:**
- Modify: `package.json` (devDependency `@playwright/test`, script `test:e2e`)
- Create: `playwright.config.ts`
- Create: `e2e/navegacao.spec.ts`
- Modify: `.gitignore` (ignorar artefatos do Playwright)

**Interfaces:**
- Consumes: nada (primeira task).
- Produces: `playwright.config.ts` com `testDir: './e2e'` e `webServer` subindo `npm run dev` em `http://localhost:5173` — Task 2 depende deste config para rodar `e2e/carrinho.spec.ts` sem duplicar setup.

- [ ] **Step 1: Instalar `@playwright/test`**

Run: `npm install --save-dev @playwright/test@1.61.1`
Expected: `package.json` ganha a entrada em `devDependencies` e `package-lock.json` é atualizado.

- [ ] **Step 2: Criar `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Adicionar script `test:e2e` no `package.json`**

Em `package.json`, dentro de `"scripts"`, adicionar após `"screenshot"`:

```json
    "test:e2e": "playwright test"
```

- [ ] **Step 4: Ignorar artefatos do Playwright**

Em `.gitignore`, adicionar ao final:

```
# Artefatos do Playwright (npm run test:e2e)
/test-results/
/playwright-report/
/blob-report/
```

- [ ] **Step 5: Escrever o spec de navegação (falhando)**

Criar `e2e/navegacao.spec.ts`:

```typescript
import { expect, test } from '@playwright/test'

test.describe('Navegação Home ↔ Cardápio', () => {
  test('Home exibe o hero principal', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' }),
    ).toBeVisible()
  })

  test('navega da Home para o Cardápio ao clicar em "Ver o cardápio"', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Ver o cardápio' }).click()

    await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Pizzaria Dona Massa' }),
    ).toBeVisible()
  })

  test('volta do Cardápio para a Home ao clicar no título', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Ver o cardápio' }).click()
    await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()

    await page.getByRole('button', { name: 'Pizzaria Dona Massa' }).click()

    await expect(
      page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' }),
    ).toBeVisible()
  })
})
```

- [ ] **Step 6: Rodar e confirmar que os 3 testes passam**

Run: `npm run test:e2e -- e2e/navegacao.spec.ts`
Expected: `3 passed` (o Playwright sobe o dev server automaticamente via `webServer`; se algum seletor estiver errado, o teste falha em timeout esperando o elemento — ajuste o texto/role até bater com o componente real antes de seguir).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e/navegacao.spec.ts .gitignore
git commit -m "test: adiciona setup do Playwright e specs de navegação E2E"
```

---

### Task 2: `e2e/carrinho.spec.ts`

**Files:**
- Create: `e2e/carrinho.spec.ts`

**Interfaces:**
- Consumes: `playwright.config.ts` da Task 1 (roda com o mesmo comando `npm run test:e2e`, mesmo `baseURL`).
- Produces: nada consumido por outra task (última task do plano).

- [ ] **Step 1: Escrever o spec de carrinho (falhando)**

Criar `e2e/carrinho.spec.ts`:

```typescript
import { expect, type Page, test } from '@playwright/test'

async function irParaCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
}

function cartaoDaPizza(page: Page, nomePizza: string) {
  return page.locator('div').filter({ has: page.getByRole('heading', { name: nomePizza }) }).first()
}

test.describe('Carrinho — adicionar, quantidade, frete', () => {
  test('carrinho começa vazio', async ({ page }) => {
    await irParaCardapio(page)

    await expect(page.getByText('Seu pedido está vazio')).toBeVisible()
  })

  test('adicionar 1 Margherita M mostra item, subtotal e frete pago', async ({ page }) => {
    await irParaCardapio(page)

    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('Margherita da casa')).toBeVisible()
    await expect(painel.getByText('Tamanho M')).toBeVisible()
    await expect(painel.getByText('R$ 45,00')).toHaveCount(2) // subtotal + total do item
    await expect(painel.getByText('R$ 12,00')).toBeVisible() // frete pago
    await expect(painel.getByText('R$ 57,00')).toBeVisible() // total
    await expect(painel.getByText('para o frete grátis')).toBeVisible()
  })

  test('incrementar até 3 unidades libera frete grátis', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .click()

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('R$ 135,00')).toHaveCount(2) // subtotal + total geral
    await expect(painel.getByText('Você ganhou frete grátis')).toBeVisible()
    await expect(painel.getByText('Grátis')).toBeVisible()
  })

  test('decrementar de volta a 2 unidades cobra frete novamente', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .click()

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await page.getByRole('button', { name: 'Diminuir quantidade' }).click()

    const painel = page.getByRole('heading', { name: 'Seu pedido' }).locator('..')
    await expect(painel.getByText('R$ 90,00')).toBeVisible() // subtotal com 2 unidades
    await expect(painel.getByText('R$ 12,00')).toBeVisible() // frete voltou a ser pago
    await expect(painel.getByText('para o frete grátis')).toBeVisible()
  })

  test('remover o item volta o carrinho ao estado vazio', async ({ page }) => {
    await irParaCardapio(page)
    await cartaoDaPizza(page, 'Margherita da casa')
      .getByRole('button', { name: /Adicionar/ })
      .click()

    await page.getByTitle('Tirar do pedido').click()

    await expect(page.getByText('Seu pedido está vazio')).toBeVisible()
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha apenas se algo estiver incorreto**

Run: `npm run test:e2e -- e2e/carrinho.spec.ts`
Expected: `5 passed`. Se algum `getByText` com valor monetário falhar por
ambiguidade (mais de uma ocorrência inesperada), ajuste o teste para
usar o escopo `painel` (já feito acima) ou `.first()`/`.nth()` conforme o
DOM real renderizado — inspecione com
`npx playwright test e2e/carrinho.spec.ts --debug` se necessário.

- [ ] **Step 3: Rodar a suíte E2E completa**

Run: `npm run test:e2e`
Expected: `8 passed` (3 de `navegacao.spec.ts` + 5 de `carrinho.spec.ts`).

- [ ] **Step 4: Rodar a suíte unitária para garantir que nada foi afetado**

Run: `npm test`
Expected: todos os testes Vitest existentes continuam passando (suíte
verde, sem relação com a mudança, mas confirma que nada em `tests/` foi
tocado).

- [ ] **Step 5: Commit**

```bash
git add e2e/carrinho.spec.ts
git commit -m "test: adiciona specs E2E do fluxo de carrinho e frete"
```

---

## Self-Review

**Cobertura da spec:**
- Navegação Home → Cardápio: Task 1, teste 2. ✅
- Voltar Cardápio → Home: Task 1, teste 3. ✅
- Adicionar item ao carrinho: Task 2, teste 2. ✅
- Frete pago (1 item, R$45): Task 2, teste 2. ✅
- Frete grátis (3 unidades, R$135): Task 2, teste 3. ✅
- Decremento recalcula frete pago: Task 2, teste 4 (não estava explícito
  na lista de escopo do usuário, mas está no design document como caso 4
  — mantido pois testa o mesmo botão de decremento pedido). ✅
- Remover item: Task 2, teste 5. ✅
- Config isolada de `tests/`, comando próprio, webServer automático: Task 1,
  steps 2–4. ✅

**Placeholder scan:** nenhum "TBD"/"similar to"/passos sem código — todos os
steps têm código completo ou comando+saída esperada.

**Consistência de tipos/nomes:** `irParaCardapio` e `cartaoDaPizza` são
definidos e usados apenas dentro de `e2e/carrinho.spec.ts` (Task 2), sem
dependência cruzada de nomes com `e2e/navegacao.spec.ts` — os dois specs são
independentes e só compartilham o `playwright.config.ts` da Task 1.
