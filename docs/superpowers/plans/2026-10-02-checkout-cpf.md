# Finalizar pedido com CPF na nota — Plano de implementação

> **Para o agente executor:** sub-skill obrigatória: `superpowers:executing-plans` (um único subagente `dev`,
> tasks em sequência), com `superpowers:test-driven-development` em cada task e
> `superpowers:verification-before-completion` na Task 11. Os passos usam checkbox (`- [ ]`). Planejador, 2026-10-02.

**Objetivo:** ligar o botão "Finalizar pedido" do Cardápio a uma tela de checkout (nome, telefone e CPF
opcional na nota) e a uma tela "Pedido confirmado". O CPF só aparece mascarado depois de digitado. Nada persiste.

**Arquitetura:** as regras novas ficam em `src/domain/cliente.ts` (validações e máscaras) e
`src/domain/pedido.ts` (número, montagem e resumo do pedido). São funções puras, e total/frete reusam
`carrinho.ts`. O campo genérico nasce em `src/components/ui/Input.tsx` (caminho compartilhado, autorizado
literalmente pela spec). O bloco Subtotal/Entrega/Total sai do `CartPanel` para `src/components/pedido/TotaisPedido.tsx`.
As telas novas ficam em `src/components/checkout/`. O carrinho sobe do `CardapioPage` para o `App.tsx`, que
navega por `useState` entre `'home' | 'cardapio' | 'checkout' | 'confirmacao'`.

**Stack:** React 19.2, Vite 8, TypeScript 6, Vitest 4 + Testing Library (jsdom 29), Playwright (E2E, porta 3100),
oxlint. Windows, sem git.

**Spec (ler junto, por inteiro):** `docs/superpowers/specs/2026-10-02-checkout-cpf-design.md`. Ler com atenção:
"Decisões do usuário" (P-1 a P-7, **não se reabrem**), "Confidencialidade", "Domínio", "Componentes", "Testes",
"Inventario de paridade" (linhas 1-71) e "T9 — texto literal".

**Mockups (só leitura, cópia local D6; Lnn nas tasks = linhas destes arquivos):**
`C:\Users\<user>\AppData\Local\Temp\claude\C--Projetos-VSCode-apresentacao-cq1-template-pizzaria-dona-massa-full-template\1ffc3bb6-7c98-4e55-b101-4ca8ce31a437\scratchpad\mockups\02dc2137\`
(`Checkout.dc.html`, `Input.dc.html`, `Cardapio.dc.html`, `Checkout - Pranchas.dc.html`).

**Raiz do projeto:** `C:\Projetos VSCode\apresentacao_cq1\template\pizzaria-dona-massa-full-template`. Todos os
caminhos abaixo são relativos a ela.

---

## Restrições globais (valem para TODA task)

- **Sem git (D1).** Não há passo de commit. O checkpoint de cada task é a suíte afetada verde mais
  `npx tsc -b` com exit 0. No fim de cada task, anote os arquivos criados ou alterados para o relatório final.
- **O dev NÃO roda `npm run gate`.** Roda os comandos de cada passo (suíte afetada, `npm test` total,
  `npx tsc -b`, `npm run lint` e o E2E `tests/e2e/checkout.spec.ts`). Gate completo, régua de paridade e
  E2E completo ficam com a sessão principal e o testador.
- **A régua F1 (`tests/paridade/cardapio.paridade.mjs`) NÃO é editada nem rodada pelo dev.** Depois da Task 9 ela
  vai acusar as linhas 41-43 nos estados P e G (o card passa de 4 para 6 blocos e aparecem botão e frase). Isso é
  esperado. Quem ajusta é o testador (T10). A régua nova `tests/paridade/checkout.paridade.mjs` também é do
  testador.
- **Caminhos compartilhados (M-8):** `src/styles/tokens.css`, `src/components/ui/**`, `CLAUDE.md`,
  `docs/constitution.md`, `docs/framework/**`, `docs/patterns/**`, `.claude/**` e `package.json`.
  **A ÚNICA edição autorizada** é a criação de `src/components/ui/Input.tsx` e `tests/unit/ui/Input.test.tsx`
  (Task 3, autorização literal da spec). `Button.tsx`, `Card.tsx`, `Badge.tsx` e `tokens.css` NÃO mudam.
  Nenhuma dependência nova. A constituição fica com a sessão principal.
- **Fora do escopo (não implementar):** endereço/CEP, pagamento, login, mobile/responsivo, backend,
  persistência (`localStorage`/`sessionStorage`/cookie), `EXEMPLO`, presets `estado`, `forceState`, modo não
  controlado do Input, `<form>`/Enter para enviar, mudanças em `npm run screenshot`, hints Badge 22/Button 48.
- **Copy literal** (UTF-8, acentos, travessão "—" e ponto médio "·" exatos): está nos blocos de código de cada task.
  Copie do plano, não redigite.

## Instruções ao dev — checklist recorrente dos revisores (obrigatório)

1. **Vermelho real.** Todo teste marcado "(vermelho)" tem de FALHAR antes do código, pelo motivo escrito no passo.
   Proibido assert vazio, regex sobre o código-fonte ou fixture que já satisfaça o teste. Se um teste "(vermelho)"
   passar antes do código, PARE: o teste está errado. Os marcados "(guarda)" são de regressão ou LGPD e podem
   passar logo que o módulo existe. O passo diz quando isso acontece.
2. **Dado pessoal (CPF/telefone/nome) nunca em log, console, URL, `Error.message`, `key`, `aria-label`, `title`,
   `data-*` ou snapshot.** `toMatchSnapshot`/`toMatchInlineSnapshot` são proibidos nesta feature. CPF só aparece
   mascarado depois da digitação (P-7). No campo, enquanto se digita, ele aparece formatado e completo. Só dados
   fictícios: `123.456.789-09`, "Ana Exemplo", "(11) 90000-0000", e variações inválidas (`123.456.789-00`,
   `111.111.111-11`). **Proibido gerar outro CPF válido.**
3. **Regra de negócio só em `src/domain`:** validação, máscara, total do item, frete e número do pedido.
   Componente só exibe. Nada de `preco * qty`, `.reduce(` ou regex de dígitos em `src/components/**`.
4. **Estilo só por tokens e componentes `ui` (E-1/E-5).** `fontWeight` usa `'var(--fw-regular)'` ou
   `'var(--fw-bold)'`, nunca 400/700 cru.
5. **Valor cru só da lista fechada P-4 da spec**, e nenhum outro px, s, opacity ou hex:
   - gap do Input `6px`;
   - padding do campo `12px 14px`;
   - checkbox `22px`;
   - gap do checkbox `10px`;
   - coluna do aside `320px`;
   - `max-width` `1200px` e `520px`;
   - gap `2px` das linhas de item;
   - transição `.15s ease`;
   - borda `1px solid` com cor variável (campo em hover/erro, checkbox);
   - `lineHeight: 1` da marca do checkbox;
   - `opacity: 1` do placeholder.

   Também valem: `width: '100%'`, `margin: 0`, `padding: 0`, `flex: '0 0 auto'`, `gridColumn: '1 / -1'` e
   `minmax(0, 1fr)`, porque não são medidas de design. **Ressalva PL-1, Task 7:** o `gap: '2px'` da coluna
   número/prazo da confirmação (inventário 56) não está literalmente na lista. Ver a pré-condição da Task 7.
   Antes de entregar, o dev roda o grep da Task 11, passo 11.3, e confronta cada ocorrência com esta lista.
6. **Asserts:**
   - RTL: `getByRole` NÃO tem `exact` (quebra o tsc). `name` string já é exato.
   - Playwright: use `{ exact: true }` ou locator escopado quando o mesmo texto aparece em mais de um elemento.
     Exemplo: "R$ 105,00" está no Subtotal e no Total.
7. **`toHaveStyle` com `var(--x)` funciona no jsdom 29 em propriedade longa:** `color`, `background`,
   `fontWeight`, `boxShadow`, `fontSize`, `lineHeight`, `width`.
   - **Não funciona em shorthand com `var()`:** `border`, `borderTop`, `borderBottom`, `borderRadius`, `gap`/
     `padding` com `var()`. O assert falha sempre, tanto com o valor certo quanto com o errado (sondado pelo
     planejador em 2026-10-02).
   - Para esses, use `el.getAttribute('style')` com `toContain('border: 1px solid var(--danger)')`. É o padrão
     já usado em `tests/unit/ui/Card.test.tsx` L11-16.
   - Quando dois estados compartilham o fundo, confira cor E borda.
8. **Todo teste ou arquivo novo compila no `npx tsc -b`** (`tests/unit` entra no tsc; `tests/e2e` não).
9. **`<style>` do placeholder persiste no `<head>` entre testes do mesmo arquivo.** O único teste que olha para ele
   conta as regras (`toHaveLength(1)`) e confere a classe do campo. Nenhum teste pode depender só de "a regra existe".
10. **Antes de reportar pronto:** `npx tsc -b` exit 0 e `npm test` total verde, com a saída colada no relatório.

## Foco de revisão (entradas que a spec implica e que mais podem morder)

1. **Desmarcar "Quero CPF na nota" depois de um CPF inválido, já com `tentou`,** tem de deixar confirmar sem CPF.
   `onConfirmar` recebe `querCPF:false, cpf:''`. Teste na Task 6 (passo 6.1, teste "FR-1").
2. **Ir à Home pelo wordmark a partir do checkout e voltar ao Cardápio** preserva o carrinho (P-6). Teste na
   Task 9 (passo 9.3, teste "FR-2").
3. **Colar um CPF com mais de 11 dígitos ou com pontuação** corta em 11 e formata. Teste na Task 6 (passo 6.1,
   teste "FR-3"); a regra está na Task 1.
4. **Telefone fixo de 10 dígitos** é aceito no formulário, sem erro, e confirma. Teste na Task 6 (passo 6.1,
   teste "FR-4").
5. **Nome só com espaços** mostra o erro e não confirma. Teste na Task 6 (passo 6.1, teste "FR-5").

## Mapa de arquivos

| Arquivo | Task | Responsabilidade |
|---|---|---|
| `src/domain/cliente.ts` (novo) | 1 | máscaras e validações de nome, telefone e CPF; CPF mascarado |
| `tests/unit/domain/cliente.test.ts` (novo) | 1 | tabela "Casos de teste" da spec |
| `src/domain/pedido.ts` (novo) | 2 | número sequencial, `montarPedido`, `resumirConfirmacao` |
| `tests/unit/domain/pedido.test.ts` (novo) | 2 | idem |
| `src/components/ui/Input.tsx` (novo, **COMPARTILHADO**) | 3 | campo texto + checkbox |
| `tests/unit/ui/Input.test.tsx` (novo, **COMPARTILHADO**) | 3 | estados do Input |
| `src/components/pedido/TotaisPedido.tsx` (novo) | 4 | `TotaisPedido` + `LinhaTotal` |
| `tests/unit/components/pedido/TotaisPedido.test.tsx` (novo) | 4 | idem |
| `src/components/cardapio/CartPanel.tsx` | 4, 9 | usa `TotaisPedido`; botão Finalizar + frase |
| `src/components/checkout/itemResumoDe.ts` (novo) | 5 | mapeia `ItemCarrinho` → dados de exibição (ver PL-2) |
| `src/components/checkout/ItemResumo.tsx` (novo) | 5 | linha só leitura |
| `src/components/checkout/ResumoPedido.tsx` (novo) | 5 | aside do checkout |
| `src/components/checkout/FormularioCliente.tsx` (novo) | 6 | card do formulário + copy dos erros |
| `src/components/checkout/CheckoutPage.tsx` (novo) | 6 | estado do formulário, `tentou`, totais |
| `tests/unit/components/checkout/CheckoutPage.test.tsx` (novo) | 5, 6 | aside + formulário |
| `src/components/checkout/PedidoConfirmado.tsx` (novo) | 7 | tela de confirmação |
| `tests/unit/components/checkout/PedidoConfirmado.test.tsx` (novo) | 7 | idem |
| `tests/e2e/checkout.spec.ts` (novo) | 8 | fluxo + guardas LGPD |
| `src/components/cardapio/CardapioPage.tsx` | 9 | carrinho por props; `onFinalizar` |
| `src/App.tsx` | 9 | telas, carrinho, número, confirmação |
| `tests/unit/components/cardapio/CartPanel.test.tsx` | 9 | `onFinalizar`; guarda invertida |
| `tests/unit/components/cardapio/CardapioPage.test.tsx` | 9 | wrapper com estado; props novas |
| `tests/unit/App.test.tsx` | 9 | fluxo, P-1, P-2, P-6 |
| `design/design-system.md`, `docs/spec-home.md`, `docs/spec-cardapio.md`, `AI_HANDOFF.md` | 10 | T9 literal (M-4) |

**Correspondência com a spec:** Task 1 = T1; Task 2 = T2; Task 3 = T3; Task 4 = T4; Tasks 5-6 = T6; Task 7 = T7
(componente); Task 8 = T8; Task 9 = T5 + T7 (`App`); Task 10 = T9; Task 11 = verificação. T10 é do testador.
T11 e o screenshot foram cortados pela spec.

**Por que T5 e o `App` de T7 estão juntos (Task 9):** a mudança de props do `CardapioPage` (T5) quebra o
`App.tsx` no tsc e em runtime, porque o carrinho chegaria `undefined`, se o `App` não mudar na mesma task.
**Por que o E2E (Task 8) vem antes da Task 9:** assim ele nasce vermelho de verdade, já que ainda não existe o
botão "Finalizar pedido", e fecha verde no fim da Task 9.

---

### Task 1: Domínio do cliente (T1)

**Files:**
- Create: `src/domain/cliente.ts`
- Test: `tests/unit/domain/cliente.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces (usado nas Tasks 2, 6 e 9):
  ```ts
  export type ErroNome = 'vazio'
  export type ErroTelefone = 'vazio' | 'incompleto'
  export type ErroCPF = 'invalido'
  export interface DadosCliente { nome: string; telefone: string; querCPF: boolean; cpf: string }
  export interface ErrosCliente { nome: ErroNome | null; telefone: ErroTelefone | null; cpf: ErroCPF | null }
  export function apenasDigitos(texto: string): string
  export function formatarTelefone(texto: string): string
  export function validarTelefone(texto: string): ErroTelefone | null
  export function validarNome(nome: string): ErroNome | null
  export function formatarCPF(texto: string): string
  export function validarCPF(texto: string): boolean
  export function mascararCPF(texto: string): string | null
  export function validarDadosCliente(dados: DadosCliente): ErrosCliente
  export function temErros(erros: ErrosCliente): boolean
  ```

- [ ] **Passo 1.1: Escrever o teste (vermelho)** em `tests/unit/domain/cliente.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  apenasDigitos,
  formatarCPF,
  formatarTelefone,
  mascararCPF,
  temErros,
  validarCPF,
  validarDadosCliente,
  validarNome,
  validarTelefone,
  type DadosCliente,
  type ErroNome,
  type ErroTelefone,
} from '../../../src/domain/cliente'

const preenchido: DadosCliente = {
  nome: 'Ana Exemplo',
  telefone: '(11) 90000-0000',
  querCPF: true,
  cpf: '123.456.789-09',
}

describe('apenasDigitos', () => {
  const casos: Array<[string, string]> = [
    ['(11) 90000-0000', '11900000000'],
    ['abc', ''],
    ['', ''],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(apenasDigitos(entrada)).toBe(esperado)
  })
})

describe('formatarTelefone (= maskTel, Checkout L143-150)', () => {
  const casos: Array<[string, string]> = [
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['119000', '(11) 9000'],
    ['1190000', '(11) 9000-0'],
    ['1100000000', '(11) 0000-0000'],
    ['11900000000', '(11) 90000-0000'],
    ['119000000001', '(11) 90000-0000'],
    ['(11) 90000-0000', '(11) 90000-0000'],
    ['abc', ''],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(formatarTelefone(entrada)).toBe(esperado)
  })
})

describe('validarTelefone', () => {
  const casos: Array<[string, ErroTelefone | null]> = [
    ['', 'vazio'],
    ['abc', 'vazio'],
    ['(11', 'incompleto'],
    ['(11) 9000', 'incompleto'],
    ['119000000', 'incompleto'],
    ['(11) 0000-0000', null],
    ['(11) 90000-0000', null],
    ['11900000000', null],
    ['119000000001', null],
  ]
  it.each(casos)('%j -> %j (sem checagem de DDD; corta em 11 dígitos)', (entrada, esperado) => {
    expect(validarTelefone(entrada)).toBe(esperado)
  })
})

describe('validarNome', () => {
  const casos: Array<[string, ErroNome | null]> = [
    ['', 'vazio'],
    ['   ', 'vazio'],
    ['Ana Exemplo', null],
    [' A ', null],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(validarNome(entrada)).toBe(esperado)
  })
})

describe('formatarCPF (= maskCpf, Checkout L151-158)', () => {
  const casos: Array<[string, string]> = [
    ['', ''],
    ['1', '1'],
    ['123', '123'],
    ['1234', '123.4'],
    ['123456', '123.456'],
    ['1234567', '123.456.7'],
    ['123456789', '123.456.789'],
    ['1234567890', '123.456.789-0'],
    ['12345678909', '123.456.789-09'],
    ['123456789091', '123.456.789-09'],
    ['123.456.789-09', '123.456.789-09'],
    ['a1b2', '12'],
  ]
  it.each(casos)('%j -> %j', (entrada, esperado) => {
    expect(formatarCPF(entrada)).toBe(esperado)
  })
})

describe('validarCPF (= cpfValido, Checkout L159-169)', () => {
  it.each(['123.456.789-09', '12345678909', ' 123.456.789-09 '])('%j é válido', (entrada) => {
    expect(validarCPF(entrada)).toBe(true)
  })

  it.each([
    '123.456.789-00', // 1º DV certo, 2º errado (preset erros)
    '123.456.789-08', // 2º DV errado
    '123.456.789-19', // 1º DV errado
    '111.111.111-11', // repetido (passaria no DV)
    '000.000.000-00', // repetido
    '',
    '123.456.789', // 9 dígitos
    '1234567890', // 10
    '123456789091', // 12
  ])('%j é inválido', (entrada) => {
    expect(validarCPF(entrada)).toBe(false)
  })
})

describe('mascararCPF', () => {
  it.each(['123.456.789-09', '12345678909'])('%j -> ***.456.789-** (sem os dígitos 0-2 e 9-10)', (entrada) => {
    const mascarado = mascararCPF(entrada)
    expect(mascarado).toBe('***.456.789-**')
    expect(mascarado).not.toContain('123')
    expect(mascarado?.endsWith('09')).toBe(false)
  })

  it.each(['123.456.789', ''])('%j -> null (não tem 11 dígitos)', (entrada) => {
    expect(mascararCPF(entrada)).toBeNull()
  })
})

describe('validarDadosCliente (= erros(), Checkout L193-201)', () => {
  it('preset erros: os três campos com erro', () => {
    expect(
      validarDadosCliente({ nome: '', telefone: '(11) 9000', querCPF: true, cpf: '123.456.789-00' }),
    ).toEqual({ nome: 'vazio', telefone: 'incompleto', cpf: 'invalido' })
  })

  it('preset preenchido: nenhum erro', () => {
    expect(validarDadosCliente(preenchido)).toEqual({ nome: null, telefone: null, cpf: null })
  })

  it('CPF só é avaliado com querCPF', () => {
    expect(validarDadosCliente({ ...preenchido, querCPF: false, cpf: '' }).cpf).toBeNull()
    expect(validarDadosCliente({ ...preenchido, querCPF: false, cpf: '123' }).cpf).toBeNull()
    expect(validarDadosCliente({ ...preenchido, querCPF: true, cpf: '' }).cpf).toBe('invalido')
  })

  it('telefone vazio -> vazio', () => {
    expect(validarDadosCliente({ ...preenchido, telefone: '' }).telefone).toBe('vazio')
  })
})

describe('temErros', () => {
  it('todos null -> false; um não nulo -> true', () => {
    expect(temErros({ nome: null, telefone: null, cpf: null })).toBe(false)
    expect(temErros({ nome: null, telefone: null, cpf: 'invalido' })).toBe(true)
    expect(temErros({ nome: 'vazio', telefone: null, cpf: null })).toBe(true)
  })
})
```

- [ ] **Passo 1.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/domain/cliente.test.ts`.
  Esperado: FAIL com `Failed to resolve import "../../../src/domain/cliente"` (o módulo não existe).

- [ ] **Passo 1.3: Implementação mínima** em `src/domain/cliente.ts`:

```ts
export type ErroNome = 'vazio'
export type ErroTelefone = 'vazio' | 'incompleto'
export type ErroCPF = 'invalido'

/** Valores do formulário, como o cliente vê (formatados). */
export interface DadosCliente {
  nome: string
  telefone: string
  querCPF: boolean
  cpf: string
}

