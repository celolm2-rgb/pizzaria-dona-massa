# Redesenho do Cardápio — Plano de implementação

> **Para o agente executor:** sub-skill obrigatória: `superpowers:executing-plans` (execução por um único
> subagente `dev`, tasks em sequência) + `superpowers:test-driven-development` em cada task. Os passos usam
> checkbox (`- [ ]`). Planejador, 2026-10-02.

**Objetivo:** trocar o Cardápio atual pelo Cardápio redesenhado do Claude Design (projeto
`02dc2137-ef8c-4ce1-a78a-620ac1883b79`, `Cardapio.dc.html`), sem mudar regra de preço/frete e sem
persistência.

**Arquitetura:** o domínio (`src/domain`) ganha 3 funções puras (`fatiasPorTamanho`, `contarPizzas`,
`calcularTotalDoItem`) e o catálogo novo. Os componentes de `src/components/cardapio/` são reescritos para a estrutura nova do mockup e
só exibem o que `CardapioPage`/`PizzaGrid` calculam via domínio. `App.tsx` deixa de ter o grid de 2 colunas,
que passa para `CardapioPage` junto com o título e a intro. `src/components/ui/**` NÃO é tocado.

**Stack:** React 19, Vite 8, TypeScript 6, Vitest 4 + Testing Library (jsdom), Playwright (E2E, porta 3100),
oxlint. Windows, sem git.

**Spec (ler junto, por inteiro):**
`docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md` — em especial "Decisões" (item 6),
"Domínio", "Componentes", "Inventario de paridade" (linhas 1-51), "Testes" e "T9 — texto literal".

**Mockup de referência (só leitura, para conferir estilos):**
`C:\Users\<user>\AppData\Local\Temp\claude\C--Projetos-VSCode-apresentacao-cq1-pizzaria-dona-massa-full\17ebdad0-986d-40b9-aee1-8459a3b84011\scratchpad\mockups\02dc2137\Cardapio.dc.html`
(Lnn citadas abaixo = linhas desse arquivo).

Raiz do projeto: `C:\Projetos VSCode\apresentacao_cq1\pizzaria-dona-massa-full` (todos os caminhos abaixo são
relativos a ela).

## Restrições globais (valem para TODA task)

- **Sem git (D1).** Nenhum passo de commit. No fim de cada task: anotar os arquivos tocados (para o
  relatório final). Não criar branch, não rodar `git`.
- **O dev NÃO roda `npm run gate`** (fica para a sessão principal). Roda só os comandos de cada passo e, na
  Task 11, `npm test`, `npm run lint`, `npx tsc -b`, `npm run test:e2e`, `npm run screenshot`.
- **Vermelho real (checklist do brief):** todo teste marcado "(vermelho)" tem de FALHAR antes do código, pelo
  motivo indicado. Proibido assert vazio, regex sobre o código-fonte, ou fixture que já satisfaça o teste.
  Se o teste passar antes do código, PARE: o teste está errado. Testes marcados "(guarda)" são de regressão e
  podem passar já no início; isso é esperado e está dito no passo.
- **Regra de negócio só em `src/domain` (invariante 1):** componente não calcula preço, frete, contagem de
  pizzas nem fatias. `CartPanel`, `CartItemRow` e `PizzaCard` recebem tudo pronto por props.
- **Estilo (invariante 2, E-5):** só tokens de `src/styles/tokens.css` e componentes de
  `src/components/ui` (`Card`, `Badge`, `Button`). As ÚNICAS exceções são os valores crus do mockup,
  confirmados pelo PO em 2026-10-01, e só nestes pontos: padding da pílula `10px 16px`; stepper `28px`;
  gap `2px` na linha do item; foto `180px`; colunas `340px` e `minmax(300px, 1fr)` (e `minmax(0, 1fr)`);
  `maxWidth: '1200px'` e `maxWidth: '52ch'`; anel `0 0 0 3px`; `minWidth: '14px'`. Nenhum outro hex, px ou
  rem cru.
- **Fonte dos botões pílula e "tirar" (spec, Decisões item 6):** os `<button>` levam
  `fontFamily: 'var(--font-body)'` e **NÃO** `font: 'inherit'` nem `lineHeight`. O stepper −/+ segue literal
  (L95-97: `fontSize` + `lineHeight: 1`).
- **Caminhos compartilhados (M-8):** `src/styles/tokens.css`, `src/components/ui/**`, `CLAUDE.md`,
  `docs/constitution.md`, `docs/framework/**`, `docs/patterns/**`, `.claude/**`, `package.json`. NENHUM é
  editado neste plano, EXCETO `docs/constitution.md` na Task 10, passo 10.4, com texto literal (edição
  autorizada de caminho compartilhado). `src/components/home/**` e `src/components/cardapio/fotosPizzas.ts`
  também NÃO mudam.
- **Confidencialidade (LGPD):** esta feature não tem dado pessoal. Não introduzir nome/telefone/CPF em
  código, teste, log ou print. Nada persiste: proibido `localStorage`/`sessionStorage`. Estado só em
  `useState`.
- **Fora do escopo (não implementar):** botão "Finalizar pedido" e frase "Sai do forno e chega quentinha em
  uns 40 minutos." (feature 2); `localStorage`/`finalizar()`/`window.location`; feedback "Adicionado ✓";
  responsivo; mudança de preço/frete; layout da Home.
- **Copy literal** (acentos exatos, UTF-8): ver cada task. id `quatroqueijos` mantido (NÃO usar
  `quatro-queijos`).
- **`npx tsc -b` verde ao fim de cada task** (o `tsconfig.app.json` inclui `tests/unit`, então teste com prop
  errada quebra o typecheck).
- **Paridade (E-6):** a validação visual é no viewport 1280x720, tela inteira dos dois lados
  (`npm run screenshot` gera `design/atual-cardapio.png`). O dev confere na Task 11; a régua é do testador.

## Foco de revisão (entradas que a spec implica e que mais podem morder)

1. **Pílula/"tirar" com `font: inherit`** (o padrão atual do código) mudaria a altura (46px em vez de 45/47px;
   18px em vez de 14px). Teste em Task 5 (passo 5.1, "tirar") e Task 8 (passo 8.1, pílula).
2. **Pílula selecionada recebendo hover** (o mockup zera o hover quando ativa, L238). Teste em Task 8
   (passo 8.1).
3. **Subtotal exatamente R$ 100,00** tem de dar "Grátis" + aviso de frete grátis (limiar inclusivo). Teste em
   Task 6 (passo 6.2).
4. **Diminuir até zero** tem de remover a linha e voltar a "Nenhuma pizza ainda" + mensagem de vazio, sem
   aviso de frete. Teste em Task 6 (passo 6.2).
5. **Mesmo sabor em 2 tamanhos**: 2 linhas, resumo soma as quantidades ("2 pizzas no carrinho"), não conta
   linhas. Teste em Task 2 (domínio) e Task 6 (passo 6.2).

## Mapa de arquivos

| Arquivo | Task | Responsabilidade |
|---|---|---|
| `src/domain/cardapio.ts` | 1 | catálogo novo + `fatiasPorTamanho` |
| `src/domain/carrinho.ts` | 2, 3 | `contarPizzas`, `calcularTotalDoItem` |
| `src/components/cardapio/CardapioHeader.tsx` | 4 | header novo |
| `src/components/cardapio/CartItemRow.tsx` | 5 | linha do item (fatias, stepper 28px, "tirar") |
| `src/components/cardapio/CartPanel.tsx` | 5, 6 | aside "Seu pedido" |
| `src/components/cardapio/CardapioPage.tsx` | 3, 5, 6, 7 | estado do carrinho, cálculo via domínio, título/intro, grid 2 colunas |
| `src/App.tsx` | 7 | wrapper + `<main>` sem grid |
| `src/components/cardapio/PizzaGrid.tsx` | 7, 8 | grade de pizzas, tamanho selecionado |
| `src/components/cardapio/PizzaCard.tsx` | 8 | card novo + pílula de tamanho |
| `tests/unit/domain/cardapio.test.ts` | 1 | |
| `tests/unit/components/home/Favoritas.test.tsx` | 1 | |
| `tests/unit/domain/carrinho.test.ts` | 2, 3 | |
| `tests/unit/components/cardapio/CardapioHeader.test.tsx` | 4 | |
| `tests/unit/components/cardapio/CardapioPage.test.tsx` | 5, 6, 7 | |
| `tests/unit/components/cardapio/CartPanel.test.tsx` (NOVO) | 6 | |
| `tests/unit/components/cardapio/PizzaGrid.test.tsx` | 7, 8 | |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | 8 | |
| `tests/e2e/carrinho.spec.ts` | 9 | |
| `docs/spec-cardapio.md`, `docs/spec-home.md`, `design/design-system.md`, `docs/constitution.md` | 10 | artefatos M-4 |

Ordem (grafo de dependências): domínio (1, 2, 3) → header (4) → carrinho (5, 6) → página/App (7) → card (8) →
E2E (9) → artefatos (10) → verificação (11). Cada task termina com typecheck verde.

---

### Task 1: Catálogo novo + `fatiasPorTamanho` (spec T1, T2; inventário 13-16, 48-51)

**Arquivos:**
- Modificar: `src/domain/cardapio.ts` (array `PIZZAS`; nova função no fim do bloco de tamanhos)
- Modificar: `tests/unit/domain/cardapio.test.ts`
- Modificar: `tests/unit/components/home/Favoritas.test.tsx` (só os testes 2 e 3; efeito P-1 → A)

**Interfaces:**
- Produz: `export function fatiasPorTamanho(tamanho: Tamanho): string` → `'4 fatias' | '6 fatias' | '8 fatias'`.
- Produz: `PIZZAS` com os dados novos (ids e `extra` inalterados).

- [ ] **Passo 1.1: Escrever os testes que falham (vermelho)**

Em `tests/unit/domain/cardapio.test.ts`, trocar a linha 2 por:

```ts
import { fatiasPorTamanho, listarTamanhosComPreco, PIZZAS, precoPorTamanho } from '../../../src/domain/cardapio'
```

Inserir, antes de `describe('PIZZAS (catálogo)'`:

```ts
describe('fatiasPorTamanho', () => {
  it("P → '4 fatias'", () => {
    expect(fatiasPorTamanho('P')).toBe('4 fatias')
  })

  it("M → '6 fatias'", () => {
    expect(fatiasPorTamanho('M')).toBe('6 fatias')
  })

  it("G → '8 fatias'", () => {
    expect(fatiasPorTamanho('G')).toBe('8 fatias')
  })
})
```

Substituir o `describe('PIZZAS (catálogo)', ...)` inteiro (linhas 48-74) por:

```ts
describe('PIZZAS (catálogo)', () => {
  it('tem exatamente 3 pizzas, fielmente extraídas do Cardapio.dc.html redesenhado (02dc2137)', () => {
    expect(PIZZAS).toEqual([
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
    ])
  })
})
```

Em `tests/unit/components/home/Favoritas.test.tsx`, substituir os testes 2 e 3 (linhas 13-34) por:

```tsx
  it('renderiza as 3 pizzas do catálogo com o preço "a partir de" derivado do domínio', () => {
    render(<Favoritas onNavigateToCardapio={() => {}} />)

    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 35,00')).toBeInTheDocument()
    expect(screen.getByText('Mais pedida')).toBeInTheDocument()

    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 40,00')).toBeInTheDocument()
    expect(
      screen.getByText('Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.'),
    ).toBeInTheDocument()

    expect(screen.getByText('Quatro queijos')).toBeInTheDocument()
    expect(screen.getByText('A partir de R$ 45,00')).toBeInTheDocument()
    expect(screen.getByText('Da casa')).toBeInTheDocument()
  })

  it('não mostra badge para a pizza sem badge no catálogo', () => {
    render(<Favoritas onNavigateToCardapio={() => {}} />)
    expect(screen.queryByText('Vegetariana')).not.toBeInTheDocument()
    // Calabresa tem badge null no catálogo — só 2 badges devem existir no total
    expect(screen.getAllByText(/Mais pedida|Da casa/)).toHaveLength(2)
  })
```

- [ ] **Passo 1.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/domain/cardapio.test.ts tests/unit/components/home/Favoritas.test.tsx`
Esperado: FALHA.
- `fatiasPorTamanho` (3 testes): `TypeError: ... fatiasPorTamanho is not a function`.
- `PIZZAS (catálogo)`: `AssertionError: expected [ …(3) ] to deeply equal [ …(3) ]`.
- Favoritas: `Unable to find an element with the text: Calabresa artesanal…` e o teste de badges falha (acha
  "Vegetariana").

- [ ] **Passo 1.3: Implementação mínima**

Em `src/domain/cardapio.ts`, logo depois de `listarTamanhosComPreco`, acrescentar:

```ts
export function fatiasPorTamanho(tamanho: Tamanho): string {
  return TAMANHOS.find((t) => t.k === tamanho)!.fatias
}
```

Substituir o array `PIZZAS` por:

```ts
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
```

`TAMANHOS`, `precoPorTamanho`, `listarTamanhosComPreco` e os tipos NÃO mudam.

- [ ] **Passo 1.4: Rodar e confirmar o verde**

Rodar: `npx vitest run tests/unit/domain/cardapio.test.ts tests/unit/components/home/Favoritas.test.tsx`
Esperado: PASS (todos).

Rodar: `npx vitest run tests/unit/components/cardapio`
Esperado: PASS (os testes de componente usam fixtures locais ou só nomes, que não mudaram).

Rodar: `npx tsc -b` → esperado: sem saída, código 0.

- [ ] **Passo 1.5: Registrar arquivos tocados** — `src/domain/cardapio.ts`,
`tests/unit/domain/cardapio.test.ts`, `tests/unit/components/home/Favoritas.test.tsx`.

---

### Task 2: `contarPizzas` (spec T2)

**Arquivos:**
- Modificar: `src/domain/carrinho.ts` (nova função no fim)
- Modificar: `tests/unit/domain/carrinho.test.ts`

**Interfaces:**
- Produz: `export function contarPizzas(carrinho: ItemCarrinho[]): number` → soma de `qty`.

- [ ] **Passo 2.1: Escrever os testes que falham (vermelho)**

Em `tests/unit/domain/carrinho.test.ts`, acrescentar `contarPizzas,` na lista do import (linhas 2-11), em
ordem alfabética depois de `calcularTotal,`:

```ts
import {
  adicionarItem,
  alterarQuantidade,
  calcularFaltaParaFreteGratis,
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  contarPizzas,
  ehFreteGratis,
  removerItem,
} from '../../../src/domain/carrinho'
```

Acrescentar no fim do arquivo:

```ts
describe('contarPizzas', () => {
  it('carrinho vazio → 0', () => {
    expect(contarPizzas([])).toBe(0)
  })

  it('1 item com qty 1 → 1', () => {
    expect(contarPizzas([item('margherita-M', 45, 1)])).toBe(1)
  })

  it('soma as quantidades, não conta linhas (mesmo sabor em 2 tamanhos conta separado)', () => {
    expect(contarPizzas([item('margherita-M', 45, 2), item('calabresa-G', 60, 1)])).toBe(3)
  })
})
```

(`item(key, preco, qty)` é o helper que já existe nas linhas 13-19.)

- [ ] **Passo 2.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/domain/carrinho.test.ts`
Esperado: os 3 testes de `contarPizzas` FALHAM com `TypeError: ... contarPizzas is not a function`; os
demais passam.

- [ ] **Passo 2.3: Implementação mínima** — no fim de `src/domain/carrinho.ts`:

```ts
export function contarPizzas(carrinho: ItemCarrinho[]): number {
  return carrinho.reduce((total, item) => total + item.qty, 0)
}
```

- [ ] **Passo 2.4: Rodar e confirmar o verde**

Rodar: `npx vitest run tests/unit/domain/carrinho.test.ts` → PASS (todos).
Rodar: `npx tsc -b` → sem saída, código 0.

- [ ] **Passo 2.5: Registrar arquivos tocados** — `src/domain/carrinho.ts`, `tests/unit/domain/carrinho.test.ts`.

---

### Task 3: `calcularTotalDoItem` — total da linha sai do componente (spec T10 / C2, decisão do PO 2026-10-02)

Hoje `src/components/cardapio/CardapioPage.tsx` (L54) faz `formatarPreco(item.preco * item.qty)`: conta de
preço dentro de componente, violação da invariante 1 anterior a esta feature. Corrige agora.

**Arquivos:**
- Modificar: `src/domain/carrinho.ts` (nova função no fim)
- Modificar: `tests/unit/domain/carrinho.test.ts`
- Modificar: `src/components/cardapio/CardapioPage.tsx` (só a linha do `precoTotalFormatado` e o import)

**Interfaces:**
- Produz: `export function calcularTotalDoItem(item: ItemCarrinho): number` → `item.preco * item.qty`.
- `CardapioPage` passa a montar `precoTotalFormatado: formatarPreco(calcularTotalDoItem(item))`. Depois
  desta task, nenhum componente de `src/components/cardapio/` tem aritmética de preço.

- [ ] **Passo 3.1: Testes que falham (vermelho)**

Em `tests/unit/domain/carrinho.test.ts`, acrescentar `calcularTotalDoItem,` ao import, depois de
`calcularTotal,`:

```ts
import {
  adicionarItem,
  alterarQuantidade,
  calcularFaltaParaFreteGratis,
  calcularFrete,
  calcularSubtotal,
  calcularTotal,
  calcularTotalDoItem,
  contarPizzas,
  ehFreteGratis,
  removerItem,
} from '../../../src/domain/carrinho'
```

Acrescentar no fim do arquivo (casos literais da tabela da spec, Domínio > casos de teste):

```ts
describe('calcularTotalDoItem', () => {
  it('qty 1 → o próprio preço', () => {
    expect(
      calcularTotalDoItem({ key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }),
    ).toBe(45)
  })

  it('qty 3 → 3 vezes o preço', () => {
    expect(
      calcularTotalDoItem({ key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 3 }),
    ).toBe(135)
  })

  it('preço já com o extra do sabor (Calabresa G = 55 + 5) × 2', () => {
    expect(
      calcularTotalDoItem({ key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 2 }),
    ).toBe(120)
  })
})
```

- [ ] **Passo 3.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/domain/carrinho.test.ts`
Esperado: os 3 testes de `calcularTotalDoItem` FALHAM com
`TypeError: ... calcularTotalDoItem is not a function` (a função não existe); os demais passam.

- [ ] **Passo 3.3: Implementação mínima**

No fim de `src/domain/carrinho.ts`:

```ts
export function calcularTotalDoItem(item: ItemCarrinho): number {
  return item.preco * item.qty
}
```

Em `src/components/cardapio/CardapioPage.tsx`:
- acrescentar `calcularTotalDoItem,` ao import de `'../../domain/carrinho'` (depois de `calcularTotal,`);
- trocar `precoTotalFormatado: formatarPreco(item.preco * item.qty),` por
  `precoTotalFormatado: formatarPreco(calcularTotalDoItem(item)),`.

- [ ] **Passo 3.4: Verde**

Rodar: `npx vitest run tests/unit/domain/carrinho.test.ts tests/unit/components/cardapio/CardapioPage.test.tsx`
→ PASS (todos; o teste de integração continua achando "R$ 77,00", que mostra que o total da linha não mudou).
Rodar: `npx tsc -b` → sem saída, código 0.
Rodar: `npm run lint` → 0 erros.
Conferir: `grep -rnE "preco \* |\* item\.qty" src/components` → nenhuma linha.

- [ ] **Passo 3.5: Registrar arquivos tocados** — `src/domain/carrinho.ts`,
`tests/unit/domain/carrinho.test.ts`, `src/components/cardapio/CardapioPage.tsx`.

---

### Task 4: Header novo (spec T3; inventário 1-4)

**Arquivos:**
- Modificar: `src/components/cardapio/CardapioHeader.tsx` (arquivo inteiro)
- Modificar: `tests/unit/components/cardapio/CardapioHeader.test.tsx` (teste 1)

**Interfaces:** `CardapioHeaderProps { onNavigateToHome: () => void }` — inalterada. O wordmark CONTINUA
`<button>` (spec, Decisões item 2).

- [ ] **Passo 4.1: Teste que falha (vermelho)** — substituir a linha 10 por:

```tsx
    expect(screen.getByText('Aberto hoje até 23h · entrega em uns 40 minutos')).toBeInTheDocument()