export interface ErrosCliente {
  nome: ErroNome | null
  telefone: ErroTelefone | null
  cpf: ErroCPF | null
}

const MAX_DIGITOS = 11

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}

export function formatarTelefone(texto: string): string {
  const d = apenasDigitos(texto).slice(0, MAX_DIGITOS)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  const meio = d.length > 10 ? 5 : 4
  const a = d.slice(2, 2 + meio)
  const b = d.slice(2 + meio)
  return `(${d.slice(0, 2)}) ${a}${b ? `-${b}` : ''}`
}

export function validarTelefone(texto: string): ErroTelefone | null {
  const n = apenasDigitos(texto).slice(0, MAX_DIGITOS).length
  if (n === 0) return 'vazio'
  if (n < 10) return 'incompleto'
  return null
}

export function validarNome(nome: string): ErroNome | null {
  return nome.trim() ? null : 'vazio'
}

export function formatarCPF(texto: string): string {
  const d = apenasDigitos(texto).slice(0, MAX_DIGITOS)
  let r = d.slice(0, 3)
  if (d.length > 3) r += `.${d.slice(3, 6)}`
  if (d.length > 6) r += `.${d.slice(6, 9)}`
  if (d.length > 9) r += `-${d.slice(9)}`
  return r
}

export function validarCPF(texto: string): boolean {
  const d = apenasDigitos(texto)
  if (d.length !== MAX_DIGITOS || /^(\d)\1+$/.test(d)) return false
  const dv = (n: number): number => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

export function mascararCPF(texto: string): string | null {
  const d = apenasDigitos(texto)
  if (d.length !== MAX_DIGITOS) return null
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

export function validarDadosCliente(dados: DadosCliente): ErrosCliente {
  return {
    nome: validarNome(dados.nome),
    telefone: validarTelefone(dados.telefone),
    cpf: dados.querCPF && !validarCPF(dados.cpf) ? 'invalido' : null,
  }
}

export function temErros(erros: ErrosCliente): boolean {
  return erros.nome !== null || erros.telefone !== null || erros.cpf !== null
}
```

- [ ] **Passo 1.4: Verde.** Rode `npx vitest run tests/unit/domain/cliente.test.ts` (esperado: PASS, todos) e depois
  `npx tsc -b` (esperado: exit 0, sem saída).
- [ ] **Passo 1.5: Checkpoint.** Registre os arquivos tocados: `src/domain/cliente.ts` e
  `tests/unit/domain/cliente.test.ts`.

---

### Task 2: Domínio do pedido (T2, P-1 → A)

**Files:**
- Create: `src/domain/pedido.ts`
- Test: `tests/unit/domain/pedido.test.ts`

**Interfaces:**
- Consumes: de `carrinho.ts`, `ItemCarrinho`, `calcularSubtotal`, `calcularFrete(subtotal, temItens)` e
  `calcularTotal`. De `cliente.ts` (Task 1), `DadosCliente`, `apenasDigitos`, `mascararCPF`,
  `validarDadosCliente` e `temErros`.
- Produces (usado nas Tasks 7 e 9):
  ```ts
  export const NUMERO_PEDIDO_INICIAL = 1234
  export interface Pedido { numero: number; itens: ItemCarrinho[]; subtotal: number; frete: number; total: number
    cliente: { nome: string; telefone: string; cpf: string | null } }
  export interface ResumoConfirmacao { numero: number; itens: ItemCarrinho[]; total: number; cpfMascarado: string | null }
  export function proximoNumeroPedido(ultimo: number | null): number
  export function montarPedido(carrinho: ItemCarrinho[], dados: DadosCliente, numero: number): Pedido
  export function resumirConfirmacao(pedido: Pedido): ResumoConfirmacao
  ```

- [ ] **Passo 2.1: Escrever o teste (vermelho)** em `tests/unit/domain/pedido.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { ItemCarrinho } from '../../../src/domain/carrinho'
import type { DadosCliente } from '../../../src/domain/cliente'
import {
  NUMERO_PEDIDO_INICIAL,
  montarPedido,
  proximoNumeroPedido,
  resumirConfirmacao,
} from '../../../src/domain/pedido'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const preenchido: DadosCliente = {
  nome: 'Ana Exemplo',
  telefone: '(11) 90000-0000',
  querCPF: true,
  cpf: '123.456.789-09',
}
const comErros: DadosCliente = { nome: '', telefone: '(11) 9000', querCPF: true, cpf: '123.456.789-00' }

function erroLancadoPor(f: () => unknown): Error {
  try {
    f()
  } catch (e) {
    return e as Error
  }
  throw new Error('a função não lançou')
}

describe('proximoNumeroPedido (P-1 -> A)', () => {
  it('começa em 1234 e soma 1', () => {
    expect(NUMERO_PEDIDO_INICIAL).toBe(1234)
    expect(proximoNumeroPedido(null)).toBe(1234)
    expect(proximoNumeroPedido(1234)).toBe(1235)
    expect(proximoNumeroPedido(1235)).toBe(1236)
  })
})

describe('montarPedido', () => {
  it('1 Margherita M + preset preenchido: frete pago, dados normalizados', () => {
    expect(montarPedido([margheritaM], preenchido, 1234)).toEqual({
      numero: 1234,
      itens: [margheritaM],
      subtotal: 45,
      frete: 12,
      total: 57,
      cliente: { nome: 'Ana Exemplo', telefone: '11900000000', cpf: '12345678909' },
    })
  })

  it('Margherita M + Calabresa G: subtotal 105, frete grátis', () => {
    const pedido = montarPedido([margheritaM, calabresaG], preenchido, 1234)
    expect(pedido.subtotal).toBe(105)
    expect(pedido.frete).toBe(0)
    expect(pedido.total).toBe(105)
  })

  it('sem querCPF, o CPF digitado não entra no pedido', () => {
    expect(montarPedido([margheritaM], { ...preenchido, querCPF: false }, 1234).cliente.cpf).toBeNull()
  })

  it('o nome vai com trim', () => {
    expect(montarPedido([margheritaM], { ...preenchido, nome: '  Ana Exemplo ' }, 1234).cliente.nome).toBe('Ana Exemplo')
  })

  it('carrinho vazio ou dados com erro lançam com mensagem fixa, sem dado pessoal', () => {
    const vazio = erroLancadoPor(() => montarPedido([], preenchido, 1234))
    const invalido = erroLancadoPor(() => montarPedido([margheritaM], comErros, 1234))
    for (const erro of [vazio, invalido]) {
      expect(erro.message).toBe('Pedido inválido')
      expect(erro.message).not.toMatch(/\d/)
    }
  })
})

describe('resumirConfirmacao', () => {
  it('com CPF: só numero, itens, total e CPF mascarado', () => {
    const resumo = resumirConfirmacao(montarPedido([margheritaM], preenchido, 1234))
    expect(resumo).toEqual({ numero: 1234, itens: [margheritaM], total: 57, cpfMascarado: '***.456.789-**' })
    expect(Object.keys(resumo)).toEqual(['numero', 'itens', 'total', 'cpfMascarado'])
    const serializado = JSON.stringify(resumo)
    expect(serializado).not.toContain('12345678909')
    expect(serializado).not.toContain('Ana Exemplo')
    expect(serializado).not.toContain('11900000000')
  })

  it('sem CPF: cpfMascarado null', () => {
    const resumo = resumirConfirmacao(montarPedido([margheritaM], { ...preenchido, querCPF: false }, 1234))
    expect(resumo.cpfMascarado).toBeNull()
  })
})
```

- [ ] **Passo 2.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/domain/pedido.test.ts`.
  Esperado: FAIL com `Failed to resolve import "../../../src/domain/pedido"`.

- [ ] **Passo 2.3: Implementação mínima** em `src/domain/pedido.ts`:

```ts
import { calcularFrete, calcularSubtotal, calcularTotal, type ItemCarrinho } from './carrinho'
import { apenasDigitos, mascararCPF, temErros, validarDadosCliente, type DadosCliente } from './cliente'

export const NUMERO_PEDIDO_INICIAL = 1234

export interface Pedido {
  numero: number
  itens: ItemCarrinho[]
  subtotal: number
  frete: number
  total: number
  cliente: {
    nome: string // trim
    telefone: string // só dígitos
    cpf: string | null // só dígitos; null sem querCPF
  }
}

export interface ResumoConfirmacao {
  numero: number
  itens: ItemCarrinho[]
  total: number
  cpfMascarado: string | null
}

export function proximoNumeroPedido(ultimo: number | null): number {
  return ultimo === null ? NUMERO_PEDIDO_INICIAL : ultimo + 1
}

export function montarPedido(carrinho: ItemCarrinho[], dados: DadosCliente, numero: number): Pedido {
  if (carrinho.length === 0 || temErros(validarDadosCliente(dados))) {
    throw new Error('Pedido inválido')
  }
  const subtotal = calcularSubtotal(carrinho)
  const frete = calcularFrete(subtotal, true)
  return {
    numero,
    itens: carrinho.map((item) => ({ ...item })),
    subtotal,
    frete,
    total: calcularTotal(subtotal, frete),
    cliente: {
      nome: dados.nome.trim(),
      telefone: apenasDigitos(dados.telefone),
      cpf: dados.querCPF ? apenasDigitos(dados.cpf) : null,
    },
  }
}

export function resumirConfirmacao(pedido: Pedido): ResumoConfirmacao {
  return {
    numero: pedido.numero,
    itens: pedido.itens,
    total: pedido.total,
    cpfMascarado: pedido.cliente.cpf ? mascararCPF(pedido.cliente.cpf) : null,
  }
}
```

- [ ] **Passo 2.4: Verde.** Rode `npx vitest run tests/unit/domain` (esperado: PASS, inclusive `carrinho`, `cardapio`
  e `moeda`) e `npx tsc -b` (esperado: exit 0).
- [ ] **Passo 2.5: Checkpoint.** Registre `src/domain/pedido.ts` e `tests/unit/domain/pedido.test.ts`.

---

### Task 3: `ui/Input` texto + checkbox (T3, P-4 → A, P-5 → A) — **CAMINHO COMPARTILHADO**

> **Esta task toca `src/components/ui/**`, que é caminho compartilhado (M-8).** A spec autoriza LITERALMENTE só a
> criação de `src/components/ui/Input.tsx` e `tests/unit/ui/Input.test.tsx`. Não edite `Button.tsx`, `Card.tsx`,
> `Badge.tsx`, `src/styles/tokens.css` nem nenhum outro arquivo de `src/components/ui/**`.

**Files:**
- Create: `src/components/ui/Input.tsx` (**compartilhado, autorizado literalmente**)
- Test: `tests/unit/ui/Input.test.tsx` (**compartilhado, autorizado literalmente**)

**Interfaces:**
- Consumes: nada.
- Produces (usado na Task 6):
  ```ts
  export type InputMode = 'text' | 'numeric' | 'tel'
  // texto:    <Input id label value onChange placeholder? help? error? disabled? inputMode? autoComplete? />
  // checkbox: <Input kind="checkbox" label checked onToggle disabled? />
  export type InputProps = InputTextoProps | InputCheckboxProps
  export function Input(props: InputProps): JSX.Element
  ```

Estilos: `Input.dc.html` L24-41 e L60-96, inventário 28-42.

- [ ] **Passo 3.1: Escrever o teste (vermelho)** em `tests/unit/ui/Input.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../../src/components/ui/Input'

const estilo = (el: HTMLElement) => el.getAttribute('style') ?? ''

describe('Input — texto', () => {
  it('rótulo liga ao campo; placeholder, inputMode e ajuda; sem erro', () => {
    render(
      <Input
        id="telefone"
        label="Telefone (com DDD)"
        value=""
        onChange={vi.fn()}
        placeholder="(11) 98765-4321"
        inputMode="tel"
        help="A gente só liga se o motoboy se perder."
      />,
    )
    const campo = screen.getByLabelText('Telefone (com DDD)')
    expect(campo).toHaveAttribute('type', 'text')
    expect(campo).toHaveAttribute('placeholder', '(11) 98765-4321')
    expect(campo).toHaveAttribute('inputmode', 'tel')
    expect(campo).toHaveAttribute('aria-invalid', 'false')
    expect(campo).toHaveAttribute('aria-describedby', 'telefone-ajuda')
    expect(screen.getByText('A gente só liga se o motoboy se perder.')).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-muted)',
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('é controlado: digitar chama onChange com o valor', async () => {
    const onChange = vi.fn()
    render(<Input id="nome" label="Seu nome" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Seu nome'), 'A')
    expect(onChange).toHaveBeenCalledWith('A')
  })

  it('com erro: role=alert com a copy, a ajuda some, aria-invalid=true', () => {
    render(
      <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} help="Ajuda qualquer" error="Conta pra gente seu nome." />,
    )
    const alerta = screen.getByRole('alert')
    expect(alerta).toHaveTextContent('Conta pra gente seu nome.')
    expect(alerta).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      fontWeight: 'var(--fw-bold)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--danger)',
    })
    expect(screen.queryByText('Ajuda qualquer')).not.toBeInTheDocument()
    const campo = screen.getByLabelText('Seu nome')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAttribute('aria-describedby', 'nome-erro')
  })

  it('estrutura: coluna gap 6px; rótulo small/bold/title/lh-body', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const rotulo = screen.getByText('Seu nome')
    expect(rotulo.tagName).toBe('LABEL')
    expect(rotulo).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-title)',
      lineHeight: 'var(--lh-body)',
    })
    expect(rotulo.parentElement).toHaveStyle({ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' })
  })

  it('padrão: borda var(--border-card), fundo surface-card, sem sombra, padding 12px 14px', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    expect(estilo(campo)).toContain('border: var(--border-card)')
    expect(estilo(campo)).toContain('border-radius: var(--radius-md)')
    expect(campo).toHaveStyle({
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      boxShadow: 'none',
      padding: '12px 14px',
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
    })
    expect(estilo(campo)).toContain('transition: border-color .15s ease, box-shadow .15s ease, background .15s ease')
  })

  it('hover sem foco: borda 1px solid var(--border-strong)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(campo)
    expect(estilo(campo)).toContain('border: 1px solid var(--border-strong)')
    fireEvent.mouseLeave(campo)
    expect(estilo(campo)).toContain('border: var(--border-card)')
  })

  it('foco (mesmo com hover): focus-ring e a borda continua var(--border-card)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />)
    const campo = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(campo).toHaveStyle({ boxShadow: 'var(--focus-ring)' })
    expect(estilo(campo)).toContain('border: var(--border-card)')
    expect(estilo(campo)).not.toContain('var(--border-strong)')
  })

  it('erro prevalece sobre hover e foco: borda 1px solid var(--danger)', () => {
    render(<Input id="nome" label="Seu nome" value="" onChange={vi.fn()} error="Conta pra gente seu nome." />)
    const campo = screen.getByLabelText('Seu nome')
    expect(estilo(campo)).toContain('border: 1px solid var(--danger)')
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(estilo(campo)).toContain('border: 1px solid var(--danger)')
  })

  it('desabilitado: fundo surface-inset, texto muted, not-allowed, sem hover nem foco', () => {
    render(<Input id="cpf" label="CPF" value="123.456.789-09" onChange={vi.fn()} disabled />)
    const campo = screen.getByLabelText('CPF')
    expect(campo).toBeDisabled()
    fireEvent.mouseEnter(campo)
    fireEvent.focus(campo)
    expect(campo).toHaveStyle({
      background: 'var(--surface-inset)',
      color: 'var(--text-muted)',
      cursor: 'not-allowed',
      boxShadow: 'none',
    })
    expect(estilo(campo)).toContain('border: var(--border-card)')
  })

  it('autoComplete="off" vira atributo; sem a prop, o atributo não existe (P-5)', () => {
    render(
      <>
        <Input id="cpf" label="CPF" value="" onChange={vi.fn()} autoComplete="off" />
        <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} />
      </>,
    )
    expect(screen.getByLabelText('CPF')).toHaveAttribute('autocomplete', 'off')
    expect(screen.getByLabelText('Seu nome')).not.toHaveAttribute('autocomplete')
  })

  it('placeholder: com 2 Inputs, 1 única regra .dm-input::placeholder no documento; o campo tem a classe', () => {
    render(
      <>
        <Input id="nome" label="Seu nome" value="" onChange={vi.fn()} placeholder="Como a gente te chama?" />
        <Input id="telefone" label="Telefone (com DDD)" value="" onChange={vi.fn()} />
      </>,
    )
    const regras = [...document.querySelectorAll('style')].filter((s) =>
      (s.textContent ?? '').includes('.dm-input::placeholder'),
    )
    expect(regras).toHaveLength(1)
    expect(regras[0].textContent).toContain('color:var(--text-muted)')
    expect(regras[0].textContent).toContain('opacity:1')
    expect(screen.getByLabelText('Seu nome')).toHaveClass('dm-input')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveClass('dm-input')
  })
})

describe('Input — checkbox', () => {
  it('desmarcado: aria-checked=false, sem marca, 22x22, fundo surface-card, borda border-strong; linha gap 10px', () => {
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={vi.fn()} />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    expect(caixa).toHaveAttribute('aria-checked', 'false')
    expect(caixa.textContent).toBe('') // toHaveTextContent('') casaria qualquer texto (assert vazio)
    expect(caixa).toHaveStyle({ width: '22px', height: '22px', background: 'var(--surface-card)' })
    expect(estilo(caixa)).toContain('border: 1px solid var(--border-strong)')
    expect(estilo(caixa)).toContain('border-radius: var(--radius-sm)')
    expect(caixa.parentElement).toHaveStyle({ display: 'flex', alignItems: 'center', gap: '10px' })
    expect(screen.getByText('Quero CPF na nota')).toHaveStyle({
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      cursor: 'pointer',
      userSelect: 'none',
    })
  })

  it('clicar na caixa e clicar no rótulo chamam onToggle(true)', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Quero CPF na nota' }))
    await userEvent.click(screen.getByText('Quero CPF na nota'))
    expect(onToggle).toHaveBeenNthCalledWith(1, true)
    expect(onToggle).toHaveBeenNthCalledWith(2, true)
  })

  it('marcado: aria-checked=true, ✓, fundo e borda action-primary; clicar chama onToggle(false)', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked onToggle={onToggle} />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    expect(caixa).toHaveAttribute('aria-checked', 'true')
    expect(caixa).toHaveTextContent('✓')
    expect(caixa).toHaveStyle({
      background: 'var(--action-primary)',
      color: 'var(--text-on-primary)',
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      lineHeight: '1',
    })
    expect(estilo(caixa)).toContain('border: 1px solid var(--action-primary)')
    await userEvent.click(caixa)
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('hover: shadow-card só desmarcado; foco: focus-ring', () => {
    const { unmount } = render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={vi.fn()} />)
    const desmarcada = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    fireEvent.mouseEnter(desmarcada)
    expect(desmarcada).toHaveStyle({ boxShadow: 'var(--shadow-card)' })
    expect(estilo(desmarcada)).toContain('border: 1px solid var(--border-strong)')
    fireEvent.focus(desmarcada)
    expect(desmarcada).toHaveStyle({ boxShadow: 'var(--focus-ring)' })
    unmount()

    render(<Input kind="checkbox" label="Quero CPF na nota" checked onToggle={vi.fn()} />)
    const marcada = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    fireEvent.mouseEnter(marcada)
    expect(marcada).toHaveStyle({ boxShadow: 'none' })
  })

  it('desabilitado: não chama onToggle (caixa nem rótulo); fundo inset; rótulo muted', async () => {
    const onToggle = vi.fn()
    render(<Input kind="checkbox" label="Quero CPF na nota" checked={false} onToggle={onToggle} disabled />)
    const caixa = screen.getByRole('checkbox', { name: 'Quero CPF na nota' })
    await userEvent.click(caixa)
    await userEvent.click(screen.getByText('Quero CPF na nota'))
    expect(onToggle).not.toHaveBeenCalled()
    expect(caixa).toHaveStyle({ background: 'var(--surface-inset)', color: 'var(--text-muted)', cursor: 'not-allowed' })
    expect(screen.getByText('Quero CPF na nota')).toHaveStyle({ color: 'var(--text-muted)', cursor: 'not-allowed' })
  })
})
```

- [ ] **Passo 3.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/ui/Input.test.tsx`.
  Esperado: FAIL com `Failed to resolve import "../../../src/components/ui/Input"`.

- [ ] **Passo 3.3: Implementação mínima** em `src/components/ui/Input.tsx` (**caminho compartilhado, autorizado
  literalmente**):

```tsx
import { useState, type CSSProperties } from 'react'

export type InputMode = 'text' | 'numeric' | 'tel'

interface InputTextoProps {
  kind?: 'text'
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  help?: string
  error?: string
  disabled?: boolean
  inputMode?: InputMode
  autoComplete?: string // P-5; repassado ao <input> só quando definido
}

interface InputCheckboxProps {
  kind: 'checkbox'
  label: string
  checked: boolean
  onToggle: (checked: boolean) => void
  disabled?: boolean
}

export type InputProps = InputTextoProps | InputCheckboxProps

// Input.dc.html L19. Estilo inline não alcança pseudo-elemento; o React 19 iça e deduplica
// <style> com href + precedence (uma regra por documento, não por instância).
const REGRA_PLACEHOLDER = '.dm-input::placeholder{color:var(--text-muted);opacity:1}'

const wrapper: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

function InputTexto({
  id,
  label,
  value,
  onChange,
  placeholder,
  help,
  error,
  disabled = false,
  inputMode = 'text',
  autoComplete,
}: InputTextoProps) {
  const [hover, setHover] = useState(false)
  const [foco, setFoco] = useState(false)
  const temErro = Boolean(error)
  const comHover = !disabled && hover
  const comFoco = !disabled && foco
  const mostraAjuda = !temErro && Boolean(help)
  const descricao = temErro ? `${id}-erro` : mostraAjuda ? `${id}-ajuda` : undefined

  const campo: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    background: disabled ? 'var(--surface-inset)' : 'var(--surface-card)',
    border: temErro
      ? '1px solid var(--danger)'
      : comHover && !comFoco
        ? '1px solid var(--border-strong)'
        : 'var(--border-card)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fs-body)',
    lineHeight: 'var(--lh-body)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-body)',
    outline: 'none',
    boxShadow: comFoco ? 'var(--focus-ring)' : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color .15s ease, box-shadow .15s ease, background .15s ease',
  }

  return (
    <div style={wrapper}>
      <style href="dm-input-placeholder" precedence="default">
        {REGRA_PLACEHOLDER}
      </style>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-small)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--text-title)',
          lineHeight: 'var(--lh-body)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        className="dm-input"
        type="text"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={temErro}
        aria-describedby={descricao}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={campo}
      />
      {temErro && (
        <span
          id={`${id}-erro`}
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 'var(--fw-bold)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </span>
      )}
      {mostraAjuda && (
        <span
          id={`${id}-ajuda`}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--text-muted)',
          }}
        >
          {help}
        </span>
      )}
    </div>
  )
}