```

- [ ] **Passo 4.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/components/cardapio/CardapioHeader.test.tsx`
Esperado: FALHA em "renderiza o wordmark e a tagline da marca" com
`Unable to find an element with the text: Aberto hoje até 23h · entrega em uns 40 minutos`. O teste de
clique passa.

- [ ] **Passo 4.3: Implementação** — `src/components/cardapio/CardapioHeader.tsx` inteiro (mockup L25-29):

```tsx
export interface CardapioHeaderProps {
  onNavigateToHome: () => void
}

export function CardapioHeader({ onNavigateToHome }: CardapioHeaderProps) {
  return (
    <header style={{ background: 'var(--action-primary)', padding: 'var(--sp-6) var(--sp-8)' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--sp-6)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onNavigateToHome}
          style={{
            font: 'inherit',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-title)',
            lineHeight: 'var(--lh-title)',
            color: 'var(--text-on-primary)',
          }}
        >
          Pizzaria Dona Massa
        </button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-small)', color: 'var(--molho-100)' }}>
          Aberto hoje até 23h · entrega em uns 40 minutos
        </span>
      </div>
    </header>
  )
}
```

(O wordmark mantém `font: 'inherit'` só para zerar a fonte de UA do botão; a regra "sem `font: inherit`" da
Decisão 6 vale para a pílula e o "tirar", não para o wordmark.)

- [ ] **Passo 4.4: Verde**

Rodar: `npx vitest run tests/unit/components/cardapio/CardapioHeader.test.tsx tests/unit/App.test.tsx` →
PASS (todos; `App.test` continua achando o botão "Pizzaria Dona Massa").
Rodar: `npx tsc -b` → sem saída, código 0.

- [ ] **Passo 4.5: Registrar arquivos tocados** — `src/components/cardapio/CardapioHeader.tsx`,
`tests/unit/components/cardapio/CardapioHeader.test.tsx`.

---

### Task 5: Linha do item do carrinho (spec T6; inventário 28-34)

**Arquivos:**
- Modificar: `src/components/cardapio/CartItemRow.tsx` (arquivo inteiro)
- Modificar: `src/components/cardapio/CartPanel.tsx` (só repassar `fatias` ao `CartItemRow`)
- Modificar: `src/components/cardapio/CardapioPage.tsx` (só o `map` dos itens: incluir `fatias`)
- Modificar: `tests/unit/components/cardapio/CardapioPage.test.tsx`

**Interfaces:**
- Consome: `fatiasPorTamanho(tamanho: Tamanho): string` (Task 1).
- Produz: `CartItemRowProps` ganha `fatias: string` (obrigatória). Como
  `CartPanelItem extends Omit<CartItemRowProps, 'onIncrementar' | 'onDecrementar' | 'onRemover'>`,
  `CartPanelItem` também passa a exigir `fatias`.
- O botão de remover passa a ter nome acessível **"tirar"** (sem `title`). Os aria-labels
  "Diminuir quantidade"/"Aumentar quantidade" ficam.

- [ ] **Passo 5.1: Testes que falham (vermelho)**

Em `tests/unit/components/cardapio/CardapioPage.test.tsx`, acrescentar dentro do `describe` existente, depois
do teste atual:

```tsx
  it('a linha do item mostra tamanho, fatias e preço unitário; "tirar" remove o item', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    const carrinho = screen.getByRole('complementary')

    // Margherita é a 1ª pizza (índice 0), tamanho padrão M = R$ 45
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])

    expect(within(carrinho).getByText('Tamanho M · 6 fatias · R$ 45,00 cada')).toBeInTheDocument()

    await user.click(within(carrinho).getByRole('button', { name: 'tirar' }))

    expect(within(carrinho).queryByText('Margherita da casa')).not.toBeInTheDocument()
    expect(within(carrinho).getByText(/vazio/)).toBeInTheDocument()
  })

  it('o botão "tirar" usa só font-family, sem font: inherit nem line-height (Decisões, item 6)', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])

    const estilo = within(screen.getByRole('complementary')).getByRole('button', { name: 'tirar' }).getAttribute('style') ?? ''
    expect(estilo).toContain('font-family: var(--font-body)')
    expect(estilo).toContain('font-size: var(--fs-caption)')
    expect(estilo).not.toMatch(/(^|;)\s*font:/)
    expect(estilo).not.toContain('line-height')
  })
```

- [ ] **Passo 5.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/components/cardapio/CardapioPage.test.tsx`
Esperado: os 2 testes novos FALHAM — o 1º com
`Unable to find an element with the text: Tamanho M · 6 fatias · R$ 45,00 cada` (hoje não há fatias); o 2º com
`Unable to find an accessible element with the role "button" and name "tirar"` (hoje o botão é "×"). O teste
antigo passa.

- [ ] **Passo 5.3: Implementação**

`src/components/cardapio/CartItemRow.tsx` inteiro (mockup L90-102, hover L207-208):

```tsx
import { useState, type ReactNode } from 'react'
import type { Tamanho } from '../../domain/cardapio'

export interface CartItemRowProps {
  nome: string
  tam: Tamanho
  fatias: string
  qty: number
  precoUnitFormatado: string
  precoTotalFormatado: string
  onIncrementar: () => void
  onDecrementar: () => void
  onRemover: () => void
}

interface BotaoStepperProps {
  rotulo: string
  onClick: () => void
  children: ReactNode
}

function BotaoStepper({ rotulo, onClick, children }: BotaoStepperProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border-soft)'}`,
        background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
        color: 'var(--text-title)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body)',
        lineHeight: 1,
        cursor: 'pointer',
        transition: 'background .15s ease, border-color .15s ease',
      }}
    >
      {children}
    </button>
  )
}

function BotaoTirar({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginLeft: 'var(--sp-2)',
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-caption)',
        color: hover ? 'var(--action-primary)' : 'var(--text-muted)',
        textDecoration: 'underline',
      }}
    >
      tirar
    </button>
  )
}

export function CartItemRow({
  nome,
  tam,
  fatias,
  qty,
  precoUnitFormatado,
  precoTotalFormatado,
  onIncrementar,
  onDecrementar,
  onRemover,
}: CartItemRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        paddingBottom: 'var(--sp-3)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-body)',
            color: 'var(--text-title)',
          }}
        >
          {nome}
        </span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          Tamanho {tam} · {fatias} · {precoUnitFormatado} cada
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <BotaoStepper rotulo="Diminuir quantidade" onClick={onDecrementar}>
            −
          </BotaoStepper>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-small)',
              fontWeight: 'var(--fw-bold)',
              color: 'var(--text-title)',
              minWidth: '14px',
              textAlign: 'center',
            }}
          >
            {qty}
          </span>
          <BotaoStepper rotulo="Aumentar quantidade" onClick={onIncrementar}>
            +
          </BotaoStepper>
          <BotaoTirar onClick={onRemover} />
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-body)',
          color: 'var(--text-title)',
        }}
      >
        {precoTotalFormatado}
      </span>
    </div>
  )
}
```

(O caractere do botão de diminuir é o sinal de menos `−` U+2212, igual ao mockup L95 e ao código atual.)

Em `src/components/cardapio/CartPanel.tsx`, no `<CartItemRow ... />` (linhas 70-80), acrescentar
`fatias={item.fatias}` logo depois de `tam={item.tam}`. Nada mais muda neste arquivo nesta task.

Em `src/components/cardapio/CardapioPage.tsx`:
- acrescentar o import `import { fatiasPorTamanho } from '../../domain/cardapio'`;
- no `itens={carrinho.map((item) => ({ ... }))}`, acrescentar `fatias: fatiasPorTamanho(item.tam),` logo
  depois de `tam: item.tam,`.

- [ ] **Passo 5.4: Verde**

Rodar: `npx vitest run tests/unit/components/cardapio` → PASS (todos).
Rodar: `npx tsc -b` → sem saída, código 0.
Rodar: `npm run lint` → 0 erros.

- [ ] **Passo 5.5: Registrar arquivos tocados** — `src/components/cardapio/CartItemRow.tsx`,
`src/components/cardapio/CartPanel.tsx`, `src/components/cardapio/CardapioPage.tsx`,
`tests/unit/components/cardapio/CardapioPage.test.tsx`.

---

### Task 6: Aside "Seu pedido" novo (spec T6; inventário 23-27, 35-41; 42-43 adiados)

**Arquivos:**
- Modificar: `src/components/cardapio/CartPanel.tsx` (arquivo inteiro)
- Modificar: `src/components/cardapio/CardapioPage.tsx` (props do `CartPanel`)
- Criar: `tests/unit/components/cardapio/CartPanel.test.tsx`
- Modificar: `tests/unit/components/cardapio/CardapioPage.test.tsx`

**Interfaces:**
- Consome: `contarPizzas(carrinho: ItemCarrinho[]): number` (Task 2); `CartItemRowProps.fatias` (Task 5).
- Produz: `CartPanelProps` = `{ itens: CartPanelItem[]; quantidadePizzas: number; subtotalFormatado: string;
  freteFormatado: string; freteGratis: boolean; totalFormatado: string; faltaParaFreteGratisFormatado: string;
  onIncrementar: (chave: string) => void; onDecrementar: (chave: string) => void;
  onRemover: (chave: string) => void }`. SAEM `mostraAviso` e `mostraGratis`: o aviso aparece sempre que há
  item (pago ou grátis, decidido por `freteGratis`).
- Copy (literal): "Nenhuma pizza ainda" / "1 pizza no carrinho" / "N pizzas no carrinho"; vazio:
  "Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno."; "Subtotal"; "Entrega";
  "Total"; aviso pago: "Faltam R$ X,00 para frete grátis" (sem negrito, sem "o"); aviso grátis:
  "Frete grátis liberado! A entrega é por nossa conta.".

- [ ] **Passo 6.1: Criar `tests/unit/components/cardapio/CartPanel.test.tsx` (vermelho)**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartPanel, type CartPanelProps } from '../../../../src/components/cardapio/CartPanel'

const margheritaM = {
  key: 'margherita-M',
  nome: 'Margherita da casa',
  tam: 'M' as const,
  fatias: '6 fatias',
  qty: 1,
  precoUnitFormatado: 'R$ 45,00',
  precoTotalFormatado: 'R$ 45,00',
}

function renderPanel(overrides: Partial<CartPanelProps> = {}) {
  const props: CartPanelProps = {
    itens: [margheritaM],
    quantidadePizzas: 1,
    subtotalFormatado: 'R$ 45,00',
    freteFormatado: 'R$ 12,00',
    freteGratis: false,
    totalFormatado: 'R$ 57,00',
    faltaParaFreteGratisFormatado: 'R$ 55,00',
    onIncrementar: vi.fn(),
    onDecrementar: vi.fn(),
    onRemover: vi.fn(),
    ...overrides,
  }
  render(<CartPanel {...props} />)
  return props
}

const vazio: Partial<CartPanelProps> = {
  itens: [],
  quantidadePizzas: 0,
  subtotalFormatado: 'R$ 0,00',
  freteFormatado: 'R$ 0,00',
  totalFormatado: 'R$ 0,00',
  faltaParaFreteGratisFormatado: 'R$ 100,00',
}

describe('CartPanel', () => {
  it('vazio: resumo "Nenhuma pizza ainda", mensagem de vazio, sem subtotal e sem aviso', () => {
    renderPanel(vazio)
    expect(screen.getByRole('heading', { name: 'Seu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Nenhuma pizza ainda')).toBeInTheDocument()
    expect(
      screen.getByText('Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument()
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Frete grátis liberado/)).not.toBeInTheDocument()
  })

  it('resumo no singular com 1 pizza', () => {
    renderPanel({ quantidadePizzas: 1 })
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('resumo no plural com 3 pizzas', () => {
    renderPanel({
      itens: [{ ...margheritaM, qty: 3, precoTotalFormatado: 'R$ 135,00' }],
      quantidadePizzas: 3,
    })
    expect(screen.getByText('3 pizzas no carrinho')).toBeInTheDocument()
  })

  it('frete pago: linha "Entrega" com o valor e aviso "Faltam … para frete grátis"', () => {
    renderPanel()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('R$ 12,00')).toBeInTheDocument()
    expect(screen.getByText('Faltam R$ 55,00 para frete grátis')).toHaveStyle({
      background: 'var(--accent-highlight-bg)',
      color: 'var(--crosta-600)',
    })
    expect(screen.queryByText(/Frete grátis liberado/)).not.toBeInTheDocument()
  })

  it('frete grátis: "Grátis" em manjericão-700 e aviso de frete grátis liberado', () => {
    renderPanel({
      itens: [{ ...margheritaM, qty: 3, precoTotalFormatado: 'R$ 135,00' }],
      quantidadePizzas: 3,
      subtotalFormatado: 'R$ 135,00',
      freteFormatado: 'Grátis',
      freteGratis: true,
      totalFormatado: 'R$ 135,00',
      faltaParaFreteGratisFormatado: 'R$ 0,00',
    })
    expect(screen.getByText('Grátis')).toHaveStyle({ color: 'var(--manjericao-700)' })
    expect(screen.getByText('Frete grátis liberado! A entrega é por nossa conta.')).toHaveStyle({
      background: 'var(--accent-success-bg)',
      color: 'var(--manjericao-700)',
    })
    expect(screen.queryByText(/Faltam/)).not.toBeInTheDocument()
  })

  it('o aviso de frete vem DEPOIS do total', () => {
    renderPanel()
    const total = screen.getByText('Total')
    const aviso = screen.getByText('Faltam R$ 55,00 para frete grátis')
    expect(total.compareDocumentPosition(aviso) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('(guarda) não mostra "Finalizar pedido" nem a frase de entrega (adiados para a feature 2)', () => {
    renderPanel()
    expect(screen.queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Sai do forno/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Passo 6.2: Alterar `tests/unit/components/cardapio/CardapioPage.test.tsx` (vermelho)**

No teste existente, trocar a linha `expect(aviso.textContent).toContain('para o frete grátis')` por:

```tsx
    expect(aviso.textContent).toContain('para frete grátis')
```

Acrescentar dentro do mesmo `describe`, no fim:

```tsx
  it('o resumo do carrinho soma as quantidades: nenhuma → 1 → 2 pizzas', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    const carrinho = screen.getByRole('complementary')

    expect(within(carrinho).getByText('Nenhuma pizza ainda')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    expect(within(carrinho).getByText('1 pizza no carrinho')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // mesma chave → qty 2
    expect(within(carrinho).getByText('2 pizzas no carrinho')).toBeInTheDocument()
    expect(within(carrinho).getByText('Entrega')).toBeInTheDocument()
  })

  it('mesmo sabor em 2 tamanhos vira 2 linhas e o resumo conta 2 pizzas', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    const carrinho = screen.getByRole('complementary')

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    await user.click(screen.getAllByRole('button', { name: /^G/ })[0]) // Margherita → G
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita G

    expect(within(carrinho).getAllByRole('button', { name: 'tirar' })).toHaveLength(2)
    expect(within(carrinho).getByText('2 pizzas no carrinho')).toBeInTheDocument()
  })

  it('subtotal exatamente R$ 100,00 libera frete grátis (limiar inclusivo)', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    const carrinho = screen.getByRole('complementary')

    // Calabresa é a 2ª pizza (índice 1); M = 45 + 5 = R$ 50; 2 × 50 = R$ 100
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[1])
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[1])

    expect(within(carrinho).getByText('Grátis')).toBeInTheDocument()
    expect(
      within(carrinho).getByText('Frete grátis liberado! A entrega é por nossa conta.'),
    ).toBeInTheDocument()
    expect(within(carrinho).queryByText(/Faltam/)).not.toBeInTheDocument()
  })

  it('diminuir até zero remove a linha e volta ao estado vazio, sem aviso de frete', async () => {
    const user = userEvent.setup()
    render(<CardapioPage />)
    const carrinho = screen.getByRole('complementary')

    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0])
    await user.click(within(carrinho).getByRole('button', { name: 'Diminuir quantidade' }))

    expect(within(carrinho).getByText('Nenhuma pizza ainda')).toBeInTheDocument()
    expect(within(carrinho).getByText(/vazio/)).toBeInTheDocument()
    expect(within(carrinho).queryByText(/Faltam/)).not.toBeInTheDocument()
  })
```

- [ ] **Passo 6.3: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/components/cardapio/CartPanel.test.tsx tests/unit/components/cardapio/CardapioPage.test.tsx`
Esperado:
- `CartPanel.test`: falham "vazio" (`Unable to find … Nenhuma pizza ainda`), singular, plural, "frete pago"
  (`Unable to find … Entrega`), "frete grátis" (`Unable to find … Frete grátis liberado!…`) e "ordem"
  (`Unable to find … Faltam R$ 55,00 para frete grátis`: com o `CartPanel` atual o aviso nem é renderizado,
  porque o `renderPanel` não passa `mostraAviso`, prop que deixa de existir). O teste
  "(guarda)" PASSA já agora: é esperado (regressão, não conta como vermelho).
- `CardapioPage.test`: falham o teste antigo (`para frete grátis`), o do resumo (`Nenhuma pizza ainda`), o
  dos 2 tamanhos (`2 pizzas no carrinho`), o do limiar (`Frete grátis liberado!…`) e o de diminuir até zero
  (`Nenhuma pizza ainda`).
- `npx tsc -b` também falha agora (`quantidadePizzas` não existe em `CartPanelProps`): esperado no vermelho.

- [ ] **Passo 6.4: Implementação**

`src/components/cardapio/CartPanel.tsx` inteiro (mockup L77-123, sem L121-122):