function InputCheckbox({ label, checked, onToggle, disabled = false }: InputCheckboxProps) {
  const [hover, setHover] = useState(false)
  const [foco, setFoco] = useState(false)
  const comHover = !disabled && hover
  const comFoco = !disabled && foco

  function alternar() {
    if (disabled) return
    onToggle(!checked)
  }

  const caixa: CSSProperties = {
    width: '22px',
    height: '22px',
    flex: '0 0 auto',
    padding: 0,
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: disabled ? 'var(--surface-inset)' : checked ? 'var(--action-primary)' : 'var(--surface-card)',
    border: checked && !disabled ? '1px solid var(--action-primary)' : '1px solid var(--border-strong)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-on-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fs-small)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1,
    boxShadow: comFoco ? 'var(--focus-ring)' : comHover && !checked ? 'var(--shadow-card)' : 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background .15s ease, box-shadow .15s ease, border-color .15s ease',
  }

  return (
    <div style={wrapper}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={alternar}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={caixa}
        >
          {checked ? '✓' : ''}
        </button>
        <span
          onClick={alternar}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body)',
            color: disabled ? 'var(--text-muted)' : 'var(--text-body)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export function Input(props: InputProps) {
  return props.kind === 'checkbox' ? <InputCheckbox {...props} /> : <InputTexto {...props} />
}
```

  Notas:
  - A coluna externa (`wrapper`) envolve também o checkbox, como no mockup (L24 → L35-39).
  - `autoComplete={undefined}` não gera atributo no React. Por isso nome e telefone ficam sem ele.

- [ ] **Passo 3.4: Verde.** Rode `npx vitest run tests/unit/ui` (esperado: PASS, inclusive Button/Card/Badge) e
  `npx tsc -b` (esperado: exit 0).
- [ ] **Passo 3.5: Checkpoint.** Registre `src/components/ui/Input.tsx` e `tests/unit/ui/Input.test.tsx`, os dois
  **compartilhados e autorizados**.

---

### Task 4: Extrair `TotaisPedido`/`LinhaTotal` do `CartPanel` (T4)

**Files:**
- Create: `src/components/pedido/TotaisPedido.tsx`
- Test: `tests/unit/components/pedido/TotaisPedido.test.tsx`
- Modify: `src/components/cardapio/CartPanel.tsx`. O bloco das L96-140 do arquivo atual, o `<div>` de
  Subtotal/Entrega/Total, é trocado por `<TotaisPedido … />`.

**Interfaces:**
- Produces (usado nas Tasks 5, 7 e 9):
  ```ts
  export interface TotaisPedidoProps { subtotalFormatado: string; freteFormatado: string; freteGratis: boolean; totalFormatado: string }
  export function TotaisPedido(props: TotaisPedidoProps): JSX.Element // 1 <div> raiz com 3 filhos
  export function LinhaTotal({ totalFormatado }: { totalFormatado: string }): JSX.Element
  ```

**Restrição da régua F1:** o bloco extraído é **um único `<div>`** com 3 filhos `<div>` (Subtotal, Entrega,
`LinhaTotal`). A régua conta os filhos do card e indexa `:scope > div > div`. O DOM computado não pode mudar.

- [ ] **Passo 4.1: Escrever o teste (vermelho)** em `tests/unit/components/pedido/TotaisPedido.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LinhaTotal, TotaisPedido } from '../../../../src/components/pedido/TotaisPedido'