```tsx
import { Card } from '../ui/Card'
import { CartItemRow, type CartItemRowProps } from './CartItemRow'

export interface CartPanelItem extends Omit<CartItemRowProps, 'onIncrementar' | 'onDecrementar' | 'onRemover'> {
  key: string
}

export interface CartPanelProps {
  itens: CartPanelItem[]
  quantidadePizzas: number
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
  faltaParaFreteGratisFormatado: string
  onIncrementar: (chave: string) => void
  onDecrementar: (chave: string) => void
  onRemover: (chave: string) => void
}

function textoDoResumo(quantidadePizzas: number): string {
  if (quantidadePizzas === 0) return 'Nenhuma pizza ainda'
  if (quantidadePizzas === 1) return '1 pizza no carrinho'
  return `${quantidadePizzas} pizzas no carrinho`
}

export function CartPanel({
  itens,
  quantidadePizzas,
  subtotalFormatado,
  freteFormatado,
  freteGratis,
  totalFormatado,
  faltaParaFreteGratisFormatado,
  onIncrementar,
  onDecrementar,
  onRemover,
}: CartPanelProps) {
  const carrinhoVazio = itens.length === 0

  return (
    <Card padding="var(--sp-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-heading)',
            lineHeight: 'var(--lh-title)',
            color: 'var(--text-title)',
          }}
        >
          Seu pedido
        </h2>
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
          {textoDoResumo(quantidadePizzas)}
        </span>
      </div>

      {carrinhoVazio && (
        <p
          style={{
            margin: 0,
            padding: 'var(--sp-6) 0',
            fontSize: 'var(--fs-small)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            textWrap: 'pretty',
          }}
        >
          Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno.
        </p>
      )}

      {!carrinhoVazio && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {itens.map((item) => (
              <CartItemRow
                key={item.key}
                nome={item.nome}
                tam={item.tam}
                fatias={item.fatias}
                qty={item.qty}
                precoUnitFormatado={item.precoUnitFormatado}
                precoTotalFormatado={item.precoTotalFormatado}
                onIncrementar={() => onIncrementar(item.key)}
                onDecrementar={() => onDecrementar(item.key)}
                onRemover={() => onRemover(item.key)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
              <span>Subtotal</span>
              <span>{subtotalFormatado}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)', color: 'var(--text-body)' }}>
              <span>Entrega</span>
              <span style={freteGratis ? { color: 'var(--manjericao-700)', fontWeight: 'var(--fw-bold)' } : undefined}>
                {freteFormatado}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: 'var(--sp-3)',
                borderTop: '1px solid var(--border-soft)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--fs-small)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: 'var(--ls-caps)',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--fw-regular)',
                  fontSize: 'var(--fs-title)',
                  lineHeight: 'var(--lh-title)',
                  color: 'var(--text-title)',
                }}
              >
                {totalFormatado}
              </span>
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-small)',
              lineHeight: 'var(--lh-body)',
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--radius-md)',
              textWrap: 'pretty',
              background: freteGratis ? 'var(--accent-success-bg)' : 'var(--accent-highlight-bg)',
              color: freteGratis ? 'var(--manjericao-700)' : 'var(--crosta-600)',
            }}
          >
            {freteGratis
              ? 'Frete grátis liberado! A entrega é por nossa conta.'
              : `Faltam ${faltaParaFreteGratisFormatado} para frete grátis`}
          </div>
        </>
      )}
    </Card>
  )
}
```

(`textoDoResumo` é só copy de UI sobre um número já contado pelo domínio — spec, Domínio > `carrinho.ts`.)

Em `src/components/cardapio/CardapioPage.tsx`:
- acrescentar `contarPizzas,` ao import de `'../../domain/carrinho'`;
- depois de `const gratis = ehFreteGratis(subtotal)`, acrescentar `const quantidadePizzas = contarPizzas(carrinho)`;
- no `<CartPanel ...>`: acrescentar `quantidadePizzas={quantidadePizzas}` e REMOVER as props
  `mostraAviso={temItens && !gratis}` e `mostraGratis={temItens && gratis}`. `temItens` continua (usado em
  `calcularFrete`).

- [ ] **Passo 6.5: Verde**

Rodar: `npx vitest run tests/unit/components/cardapio` → PASS (todos).
Rodar: `npx tsc -b` → sem saída, código 0.
Rodar: `npm run lint` → 0 erros.

- [ ] **Passo 6.6: Registrar arquivos tocados** — `src/components/cardapio/CartPanel.tsx`,
`src/components/cardapio/CardapioPage.tsx`, `tests/unit/components/cardapio/CartPanel.test.tsx` (novo),
`tests/unit/components/cardapio/CardapioPage.test.tsx`.

---

### Task 7: Título/intro em largura total + grid de 340px + `<main>` sem grid (spec T4; inventário 5-8, 46-47)

**Arquivos:**
- Modificar: `src/components/cardapio/CardapioPage.tsx` (o `return`)
- Modificar: `src/App.tsx` (wrapper e `<main>` do Cardápio)
- Modificar: `src/components/cardapio/PizzaGrid.tsx` (só o `return`: sai título/subtítulo e `alignItems`)
- Modificar: `tests/unit/components/cardapio/CardapioPage.test.tsx`
- Modificar: `tests/unit/components/cardapio/PizzaGrid.test.tsx` (remover o teste de título)

**Interfaces:** nenhuma prop muda nesta task. O `<h1>` "Nossas pizzas" passa a ser renderizado por
`CardapioPage` (o `App.test` continua achando-o).

- [ ] **Passo 7.1: Testes que falham (vermelho)** — em `CardapioPage.test.tsx`, acrescentar no fim do arquivo
(fora do `describe` existente):

```tsx
describe('CardapioPage — título e layout', () => {
  it('renderiza o h1 "Nossas pizzas" e a intro literal do mockup', () => {
    render(<CardapioPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa.',
      ),
    ).toBeInTheDocument()
  })

  it('o título fica fora da grade de 2 colunas (largura total, acima de pizzas e pedido)', () => {
    render(<CardapioPage />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Nossas pizzas' })
    const gradeDeColunas = screen.getByRole('complementary').parentElement!
    expect(gradeDeColunas.contains(h1)).toBe(false)
    expect(gradeDeColunas).toHaveStyle({ display: 'grid' })
  })
})
```

Em `PizzaGrid.test.tsx`, apagar o teste `'renderiza o título e o subtítulo da seção'` (linhas 15-19): ele foi
movido para `CardapioPage.test` com a copy nova.

- [ ] **Passo 7.2: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/components/cardapio/CardapioPage.test.tsx`
Esperado: FALHAM os 2 testes novos — o 1º com `Unable to find an element with the text: Massa de
fermentação natural…`; o 2º em `expect(gradeDeColunas.contains(h1)).toBe(false)` (hoje o `aside` e o `h1`
têm o mesmo ancestral: `expected true to be false`).

- [ ] **Passo 7.3: Implementação**

`src/components/cardapio/CardapioPage.tsx` — substituir o `return (...)` inteiro por (mockup L33-37, L77):

```tsx
  return (
    <>
      <h1
        style={{
          margin: '0 0 var(--sp-2)',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-display)',
          lineHeight: 'var(--lh-display)',
          color: 'var(--text-title)',
        }}
      >
        Nossas pizzas
      </h1>
      <p
        style={{
          margin: '0 0 var(--sp-8)',
          maxWidth: '52ch',
          fontSize: 'var(--fs-body)',
          lineHeight: 'var(--lh-body)',
          color: 'var(--text-muted)',
          textWrap: 'pretty',
        }}
      >
        Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 'var(--sp-8)',
          alignItems: 'start',
        }}
      >
        <PizzaGrid onAdicionarAoCarrinho={handleAdicionarAoCarrinho} />
        <aside style={{ position: 'sticky', top: 'var(--sp-6)' }}>
          <CartPanel
            itens={carrinho.map((item) => ({
              key: item.key,
              nome: item.nome,
              tam: item.tam,
              fatias: fatiasPorTamanho(item.tam),
              qty: item.qty,
              precoUnitFormatado: formatarPreco(item.preco),
              precoTotalFormatado: formatarPreco(calcularTotalDoItem(item)),
            }))}
            quantidadePizzas={quantidadePizzas}
            subtotalFormatado={formatarPreco(subtotal)}
            freteFormatado={gratis ? 'Grátis' : formatarPreco(frete)}
            freteGratis={gratis}
            totalFormatado={formatarPreco(total)}
            faltaParaFreteGratisFormatado={formatarPreco(falta)}
            onIncrementar={handleIncrementar}
            onDecrementar={handleDecrementar}
            onRemover={handleRemover}
          />
        </aside>
      </div>
    </>
  )
```

(`calcularTotalDoItem` já está importado desde a Task 3; aqui ele só é mantido. Nenhuma conta de preço no
componente.)

`src/App.tsx` — substituir o `return (...)` do Cardápio (linhas 15-32) por (mockup L24, L32):

```tsx
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-body)',
      }}
    >
      <CardapioHeader onNavigateToHome={() => setTela('home')} />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--sp-10) var(--sp-8) var(--sp-16)' }}>
        <CardapioPage />
      </main>
    </div>
  )
```

`src/components/cardapio/PizzaGrid.tsx` — substituir o `return (...)` por (mockup L37; sem `alignItems`, os
cards esticam):

```tsx
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
            onSelecionarTamanho={(novoTamanho) =>
              setTamanhoSelecionado((atual) => ({ ...atual, [pizza.id]: novoTamanho }))
            }
            onAdicionar={() => handleAdicionar(pizza.id, pizza.nome, tamanho, precoSelecionado)}
            acabouDeAdicionar={pizzaAdicionada === pizza.id}
          />
        )
      })}
    </div>
  )
```

(Estado `pizzaAdicionada`, timer e `acabouDeAdicionar` ainda ficam: saem na Task 8.)

- [ ] **Passo 7.4: Verde**

Rodar: `npx vitest run tests/unit/components/cardapio tests/unit/App.test.tsx` → PASS (todos).
Rodar: `npx tsc -b` → sem saída, código 0.
Rodar: `npm run lint` → 0 erros.

- [ ] **Passo 7.5: Registrar arquivos tocados** — `src/components/cardapio/CardapioPage.tsx`, `src/App.tsx`,
`src/components/cardapio/PizzaGrid.tsx`, `tests/unit/components/cardapio/CardapioPage.test.tsx`,
`tests/unit/components/cardapio/PizzaGrid.test.tsx`.

---

### Task 8: Card de pizza novo + pílula de tamanho (spec T5; inventário 9-22)

**Arquivos:**
- Modificar: `src/components/cardapio/PizzaCard.tsx` (arquivo inteiro)
- Modificar: `src/components/cardapio/PizzaGrid.tsx` (arquivo inteiro)
- Modificar: `tests/unit/components/cardapio/PizzaCard.test.tsx` (arquivo inteiro)
- Modificar: `tests/unit/components/cardapio/PizzaGrid.test.tsx` (arquivo inteiro)

**Interfaces:**
- Consome: `fatiasPorTamanho` (Task 1), `formatarPreco` (`src/domain/moeda.ts`).
- Produz: `PizzaCardProps` = `{ pizza: Pizza; foto: string; tamanhos: TamanhoExibido[];
  tamanhoSelecionado: Tamanho; precoSelecionadoFormatado: string; fatiasSelecionadas: string;
  onSelecionarTamanho: (tamanho: Tamanho) => void; onAdicionar: () => void }`. SAI `acabouDeAdicionar`.
  `TamanhoExibido` inalterado. O card NÃO deriva nada: preço e fatias do selecionado vêm do `PizzaGrid`.
- Botão de adicionar com copy fixa **"Adicionar"**; o feedback "Adicionado ✓" é cortado (sem timer).

> Nota sobre o teste da spec: a spec escreve `getByRole('button', { name: 'Adicionar', exact: true })`. No
> Testing Library, `ByRoleOptions` NÃO tem a opção `exact` (o `npx tsc -b` acusa propriedade inexistente,
> porque `tests/unit` entra no typecheck). Com `name` string o ByRole já compara o nome acessível INTEIRO,
> então `{ name: 'Adicionar' }` tem o mesmo efeito (falha contra "Adicionar · R$ 60,00"). Use a forma sem
> `exact` nos testes unitários. No E2E (Playwright) `exact: true` existe e é usado (Task 9).

- [ ] **Passo 8.1: Reescrever `tests/unit/components/cardapio/PizzaCard.test.tsx` (vermelho)**

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PizzaCard } from '../../../../src/components/cardapio/PizzaCard'

const pizzaComBadge = {
  id: 'margherita',
  nome: 'Margherita da casa',
  ingredientes: 'Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.',
  extra: 0,
  badge: { tone: 'highlight' as const, label: 'Mais pedida' },
}

const pizzaSemBadge = {
  id: 'calabresa',
  nome: 'Calabresa da Dona',
  ingredientes: 'Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.',
  extra: 5,
  badge: null,
}

const tamanhos = [
  { k: 'P' as const, fatias: '4 fatias', precoFormatado: 'R$ 40,00' },
  { k: 'M' as const, fatias: '6 fatias', precoFormatado: 'R$ 50,00' },
  { k: 'G' as const, fatias: '8 fatias', precoFormatado: 'R$ 60,00' },
]

function renderCard(overrides = {}) {
  const props = {
    pizza: pizzaComBadge,
    foto: 'pizza-margherita.jpg',
    tamanhos,
    tamanhoSelecionado: 'M' as const,
    precoSelecionadoFormatado: 'R$ 50,00',
    fatiasSelecionadas: '6 fatias',
    onSelecionarTamanho: vi.fn(),
    onAdicionar: vi.fn(),
    ...overrides,
  }
  render(<PizzaCard {...props} />)
  return props
}

describe('PizzaCard', () => {
  it('renderiza nome e ingredientes da pizza', () => {
    renderCard()
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(
      screen.getByText('Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.'),
    ).toBeInTheDocument()
  })

  it('renderiza o badge quando a pizza tem um', () => {
    renderCard()
    expect(screen.getByText('Mais pedida')).toBeInTheDocument()
  })

  it('não renderiza badge quando a pizza não tem um', () => {
    renderCard({ pizza: pizzaSemBadge })
    expect(screen.queryByText('Mais pedida')).not.toBeInTheDocument()
    expect(screen.queryByText('Da casa')).not.toBeInTheDocument()
  })

  it('selo fica à direita do nome, na mesma linha', () => {
    renderCard()
    const nome = screen.getByRole('heading', { name: 'Margherita da casa' })
    expect(nome.nextElementSibling).toBe(screen.getByText('Mais pedida'))
    expect(nome.parentElement).toHaveStyle({ display: 'flex', justifyContent: 'space-between' })
  })

  it('renderiza a foto com alt igual ao nome da pizza', () => {
    renderCard()
    expect(screen.getByAltText('Margherita da casa')).toHaveAttribute('src', 'pizza-margherita.jpg')
  })

  it('renderiza os 3 tamanhos na ordem P/M/G com fatias e preço já formatados', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /P\s+4 fatias/ })).toHaveTextContent('R$ 40,00')
    expect(screen.getByRole('button', { name: /M\s+6 fatias/ })).toHaveTextContent('R$ 50,00')
    expect(screen.getByRole('button', { name: /G\s+8 fatias/ })).toHaveTextContent('R$ 60,00')
  })

  it('marca visualmente o tamanho selecionado', () => {
    renderCard({ tamanhoSelecionado: 'M' })
    const selecionado = screen.getByRole('button', { name: /M\s+6 fatias/, pressed: true })
    expect(selecionado.getAttribute('style')).toContain('border: 2px solid var(--action-primary)')
  })

  it('pílula usa só font-family, sem font: inherit nem line-height (Decisões, item 6)', () => {
    renderCard()
    const estilo = screen.getByRole('button', { name: /P\s+4 fatias/ }).getAttribute('style') ?? ''
    expect(estilo).toContain('font-family: var(--font-body)')
    expect(estilo).not.toMatch(/(^|;)\s*font:/)
    expect(estilo).not.toContain('line-height')
  })

  it('hover na pílula não selecionada usa surface-raised; a selecionada não tem hover', () => {
    renderCard({ tamanhoSelecionado: 'M' })
    const naoSelecionada = screen.getByRole('button', { name: /P\s+4 fatias/ })
    fireEvent.mouseEnter(naoSelecionada)
    expect(naoSelecionada).toHaveStyle({ background: 'var(--surface-raised)' })

    const selecionada = screen.getByRole('button', { name: /M\s+6 fatias/, pressed: true })
    fireEvent.mouseEnter(selecionada)
    expect(selecionada).toHaveStyle({ background: 'var(--massa-50)' })
    // --surface-raised e --massa-50 têm a mesma cor: conferir também a borda da selecionada
    expect(selecionada.getAttribute('style')).toContain('border: 2px solid var(--action-primary)')
  })

  it('chama onSelecionarTamanho com o tamanho clicado', async () => {
    const props = renderCard({ tamanhoSelecionado: 'M' })
    await userEvent.click(screen.getByRole('button', { name: /P\s+4 fatias/ }))
    expect(props.onSelecionarTamanho).toHaveBeenCalledWith('P')
  })

  it('mostra o resumo do tamanho selecionado com o preço atual e o botão "Adicionar"', () => {
    renderCard({ tamanhoSelecionado: 'G', precoSelecionadoFormatado: 'R$ 60,00', fatiasSelecionadas: '8 fatias' })
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument()
    // "R$ 60,00" aparece 2 vezes (pílula G e resumo): proibido getByText('R$ 60,00') solto
    expect(within(screen.getByText('Tamanho G · 8 fatias').parentElement!).getByText('R$ 60,00')).toBeInTheDocument()
  })

  it('chama onAdicionar ao clicar no botão de adicionar', async () => {
    const props = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(props.onAdicionar).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Passo 8.2: Reescrever `tests/unit/components/cardapio/PizzaGrid.test.tsx` (vermelho)**

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PizzaGrid } from '../../../../src/components/cardapio/PizzaGrid'

describe('PizzaGrid', () => {
  it('renderiza as 3 pizzas do catálogo', () => {
    render(<PizzaGrid />)
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Calabresa da Dona')).toBeInTheDocument()
    expect(screen.getByText('Quatro queijos')).toBeInTheDocument()
  })

  it('cada pizza começa com o tamanho M selecionado, com preço já somando o extra do sabor', () => {
    render(<PizzaGrid />)
    const resumos = screen.getAllByText('Tamanho M · 6 fatias')
    expect(resumos).toHaveLength(3)
    expect(within(resumos[0].parentElement!).getByText('R$ 45,00')).toBeInTheDocument() // Margherita M (extra 0)
    expect(within(resumos[1].parentElement!).getByText('R$ 50,00')).toBeInTheDocument() // Calabresa M (extra 5)
    expect(within(resumos[2].parentElement!).getByText('R$ 55,00')).toBeInTheDocument() // Quatro queijos M (extra 10)
  })

  it('selecionar um tamanho em uma pizza não afeta as outras', async () => {
    const user = userEvent.setup()
    render(<PizzaGrid />)
    await user.click(screen.getAllByRole('button', { name: /^P\s/ })[0]) // P na Margherita

    expect(within(screen.getByText('Tamanho P · 4 fatias').parentElement!).getByText('R$ 35,00')).toBeInTheDocument()
    const resumosM = screen.getAllByText('Tamanho M · 6 fatias')
    expect(resumosM).toHaveLength(2)
    expect(within(resumosM[0].parentElement!).getByText('R$ 50,00')).toBeInTheDocument() // Calabresa continua em M
    expect(within(resumosM[1].parentElement!).getByText('R$ 55,00')).toBeInTheDocument() // Quatro queijos continua em M
  })

  it('os botões de adicionar têm copy fixa "Adicionar" (sem preço, sem "Adicionado ✓")', async () => {
    const user = userEvent.setup()
    render(<PizzaGrid />)
    const botoes = screen.getAllByRole('button', { name: 'Adicionar' })
    expect(botoes).toHaveLength(3)
    await user.click(botoes[0])
    expect(screen.getAllByRole('button', { name: 'Adicionar' })).toHaveLength(3)
    expect(screen.queryByText('Adicionado ✓')).not.toBeInTheDocument()
  })
})
```

- [ ] **Passo 8.3: Rodar e confirmar o vermelho**

Rodar: `npx vitest run tests/unit/components/cardapio/PizzaCard.test.tsx tests/unit/components/cardapio/PizzaGrid.test.tsx`
Esperado (motivos reais):
- PizzaCard: "selo fica à direita" (`nextElementSibling` do h2 hoje é o `<p>` de ingredientes); "marca
  visualmente" (hoje `--molho-600`); "pílula usa só font-family" (hoje sem `font-family` e com
  `font: inherit`); "hover" (hoje sem hover: fica `--massa-50`); "resumo… Adicionar" e "chama onAdicionar"
  (`Unable to find … role "button" and name "Adicionar"`: hoje o nome é "Adicionar · R$ 50,00"). Os demais
  passam (fixtures locais — a troca de fixture NÃO conta como vermelho).
- PizzaGrid: "começa com M", "não afeta as outras" (`Unable to find … Tamanho M · 6 fatias`) e "copy fixa"
  (`Unable to find … name "Adicionar"`).
- `npx tsc -b` falha agora (props novas não existem em `PizzaCardProps`): esperado no vermelho.