describe('TotaisPedido', () => {
  it('frete grátis: rótulos, valores e "Grátis" em manjericão-700 bold', () => {
    const { container } = render(
      <TotaisPedido subtotalFormatado="R$ 105,00" freteFormatado="Grátis" freteGratis totalFormatado="R$ 105,00" />,
    )
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 105,00')).toHaveLength(2)
    expect(screen.getByText('Grátis')).toHaveStyle({ color: 'var(--manjericao-700)', fontWeight: 'var(--fw-bold)' })
    const raiz = container.firstElementChild as HTMLElement
    expect(raiz.tagName).toBe('DIV')
    expect(raiz.children).toHaveLength(3)
    expect(raiz).toHaveStyle({ display: 'flex', flexDirection: 'column' })
    expect(raiz.getAttribute('style')).toContain('gap: var(--sp-2)')
  })

  it('frete pago: valor sem estilo extra', () => {
    render(
      <TotaisPedido subtotalFormatado="R$ 90,00" freteFormatado="R$ 12,00" freteGratis={false} totalFormatado="R$ 102,00" />,
    )
    expect(screen.getByText('R$ 12,00').getAttribute('style')).toBeNull()
    expect(screen.getByText('R$ 102,00')).toBeInTheDocument()
  })
})

describe('LinhaTotal', () => {
  it('rótulo caixa alta muted bold; valor display title; borda superior e padding-top', () => {
    render(<LinhaTotal totalFormatado="R$ 57,00" />)
    expect(screen.getByText('Total')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
    })
    const valor = screen.getByText('R$ 57,00')
    expect(valor).toHaveStyle({
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-regular)',
      fontSize: 'var(--fs-title)',
      lineHeight: 'var(--lh-title)',
      color: 'var(--text-title)',
    })
    const linha = valor.parentElement as HTMLElement
    expect(linha.getAttribute('style')).toContain('border-top: var(--border-card)')
    expect(linha.getAttribute('style')).toContain('padding-top: var(--sp-3)')
    expect(linha).toHaveStyle({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })
  })
})
```

- [ ] **Passo 4.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/components/pedido`.
  Esperado: FAIL com `Failed to resolve import "../../../../src/components/pedido/TotaisPedido"`.

- [ ] **Passo 4.3: Implementação mínima.** Crie `src/components/pedido/TotaisPedido.tsx`, movendo **literalmente**
  o markup de `CartPanel.tsx` L96-140:

```tsx
export interface TotaisPedidoProps {
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
}

export function LinhaTotal({ totalFormatado }: { totalFormatado: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingTop: 'var(--sp-3)',
        borderTop: 'var(--border-card)',
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
  )
}

export function TotaisPedido({ subtotalFormatado, freteFormatado, freteGratis, totalFormatado }: TotaisPedidoProps) {
  return (
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
      <LinhaTotal totalFormatado={totalFormatado} />
    </div>
  )
}
```

  Em `src/components/cardapio/CartPanel.tsx`:
  - acrescente `import { TotaisPedido } from '../pedido/TotaisPedido'`;
  - troque o `<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>…</div>` das L96-140
    (de Subtotal até o fecha-div depois do valor do Total) por:

```tsx
          <TotaisPedido
            subtotalFormatado={subtotalFormatado}
            freteFormatado={freteFormatado}
            freteGratis={freteGratis}
            totalFormatado={totalFormatado}
          />
```

- [ ] **Passo 4.4: Verde.** Rode `npx vitest run tests/unit/components/pedido tests/unit/components/cardapio`.
  Esperado: PASS. Os testes do `CartPanel` e do `CardapioPage` são **(guarda)**: já passavam e têm de continuar
  passando sem mudança. Depois rode `npx tsc -b` (esperado: exit 0).
- [ ] **Passo 4.5: Checkpoint.** Registre `src/components/pedido/TotaisPedido.tsx`,
  `tests/unit/components/pedido/TotaisPedido.test.tsx` e `src/components/cardapio/CartPanel.tsx`.

---

### Task 5: Aside do checkout — `ItemResumo` + `ResumoPedido` (T6, parte 1)

**Pendência PL-2 (atacável, decisão do planejador):** a spec põe `itemResumoDe` dentro de `ItemResumo.tsx`, com
`itemResumoDe(item): ItemResumoProps`, mas `ItemResumoProps` inclui `comDivisoria`, que o item não define. Além
disso, o oxlint (`react/only-export-components`, `.oxlintrc.json`) emite *warning* para função não-componente
exportada de um `.tsx`. Isso foi sondado pelo planejador em 2026-10-02.

O plano resolve assim:
- `itemResumoDe` vai para `src/components/checkout/itemResumoDe.ts`, que é formatação pura via domínio e não
  calcula nada;
- a função devolve `ItemResumoDados` (sem `comDivisoria`);
- `ItemResumoProps = ItemResumoDados & { comDivisoria: boolean }`.

Comportamento e DOM iguais aos da spec.

**Files:**
- Create: `src/components/checkout/itemResumoDe.ts`, `src/components/checkout/ItemResumo.tsx`,
  `src/components/checkout/ResumoPedido.tsx`
- Test: `tests/unit/components/checkout/CheckoutPage.test.tsx` (arquivo novo; nesta task só o
  `describe('ResumoPedido')`)

**Interfaces:**
- Consumes: `fatiasPorTamanho` (`cardapio.ts`), `calcularTotalDoItem` e `ItemCarrinho` (`carrinho.ts`),
  `formatarPreco` (`moeda.ts`), `TotaisPedido` (Task 4).
- Produces (usado nas Tasks 6 e 7):
  ```ts
  // itemResumoDe.ts
  export interface ItemResumoDados { key: string; nome: string; tam: Tamanho; fatias: string; qty: number; precoTotalFormatado: string }
  export function itemResumoDe(item: ItemCarrinho): ItemResumoDados
  // ItemResumo.tsx
  export type ItemResumoProps = Omit<ItemResumoDados, 'key'> & { comDivisoria: boolean }
  export function ItemResumo(props: ItemResumoProps): JSX.Element
  // ResumoPedido.tsx
  export interface ResumoPedidoProps { itens: ItemResumoDados[]; subtotalFormatado: string; freteFormatado: string
    freteGratis: boolean; totalFormatado: string; onAlterar: () => void }
  export function ResumoPedido(props: ResumoPedidoProps): JSX.Element
  ```

Estilos: `Checkout.dc.html` L57-86, inventário 19-27.

- [ ] **Passo 5.1: Escrever o teste (vermelho)**, criando `tests/unit/components/checkout/CheckoutPage.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ResumoPedido } from '../../../../src/components/checkout/ResumoPedido'
import { itemResumoDe } from '../../../../src/components/checkout/itemResumoDe'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const margheritaMx2: ItemCarrinho = { ...margheritaM, qty: 2 }

describe('itemResumoDe', () => {
  it('formata via domínio: fatias e total do item', () => {
    expect(itemResumoDe(margheritaM)).toEqual({
      key: 'margherita-M',
      nome: 'Margherita da casa',
      tam: 'M',
      fatias: '6 fatias',
      qty: 1,
      precoTotalFormatado: 'R$ 45,00',
    })
    expect(itemResumoDe(margheritaMx2).precoTotalFormatado).toBe('R$ 90,00')
  })
})

describe('ResumoPedido (aside só leitura)', () => {
  function renderResumo(itens: ItemCarrinho[] = [margheritaM, calabresaG]) {
    const onAlterar = vi.fn()
    render(
      <ResumoPedido
        itens={itens.map(itemResumoDe)}
        subtotalFormatado="R$ 105,00"
        freteFormatado="Grátis"
        freteGratis
        totalFormatado="R$ 105,00"
        onAlterar={onAlterar}
      />,
    )
    return onAlterar
  }

  it('título, itens com "Tamanho X · N fatias", totais com "Grátis"', () => {
    renderResumo()
    expect(screen.getByRole('heading', { level: 2, name: 'Seu pedido' })).toBeInTheDocument()
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Tamanho M · 6 fatias')).toBeInTheDocument()
    expect(screen.getByText('Tamanho G · 8 fatias')).toBeInTheDocument()
    expect(screen.getByText('Grátis')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 105,00')).toHaveLength(2)
  })

  it('qty > 1: detalhe com " · N unidades" e total da linha', () => {
    renderResumo([margheritaMx2])
    expect(screen.getByText('Tamanho M · 6 fatias · 2 unidades')).toBeInTheDocument()
    expect(screen.getByText('R$ 90,00')).toBeInTheDocument()
  })

  it('só leitura: sem stepper, "tirar", resumo de pizzas, aviso de frete nem Finalizar', () => {
    renderResumo()
    expect(screen.queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Diminuir quantidade' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'tirar' })).not.toBeInTheDocument()
    expect(screen.queryByText(/no carrinho/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Faltam|Frete grátis liberado/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument()
  })

  it('linha com divisória: borda inferior var(--border-card), padding-bottom sp-3; coluna gap 2px', () => {
    renderResumo()
    const coluna = screen.getByText('Margherita da casa').parentElement as HTMLElement
    const linha = coluna.parentElement as HTMLElement
    expect(coluna).toHaveStyle({ display: 'flex', flexDirection: 'column', gap: '2px' })
    expect(linha.getAttribute('style')).toContain('border-bottom: var(--border-card)')
    expect(linha.getAttribute('style')).toContain('padding-bottom: var(--sp-3)')
    expect(screen.getByText('Tamanho M · 6 fatias')).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
    })
  })

  it('"Alterar pedido" é botão com cara de link; hover muda cor e sublinha; clique chama onAlterar', async () => {
    const onAlterar = renderResumo()
    const alterar = screen.getByRole('button', { name: 'Alterar pedido' })
    expect(alterar).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--action-primary)',
      textDecoration: 'none',
      lineHeight: 'var(--lh-body)',
    })
    fireEvent.mouseEnter(alterar)
    expect(alterar).toHaveStyle({ color: 'var(--action-primary-hover)', textDecoration: 'underline' })
    await userEvent.click(alterar)
    expect(onAlterar).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Passo 5.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/components/checkout/CheckoutPage.test.tsx`.
  Esperado: FAIL com `Failed to resolve import "../../../../src/components/checkout/ResumoPedido"`.

- [ ] **Passo 5.3: Implementação mínima.**

  `src/components/checkout/itemResumoDe.ts`:

```ts
import { fatiasPorTamanho, type Tamanho } from '../../domain/cardapio'
import { calcularTotalDoItem, type ItemCarrinho } from '../../domain/carrinho'
import { formatarPreco } from '../../domain/moeda'

export interface ItemResumoDados {
  key: string
  nome: string
  tam: Tamanho
  fatias: string
  qty: number
  precoTotalFormatado: string
}

export function itemResumoDe(item: ItemCarrinho): ItemResumoDados {
  return {
    key: item.key,
    nome: item.nome,
    tam: item.tam,
    fatias: fatiasPorTamanho(item.tam),
    qty: item.qty,
    precoTotalFormatado: formatarPreco(calcularTotalDoItem(item)),
  }
}
```

  `src/components/checkout/ItemResumo.tsx` (L65-71 / L108-114):

```tsx
import type { ItemResumoDados } from './itemResumoDe'

export type ItemResumoProps = Omit<ItemResumoDados, 'key'> & { comDivisoria: boolean }

const textoDisplay = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--fw-regular)',
  fontSize: 'var(--fs-body)',
  color: 'var(--text-title)',
} as const

export function ItemResumo({ nome, tam, fatias, qty, precoTotalFormatado, comDivisoria }: ItemResumoProps) {
  const detalhe = `Tamanho ${tam} · ${fatias}${qty > 1 ? ` · ${qty} unidades` : ''}`
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--sp-3)',
        alignItems: 'flex-start',
        ...(comDivisoria ? { paddingBottom: 'var(--sp-3)', borderBottom: 'var(--border-card)' } : {}),
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={textoDisplay}>{nome}</span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{detalhe}</span>
      </div>
      <span style={textoDisplay}>{precoTotalFormatado}</span>
    </div>
  )
}
```

  `src/components/checkout/ResumoPedido.tsx` (L57-86):

```tsx
import { useState } from 'react'
import { Card } from '../ui/Card'
import { TotaisPedido } from '../pedido/TotaisPedido'
import { ItemResumo } from './ItemResumo'
import type { ItemResumoDados } from './itemResumoDe'

export interface ResumoPedidoProps {
  itens: ItemResumoDados[]
  subtotalFormatado: string
  freteFormatado: string
  freteGratis: boolean
  totalFormatado: string
  onAlterar: () => void
}

function BotaoAlterarPedido({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-small)',
        fontWeight: 'var(--fw-bold)',
        lineHeight: 'var(--lh-body)',
        color: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)',
        textDecoration: hover ? 'underline' : 'none',
      }}
    >
      Alterar pedido
    </button>
  )
}

export function ResumoPedido({
  itens,
  subtotalFormatado,
  freteFormatado,
  freteGratis,
  totalFormatado,
  onAlterar,
}: ResumoPedidoProps) {
  return (
    <Card padding="var(--sp-6)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
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
          <BotaoAlterarPedido onClick={onAlterar} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {itens.map(({ key, ...item }) => (
            <ItemResumo key={key} {...item} comDivisoria />
          ))}
        </div>
        <TotaisPedido
          subtotalFormatado={subtotalFormatado}
          freteFormatado={freteFormatado}
          freteGratis={freteGratis}
          totalFormatado={totalFormatado}
        />
      </div>
    </Card>
  )
}
```

- [ ] **Passo 5.4: Verde.** Rode `npx vitest run tests/unit/components/checkout` (esperado: PASS) e `npx tsc -b`
  (esperado: exit 0).
- [ ] **Passo 5.5: Checkpoint.** Registre `src/components/checkout/itemResumoDe.ts`, `ItemResumo.tsx`,
  `ResumoPedido.tsx` e `tests/unit/components/checkout/CheckoutPage.test.tsx`.

---

### Task 6: Formulário + `CheckoutPage` (T6, parte 2; P-3 → A, P-5 → A, P-7 → A)

**Files:**
- Create: `src/components/checkout/FormularioCliente.tsx`, `src/components/checkout/CheckoutPage.tsx`
- Test: `tests/unit/components/checkout/CheckoutPage.test.tsx` (acrescentar os `describe` abaixo)

**Interfaces:**
- Consumes: `Input` (Task 3); `Button`, `Card` (ui, sem mudança); `ResumoPedido`, `itemResumoDe` (Task 5).
  De `cliente.ts`: `DadosCliente`, `ErrosCliente`, `ErroNome`, `ErroTelefone`, `ErroCPF`,
  `formatarTelefone`, `formatarCPF`, `validarDadosCliente` e `temErros`. De `carrinho.ts`:
  `calcularSubtotal`, `calcularFrete`, `calcularTotal`, `ehFreteGratis` e `ItemCarrinho`. De `moeda.ts`:
  `formatarPreco`.
- Produces (usado na Task 9):
  ```ts
  export interface CheckoutPageProps { carrinho: ItemCarrinho[]; onVoltar: () => void; onConfirmar: (dados: DadosCliente) => void }
  export function CheckoutPage(props: CheckoutPageProps): JSX.Element // raiz <main>
  ```

Estilos: `Checkout.dc.html` L33-55, inventário 7-18 e 44-50.

- [ ] **Passo 6.1: Escrever o teste (vermelho).** Em `tests/unit/components/checkout/CheckoutPage.test.tsx`:
  - troque a linha de import do RTL por `import { fireEvent, render, screen, within } from '@testing-library/react'`;
  - troque a do vitest por `import { afterEach, describe, expect, it, vi } from 'vitest'`;
  - acrescente aos imports `import { CheckoutPage } from '../../../../src/components/checkout/CheckoutPage'`;
  - acrescente no fim do arquivo:

```tsx
const TITULO = 'Quase lá — falta só a gente saber quem é você'
const ERRO_NOME = 'Conta pra gente seu nome.'
const ERRO_TEL_VAZIO = 'A gente precisa de um telefone com DDD.'
const ERRO_TEL_INCOMPLETO = 'Esse telefone parece incompleto — confere o DDD?'
const ERRO_CPF = 'Esse CPF não confere. Dá uma olhadinha nos números?'

function renderCheckout(carrinho: ItemCarrinho[] = [margheritaM]) {
  const onVoltar = vi.fn()
  const onConfirmar = vi.fn()
  const user = userEvent.setup()
  render(<CheckoutPage carrinho={carrinho} onVoltar={onVoltar} onConfirmar={onConfirmar} />)
  return { user, onVoltar, onConfirmar }
}

const confirmar = (total = 'R$ 57,00') => screen.getByRole('button', { name: `Confirmar pedido · ${total}` })
const caixaCPF = () => screen.getByRole('checkbox', { name: 'Quero CPF na nota' })

describe('CheckoutPage — estrutura', () => {
  it('main 1200px; voltar; grid com aside de 320px sticky; título literal', () => {
    renderCheckout()
    const main = screen.getByRole('main')
    expect(main).toHaveStyle({ maxWidth: '1200px', boxSizing: 'border-box' })
    expect(main.getAttribute('style')).toContain('padding: var(--sp-6) var(--sp-8) var(--sp-10)')
    expect(screen.getByRole('heading', { level: 1, name: TITULO })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← Voltar ao cardápio' })).toBeInTheDocument()
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveStyle({ position: 'sticky' })
    const grade = aside.parentElement as HTMLElement
    expect(grade).toHaveStyle({ display: 'grid', alignItems: 'start' })
    expect(grade.getAttribute('style')).toContain('grid-template-columns: minmax(0, 1fr) 320px')
    expect(grade.getAttribute('style')).toContain('gap: var(--sp-8)')
  })

  it('campos: nome e telefone visíveis; CPF oculto até marcar; checkbox começa desmarcado', () => {
    renderCheckout()
    expect(screen.getByLabelText('Seu nome')).toHaveAttribute('placeholder', 'Como a gente te chama?')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveAttribute('placeholder', '(11) 98765-4321')
    expect(screen.getByText('A gente só liga se o motoboy se perder.')).toBeInTheDocument()
    expect(caixaCPF()).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()
  })

  it('rótulo do botão com o total: 1 item R$ 57,00; M x2 R$ 102,00; 2 itens R$ 105,00', () => {
    const { unmount } = render(<CheckoutPage carrinho={[margheritaM]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 57,00')).toBeInTheDocument()
    unmount()
    const r2 = render(<CheckoutPage carrinho={[margheritaMx2]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 102,00')).toBeInTheDocument()
    r2.unmount()
    render(<CheckoutPage carrinho={[margheritaM, calabresaG]} onVoltar={vi.fn()} onConfirmar={vi.fn()} />)
    expect(confirmar('R$ 105,00')).toBeInTheDocument()
  })

  it('aside: itens só leitura via ResumoPedido; com qty 2 mostra unidades', () => {
    renderCheckout([margheritaMx2])
    const aside = screen.getByRole('complementary')
    expect(within(aside).getByText('Tamanho M · 6 fatias · 2 unidades')).toBeInTheDocument()
    expect(within(aside).getByText('R$ 12,00')).toBeInTheDocument()
    expect(within(aside).queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument()
    expect(within(aside).queryByRole('button', { name: 'tirar' })).not.toBeInTheDocument()
  })

  it('"← Voltar ao cardápio" e "Alterar pedido" chamam onVoltar', async () => {
    const { user, onVoltar } = renderCheckout()
    await user.click(screen.getByRole('button', { name: '← Voltar ao cardápio' }))
    await user.click(screen.getByRole('button', { name: 'Alterar pedido' }))
    expect(onVoltar).toHaveBeenCalledTimes(2)
  })
})

describe('CheckoutPage — validação e máscaras', () => {
  it('sem erros antes de tentar; confirmar vazio mostra erros de nome e telefone e não confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(confirmar())
    expect(screen.getByText(ERRO_NOME)).toBeInTheDocument()
    expect(screen.getByText(ERRO_TEL_VAZIO)).toBeInTheDocument()
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('depois de tentar, o erro some assim que o campo fica válido (sem novo clique)', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    expect(screen.queryByText(ERRO_NOME)).not.toBeInTheDocument()
    expect(screen.getByText(ERRO_TEL_VAZIO)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '119000')
    expect(screen.getByText(ERRO_TEL_INCOMPLETO)).toBeInTheDocument()
  })

  it('máscaras progressivas: telefone e CPF; erro de CPF depois de tentar', async () => {
    const { user } = renderCheckout()
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveValue('(11) 90000-0000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678900')
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-00')
    expect(screen.queryByText(ERRO_CPF)).not.toBeInTheDocument()
    await user.click(confirmar())
    expect(screen.getByText(ERRO_CPF)).toBeInTheDocument()
  })

  it('campo CPF: inputMode numeric, ajuda literal, autocomplete=off; nome e telefone sem o atributo (P-5)', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    const cpf = screen.getByLabelText('CPF')
    expect(cpf).toHaveAttribute('autocomplete', 'off')
    expect(cpf).toHaveAttribute('inputmode', 'numeric')
    expect(cpf).toHaveAttribute('placeholder', '000.000.000-00')
    expect(screen.getByText('Usado só para emitir a nota fiscal.')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).not.toHaveAttribute('autocomplete')
    expect(screen.getByLabelText('Telefone (com DDD)')).not.toHaveAttribute('autocomplete')
  })

  it('P-3: desmarcar some com o erro e descarta o CPF; remarcar mostra o campo vazio', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '123')
    await user.click(confirmar())
    expect(screen.getByText(ERRO_CPF)).toBeInTheDocument()
    await user.click(caixaCPF())
    expect(screen.queryByText(ERRO_CPF)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()
    await user.click(caixaCPF())
    expect(screen.getByLabelText('CPF')).toHaveValue('')
  })

  it('fluxo válido chama onConfirmar com os valores formatados', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678909')
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onConfirmar).toHaveBeenCalledWith({
      nome: 'Ana Exemplo',
      telefone: '(11) 90000-0000',
      querCPF: true,
      cpf: '123.456.789-09',
    })
  })

  it('FR-1: CPF inválido com tentou, desmarcar e confirmar -> confirma sem CPF', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678900')
    await user.click(confirmar())
    expect(onConfirmar).not.toHaveBeenCalled()
    await user.click(caixaCPF())
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledWith({ nome: 'Ana Exemplo', telefone: '(11) 90000-0000', querCPF: false, cpf: '' })
  })

  it('FR-3: colar CPF com pontuação e mais de 11 dígitos corta e formata', async () => {
    const { user } = renderCheckout()
    await user.click(caixaCPF())
    await user.click(screen.getByLabelText('CPF'))
    await user.paste('123.456.789-091')
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-09')
  })

  it('FR-4: telefone fixo de 10 dígitos é aceito e confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '1100000000')
    expect(screen.getByLabelText('Telefone (com DDD)')).toHaveValue('(11) 0000-0000')
    await user.click(confirmar())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onConfirmar).toHaveBeenCalledWith({ nome: 'Ana Exemplo', telefone: '(11) 0000-0000', querCPF: false, cpf: '' })
  })

  it('FR-5: nome só com espaços mostra o erro e não confirma', async () => {
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), '   ')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(confirmar())
    expect(screen.getByText(ERRO_NOME)).toBeInTheDocument()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('o botão confirmar continua visível e habilitado com erros (prompt L61); wrapper ocupa a linha inteira', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    expect(confirmar()).toBeEnabled()
    const wrapperBotao = confirmar().parentElement as HTMLElement
    expect(wrapperBotao.getAttribute('style')).toContain('grid-column: 1 / -1')
    expect(wrapperBotao.getAttribute('style')).toContain('margin-top: var(--sp-2)')
  })

  it('erro em hover no campo: borda danger (cor e borda conferidas)', async () => {
    const { user } = renderCheckout()
    await user.click(confirmar())
    const nome = screen.getByLabelText('Seu nome')
    fireEvent.mouseEnter(nome)
    expect(nome.getAttribute('style')).toContain('border: 1px solid var(--danger)')
    expect(nome).toHaveStyle({ background: 'var(--surface-card)' })
  })
})

describe('CheckoutPage — LGPD (guarda)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('nenhum argumento de console contém o CPF, com ou sem máscara', async () => {
    const metodos = ['log', 'info', 'warn', 'error', 'debug'] as const
    const espioes = metodos.map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    const { user, onConfirmar } = renderCheckout()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(caixaCPF())
    await user.type(screen.getByLabelText('CPF'), '12345678909')
    await user.click(confirmar())
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    const argumentos = espioes.flatMap((e) => e.mock.calls.flat().map((a) => String(a)))
    for (const a of argumentos) {
      expect(a).not.toContain('12345678909')
      expect(a).not.toContain('123.456.789-09')
    }
  })
})
```