- [ ] **Passo 8.4: Implementação**

`src/components/cardapio/PizzaCard.tsx` inteiro (mockup L39-73, `pill()` L212-223, hover L238):

```tsx
import { useState, type CSSProperties } from 'react'
import type { Pizza, Tamanho } from '../../domain/cardapio'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export interface TamanhoExibido {
  k: Tamanho
  fatias: string
  precoFormatado: string
}

export interface PizzaCardProps {
  pizza: Pizza
  foto: string
  tamanhos: TamanhoExibido[]
  tamanhoSelecionado: Tamanho
  precoSelecionadoFormatado: string
  fatiasSelecionadas: string
  onSelecionarTamanho: (tamanho: Tamanho) => void
  onAdicionar: () => void
}

interface PilulaTamanhoProps {
  tamanho: TamanhoExibido
  selecionado: boolean
  onClick: () => void
}

const textoDisplay: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-regular)',
  fontSize: 'var(--fs-body)',
  color: 'var(--text-title)',
}

function PilulaTamanho({ tamanho, selecionado, onClick }: PilulaTamanhoProps) {
  const [hover, setHover] = useState(false)
  const comHover = hover && !selecionado

  const estilo: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--sp-3)',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    padding: '10px 16px',
    borderRadius: 'var(--radius-pill)',
    background: selecionado ? 'var(--massa-50)' : comHover ? 'var(--surface-raised)' : 'var(--surface-card)',
    border: selecionado
      ? '2px solid var(--action-primary)'
      : `1px solid ${comHover ? 'var(--border-strong)' : 'var(--border-soft)'}`,
    boxShadow: selecionado ? '0 0 0 3px var(--molho-100)' : 'none',
    fontFamily: 'var(--font-body)',
    transition: 'background .15s ease, border-color .15s ease, box-shadow .15s ease',
  }

  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={estilo}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <span style={textoDisplay}>{tamanho.k}</span>{' '}
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{tamanho.fatias}</span>
      </span>{' '}
      <span style={textoDisplay}>{tamanho.precoFormatado}</span>
    </button>
  )
}

export function PizzaCard({
  pizza,
  foto,
  tamanhos,
  tamanhoSelecionado,
  precoSelecionadoFormatado,
  fatiasSelecionadas,
  onSelecionarTamanho,
  onAdicionar,
}: PizzaCardProps) {
  return (
    <Card padding="var(--sp-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div
        style={{
          height: '180px',
          background: 'var(--surface-inset)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <img
          src={foto}
          alt={pizza.nome}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--fw-regular)',
              fontSize: 'var(--fs-heading)',
              lineHeight: 'var(--lh-title)',
              color: 'var(--text-title)',
            }}
          >
            {pizza.nome}
          </h2>
          {pizza.badge && <Badge tone={pizza.badge.tone}>{pizza.badge.label}</Badge>}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--fs-small)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-muted)',
            textWrap: 'pretty',
          }}
        >
          {pizza.ingredientes}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-caps)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Tamanho
        </span>
        <div style={{ display: 'grid', gap: 'var(--sp-2)' }}>
          {tamanhos.map((tamanho) => (
            <PilulaTamanho
              key={tamanho.k}
              tamanho={tamanho}
              selecionado={tamanho.k === tamanhoSelecionado}
              onClick={() => onSelecionarTamanho(tamanho.k)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--sp-3)',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
          Tamanho {tamanhoSelecionado} · {fatiasSelecionadas}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: 'var(--fs-heading)',
            color: 'var(--text-title)',
          }}
        >
          {precoSelecionadoFormatado}
        </span>
      </div>

      <Button variant="primary" size="md" fullWidth onClick={onAdicionar}>
        Adicionar
      </Button>
    </Card>
  )
}
```

(Os `{' '}` entre os spans da pílula são obrigatórios: garantem o espaço no nome acessível "P 4 fatias R$ 40,00"
que o regex `/P\s+4 fatias/` exige. Em flex eles não ocupam espaço visual.)

`src/components/cardapio/PizzaGrid.tsx` inteiro:

```tsx
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
```

(Saem `useEffect`, `useRef`, `DURACAO_ADICIONADO_MS`, `pizzaAdicionada`, `timeoutRef` e `handleAdicionar`.)

- [ ] **Passo 8.5: Verde**

Rodar: `npx vitest run tests/unit` → PASS (todos; inclui `CardapioPage.test`, cujo `/Adicionar/` continua
casando "Adicionar", e `App.test`).
Rodar: `npx tsc -b` → sem saída, código 0.
Rodar: `npm run lint` → 0 erros (confirmar que não sobrou import sem uso em `PizzaGrid.tsx`).
Conferir com busca: `src/components/cardapio/**` não contém `localStorage`, `acabouDeAdicionar`,
`Adicionado` nem `font: 'inherit'` fora do `CardapioHeader.tsx`:
`grep -rnE "localStorage|acabouDeAdicionar|Adicionado|font: 'inherit'" src/components/cardapio` (Git Bash; ou a
ferramenta Grep do agente com o mesmo padrão) → só a linha `font: 'inherit'` de `CardapioHeader.tsx`.

- [ ] **Passo 8.6: Registrar arquivos tocados** — `src/components/cardapio/PizzaCard.tsx`,
`src/components/cardapio/PizzaGrid.tsx`, `tests/unit/components/cardapio/PizzaCard.test.tsx`,
`tests/unit/components/cardapio/PizzaGrid.test.tsx`.

---

### Task 9: E2E do carrinho (spec, Testes > E2E)

**Arquivos:**
- Modificar: `tests/e2e/carrinho.spec.ts` (arquivo inteiro)
- `tests/e2e/navegacao.spec.ts`: SEM mudança (o wordmark continua `button`).

**Interfaces:** consome o DOM final das Tasks 4-8: nome do botão "Adicionar", `<aside>` = role
`complementary`, botão "tirar", copy nova.

- [ ] **Passo 9.1: Confirmar que o E2E atual está desatualizado (vermelho)**

Rodar: `npm run test:e2e`
Esperado: os 3 de `navegacao.spec.ts` PASSAM; os 5 de `carrinho.spec.ts` FALHAM (copy antiga
"Seu pedido está vazio", "para o frete grátis", "Você ganhou frete grátis", `getByTitle('Tirar do pedido')` e
o localizador `heading.locator('..').locator('..')`, que agora cai na linha nome+selo e não acha o botão).
Se a porta 3100 estiver ocupada, o Vite falha alto (`strictPort`): liberar a porta e repetir — não é defeito.

- [ ] **Passo 9.2: Reescrever `tests/e2e/carrinho.spec.ts`**

```ts
import { expect, type Page, test } from '@playwright/test'

async function irParaCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
}

function cartaoDaPizza(page: Page, nomePizza: string) {
  return page
    .locator('main div')
    .filter({ has: page.getByRole('heading', { name: nomePizza }) })
    .filter({ has: page.getByRole('button', { name: 'Adicionar', exact: true }) })
    .last()
}

async function adicionar(page: Page, nomePizza: string) {
  await cartaoDaPizza(page, nomePizza).getByRole('button', { name: 'Adicionar', exact: true }).click()
}

function painel(page: Page) {
  return page.getByRole('complementary')
}

test.describe('Carrinho — adicionar, quantidade, frete', () => {
  test('carrinho começa vazio', async ({ page }) => {
    await irParaCardapio(page)

    await expect(page.getByText('Seu carrinho ainda está vazio')).toBeVisible()
    await expect(painel(page).getByText('Nenhuma pizza ainda')).toBeVisible()
  })

  test('adicionar 1 Margherita M mostra item, subtotal e frete pago', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    await expect(painel(page).getByText('1 pizza no carrinho')).toBeVisible()
    await expect(painel(page).getByText('Margherita da casa')).toBeVisible()
    await expect(painel(page).getByText('Tamanho M')).toBeVisible()
    await expect(painel(page).getByText('R$ 45,00').first()).toBeVisible() // subtotal ou total do item
    await expect(painel(page).getByText('R$ 12,00')).toBeVisible() // entrega paga
    await expect(painel(page).getByText('R$ 57,00')).toBeVisible() // total
    await expect(painel(page).getByText('para frete grátis')).toBeVisible()
  })

  test('incrementar até 3 unidades libera frete grátis', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await expect(painel(page).getByText('3 pizzas no carrinho')).toBeVisible()
    await expect(painel(page).getByText('R$ 135,00').first()).toBeVisible() // subtotal ou total geral
    await expect(painel(page).getByText('Frete grátis liberado!')).toBeVisible()
    await expect(painel(page).getByText('Grátis').first()).toBeVisible()
  })

  test('decrementar de volta a 2 unidades cobra frete novamente', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    const aumentar = page.getByRole('button', { name: 'Aumentar quantidade' })
    await aumentar.click()
    await aumentar.click()

    await page.getByRole('button', { name: 'Diminuir quantidade' }).click()

    await expect(painel(page).getByText('R$ 90,00').first()).toBeVisible() // subtotal com 2 unidades
    await expect(painel(page).getByText('R$ 12,00')).toBeVisible() // entrega voltou a ser paga
    await expect(painel(page).getByText('para frete grátis')).toBeVisible()
  })

  test('remover o item volta o carrinho ao estado vazio', async ({ page }) => {
    await irParaCardapio(page)
    await adicionar(page, 'Margherita da casa')

    await page.getByRole('button', { name: 'tirar' }).click()

    await expect(page.getByText('Seu carrinho ainda está vazio')).toBeVisible()
  })
})
```

- [ ] **Passo 9.3: Verde**

Rodar: `npm run test:e2e`
Esperado: `8 passed` (5 carrinho + 3 navegação).

- [ ] **Passo 9.4: Registrar arquivos tocados** — `tests/e2e/carrinho.spec.ts`.

---

### Task 10: Artefatos de continuidade (spec T9, M-4 — texto LITERAL)

Sem teste automatizado (documentação). Cada passo é uma substituição exata; conferir lendo o trecho depois.
Todos os arquivos em UTF-8, preservando acentos.