- [ ] **Passo 6.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/components/checkout/CheckoutPage.test.tsx`.
  Esperado: FAIL com `Failed to resolve import "../../../../src/components/checkout/CheckoutPage"`.
  - O arquivo inteiro falha, inclusive os testes da Task 5. Isso é esperado.
  - O teste "LGPD (guarda)" passa logo que o módulo existe, porque a implementação não loga nada. Ele é guarda, não
    vermelho.

- [ ] **Passo 6.3: Implementação mínima.**

  `src/components/checkout/FormularioCliente.tsx` (L39-54; a copy dos erros vem do script, L197-199):

```tsx
import type { DadosCliente, ErroCPF, ErroNome, ErroTelefone, ErrosCliente } from '../../domain/cliente'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

const COPY_ERRO_NOME: Record<ErroNome, string> = { vazio: 'Conta pra gente seu nome.' }
const COPY_ERRO_TELEFONE: Record<ErroTelefone, string> = {
  vazio: 'A gente precisa de um telefone com DDD.',
  incompleto: 'Esse telefone parece incompleto — confere o DDD?',
}
const COPY_ERRO_CPF: Record<ErroCPF, string> = { invalido: 'Esse CPF não confere. Dá uma olhadinha nos números?' }

export interface FormularioClienteProps {
  valores: DadosCliente
  erros: ErrosCliente // já filtrados por `tentou`
  rotuloConfirmar: string
  onNome: (valor: string) => void
  onTelefone: (valor: string) => void
  onQuerCPF: (marcado: boolean) => void
  onCPF: (valor: string) => void
  onConfirmar: () => void
}

export function FormularioCliente({
  valores,
  erros,
  rotuloConfirmar,
  onNome,
  onTelefone,
  onQuerCPF,
  onCPF,
  onConfirmar,
}: FormularioClienteProps) {
  return (
    <Card padding="var(--sp-8)">
      <h1
        style={{
          margin: '0 0 var(--sp-6)',
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 'var(--fs-title)',
          lineHeight: 'var(--lh-title)',
          color: 'var(--text-title)',
          textWrap: 'pretty',
        }}
      >
        Quase lá — falta só a gente saber quem é você
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'var(--sp-5) var(--sp-6)',
          alignItems: 'start',
        }}
      >
        <Input
          id="nome"
          label="Seu nome"
          placeholder="Como a gente te chama?"
          value={valores.nome}
          onChange={onNome}
          error={erros.nome ? COPY_ERRO_NOME[erros.nome] : undefined}
        />
        <Input
          id="telefone"
          label="Telefone (com DDD)"
          placeholder="(11) 98765-4321"
          inputMode="tel"
          value={valores.telefone}
          onChange={onTelefone}
          error={erros.telefone ? COPY_ERRO_TELEFONE[erros.telefone] : undefined}
          help="A gente só liga se o motoboy se perder."
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <Input kind="checkbox" label="Quero CPF na nota" checked={valores.querCPF} onToggle={onQuerCPF} />
        </div>
        {valores.querCPF && (
          <Input
            id="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            value={valores.cpf}
            onChange={onCPF}
            error={erros.cpf ? COPY_ERRO_CPF[erros.cpf] : undefined}
            help="Usado só para emitir a nota fiscal."
          />
        )}
        <div style={{ gridColumn: '1 / -1', marginTop: 'var(--sp-2)' }}>
          <Button variant="primary" size="md" fullWidth onClick={onConfirmar}>
            {rotuloConfirmar}
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

  `src/components/checkout/CheckoutPage.tsx` (L33-38, L56-58; estado conforme o script L211-224):

```tsx
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
```

- [ ] **Passo 6.4: Verde.** Rode `npx vitest run tests/unit/components/checkout` (esperado: PASS, inclusive os testes
  da Task 5) e `npx tsc -b` (esperado: exit 0).
- [ ] **Passo 6.5: Checkpoint.** Registre `src/components/checkout/FormularioCliente.tsx`, `CheckoutPage.tsx` e
  `tests/unit/components/checkout/CheckoutPage.test.tsx`.

---

### Task 7: Tela "Pedido confirmado" (T7, componente; P-1 → A, P-2 → A)

**Pré-condição PL-1 (bloqueante só para o passo 7.3):** o `gap: '2px'` da coluna "Pedido #N" / prazo
(inventário 56, `Checkout.dc.html` L101) não está literalmente na lista P-4. Ela diz "gap `2px` das linhas de
item". Não existe token de 2px (`--sp-1` = 4px). O plano prescreve `'2px'`, o literal do mockup, como a mesma
classe de valor da P-4. **Antes do passo 7.3, confira na spec se a sessão principal registrou a extensão da P-4 para
o inventário 56.** Se não registrou, PARE e reporte. Não troque por token nem tire o gap por conta própria.

**Files:**
- Create: `src/components/checkout/PedidoConfirmado.tsx`
- Test: `tests/unit/components/checkout/PedidoConfirmado.test.tsx`

**Interfaces:**
- Consumes: `ResumoConfirmacao` (Task 2), `ItemResumo` e `itemResumoDe` (Task 5), `LinhaTotal` (Task 4),
  `Badge`, `Button` e `Card` (ui, sem mudança), `formatarPreco`.
- Produces (usado na Task 9):
  ```ts
  export interface PedidoConfirmadoProps { confirmacao: ResumoConfirmacao; onInicio: () => void }
  export function PedidoConfirmado(props: PedidoConfirmadoProps): JSX.Element // raiz <main>
  ```

Estilos: `Checkout.dc.html` L93-128, inventário 51-63.

- [ ] **Passo 7.1: Escrever o teste (vermelho)** em `tests/unit/components/checkout/PedidoConfirmado.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PedidoConfirmado } from '../../../../src/components/checkout/PedidoConfirmado'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'
import type { ResumoConfirmacao } from '../../../../src/domain/pedido'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }
const calabresaG: ItemCarrinho = { key: 'calabresa-G', nome: 'Calabresa da Dona', tam: 'G', preco: 60, qty: 1 }
const comCPF: ResumoConfirmacao = { numero: 1234, itens: [margheritaM, calabresaG], total: 105, cpfMascarado: '***.456.789-**' }

describe('PedidoConfirmado', () => {
  it('badge, título, número, prazo, itens e total', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    expect(screen.getByText('Pedido confirmado')).toHaveStyle({ background: 'var(--accent-success-bg)' })
    expect(screen.getByRole('heading', { level: 1, name: 'Sua pizza já vai pro forno!' })).toBeInTheDocument()
    expect(screen.getByText('Pedido #1234')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-title)',
    })
    expect(screen.getByText('Chega quentinha em uns 40 minutos.')).toHaveStyle({
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-body)',
    })
    expect(screen.getByText('Margherita da casa')).toBeInTheDocument()
    expect(screen.getByText('Tamanho G · 8 fatias')).toBeInTheDocument()
    expect(screen.getByText('R$ 60,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 105,00')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('o número vem da confirmação, não do literal do mockup', () => {
    render(<PedidoConfirmado confirmacao={{ ...comCPF, numero: 1235 }} onInicio={vi.fn()} />)
    expect(screen.getByText('Pedido #1235')).toBeInTheDocument()
    expect(screen.queryByText('Pedido #1234')).not.toBeInTheDocument()
  })

  it('com cpfMascarado: "CPF na nota: ***.456.789-**" (guarda: nunca o completo)', () => {
    const { container } = render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    expect(screen.getByText('CPF na nota: ***.456.789-**')).toHaveStyle({
      fontSize: 'var(--fs-small)',
      color: 'var(--text-muted)',
    })
    expect(container.textContent).not.toContain('123.456.789-09')
  })

  it('sem CPF: não há "CPF na nota"', () => {
    render(<PedidoConfirmado confirmacao={{ ...comCPF, cpfMascarado: null }} onInicio={vi.fn()} />)
    expect(screen.queryByText(/CPF na nota/)).not.toBeInTheDocument()
  })

  it('itens sem divisória; bloco de itens com borda superior e padding-top sp-4', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    const linha = (screen.getByText('Margherita da casa').parentElement as HTMLElement).parentElement as HTMLElement
    expect(linha.getAttribute('style')).not.toContain('border-bottom')
    expect(linha.getAttribute('style')).not.toContain('padding-bottom')
    const bloco = linha.parentElement as HTMLElement
    expect(bloco.getAttribute('style')).toContain('border-top: var(--border-card)')
    expect(bloco.getAttribute('style')).toContain('padding-top: var(--sp-4)')
  })

  it('layout: main 1200px centralizado; conteúdo max 520px', () => {
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={vi.fn()} />)
    const main = screen.getByRole('main')
    expect(main).toHaveStyle({ maxWidth: '1200px', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' })
    expect(main.getAttribute('style')).toContain('padding: var(--sp-8)')
    expect(main.firstElementChild).toHaveStyle({ width: '100%', maxWidth: '520px' })
  })

  it('"Voltar para o início" chama onInicio', async () => {
    const onInicio = vi.fn()
    render(<PedidoConfirmado confirmacao={comCPF} onInicio={onInicio} />)
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    expect(onInicio).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Passo 7.2: Confirmar o vermelho.** Rode `npx vitest run tests/unit/components/checkout/PedidoConfirmado.test.tsx`.
  Esperado: FAIL com `Failed to resolve import "../../../../src/components/checkout/PedidoConfirmado"`.

- [ ] **Passo 7.3: Implementação mínima** em `src/components/checkout/PedidoConfirmado.tsx`. Antes, confira a
  pré-condição PL-1.

```tsx
import type { ResumoConfirmacao } from '../../domain/pedido'
import { formatarPreco } from '../../domain/moeda'
import { LinhaTotal } from '../pedido/TotaisPedido'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ItemResumo } from './ItemResumo'
import { itemResumoDe } from './itemResumoDe'

export interface PedidoConfirmadoProps {
  confirmacao: ResumoConfirmacao
  onInicio: () => void
}

export function PedidoConfirmado({ confirmacao, onInicio }: PedidoConfirmadoProps) {
  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--sp-8)',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <Card padding="var(--sp-8)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
              <Badge tone="success">Pedido confirmado</Badge>
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--fw-regular)',
                  fontSize: 'var(--fs-title)',
                  lineHeight: 'var(--lh-title)',
                  color: 'var(--text-title)',
                }}
              >
                Sua pizza já vai pro forno!
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' /* PL-1 */ }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--fs-small)',
                    fontWeight: 'var(--fw-bold)',
                    color: 'var(--text-title)',
                  }}
                >
                  {`Pedido #${confirmacao.numero}`}
                </span>
                <span style={{ fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', color: 'var(--text-body)' }}>
                  Chega quentinha em uns 40 minutos.
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                paddingTop: 'var(--sp-4)',
                borderTop: 'var(--border-card)',
              }}
            >
              {confirmacao.itens.map(itemResumoDe).map(({ key, ...item }) => (
                <ItemResumo key={key} {...item} comDivisoria={false} />
              ))}
              <LinhaTotal totalFormatado={formatarPreco(confirmacao.total)} />
              {confirmacao.cpfMascarado && (
                <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
                  {`CPF na nota: ${confirmacao.cpfMascarado}`}
                </span>
              )}
            </div>
            <Button variant="primary" size="md" fullWidth onClick={onInicio}>
              Voltar para o início
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
```

  Nota: `Pedido #${numero}` e `CPF na nota: …` vão em template string única, para virar **um** nó de texto e o
  `getByText` exato casar.

- [ ] **Passo 7.4: Verde.** Rode `npx vitest run tests/unit/components/checkout` (esperado: PASS) e `npx tsc -b`
  (esperado: exit 0).
- [ ] **Passo 7.5: Checkpoint.** Registre `src/components/checkout/PedidoConfirmado.tsx` e
  `tests/unit/components/checkout/PedidoConfirmado.test.tsx`.

---

### Task 8: E2E do fluxo + guardas de LGPD (T8) — escrito ANTES da ligação

**Files:**
- Create: `tests/e2e/checkout.spec.ts`. `carrinho.spec.ts` e `navegacao.spec.ts` não mudam.

**Interfaces:** consome a UI das Tasks 3-7 e a ligação da Task 9 (ainda inexistente, daí o vermelho).

- [ ] **Passo 8.1: Escrever o E2E (vermelho)** em `tests/e2e/checkout.spec.ts`:

```ts
import { expect, type Page, test } from '@playwright/test'

// mesma regex da régua F1 (cardapio.paridade.mjs L399): CPF com e sem máscara (casa também telefone de 11 dígitos)
const REGEX_CPF = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/
const TITULO_CHECKOUT = 'Quase lá — falta só a gente saber quem é você'
const ERRO_CPF = 'Esse CPF não confere. Dá uma olhadinha nos números?'

function coletarMensagens(page: Page): string[] {
  const mensagens: string[] = []
  page.on('console', (m) => mensagens.push(m.text()))
  page.on('pageerror', (e) => mensagens.push(String(e)))
  return mensagens
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

async function irAoCardapio(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver o cardápio' }).click()
  await expect(page.getByRole('heading', { name: 'Nossas pizzas' })).toBeVisible()
}

// Margherita M + Calabresa G (= EXEMPLO do mockup): subtotal R$ 105,00, frete grátis
async function irAoCheckoutComDoisItens(page: Page) {
  await irAoCardapio(page)
  await adicionar(page, 'Margherita da casa')
  await page.getByRole('button', { name: /^G/ }).nth(1).click() // Calabresa (2ª pizza) -> G
  await adicionar(page, 'Calabresa da Dona')
  await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()
  await page.getByRole('button', { name: 'Finalizar pedido' }).click()
  await expect(page.getByRole('heading', { name: TITULO_CHECKOUT })).toBeVisible()
}

async function preencherNomeETelefone(page: Page) {
  await page.getByLabel('Seu nome').fill('Ana Exemplo')
  await page.getByLabel('Telefone (com DDD)').pressSequentially('11900000000')
  await expect(page.getByLabel('Telefone (com DDD)')).toHaveValue('(11) 90000-0000')
}

test.describe('Checkout — Finalizar pedido com CPF na nota', () => {
  test('com CPF: erros, máscaras, confirmação mascarada e guardas de LGPD', async ({ page }) => {
    const mensagens = coletarMensagens(page)
    await irAoCheckoutComDoisItens(page)

    const aside = page.getByRole('complementary')
    await expect(aside.getByText('Margherita da casa')).toBeVisible()
    await expect(aside.getByText('Calabresa da Dona')).toBeVisible()
    await expect(aside.getByText('Grátis', { exact: true })).toBeVisible()
    await expect(aside.getByText('R$ 105,00', { exact: true })).toHaveCount(2) // Subtotal e Total

    const confirmar = page.getByRole('button', { name: 'Confirmar pedido · R$ 105,00' })
    await confirmar.click()
    await expect(page.getByText('Conta pra gente seu nome.')).toBeVisible()
    await expect(page.getByText('A gente precisa de um telefone com DDD.')).toBeVisible()

    await preencherNomeETelefone(page)
    await page.getByRole('checkbox', { name: 'Quero CPF na nota' }).click()
    const cpf = page.getByLabel('CPF', { exact: true })
    await cpf.pressSequentially('12345678900')
    await expect(cpf).toHaveValue('123.456.789-00')
    await expect(page.getByText(ERRO_CPF)).toBeVisible()
    await cpf.fill('')
    await cpf.pressSequentially('12345678909')
    await expect(page.getByText(ERRO_CPF)).toHaveCount(0)

    await confirmar.click()
    await expect(page.getByText('Sua pizza já vai pro forno!')).toBeVisible()
    await expect(page.getByText('Pedido #1234', { exact: true })).toBeVisible()
    await expect(page.getByText('CPF na nota: ***.456.789-**', { exact: true })).toBeVisible()

    // LGPD
    expect(mensagens.filter((m) => REGEX_CPF.test(m))).toEqual([])
    const url = new URL(page.url())
    expect(url.pathname).toBe('/')
    expect(url.search).toBe('')
    expect(url.hash).toBe('')
    expect(page.url()).not.toContain('12345678909')
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
    const html = await page.content()
    expect(html).not.toMatch(REGEX_CPF)
    expect(html).not.toContain('Ana Exemplo')
    expect(html).not.toContain('90000-0000')

    await page.getByRole('button', { name: 'Voltar para o início' }).click() // P-2 -> A
    await expect(page.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeVisible()
  })

  test('sem CPF: a confirmação não tem "CPF na nota"', async ({ page }) => {
    await irAoCheckoutComDoisItens(page)
    await preencherNomeETelefone(page)
    await page.getByRole('button', { name: 'Confirmar pedido · R$ 105,00' }).click()
    await expect(page.getByText('Pedido #1234', { exact: true })).toBeVisible()
    await expect(page.getByText(/CPF na nota/)).toHaveCount(0)
  })

  test('"← Voltar ao cardápio" e "Alterar pedido" voltam ao Cardápio com o carrinho', async ({ page }) => {
    await irAoCheckoutComDoisItens(page)
    await page.getByRole('button', { name: '← Voltar ao cardápio' }).click()
    await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()

    await page.getByRole('button', { name: 'Finalizar pedido' }).click()
    await expect(page.getByRole('heading', { name: TITULO_CHECKOUT })).toBeVisible()
    await page.getByRole('button', { name: 'Alterar pedido' }).click()
    await expect(page.getByRole('complementary').getByText('2 pizzas no carrinho')).toBeVisible()
  })

  test('carrinho vazio: não há "Finalizar pedido"', async ({ page }) => {
    await irAoCardapio(page)
    await expect(page.getByRole('button', { name: 'Finalizar pedido' })).toHaveCount(0)
  })
})
```

- [ ] **Passo 8.2: Confirmar o vermelho.** Rode `npx playwright test tests/e2e/checkout.spec.ts`.
  - Esperado: **3 FAIL e 1 PASS.**
  - Os testes 1-3 falham por timeout em `getByRole('button', { name: 'Finalizar pedido' })`: o botão ainda não
    existe.
  - O teste 4 ("carrinho vazio") é **(guarda)** e passa já: hoje não existe o botão em nenhum estado.
  - Se a porta 3100 estiver ocupada por outro projeto, o Vite falha alto (`strictPort`). Pare e reporte; não troque
    a porta.
- [ ] **Passo 8.3: Checkpoint.** Registre `tests/e2e/checkout.spec.ts`. O verde vem no passo 9.6.

---

### Task 9: Botão "Finalizar pedido" + ligação no `App` (T5 + T7 `App`; P-1, P-2 e P-6 → A)

**Files:**
- Modify: `src/components/cardapio/CartPanel.tsx`, para a prop `onFinalizar`, o botão e a frase (Cardapio L119-122,
  inventário 1-4).
- Modify: `src/components/cardapio/CardapioPage.tsx`, que perde o `useState` e passa a receber as props.
- Modify: `src/App.tsx`, com as telas, o carrinho, `ultimoNumeroPedido` e `confirmacao`.
- Test (modify): `tests/unit/components/cardapio/CartPanel.test.tsx`,
  `tests/unit/components/cardapio/CardapioPage.test.tsx`, `tests/unit/App.test.tsx`.

**Interfaces:**
- Consumes: `CheckoutPage` (Task 6), `PedidoConfirmado` (Task 7), `proximoNumeroPedido`, `montarPedido`,
  `resumirConfirmacao` e `ResumoConfirmacao` (Task 2), `DadosCliente` (Task 1).
- Produces:
  ```ts
  // CartPanelProps ganha: onFinalizar: () => void (obrigatória)
  export interface CardapioPageProps {
    carrinho: ItemCarrinho[]
    onCarrinhoChange: (atualizar: (atual: ItemCarrinho[]) => ItemCarrinho[]) => void
    onFinalizar: () => void
  }
  ```

**Restrição da régua F1:** a frase é um `<span>`, e não um `<div>`, para não deslocar o índice
`:scope > div > div` da régua. O card do aside com itens passa a ter **6 filhos**: cabeçalho, itens, somas,
aviso, botão e frase.

- [ ] **Passo 9.1: `CartPanel.test.tsx` (vermelho).**
  - Acrescente `import userEvent from '@testing-library/user-event'`.
  - Em `renderPanel`, acrescente `onFinalizar: vi.fn(),` ao objeto `props`, depois de `onRemover: vi.fn(),`.
  - **Apague** o teste `'(guarda) não mostra "Finalizar pedido" nem a frase de entrega (adiados para a feature 2)'`
    (L104-108) e ponha no lugar:

```tsx
  it('com itens: "Finalizar pedido" depois do aviso e a frase de entrega depois do botão; clique chama onFinalizar', async () => {
    const props = renderPanel()
    const aviso = screen.getByText('Faltam R$ 55,00 para frete grátis')
    const botao = screen.getByRole('button', { name: 'Finalizar pedido' })
    const frase = screen.getByText('Sai do forno e chega quentinha em uns 40 minutos.')
    expect(aviso.compareDocumentPosition(botao) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(botao.compareDocumentPosition(frase) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(botao).toHaveStyle({ width: '100%', background: 'var(--action-primary)' })
    expect(frase.tagName).toBe('SPAN')
    expect(frase).toHaveStyle({
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-muted)',
      textAlign: 'center',
    })
    await userEvent.click(botao)
    expect(props.onFinalizar).toHaveBeenCalledTimes(1)
  })

  it('com itens, o card tem 6 blocos (cabeçalho, itens, somas, aviso, botão, frase)', () => {
    renderPanel()
    const card = (screen.getByRole('heading', { name: 'Seu pedido' }).parentElement as HTMLElement).parentElement as HTMLElement
    expect(card.children).toHaveLength(6)
  })

  it('vazio: sem "Finalizar pedido" e sem a frase', () => {
    renderPanel(vazio)
    expect(screen.queryByRole('button', { name: 'Finalizar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Sai do forno/)).not.toBeInTheDocument()
  })
```

- [ ] **Passo 9.2: `CardapioPage.test.tsx` (vermelho).**
  - Troque os imports do topo por:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CardapioPage } from '../../../../src/components/cardapio/CardapioPage'
import type { ItemCarrinho } from '../../../../src/domain/carrinho'

const margheritaM: ItemCarrinho = { key: 'margherita-M', nome: 'Margherita da casa', tam: 'M', preco: 45, qty: 1 }