**Arquivos:**
- Modificar: `docs/spec-cardapio.md`
- Modificar: `docs/spec-home.md` (L66-67)
- Modificar: `design/design-system.md` (§ "Tela de Cardápio", L30 até o fim do item "Fidelidade visual")
- Modificar: `docs/constitution.md` (§ "### Fonte de verdade", L44-48) — **edição autorizada de caminho
  compartilhado (M-8)**, SÓ este trecho, SÓ com o texto abaixo.

- [ ] **Passo 10.1: `docs/spec-cardapio.md`**

(a) Inserir, logo abaixo da linha 1 (`# Spec — Tela de Cardápio (Funcionalidades 1 e 2)`), uma linha em
branco e depois:

```markdown
> **Superada em parte em 2026-10-01** por `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`
> (Cardápio redesenhado, projeto Claude Design `02dc2137-ef8c-4ce1-a78a-620ac1883b79`). NÃO valem mais:
> header/tagline (L24-26), feedback "Adicionado ✓" (L36), catálogo/selos/ingredientes (L37-42), prop
> `acabouDeAdicionar` (L69-70) e o restante do "resumo fiel" visual. Continuam valendo as regras e os
> casos de teste de domínio (preço, carrinho, frete).
```

(b) Acrescentar ` (superado em 2026-10-01)` ao fim de cada item abaixo. As linhas citadas pela spec são as do
arquivo ANTES da inserção (a); depois dela, o conteúdo desceu — localizar pelo texto, não pelo número:
- item do Header (L24-26 originais): no fim da linha que termina em `` (0.9375rem, `--molho-100`). ``;
- item "Adicionado ✓" (L36 original): no fim da linha que termina em `por ~1.4s e volta ao normal.`;
- linhas do catálogo (L40-42 originais, linhas de tabela): DENTRO da última célula, antes do `|` final —
  `` `success` "Vegetariana" (superado em 2026-10-01) | ``, `` `highlight` "Mais pedida" (superado em
  2026-10-01) | `` e `| nenhum (superado em 2026-10-01) |` (texto depois do `|` final some na renderização da
  tabela);
- item do `PizzaCard.tsx` (L69-70 originais): no fim do item, isto é, na linha que termina em
  `` `moeda.ts`) por quem o renderiza. ``

- [ ] **Passo 10.2: `docs/spec-home.md`** — na seção "Conteúdo — "Favoritas da casa"", substituir a frase

`As 3 pizzas do Home.dc.html são exatamente as 3 pizzas de `PIZZAS` (`src/domain/cardapio.ts`), na mesma ordem, com o mesmo nome/ingredientes/badge.`

(que hoje ocupa a linha 66 e o começo da 67) por:

`As 3 pizzas de "Favoritas da casa" vêm de `PIZZAS` (`src/domain/cardapio.ts`), na mesma ordem e com o mesmo nome do Home.dc.html. Desde 2026-10-01, selos e ingredientes seguem o catálogo do Cardápio redesenhado e divergem do Home.dc.html por decisão do PO (P-1 → A, `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`).`

O resto da linha 67 (` O preço exibido ("A partir de R$ X,00") bate com`) e as seguintes ficam.

- [ ] **Passo 10.3: `design/design-system.md`** — substituir do título
`## Tela de Cardápio (implementada a partir de outro projeto Claude Design)` (L30) até o fim do item
"**Fidelidade visual:**" (a última linha antes da linha em branco que precede `## Fora do escopo (cardápio)`),
exclusive esse título `## Fora do escopo (cardápio)`, por:

```markdown
## Tela de Cardápio (redesenho de 2026-10-01)

A tela de cardápio vem do `Cardapio.dc.html` do projeto Claude Design
`02dc2137-ef8c-4ce1-a78a-620ac1883b79` (redesenho), que substituiu a versão do projeto
`6036dccf-e261-4ed4-a41b-e1751a2451cf`. Spec: `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`
(`docs/spec-cardapio.md` segue valendo só para o domínio de preço/carrinho/frete).

- Componentes: `CardapioHeader`, `CardapioPage`, `PizzaGrid`, `PizzaCard`, `CartPanel`, `CartItemRow`
  (`src/components/cardapio/`), sobre `src/domain/{cardapio,carrinho,moeda}.ts`. Fotos em
  `src/assets/pizzas/`.
- Simplificações assumidas: fotos sempre visíveis; tamanho padrão fixo em `M`; nada persiste (o
  `localStorage` do protótipo foi cortado); o botão "Finalizar pedido" fica para a feature 2.
- Fidelidade visual: os valores sem token do mockup (pílula `10px 16px`, stepper 28px, foto 180px,
  colunas 340px/`minmax(300px,1fr)`, gap 2px, anel 3px, max-width 1200px/52ch, min-width 14px) foram
  reproduzidos literalmente, confirmado pelo PO em 2026-10-01. Botões pílula e "tirar" usam só
  `font-family` (line-height normal do navegador), como no mockup.
```

Manter uma linha em branco entre o novo bloco e `## Fora do escopo (cardápio)`.

- [ ] **Passo 10.4: `docs/constitution.md` — EDIÇÃO AUTORIZADA DE CAMINHO COMPARTILHADO (M-8)**

Esta é a ÚNICA edição permitida em `docs/constitution.md`, na seção `### Fonte de verdade`. Nada além destas
linhas muda (nem acentos, nem a linha seguinte "Design system: …"). Substituir EXATAMENTE (hoje L44-48):

```
  - Projeto "Tela de Cardápio de Pizzas" (`6036dccf-e261-4ed4-a41b-e1751a2451cf`): `Home.dc.html`,
    `Cardapio.dc.html` (origem das telas já implementadas).
  - Projeto do checkout (`02dc2137-ef8c-4ce1-a78a-620ac1883b79`): `Checkout.dc.html`,
    `Checkout - Pranchas.dc.html`, `Input.dc.html` e uma cópia própria de `Cardapio.dc.html`
    (com o botão "Finalizar pedido"). Verificado via `DesignSync list_files` em 2026-10-01.
```

por:

```
  - Projeto "Tela de Cardápio de Pizzas" (`6036dccf-e261-4ed4-a41b-e1751a2451cf`): `Home.dc.html`
    (origem da Home implementada). O `Cardapio.dc.html` deste projeto é a versão ANTIGA, substituída
    em 2026-10-01 — não usar como fonte.
  - Projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79`: `Cardapio.dc.html` (origem do Cardápio
    implementado, redesenho de 2026-10-01 — spec
    `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`), `Checkout.dc.html`,
    `Checkout - Pranchas.dc.html` e `Input.dc.html`. Verificado via `DesignSync list_files` em 2026-10-01.
```

(Indentação: 2 espaços antes de `-`, 4 espaços nas linhas de continuação, como no arquivo.) Se o texto atual
não bater EXATAMENTE com o bloco "Substituir", PARE e reporte — não adapte.

- [ ] **Passo 10.5: Conferir** — reler os 4 trechos editados e confirmar que só eles mudaram.
- [ ] **Passo 10.6: Registrar arquivos tocados** — `docs/spec-cardapio.md`, `docs/spec-home.md`,
`design/design-system.md`, `docs/constitution.md` (caminho compartilhado, edição autorizada pela spec T9).

---

### Task 11: Verificação final do dev (evidência fresca)

Todos os comandos desta task rodam EM PRIMEIRO PLANO (nunca em background, nunca esperando notificação),
um por vez, lendo a saída antes do próximo. O `npm run gate` final NÃO é do dev: fica com a sessão principal.

- [ ] **Passo 11.1:** `npm test` → esperado: `Test Files … passed`, `Tests … passed`, **0 failed**. Copiar as
duas linhas de resumo para o relatório.
- [ ] **Passo 11.2:** `npm run lint` → esperado: 0 erros. Copiar o resumo.
- [ ] **Passo 11.3:** `npx tsc -b` → esperado: sem saída, código 0.
- [ ] **Passo 11.4:** `npm run test:e2e` → esperado: `8 passed`. Copiar o resumo.
- [ ] **Passo 11.5:** `npm run screenshot` → esperado: `Screenshot salvo em …design\atual-home.png` e
`…design\atual-cardapio.png` (porta 3101, viewport 1280x720, página inteira).
- [ ] **Passo 11.6: Conferência visual (não substitui a régua do testador)** — abrir
`design/atual-cardapio.png` e `design/atual-home.png` e conferir contra o inventário da spec, no mínimo:
header com wordmark à esquerda e tagline "Aberto hoje até 23h · entrega em uns 40 minutos" à direita na mesma
linha (1-4); "Nossas pizzas" grande, em largura total, acima das 2 colunas, com a intro (5-6); aside de 340px
(7); card com foto de 180px dentro do padding, selo à direita do nome, rótulo "TAMANHO", pílulas
arredondadas sem dot, resumo "Tamanho M · 6 fatias" + preço e botão "Adicionar" (9-22); aside vazio com
"Nenhuma pizza ainda" e mensagem centralizada (24-26); sem botão "Finalizar pedido" (42); Home com
"MAIS PEDIDA" na Margherita, Calabresa sem selo, "DA CASA" no Quatro queijos (48-51). Divergência → descrever
no relatório (não "ajeitar" fora do inventário).
- [ ] **Passo 11.7: Relatório do dev** — listar EXATAMENTE os arquivos criados/alterados (esperado: os 22 do
"Mapa de arquivos" — 9 de `src/`, 9 de `tests/`, 4 de docs/design — mais
`docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`, marcada como "assinatura": só a linha do
`dev` na tabela), as saídas de vermelho de cada task e as
saídas verdes dos passos 11.1-11.5. Nenhum arquivo fora dessa lista; em particular nada em
`src/components/ui/**`, `src/styles/tokens.css`, `src/components/home/**`, `package.json`, `.claude/**`.
Gravar a linha do `dev` na tabela "Assinaturas do pipeline" da spec (evidência = arquivos tocados + saídas).