// o carrinho agora mora no App (P-6); o teste faz o papel do App
function CardapioComEstado({ inicial = [], onFinalizar = () => {} }: { inicial?: ItemCarrinho[]; onFinalizar?: () => void }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>(inicial)
  return <CardapioPage carrinho={carrinho} onCarrinhoChange={setCarrinho} onFinalizar={onFinalizar} />
}
```

  - Troque **todas** as ocorrências de `render(<CardapioPage />)` por `render(<CardapioComEstado />)`. São 9.
    Os asserts não mudam.
  - Acrescente no fim do arquivo:

```tsx
describe('CardapioPage — carrinho por props (P-6)', () => {
  it('mostra o carrinho recebido por prop', () => {
    render(<CardapioComEstado inicial={[margheritaM]} />)
    expect(within(screen.getByRole('complementary')).getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('adicionar chama onCarrinhoChange com uma função de atualização (o estado não é local)', async () => {
    const user = userEvent.setup()
    const onCarrinhoChange = vi.fn()
    render(<CardapioPage carrinho={[]} onCarrinhoChange={onCarrinhoChange} onFinalizar={vi.fn()} />)
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M
    expect(onCarrinhoChange).toHaveBeenCalledTimes(1)
    const atualizar = onCarrinhoChange.mock.calls[0][0] as (atual: ItemCarrinho[]) => ItemCarrinho[]
    expect(atualizar([])).toEqual([margheritaM])
    expect(within(screen.getByRole('complementary')).getByText('Nenhuma pizza ainda')).toBeInTheDocument()
  })

  it('"Finalizar pedido" chama onFinalizar', async () => {
    const user = userEvent.setup()
    const onFinalizar = vi.fn()
    render(<CardapioComEstado inicial={[margheritaM]} onFinalizar={onFinalizar} />)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    expect(onFinalizar).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Passo 9.3: `App.test.tsx` (vermelho).** Acrescente dentro do `describe('App', …)`, depois do último `it`:

```tsx
  async function irAoCardapioEAdicionarMargherita(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    await user.click(screen.getAllByRole('button', { name: /Adicionar/ })[0]) // Margherita M = R$ 45
  }

  async function finalizarEConfirmar(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido · R$ 57,00' }))
  }

  it('fluxo completo: Cardápio -> checkout -> "Pedido #1234", com o header e sem dados pessoais na tela', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    expect(screen.getByRole('heading', { name: 'Quase lá — falta só a gente saber quem é você' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Nossas pizzas' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Seu nome'), 'Ana Exemplo')
    await user.type(screen.getByLabelText('Telefone (com DDD)'), '11900000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido · R$ 57,00' }))
    expect(screen.getByRole('heading', { name: 'Sua pizza já vai pro forno!' })).toBeInTheDocument()
    expect(screen.getByText('Pedido #1234')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pizzaria Dona Massa' })).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Ana Exemplo')
    expect(document.body.textContent).not.toContain('90000-0000')
  })

  it('"Voltar para o início" vai para a Home (P-2); o carrinho foi esvaziado ao confirmar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    await user.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('Nenhuma pizza ainda')).toBeInTheDocument()
  })

  it('2º pedido na mesma sessão é "Pedido #1235" (P-1)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    await user.click(screen.getByRole('button', { name: 'Voltar para o início' }))
    await irAoCardapioEAdicionarMargherita(user)
    await finalizarEConfirmar(user)
    expect(screen.getByText('Pedido #1235')).toBeInTheDocument()
  })

  it('o carrinho sobrevive à ida e volta Home <-> Cardápio (P-6)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('"← Voltar ao cardápio" preserva o carrinho', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.click(screen.getByRole('button', { name: '← Voltar ao cardápio' }))
    expect(screen.getByRole('heading', { name: 'Nossas pizzas' })).toBeInTheDocument()
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })

  it('FR-2: wordmark no checkout -> Home -> Cardápio preserva o carrinho (P-6)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await irAoCardapioEAdicionarMargherita(user)
    await user.click(screen.getByRole('button', { name: 'Finalizar pedido' }))
    await user.click(screen.getByRole('button', { name: 'Pizzaria Dona Massa' }))
    expect(screen.getByRole('heading', { name: 'Pizza artesanal, feita como em casa' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver o cardápio' }))
    expect(screen.getByText('1 pizza no carrinho')).toBeInTheDocument()
  })
```

- [ ] **Passo 9.4: Confirmar o vermelho.** Rode
  `npx vitest run tests/unit/components/cardapio tests/unit/App.test.tsx`. Esperado:
  - **CartPanel:** FAIL no teste do botão (`Unable to find an accessible element with the role "button" and name
    "Finalizar pedido"`) e no de 6 blocos (`expected 4 to have length 6`). O teste "vazio" passa: é (guarda).
  - **CardapioPage:** FAIL em "mostra o carrinho recebido por prop" (o texto achado é "Nenhuma pizza ainda"), em
    "adicionar chama onCarrinhoChange" (`expected 0 calls`) e em "Finalizar pedido chama onFinalizar" (botão
    inexistente). Os 9 testes antigos passam: são (guarda).
  - **App:** FAIL nos 6 testes novos, por falta do botão "Finalizar pedido" ou de "1 pizza no carrinho" (o carrinho
    se perde ao desmontar). Os 3 antigos passam.
  - `npx tsc -b` também falha nesta altura: `onFinalizar`, `carrinho` e `onCarrinhoChange` não existem nas props.
    É esperado.

- [ ] **Passo 9.5: Implementação mínima.**

  `src/components/cardapio/CartPanel.tsx`:
  - acrescente `import { Button } from '../ui/Button'`;
  - em `CartPanelProps`, acrescente `onFinalizar: () => void` depois de `onRemover`;
  - na desestruturação, acrescente `onFinalizar`;
  - dentro do fragmento `!carrinhoVazio`, logo depois do `<div>` do aviso de frete, antes do `</>`, insira:

```tsx
          <Button variant="primary" size="md" fullWidth onClick={onFinalizar}>
            Finalizar pedido
          </Button>
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Sai do forno e chega quentinha em uns 40 minutos.
          </span>
```

  `src/components/cardapio/CardapioPage.tsx`:
  - remova `import { useState } from 'react'`;
  - troque `export function CardapioPage() {` e a linha do `useState` (L20-21) por:

```tsx
export interface CardapioPageProps {
  carrinho: ItemCarrinho[]
  onCarrinhoChange: (atualizar: (atual: ItemCarrinho[]) => ItemCarrinho[]) => void
  onFinalizar: () => void
}

export function CardapioPage({ carrinho, onCarrinhoChange, onFinalizar }: CardapioPageProps) {
```

  - nos quatro handlers, troque `setCarrinho(` por `onCarrinhoChange(`. O corpo `(atual) => …` não muda;
  - no `<CartPanel … />`, acrescente `onFinalizar={onFinalizar}` depois de `onRemover={handleRemover}`.

  `src/App.tsx` (arquivo inteiro):

```tsx
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
```

  O `<main>` do cardápio fica como está (L24 atual). `CheckoutPage` e `PedidoConfirmado` trazem o próprio `<main>`.

- [ ] **Passo 9.6: Verde.**
  1. `npx vitest run tests/unit/components/cardapio tests/unit/App.test.tsx`. Esperado: PASS.
  2. `npm test`. Esperado: PASS, **246 testes em 26 arquivos**. É a contagem medida pelo revisor de plano com o
     plano aplicado; a base tinha 117 testes em 20 arquivos. Se der outro número, explique a diferença no relatório.
  3. `npx tsc -b`. Esperado: exit 0.
  4. `npx playwright test tests/e2e/checkout.spec.ts`. Esperado: **4 passed** (o vermelho da Task 8 fechou).
- [ ] **Passo 9.7: Checkpoint.** Registre `src/components/cardapio/CartPanel.tsx`, `CardapioPage.tsx`,
  `src/App.tsx`, `tests/unit/components/cardapio/CartPanel.test.tsx`, `CardapioPage.test.tsx` e
  `tests/unit/App.test.tsx`.

---

### Task 10: Artefatos de continuidade (T9, M-4) — texto literal da spec

**Files (doc pura, nenhum é caminho compartilhado):** `design/design-system.md`, `docs/spec-home.md`,
`docs/spec-cardapio.md`, `AI_HANDOFF.md`. **`docs/constitution.md` NÃO muda** (fica com a sessão principal).

Antes de editar, confira que cada trecho "de" existe **exatamente** no arquivo. O planejador conferiu as âncoras
em 2026-10-02. Se algum não existir, PARE e reporte, sem adaptar.

- [ ] **Passo 10.1: `design/design-system.md`.**
  1. Na L41, troque `o botão "Finalizar pedido" fica para a feature 2.` por
     `o botão "Finalizar pedido" leva ao checkout (feature 2, spec docs/superpowers/specs/2026-10-02-checkout-cpf-design.md).`
  2. Na L58, troque `` `App.tsx` guarda `useState<'home' | 'cardapio'>('home')`; `` por
     `` `App.tsx` guarda `useState<'home' | 'cardapio' | 'checkout' | 'confirmacao'>('home')` e o carrinho (memória); ``.
  3. Imediatamente antes da linha `## Fora do escopo (cardápio)` (L47), insira o bloco abaixo seguido de uma linha
     em branco:
     ```
     ## Tela de Checkout ("Finalizar pedido", 2026-10-02)

     Vem de `Checkout.dc.html` e `Input.dc.html` do projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79`. Spec:
     `docs/superpowers/specs/2026-10-02-checkout-cpf-design.md`. Componentes em `src/components/checkout/`
     (`CheckoutPage`, `FormularioCliente`, `ResumoPedido`, `ItemResumo`, `PedidoConfirmado`) e
     `src/components/pedido/TotaisPedido.tsx` (compartilhado com o Cardápio), sobre
     `src/domain/{cliente,pedido}.ts`. Reusa o `CardapioHeader`. Nada persiste; o CPF só aparece
     mascarado depois de digitado.
     ```
  4. Na seção `## Componentes base (src/components/ui)` (L121), acrescente depois do item `**`Badge`**` o item
     `` - **`Input`** — campo de formulário (`kind` `text` | `checkbox`): rótulo → campo → ajuda ou erro; estados padrão, hover, foco, erro, desabilitado. Origem `Input.dc.html` (02dc2137). ``
     Depois troque `Inventário fechado pelo briefing de origem (Button, Card, Badge) — sem adições locais.` (L131) por
     `Inventário: Button, Card, Badge (briefing de origem) + Input (2026-10-02, Input.dc.html).`
- [ ] **Passo 10.2: `docs/spec-home.md`.** No fim do item que começa na L13 (`1. **Navegação:** …`). Ele ocupa
  as L13-L15 e termina na L15, em `` `onClick` que troca esse estado.`` (a L14 acaba em "…vira"). Ali, acrescente
  ` (estendido em 2026-10-02 com 'checkout' | 'confirmacao'; ver docs/superpowers/specs/2026-10-02-checkout-cpf-design.md)`.
- [ ] **Passo 10.3: `docs/spec-cardapio.md`.** No fim do item `` - `CardapioPage.tsx` — … `` (começa na L128 e termina
  na L130, em `…repassa os valores prontos para os componentes.`), acrescente
  ` (superado em 2026-10-02: o carrinho mora no App.tsx e sobrevive à ida e volta Home ↔ Cardápio; o CardapioPage recebe carrinho/onCarrinhoChange/onFinalizar — docs/superpowers/specs/2026-10-02-checkout-cpf-design.md, P-6)`.
- [ ] **Passo 10.4: `AI_HANDOFF.md`.**
  - Na L7, troque `(Home + Cardápio com carrinho/frete)` por `(Home + Cardápio com carrinho/frete + Checkout com CPF na nota)`.
  - Na L23, troque ``(`cardapio.ts`, `carrinho.ts`, `moeda.ts`)`` por ``(`cardapio.ts`, `carrinho.ts`, `moeda.ts`, `cliente.ts`, `pedido.ts`)``.
  - Na L24, troque `(Button, Card, Badge)` por `(Button, Card, Badge, Input)`.
  - Na L25, troque ```src/components/home/`, `src/components/cardapio/` — telas;`` por
    ```src/components/home/`, `src/components/cardapio/`, `src/components/checkout/` (+ `src/components/pedido/`, compartilhado) — telas;``.
- [ ] **Passo 10.5: Checkpoint.** Doc pura: não dispara teste. Registre os 4 arquivos.

---

### Task 11: Verificação antes de entregar (dev)

- [ ] **Passo 11.1: Suíte e tipos.**
  - Rode `npm test`, `npx tsc -b` e `npm run lint`.
  - Esperado: `npm test` todo verde; tsc com exit 0; oxlint com 0 erros e nenhum *warning* novo além do
    preexistente `vite.config.ts:1:1 triple-slash-reference`.
  - Cole as três saídas no relatório.
- [ ] **Passo 11.2: E2E afetado.** Rode `npx playwright test tests/e2e/checkout.spec.ts` (esperado: 4 passed). O E2E
  completo e o gate ficam com a sessão principal.
- [ ] **Passo 11.3: Valores crus (checklist item 5).** Use aspas simples, como está: no Git Bash, aspas duplas
  corrompem as barras. Rode
  `grep -nE '[0-9.]+(px|s)\b|opacity|#[0-9a-fA-F]{3,6}\b|rgba?\(' src/components/checkout/*.tsx src/components/checkout/*.ts src/components/pedido/*.tsx src/components/ui/Input.tsx`.
  - Cole a saída.
  - Para cada linha, aponte o item da lista P-4 que a cobre: `6px`, `12px 14px`, `22px`, `10px`, `320px`,
    `1200px`, `520px`, `2px` (linhas de item + PL-1), `.15s`, `1px solid` com cor variável e `opacity:1`.
  - Qualquer linha sem item correspondente é defeito: corrija antes de entregar.
  - Rode também `grep -rnE 'fontWeight: ?[0-9]' src/components/checkout src/components/pedido src/components/cardapio src/components/ui/Input.tsx`.
    Esperado: nenhuma saída. `src/components/home/**` tem `fontWeight: 400` preexistente, fora do escopo; não
    mexa.
- [ ] **Passo 11.4: Regra de negócio fora dos componentes (invariante 1).** Rode
  `grep -rnE '(preco|qty|subtotal|frete|total)\s*[-+*/]|\.reduce\(|\\[dD]|replace\(' src/components`.
  Esperado: **nenhuma saída**. A base atual dá saída vazia, e o padrão casa `preco * qty` e `replace(/\D/g` num
  controle. Isso foi conferido pelo planejador em 2026-10-02.
- [ ] **Passo 11.5: LGPD.** Rode
  `grep -rnE 'console\.|localStorage|sessionStorage|window\.location|document\.title|toMatch(Inline)?Snapshot' src tests/unit tests/e2e/checkout.spec.ts`.
  - Esperado: só a linha de `tests/e2e/checkout.spec.ts` com `localStorage.length + sessionStorage.length` (é o
    assert da guarda).
  - Rode também `grep -rn "12345678909\|123.456.789-09" src`. Esperado: nenhuma saída, porque CPF de teste não
    entra em código de produto.
- [ ] **Passo 11.6: Caminhos compartilhados.** Liste os arquivos tocados e confirme que, dos compartilhados, só
  `src/components/ui/Input.tsx` e `tests/unit/ui/Input.test.tsx` aparecem. `Button.tsx`, `Card.tsx`, `Badge.tsx`,
  `tokens.css`, `package.json` e `docs/constitution.md` ficam intocados.
- [ ] **Passo 11.7: Relatório + assinatura do dev.**
  - O relatório lista EXATAMENTE os arquivos criados ou alterados (D1) e as saídas dos passos 11.1-11.5.
  - O dev grava na tabela "Assinaturas do pipeline" da spec a própria linha:
    `| dev | 2026-10-02 | <arquivos tocados> + <saídas vermelho/verde> | - |`.
  - Aviso para a sessão principal: a régua F1 deve acusar as linhas 41-43 nos estados P e G até o testador
    ajustá-la (T10). Isso não é regressão.

---

## Autorrevisão do planejador (2026-10-02)

- **Cobertura da spec:**
  - T1→Task 1, T2→2, T3→3, T4→4, T5→9, T6→5-6, T7→7 e 9, T8→8, T9→10. T10 é do testador; T11 e o screenshot
    foram cortados.
  - Inventário 1-4 → Task 9; 5-27 → Tasks 4-6 e 9; 28-42 → Task 3; 44-50 → Task 6; 51-63 → Task 7.
  - Linhas 43 e 64-67 estão cortadas. Linhas 68-71 são hints, não verificados.
  - "Confidencialidade": guardas nas Tasks 2, 6, 7, 8, 9 e 11.
  - P-1 → Tasks 2, 7 e 9; P-2 → 8 e 9; P-3 → 6; P-4 → global + 11.3; P-5 → 3 e 6; P-6 → 9; P-7 → 6 e 8.
- **Placeholders:** nenhum. Todo passo de código traz o código.
- **Tipos:** `DadosCliente`/`ErrosCliente` (Task 1) são usados nas Tasks 2, 6 e 9. `ResumoConfirmacao` (Task 2) é
  usado nas Tasks 7 e 9. `ItemResumoDados`/`itemResumoDe` (Task 5) são usados nas Tasks 6 e 7. `TotaisPedido`/
  `LinhaTotal` (Task 4) são usados nas Tasks 5, 7 e 9. `CardapioPageProps` (Task 9) bate com o `App` (o `setCarrinho`
  do React é atribuível a `onCarrinhoChange`).
- **Pendências para fora do plano:**
  - PL-1 (2px do inventário 56 fora do texto literal da P-4) exige decisão registrada na spec antes do passo 7.3.
  - PL-2 (`itemResumoDe` em arquivo `.ts` próprio) é decisão do planejador, atacável.
