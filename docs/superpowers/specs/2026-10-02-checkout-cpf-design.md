# Spec — Finalizar pedido com CPF na nota (feature 2)

> Especificador, 2026-10-02. Brief: `docs/superpowers/briefs/2026-10-01-checkout-especificador.md` (v2).
> Status: **pronta para re-revisão de spec** (pós-bloqueio do revisor-spec). P-1 a P-7 decididas pelo
> usuário em 2026-10-02 (seção "Decisões do usuário"). Marcas `[P-n: decidido pelo usuário em 2026-10-02: A]`
> indicam onde cada decisão pesa. Todas as dúvidas do brief e as levantadas pelo revisor-spec estão decididas.

## Pedido

Palavras do brief: adicionar ao site o fluxo **"Finalizar pedido"**. A partir do card "Seu pedido" do
Cardápio, o cliente informa nome, telefone e, se quiser, **CPF na nota**, confirma o pedido e vê a
tela "Pedido confirmado". É a feature do pipeline de papéis usada como demo da palestra "Claude Code
na prática" (nada encenado).

Já decidido com o usuário (não reabrir):
- CPF opcional, revelado pelo checkbox "Quero CPF na nota" (desmarcado por padrão), só para nota fiscal.
- CPF exibido sempre mascarado `***.456.789-**`. CPF completo nunca em log, console, analytics, URL,
  mensagem de erro ou snapshot de teste.
- Validação de CPF pelos dígitos verificadores; rejeita sequências repetidas; aceita com ou sem máscara.
- Regras (validações, máscaras, montagem do pedido, total/frete, número do pedido) só em `src/domain`,
  funções puras. Total e frete reutilizam `src/domain/carrinho.ts`.
- Nada persiste: sem backend, sem `localStorage`. O "envio" é função local que devolve o número do
  pedido. O carrinho passa do Cardápio ao Checkout por estado React.
- Campo genérico nasce em `src/components/ui` (E-1): `ui/Input` (text + checkbox).
- Copy literal do mockup.
- Dados de exemplo só fictícios: CPF `123.456.789-09`, nome "Ana Exemplo", telefone "(11) 90000-0000".
- Fora do escopo: endereço/CEP, pagamento, login, mobile/responsivo, backend.
- Badge 24.8px x hint 22px e Button md 44px x hint 48px: pendência do PO já conhecida, fora desta feature.

## Contexto

- Cardápio redesenhado (feature 1, fechada): spec `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`.
  Ela adiou o botão "Finalizar pedido" e a frase de entrega (inventário F1, linhas 42-43; T8) e cortou
  `localStorage`/`window.location` (linha 44; T7). **Esta spec resolve as linhas 41-43 da F1.**
- Mockups (projeto Claude Design `02dc2137-…`, cópia local da sessão principal, D6, em
  `<scratchpad>/mockups/02dc2137/`), lidos por inteiro, inclusive os `<script>`:
  - `Checkout.dc.html` (248 linhas): estados `interativo|vazio|preenchido|erros|confirmacao`;
  - `Checkout - Pranchas.dc.html` (89 linhas): prancha do Input e as 4 pranchas 1280x720;
  - `Input.dc.html` (108 linhas): componente text/checkbox;
  - `Cardapio.dc.html` (248 linhas): botão e frase (L121-122) e `finalizar()` (L153-156).
- Os `.dc.html` não renderizam (faltam `support.js`/`_ds_bundle.js`). **Medição do mockup:** harness
  fora do projeto (`<scratchpad>/medicao-checkout/harness.cjs`). Ele copia o markup e os estilos inline
  literais dos mockups sobre `src/styles/tokens.css` (Karla e Young Serif carregadas). Button/Card/Badge
  do bundle do DS foram trocados pelos estilos de `src/components/ui`. Chromium do Playwright,
  1280x720, 2026-10-02. As medidas "harness" são atacáveis nesse ponto.
- **App hoje:** a tela de checkout não existe. Medi o Cardápio com Margherita M + Calabresa G
  (Playwright 1280x720, Vite 3101, 2026-10-02): card do aside com 340px de largura, 531,6px de altura e
  4 blocos.
- Domínio lido pelo corpo: `cardapio.ts`, `carrinho.ts`, `moeda.ts`. `npm test` 117/117 em 2026-10-02.

## Gate cruzado

| # | Eixo | Verificação | Resultado |
|---|---|---|---|
| 1 | Pedido | Seção "Pedido" acima, com o "já decidido" | ok |
| 2 | Tasks | Cada item do pedido e do "já decidido" tem uma task (T1-T11) ou um corte/adiamento com motivo (seção Tasks) | ok |
| 3 | Design | Os 4 `.dc.html` lidos por inteiro. Todo elemento/estado tem linha no inventário: header, voltar, formulário, 3 campos, checkbox, botão confirmar, aside só leitura, Alterar pedido, 4 estados de erro, confirmação (badge, título, número, prazo, itens, total, CPF mascarado, botão), Input (5 estados + 3 checkbox), botão/frase do Cardápio, `localStorage`, `EXEMPLO`, presets, `forceState`. O mesmo vale para o script: `maskTel`, `maskCpf`, `cpfValido`, `erros()`, `tentou`, `confirmar`, `voltar`, `inicio`, `mostraCpf`, `cpfMascarado`, `sub` com unidades | ok (linhas 1-71; 68-71 = hints) |
| 4 | Domínio | Frete do mockup do Checkout: `FRETE=12`, `FRETE_GRATIS=100`, `gratis ? 0 : FRETE` (L134-135, L207-208) = `calcularFrete`/`VALOR_FRETE`/`LIMIAR_FRETE_GRATIS`. O mockup não testa carrinho vazio, mas o app só chega ao checkout com itens. `DESC` = `TAMANHOS[].fatias` = `fatiasPorTamanho`. `unit*qtd` = `calcularTotalDoItem`. `brl` ≡ `formatarPreco` só para inteiros (todos os preços são inteiros). CPF, telefone, nome e pedido: **nada existe hoje em `src/domain`**, então as funções são novas (seção Domínio). A regra delas vem do script do mockup (L142-169, L193-201), não de suposição | bate; funções novas em `cliente.ts` e `pedido.ts` |

## Decisões das dúvidas do brief (M-7)

1. **Número do pedido → P-1, decidido pelo usuário em 2026-10-02: A.** O mockup só tem o literal "Pedido #1234" (L102), sem regra. Regra:
   sequencial em memória a partir de #1234; reinicia ao recarregar (`proximoNumeroPedido`, seção Domínio).
2. **Telefone → decidido pelo mockup (L143-150, L198, L217):**
   - aceita 10 ou 11 dígitos;
   - **não valida DDD** (não há checagem);
   - máscara progressiva `(DD) NNNN-NNNN` (10 dígitos) ou `(DD) NNNNN-NNNN` (11), cortada em 11 dígitos;
   - 0 dígitos → "A gente precisa de um telefone com DDD.";
   - 1 a 9 dígitos → "Esse telefone parece incompleto — confere o DDD?".
3. **Nome → decidido (L197):** erro só quando `trim()` dá vazio ("Conta pra gente seu nome."). Sem
   mínimo nem máximo. O valor fica como digitado; o pedido guarda `nome.trim()` (decisão minha, ver
   "Afirmações").
4. **Momento da validação → decidido (L211, L220-224):**
   - nenhum erro aparece antes da 1ª tentativa de confirmar;
   - a tentativa com erro liga `tentou`, que não desliga mais enquanto se está no checkout;
   - a partir daí os erros são recalculados a cada mudança, e a mensagem some assim que o campo fica válido;
   - desmarcar o checkbox some com o erro do CPF (`erroCpf` só com `cpfOn`).
5. **Após confirmar:**
   - **o carrinho esvazia → decidido.** O mockup apaga o carrinho salvo em `inicio` (L227). No app, o
     carrinho esvazia no momento da confirmação, e a confirmação mostra um retrato do pedido
     (`ResumoConfirmacao`). Pelo caminho do mockup ("Voltar para o início") o efeito observável é o mesmo;
   - **destino de "Voltar para o início" → P-2, decidido pelo usuário em 2026-10-02: A: vai para a Home.** A copy diz "início"; o
     script ia para `Cardapio.dc.html` (L228).
6. **Desmarcar o CPF depois de digitar → P-3, decidido pelo usuário em 2026-10-02: A: descarta o CPF digitado** (minimização,
   LGPD). Diverge do mockup, que mantém o valor oculto (L219: só `cpfOn` muda); vale a decisão do usuário.
7. **Navegação → decidido:**
   - `App.tsx` passa a `type Tela = 'home' | 'cardapio' | 'checkout' | 'confirmacao'`, e o carrinho sobe
     de `CardapioPage` para `App` (`useState<ItemCarrinho[]>`);
   - "← Voltar ao cardápio" (L35, L225) e "Alterar pedido" (L61) **preservam o carrinho**. No protótipo, o
     Cardápio relê o carrinho salvo ao montar (Cardapio L146-151);
   - o carrinho **também sobrevive à ida e volta Home ↔ Cardápio**, em memória, e só esvazia ao confirmar
     (P-6, decidido pelo usuário em 2026-10-02). Hoje ele se perde porque `CardapioPage` desmonta: é mudança consciente da
     F1, coberta por teste;
   - "Finalizar pedido" só existe com itens (Cardapio L87-123, dentro de `temItens`), então o checkout
     nunca abre com carrinho vazio. O fallback `EXEMPLO` do protótipo (L137-140, L205) é cortado.
8. **Header → reusa `CardapioHeader` sem mudança.** O markup do header do Checkout (L25-30) é idêntico
   caractere a caractere ao do Cardápio (Cardapio L25-30), que já está em paridade (régua F1, linhas 1-4).
   O `App` já renderiza o header fora do `CardapioPage`, então as telas `checkout` e `confirmacao` usam o
   mesmo wrapper + `CardapioHeader`. Não há duplicação (E-1). O wordmark continua `<button>` → Home
   (precedente F1, dúvida 2: no mockup é `<span>`, sem diferença visual). Não renomeio o componente
   (seria troca cosmética em 3 testes).
9. **Resumo do pedido → componente novo `checkout/ItemResumo`.** A linha do Cardápio (`CartItemRow`) tem
   stepper, "tirar" e outro detalhe ("· R$ 45,00 cada"). A do checkout é só leitura, com o detalhe
   `Tamanho M · 6 fatias` + ` · N unidades` quando `qty > 1` (L234). `ItemResumo` serve o aside do
   checkout (com divisória, L65) e a confirmação (sem divisória, L108). O bloco Subtotal/Entrega/Total
   aparece igual no Cardápio e no checkout, por isso **sai do `CartPanel` para `pedido/TotaisPedido`**
   (E-1, 2º consumidor real). O total do item vem de `calcularTotalDoItem`.

## Decisões do usuário (P-1 a P-7, 2026-10-02: opção A em todas)

| P | Dúvida | Opções | Decisão |
|---|---|---|---|
| P-1 | Regra do número do pedido | **A** sequencial em memória, a partir de 1234: 1º pedido da sessão = #1234, próximo #1235; reinicia ao recarregar (nada persiste). `proximoNumeroPedido(ultimo: number \| null)`. **B** sempre #1234 (literal do mockup). **C** aleatório de 4 dígitos (não determinístico, pior para testar) | **A** (decidido pelo usuário em 2026-10-02: A). Motivo: casa com o mockup no 1º pedido, é função pura testável e dá números distintos a pedidos distintos |
| P-2 | Destino de "Voltar para o início" | **A** Home (copy "início"; a Home é a tela raiz e desde D8 também é mockup do 02dc2137). **B** Cardápio (href literal L228, escrito quando o 02dc2137 ainda não tinha Home) | **A** (decidido pelo usuário em 2026-10-02: A) |
| P-3 | Desmarcar "Quero CPF na nota" depois de digitar | **A** descarta o CPF (o campo volta vazio ao remarcar). **B** mantém oculto em memória (mockup L219) | **A** (decidido pelo usuário em 2026-10-02: A). Motivo: minimização (LGPD art. 6º, III); sem efeito visual nas pranchas |
| P-4 | Lista fechada de valores crus (sem token) desta feature | **A** `implementa` literal: gap do Input `6px`, padding do campo `12px 14px`, checkbox `22px`, gap do checkbox `10px`, coluna do aside `320px`, `max-width` `1200px` e `520px`, gap `2px` das linhas de item, gap `2px` da coluna "Pedido #N"/prazo da confirmação (extensão PL-1, decidida pelo usuário em 2026-10-02; L101), transição `.15s ease`, borda `1px solid` com cor variável (campo em hover/erro, checkbox), `lineHeight: 1` da marca do checkbox; e `opacity: 1` do placeholder (acrescentado na re-spec de 2026-10-02, nota 10 do revisor-spec: valor sem token da mesma classe, Input L19). **B** trocar pelo token mais próximo (muda a geometria medida) | **A** (decidido pelo usuário em 2026-10-02: A); a lista ao lado é a lista fechada desta feature. Precedente F1, PO 2026-10-01/02 |
| P-5 | Autopreenchimento do navegador no campo CPF (levantada pelo revisor-spec) | **A** `autoComplete="off"` no campo CPF; `InputTextoProps` ganha a prop opcional `autoComplete?: string`, repassada ao `<input>` (dentro da autorização literal de `ui/Input.tsx`). **B** sem atributo (como o mockup) | **A** (decidido pelo usuário em 2026-10-02). Só o CPF recebe `"off"`; nome e telefone ficam sem o atributo |
| P-6 | Carrinho na ida e volta Home ↔ Cardápio (levantada pelo revisor-spec) | **A** sobrevive em memória no `App` e só esvazia ao confirmar. **B** zera ao ir para a Home (comportamento atual da F1) | **A** (decidido pelo usuário em 2026-10-02). Mudança consciente da F1, com teste |
| P-7 | CPF no campo de digitação x "exibição sempre mascarada" (levantada pelo revisor-spec) | **A** no campo, o cliente vê o próprio CPF formatado completo enquanto digita; `***.456.789-**` em toda exibição posterior (confirmação); CPF completo nunca em log, console, URL nem snapshot. **B** mascarar também o campo | **A** (decidido pelo usuário em 2026-10-02) |
| P-4 (extensão) | PL-1, levantada pelo planejador: `gap: 2px` da coluna "Pedido #N"/prazo da confirmação (`Checkout.dc.html` L101; inventário 56), fora da lista original | **A** estender o P-4 (literal). **B** trocar por token | **A** (decidido pelo usuário em 2026-10-02): o valor entra literal na lista fechada do P-4 |

Fora da lista P-4: o `gap:32px` do grid (L38) vira `var(--sp-8)` (mesmo valor), e `1px solid var(--border-soft)`
sem variação vira `var(--border-card)` (precedente C1 da F1).

## Divergências encontradas (mockup x pedido x domínio)

| # | Divergência | Resolução |
|---|---|---|
| D-a | "Voltar para o início" vai ao Cardápio (L228) | P-2 → A: vai para a Home |
| D-b | Mockup mantém o CPF ao desmarcar (L219) x minimização | P-3 → A: descarta |
| D-c | Número fixo "#1234" (L102) x pedidos distintos | P-1 → A: sequencial a partir de #1234 |
| D-d | "Exibição sempre mascarada" x campo CPF mostra `123.456.789-09` enquanto se digita (preset `preenchido` L172; prancha Desabilitado, Pranchas L47) | **P-7, decidido pelo usuário em 2026-10-02:** no campo, o cliente vê o próprio CPF formatado completo enquanto digita (`000.000.000-00`; prompt ao Design L39-40). O mascaramento `***.456.789-**` vale para toda exibição posterior (confirmação), e o CPF completo segue proibido em log, console, URL e snapshot (prompt L64-65) |
| D-e | Protótipo persiste o carrinho em `localStorage` (Cardapio L141-156; Checkout L136, L183-187, L227) | **corta** (nada persiste); o carrinho fica em memória no `App` |
| D-f | Checkout cai em `EXEMPLO` sem carrinho (L205) | **corta** (inalcançável no app; dúvida 7) |
| D-g | Aside do checkout tem 320px (L38); o do Cardápio, 340px (Cardapio L36) | `implementa` cada um literal (o prompt ao Design pediu 320, L33) |
| D-h | Prompt ao Design pede "Frete/Grátis" e "×" ausente (L42-43); o mockup usa "Entrega" | vale o mockup (visual): "Entrega" |
| D-i | Carrinho passa a sobreviver Home ↔ Cardápio | **P-6, decidido pelo usuário em 2026-10-02:** sobrevive, em memória no `App`, e só esvazia ao confirmar. Mudança consciente do comportamento da F1 (hoje se perde ao ir para a Home); teste em `App.test` e T9 (`docs/spec-cardapio.md:128`) |

## Confidencialidade (Valor 4 / LGPD)

Dados pessoais da feature: nome, telefone e CPF (opcional, só nota fiscal). Bacen: não se aplica (sem pagamento).

**Pode aparecer:**
- no valor dos campos de digitação do checkout, formatado e completo, enquanto o cliente está na tela (P-7);
  o campo CPF tem `autoComplete="off"`, para o navegador não guardá-lo no histórico de autopreenchimento (P-5);
- no estado React do `CheckoutPage` (memória), descartado ao sair da tela;
- no objeto `Pedido`, transitório, dentro do handler de confirmação do `App`, e descartado ao fim dele;
- na confirmação: **só** `CPF na nota: ***.456.789-**`. Nome e telefone não aparecem;
- em testes e prints: **só** os dados fictícios ("Ana Exemplo", "(11) 90000-0000", `123.456.789-09`) e
  variações inválidas deles (`123.456.789-00`, `111.111.111-11`). **Proibido gerar outro CPF válido**
  (pode existir de verdade).

**NÃO pode aparecer** (CPF completo e, salvo onde está acima, nome/telefone):
- `console.*`, log, analytics (não há);
- URL (sem router; `window.location` não muda);
- `localStorage`/`sessionStorage`/cookie;
- `message` de `Error` (fixa: `'Pedido inválido'`);
- copy de erro (fixa, sem valor);
- `key` React, `aria-label`, `title`, `data-*`, `document.title`;
- estado do `App` (guarda só `ResumoConfirmacao`, sem nome/telefone/CPF completo);
- `toMatchSnapshot`/`toMatchInlineSnapshot` (proibidos nas suítes desta feature).

Verificação: o E2E (T8) e o `CheckoutPage.test` (T6) espionam o console e conferem URL, storage e DOM
da confirmação; o `pedido.test` confere que `resumirConfirmacao` não tem campos pessoais.

## Domínio (`src/domain`)

### `cliente.ts` (novo)

```ts
export type ErroNome = 'vazio'
export type ErroTelefone = 'vazio' | 'incompleto'
export type ErroCPF = 'invalido'
export interface DadosCliente { nome: string; telefone: string; querCPF: boolean; cpf: string } // valores do formulário (formatados)
export interface ErrosCliente { nome: ErroNome | null; telefone: ErroTelefone | null; cpf: ErroCPF | null }

export function apenasDigitos(texto: string): string            // remove tudo que não é 0-9
export function formatarTelefone(texto: string): string         // = maskTel (L143-150)
export function validarTelefone(texto: string): ErroTelefone | null
export function validarNome(nome: string): ErroNome | null
export function formatarCPF(texto: string): string              // = maskCpf (L151-158)
export function validarCPF(texto: string): boolean               // = cpfValido (L159-169)
export function mascararCPF(texto: string): string | null        // '***.' + d[3..6) + '.' + d[6..9) + '-**' (L242); null se != 11 dígitos
export function validarDadosCliente(dados: DadosCliente): ErrosCliente // = erros() (L193-201)
export function temErros(erros: ErrosCliente): boolean
```

Regras:
- `validarTelefone` conta os dígitos dos **primeiros 11** (o estado do mockup é sempre a saída de
  `maskTel`, já cortada): 0 → `'vazio'`; 1-9 → `'incompleto'`; 10-11 → `null`.
- `validarCPF` é estrito. Conta os dígitos da entrada inteira:
  - ≠ 11 dígitos → `false`;
  - todos iguais → `false`;
  - DV calculado para n = 9 e n = 10: `soma = Σ d[i]·(n+1−i)` para `i < n`, `r = (soma·10) % 11`, `r = 10 → 0`;
  - válido só quando os dois DVs conferem.
- `mascararCPF` só olha a contagem (como `mostraCpf`, L241). Nunca devolve dígito de posição 0-2 ou 9-10.
- `validarDadosCliente`: `cpf` só é avaliado com `querCPF` (L199).
- O texto das mensagens é copy de UI e fica em `FormularioCliente` (precedente: `textoDoResumo` do
  `CartPanel`). O domínio devolve códigos.

### `pedido.ts` (novo)

```ts
import type { ItemCarrinho } from './carrinho'
import type { DadosCliente } from './cliente'
export const NUMERO_PEDIDO_INICIAL = 1234                          // [P-1: decidido pelo usuário em 2026-10-02: A]
export interface Pedido {
  numero: number; itens: ItemCarrinho[]; subtotal: number; frete: number; total: number
  cliente: { nome: string /* trim */; telefone: string /* só dígitos */; cpf: string | null /* só dígitos; null sem querCPF */ }
}
export interface ResumoConfirmacao { numero: number; itens: ItemCarrinho[]; total: number; cpfMascarado: string | null }
export function proximoNumeroPedido(ultimo: number | null): number // [P-1: decidido pelo usuário em 2026-10-02: A] null → 1234; n → n+1
export function montarPedido(carrinho: ItemCarrinho[], dados: DadosCliente, numero: number): Pedido
export function resumirConfirmacao(pedido: Pedido): ResumoConfirmacao
```

- `montarPedido` usa `calcularSubtotal`, `calcularFrete(subtotal, true)` e `calcularTotal`. Lança
  `new Error('Pedido inválido')` (mensagem fixa, sem dado) se o carrinho estiver vazio ou se
  `temErros(validarDadosCliente(dados))`.
- O "envio" local = `proximoNumeroPedido` + `montarPedido`. O `Pedido` seria o payload de um backend
  (fora do escopo) e é descartado. Só o `ResumoConfirmacao` fica no estado.
- `resumirConfirmacao` devolve exatamente as chaves `numero, itens, total, cpfMascarado`.
  `cpfMascarado = cpf ? mascararCPF(cpf) : null`.

### Casos de teste (`tests/unit/domain/cliente.test.ts`, `pedido.test.ts`; todos vermelhos hoje: os módulos não existem)

| Função | Entrada | Esperado |
|---|---|---|
| `apenasDigitos` | `'(11) 90000-0000'` / `'abc'` / `''` | `'11900000000'` / `''` / `''` |
| `formatarTelefone` | `''` / `'1'` / `'11'` / `'119'` | `''` / `'(1'` / `'(11'` / `'(11) 9'` |
| `formatarTelefone` | `'119000'` / `'1190000'` | `'(11) 9000'` / `'(11) 9000-0'` |
| `formatarTelefone` | `'1100000000'` (10) / `'11900000000'` (11) | `'(11) 0000-0000'` / `'(11) 90000-0000'` |
| `formatarTelefone` | `'119000000001'` (12) / `'(11) 90000-0000'` (idempotente) / `'abc'` | `'(11) 90000-0000'` / `'(11) 90000-0000'` / `''` |
| `validarTelefone` | `''` / `'abc'` | `'vazio'` / `'vazio'` |
| `validarTelefone` | `'(11'` / `'(11) 9000'` / `'119000000'` (9) | `'incompleto'` (os 3) |
| `validarTelefone` | `'(11) 0000-0000'` / `'(11) 90000-0000'` / `'11900000000'` / `'119000000001'` | `null` (os 4; sem checagem de DDD; 12 dígitos cortados em 11) |
| `validarNome` | `''` / `'   '` / `'Ana Exemplo'` / `' A '` | `'vazio'` / `'vazio'` / `null` / `null` |
| `formatarCPF` | `''` / `'1'` / `'123'` / `'1234'` / `'123456'` | `''` / `'1'` / `'123'` / `'123.4'` / `'123.456'` |
| `formatarCPF` | `'1234567'` / `'123456789'` / `'1234567890'` | `'123.456.7'` / `'123.456.789'` / `'123.456.789-0'` |
| `formatarCPF` | `'12345678909'` / `'123456789091'` / `'123.456.789-09'` / `'a1b2'` | `'123.456.789-09'` (os 3 primeiros) / `'12'` |
| `validarCPF` | `'123.456.789-09'` / `'12345678909'` / `' 123.456.789-09 '` | `true` (com máscara, sem máscara, com espaço; cobre o ramo `r = 10 → 0` do 1º DV) |
| `validarCPF` | `'123.456.789-00'` (preset `erros`; 1º DV certo, 2º errado) / `'123.456.789-08'` (2º DV errado) / `'123.456.789-19'` (1º DV errado) | `false` (conferido por execução do algoritmo L159-169 em 2026-10-02) |
| `validarCPF` | `'111.111.111-11'` / `'000.000.000-00'` (repetidos passariam no DV) | `false` |
| `validarCPF` | `''` / `'123.456.789'` (9) / `'1234567890'` (10) / `'123456789091'` (12) | `false` |
| `mascararCPF` | `'123.456.789-09'` / `'12345678909'` | `'***.456.789-**'` (e o resultado não contém `'123'` nem termina em `'09'`) |
| `mascararCPF` | `'123.456.789'` / `''` | `null` |
| `validarDadosCliente` | `{nome:'', telefone:'(11) 9000', querCPF:true, cpf:'123.456.789-00'}` (preset `erros`, L173) | `{nome:'vazio', telefone:'incompleto', cpf:'invalido'}` |
| `validarDadosCliente` | `{nome:'Ana Exemplo', telefone:'(11) 90000-0000', querCPF:true, cpf:'123.456.789-09'}` (preset `preenchido`) | `{nome:null, telefone:null, cpf:null}` |
| `validarDadosCliente` | válido com `querCPF:false, cpf:''` / `querCPF:false, cpf:'123'` / `querCPF:true, cpf:''` | `cpf:null` / `cpf:null` / `cpf:'invalido'` |
| `validarDadosCliente` | `telefone:''` | `telefone:'vazio'` |
| `temErros` | todos `null` / um não nulo | `false` / `true` |
| `proximoNumeroPedido` [P-1: decidido pelo usuário em 2026-10-02: A] | `null` / `1234` / `1235` | `1234` / `1235` / `1236` |
| `montarPedido` | `[{key:'margherita-M', nome:'Margherita da casa', tam:'M', preco:45, qty:1}]`, preset `preenchido`, 1234 | `{numero:1234, itens:[…], subtotal:45, frete:12, total:57, cliente:{nome:'Ana Exemplo', telefone:'11900000000', cpf:'12345678909'}}` |
| `montarPedido` | Margherita M ×1 + `{key:'calabresa-G', nome:'Calabresa da Dona', tam:'G', preco:60, qty:1}`, válido | `subtotal:105, frete:0, total:105` |
| `montarPedido` | válido, `querCPF:false, cpf:'123.456.789-09'` | `cliente.cpf: null` |
| `montarPedido` | `nome:'  Ana Exemplo '` | `cliente.nome: 'Ana Exemplo'` |
| `montarPedido` | carrinho `[]` / preset `erros` | lança; `error.message === 'Pedido inválido'` (sem CPF) |
| `resumirConfirmacao` | pedido com `cpf:'12345678909'` | `{numero, itens, total, cpfMascarado:'***.456.789-**'}`; `Object.keys` = `['numero','itens','total','cpfMascarado']` |
| `resumirConfirmacao` | pedido com `cpf:null` | `cpfMascarado: null` |

`carrinho.ts`, `cardapio.ts`, `moeda.ts`: sem mudança.

## Componentes

### `src/components/ui/Input.tsx` — NOVO, **caminho compartilhado (M-8)**

O brief do dev deve autorizar LITERALMENTE a criação de `src/components/ui/Input.tsx` e
`tests/unit/ui/Input.test.tsx`, e nada mais em `src/components/ui/**`. `Button`, `Card` e `Badge` não mudam.

```ts
export type InputMode = 'text' | 'numeric' | 'tel'
interface InputTextoProps {
  kind?: 'text'; id: string; label: string; value: string; onChange: (valor: string) => void
  placeholder?: string; help?: string; error?: string; disabled?: boolean; inputMode?: InputMode
  autoComplete?: string // P-5; repassado ao <input> só quando definido
}
interface InputCheckboxProps { kind: 'checkbox'; label: string; checked: boolean; onToggle: (checked: boolean) => void; disabled?: boolean }
export type InputProps = InputTextoProps | InputCheckboxProps
```

- Só controlado. O modo não controlado e `forceState` do mockup são de prancha/editor → **corta**.
- Texto:
  - `<label htmlFor={id}>`, `<input id type="text" inputMode>` e, abaixo, erro **ou** ajuda (erro esconde ajuda, L93);
  - erro com `role="alert"` e `aria-invalid={!!error}` (L27-29);
  - acréscimo meu, sem efeito visual: `aria-describedby` aponta para `${id}-erro`/`${id}-ajuda`.
- Checkbox:
  - `<button type="button" role="checkbox" aria-checked aria-label={label}>` com "✓" quando marcado, mais
    `<span>` do rótulo que também alterna (L37-38);
  - desabilitado não chama `onToggle`.
- Hover e foco por estado local (padrão do `ui/Button`). Estilos do inventário, linhas 26-40.

### `src/components/pedido/TotaisPedido.tsx` — NOVO (extraído do `CartPanel`)

- `TotaisPedido({ subtotalFormatado, freteFormatado, freteGratis, totalFormatado })`: o bloco Subtotal /
  Entrega / Total, movido **literalmente** de `CartPanel.tsx` L96-140. O valor computado não muda; a
  régua F1 continua cobrindo o bloco.
- `LinhaTotal({ totalFormatado })`: o rótulo "Total" e o valor (L107-139), usado também pela confirmação.

### `src/components/checkout/` — NOVOS

| Arquivo | Papel | Props |
|---|---|---|
| `ItemResumo.tsx` | Linha só leitura (L65-71 / L108-114). Exporta também `itemResumoDe(item: ItemCarrinho): ItemResumoProps`, que usa `fatiasPorTamanho`, `calcularTotalDoItem` e `formatarPreco` | `nome, tam, fatias, qty, precoTotalFormatado, comDivisoria: boolean`. Detalhe: `` `Tamanho ${tam} · ${fatias}` `` + `` ` · ${qty} unidades` `` se `qty > 1` |
| `ResumoPedido.tsx` | Aside: título + "Alterar pedido" (`<button type="button">` com cara de link) + `ItemResumo` com divisória + `TotaisPedido` | `itens: ItemResumoProps[], subtotalFormatado, freteFormatado, freteGratis, totalFormatado, onAlterar` |
| `FormularioCliente.tsx` | Card do formulário: título, `Input` nome/telefone/checkbox/CPF, `Button` confirmar. Mapeia código de erro → copy literal | `valores: DadosCliente, erros: ErrosCliente` (já filtrados por `tentou`), `rotuloConfirmar, onNome, onTelefone, onQuerCPF, onCPF, onConfirmar` |
| `CheckoutPage.tsx` | Raiz `<main>` (inventário 7). Estado: `nome, telefone, querCPF, cpf, tentou`. `onTelefone(v) → formatarTelefone(v)`, `onCPF(v) → formatarCPF(v)`, `onQuerCPF(false)` → [P-3: decidido pelo usuário em 2026-10-02: A] `cpf = ''`. Erros = `validarDadosCliente`; exibidos só com `tentou`. Confirmar: `temErros` → `tentou = true`; senão `onConfirmar(dados)`. Totais via `carrinho.ts`; rótulo `Confirmar pedido · ${formatarPreco(total)}` | `carrinho: ItemCarrinho[], onVoltar, onConfirmar: (dados: DadosCliente) => void` |
| `PedidoConfirmado.tsx` | Raiz `<main>` (inventário 51). Badge, título, `Pedido #${numero}`, prazo, `ItemResumo` sem divisória, `LinhaTotal`, `CPF na nota: ${cpfMascarado}` só se não nulo, `Button` "Voltar para o início" | `confirmacao: ResumoConfirmacao, onInicio` |

"← Voltar ao cardápio" e "Alterar pedido" chamam o mesmo `onVoltar`.

### Mudanças

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | `Tela = 'home' \| 'cardapio' \| 'checkout' \| 'confirmacao'`. Estados: `carrinho` (vindo do `CardapioPage`), `ultimoNumeroPedido: number \| null` [P-1: decidido pelo usuário em 2026-10-02: A], `confirmacao: ResumoConfirmacao \| null`. As telas `cardapio`/`checkout`/`confirmacao` usam o wrapper atual + `CardapioHeader` (`onNavigateToHome` → `'home'`, zera `confirmacao`). O `<main>` do cardápio fica como está; `CheckoutPage` e `PedidoConfirmado` trazem o próprio `<main>`. `handleConfirmar(dados)`: `numero = proximoNumeroPedido(ultimo)`; `pedido = montarPedido(carrinho, dados, numero)`; `setUltimo(numero)`; `setConfirmacao(resumirConfirmacao(pedido))`; `setCarrinho([])`; `setTela('confirmacao')`. `onInicio` → [P-2: decidido pelo usuário em 2026-10-02: A] `'home'` e zera `confirmacao` |
| `src/components/cardapio/CardapioPage.tsx` | Perde o `useState`. Props: `carrinho: ItemCarrinho[]`, `onCarrinhoChange: (atualizar: (atual: ItemCarrinho[]) => ItemCarrinho[]) => void`, `onFinalizar: () => void`. Os handlers passam a `onCarrinhoChange((a) => adicionarItem(a, item))` etc. Repassa `onFinalizar` ao `CartPanel` |
| `src/components/cardapio/CartPanel.tsx` | Usa `TotaisPedido`. Prop nova obrigatória `onFinalizar`. Depois do aviso e só com itens: `<Button variant="primary" size="md" fullWidth onClick={onFinalizar}>Finalizar pedido</Button>` e o `<span>` da frase (inventário 1-2) |

Nenhum componente calcula preço, frete, validação ou número: tudo vem de `carrinho.ts`, `cliente.ts`,
`pedido.ts` e `cardapio.ts` (invariante 1). O dev confere por grep que não há aritmética nem regex de
dígitos em `src/components/**`.

## Tasks (cobertura do pedido)

| T | Item | Arquivos | Status |
|---|---|---|---|
| T1 | Domínio do cliente (validações, máscaras, CPF mascarado) | `src/domain/cliente.ts`, `tests/unit/domain/cliente.test.ts` | implementa |
| T2 | Domínio do pedido (número, montagem, resumo) | `src/domain/pedido.ts`, `tests/unit/domain/pedido.test.ts` | implementa (P-1 → A) |
| T3 | `ui/Input` text + checkbox (**caminho compartilhado, literal**) | `src/components/ui/Input.tsx`, `tests/unit/ui/Input.test.tsx` | implementa (P-4 → A) |
| T4 | Extrair `TotaisPedido`/`LinhaTotal` do `CartPanel` | `src/components/pedido/TotaisPedido.tsx`, `tests/unit/components/pedido/TotaisPedido.test.tsx`, `src/components/cardapio/CartPanel.tsx` | implementa (régua F1 segue exit 0 no bloco) |
| T5 | Botão "Finalizar pedido" + frase no aside (resolve F1 linhas 41-43) | `src/components/cardapio/CartPanel.tsx`, `CardapioPage.tsx`, `tests/unit/components/cardapio/CartPanel.test.tsx`, `CardapioPage.test.tsx` | implementa |
| T6 | Tela de checkout (form, aside, validação, máscaras) | `src/components/checkout/{CheckoutPage,FormularioCliente,ResumoPedido,ItemResumo}.tsx`, `tests/unit/components/checkout/CheckoutPage.test.tsx` | implementa (P-3 → A, P-4 → A) |
| T7 | Confirmação + navegação + carrinho no `App` | `src/components/checkout/PedidoConfirmado.tsx`, `tests/unit/components/checkout/PedidoConfirmado.test.tsx`, `src/App.tsx`, `tests/unit/App.test.tsx` | implementa (P-1 → A, P-2 → A) |
| T8 | E2E do fluxo + guardas de LGPD | `tests/e2e/checkout.spec.ts` (novo) | implementa |
| T9 | Artefatos de continuidade (M-4), texto literal abaixo | `design/design-system.md`, `docs/spec-home.md`, `docs/spec-cardapio.md`, `AI_HANDOFF.md` | implementa |
| T10 | Régua de paridade do checkout + ajuste da régua F1 (linhas 41-43) | `tests/paridade/checkout.paridade.mjs` (novo), `tests/paridade/cardapio.paridade.mjs` | **testador** (o dev não edita a régua, E-6c) |
| T11 | `localStorage`, `EXEMPLO`, presets `estado`, `forceState`, prancha "Checkout - Pranchas" como tela | — | **corta** (nada persiste; artefatos de editor/protótipo) |
| — | Endereço/CEP, pagamento, login, mobile, backend | — | fora do escopo (decidido com o usuário) |
| — | `npm run screenshot` com telas do checkout | — | **corta**: a saída do script está documentada em `CLAUDE.md`/constituição (caminhos compartilhados); prints dos estados vêm da régua (`PARIDADE_OUT`), precedente F1 |

### T9 — texto literal (M-4)

1. `design/design-system.md` L41: trocar `o botão "Finalizar pedido" fica para a feature 2.` por
   `o botão "Finalizar pedido" leva ao checkout (feature 2, spec docs/superpowers/specs/2026-10-02-checkout-cpf-design.md).`
2. `design/design-system.md` L58: trocar `` `App.tsx` guarda `useState<'home' | 'cardapio'>('home')`; `` por
   `` `App.tsx` guarda `useState<'home' | 'cardapio' | 'checkout' | 'confirmacao'>('home')` e o carrinho (memória); ``
3. `design/design-system.md`: inserir, antes de `## Fora do escopo (cardápio)`:
   ```
   ## Tela de Checkout ("Finalizar pedido", 2026-10-02)

   Vem de `Checkout.dc.html` e `Input.dc.html` do projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79`. Spec:
   `docs/superpowers/specs/2026-10-02-checkout-cpf-design.md`. Componentes em `src/components/checkout/`
   (`CheckoutPage`, `FormularioCliente`, `ResumoPedido`, `ItemResumo`, `PedidoConfirmado`) e
   `src/components/pedido/TotaisPedido.tsx` (compartilhado com o Cardápio), sobre
   `src/domain/{cliente,pedido}.ts`. Reusa o `CardapioHeader`. Nada persiste; o CPF só aparece
   mascarado depois de digitado.
   ```
4. `design/design-system.md` § Componentes base: acrescentar o item
   `- **`Input`** — campo de formulário (`kind` `text` | `checkbox`): rótulo → campo → ajuda ou erro; estados padrão, hover, foco, erro, desabilitado. Origem `Input.dc.html` (02dc2137).`
   e trocar `Inventário fechado pelo briefing de origem (Button, Card, Badge) — sem adições locais.` por
   `Inventário: Button, Card, Badge (briefing de origem) + Input (2026-10-02, Input.dc.html).`
5. `docs/spec-home.md` L13: acrescentar ao fim do item ` (estendido em 2026-10-02 com 'checkout' | 'confirmacao'; ver docs/superpowers/specs/2026-10-02-checkout-cpf-design.md)`.
6. `docs/spec-cardapio.md` L128 (item `CardapioPage.tsx`): acrescentar ao fim do item ` (superado em 2026-10-02: o carrinho mora no App.tsx e sobrevive à ida e volta Home ↔ Cardápio; o CardapioPage recebe carrinho/onCarrinhoChange/onFinalizar — docs/superpowers/specs/2026-10-02-checkout-cpf-design.md, P-6)`.
7. `AI_HANDOFF.md` (texto conferido em 2026-10-02):
   - L7: trocar `(Home + Cardápio com carrinho/frete)` por `(Home + Cardápio com carrinho/frete + Checkout com CPF na nota)`;
   - L23: trocar ``(`cardapio.ts`, `carrinho.ts`, `moeda.ts`)`` por ``(`cardapio.ts`, `carrinho.ts`, `moeda.ts`, `cliente.ts`, `pedido.ts`)``;
   - L24: trocar `(Button, Card, Badge)` por `(Button, Card, Badge, Input)`;
   - L25: trocar ```src/components/home/`, `src/components/cardapio/` — telas;`` por ```src/components/home/`, `src/components/cardapio/`, `src/components/checkout/` (+ `src/components/pedido/`, compartilhado) — telas;``.

`docs/constitution.md` não muda nesta feature. A § Fonte de verdade já lista os 4 mockups. O registro
de fechamento (como D7) é da sessão principal.

## Testes (TDD: o teste muda ANTES do código)

**Novos (vermelhos hoje: os módulos não existem):**
- `cliente.test.ts` e `pedido.test.ts`: a tabela do Domínio, inteira.
- `Input.test.tsx`:
  - `getByLabelText('Seu nome')` acha o campo; digitar chama `onChange` com o valor; placeholder; ajuda visível;
  - com `error`: `role="alert"` com a copy, ajuda some, `aria-invalid="true"`;
  - estilo padrão: borda `var(--border-card)`;
  - `mouseEnter` → `1px solid var(--border-strong)`;
  - `focus` → `box-shadow: var(--focus-ring)`, e a borda continua `var(--border-card)`;
  - com erro + hover → borda `1px solid var(--danger)`;
  - `disabled` → fundo `var(--surface-inset)`, cor `var(--text-muted)`;
  - `autoComplete="off"` vira `autocomplete="off"` no `<input>`; sem a prop, o atributo não existe (P-5);
  - com 2 `Input` renderizados, a regra `.dm-input::placeholder` existe uma única vez no documento (`<style>` filtrados pelo seletor, length 1);
  - checkbox:
    - `getByRole('checkbox', { name: 'Quero CPF na nota' })` começa com `aria-checked="false"`;
    - clicar na caixa e clicar no rótulo chamam `onToggle(true)`;
    - marcado mostra "✓" e fundo `var(--action-primary)`;
    - desabilitado não chama `onToggle`.
- `TotaisPedido.test.tsx`: rótulos Subtotal/Entrega/Total; "Grátis" com `var(--manjericao-700)`/`var(--fw-bold)`; pago sem estilo.
- `CheckoutPage.test.tsx` (carrinhos: 1 Margherita M; Margherita M ×2; Margherita M + Calabresa G):
  - aparece o título literal, e `queryByLabelText('CPF')` é nulo até marcar o checkbox;
  - o botão `getByRole('button', { name: 'Confirmar pedido · R$ 57,00' })` existe (no RTL, `name` string já é exato; `ByRoleOptions` não tem `exact`); com Margherita M ×2, `'Confirmar pedido · R$ 102,00'`; com 2 itens, `'Confirmar pedido · R$ 105,00'`;
  - antes de clicar não há `role="alert"`. Confirmar vazio mostra "Conta pra gente seu nome." e "A gente precisa de um telefone com DDD." e **não** chama `onConfirmar`;
  - depois digitar "Ana Exemplo" some o erro do nome sem novo clique (dúvida 4);
  - digitar `11900000000` mostra o valor `(11) 90000-0000`; digitar `12345678900` no CPF mostra `123.456.789-00` e, com `tentou`, "Esse CPF não confere. Dá uma olhadinha nos números?";
  - o campo CPF tem `autocomplete="off"`; nome e telefone não têm o atributo (P-5);
  - desmarcar some o erro do CPF; remarcar mostra o campo vazio [P-3: decidido pelo usuário em 2026-10-02: A];
  - o fluxo válido chama `onConfirmar` com `{nome:'Ana Exemplo', telefone:'(11) 90000-0000', querCPF:true, cpf:'123.456.789-09'}`;
  - aside: "Tamanho M · 6 fatias"; com qty 2, "Tamanho M · 6 fatias · 2 unidades"; **nenhum** botão "Aumentar quantidade"/"tirar";
  - "← Voltar ao cardápio" e "Alterar pedido" chamam `onVoltar`;
  - espiões em `console.log/info/warn/error/debug`: nenhum argumento contém `12345678909` nem `123.456.789-09`.
- `PedidoConfirmado.test.tsx`:
  - aparecem "Pedido confirmado", "Sua pizza já vai pro forno!", "Pedido #1234", "Chega quentinha em uns 40 minutos.", os itens e o total;
  - com `cpfMascarado`, aparece `CPF na nota: ***.456.789-**`, e `container.textContent` não contém `123.456.789-09`;
  - com `null`, não há "CPF na nota";
  - o botão "Voltar para o início" chama `onInicio`.

**A alterar:**
- `CartPanel.test.tsx`: os fixtures ganham `onFinalizar: vi.fn()` (typecheck). O guarda "(guarda) não
  mostra Finalizar…" (L104-106) vira o inverso **(vermelho)**: com itens, aparecem o botão "Finalizar pedido"
  e a frase literal, e o clique chama `onFinalizar`. Vazio: nenhum dos dois.
- `CardapioPage.test.tsx`: `render(<CardapioPage />)` passa a usar um wrapper local com `useState`
  (`carrinho`/`onCarrinhoChange`) e `onFinalizar: vi.fn()`. Os asserts existentes não mudam.
- `App.test.tsx` (novos):
  - fluxo completo até a confirmação ("Pedido #1234");
  - "Voltar para o início" → Home [P-2: decidido pelo usuário em 2026-10-02: A]; de novo no Cardápio aparece "Nenhuma pizza ainda";
  - 2º pedido na mesma sessão → "Pedido #1235" [P-1: decidido pelo usuário em 2026-10-02: A];
  - carrinho com 1 item sobrevive Home ↔ Cardápio (P-6: decidido pelo usuário em 2026-10-02: A) **(vermelho: hoje o carrinho se perde)**;
  - "Voltar ao cardápio" preserva "1 pizza no carrinho".

**E2E `tests/e2e/checkout.spec.ts` (novo):** em todos os testes, coletar `page.on('console')` e `page.on('pageerror')`.
1. Com CPF:
   - Margherita M + Calabresa G → "Finalizar pedido" → título do checkout; no aside (`getByRole('complementary')`) aparecem os 2 itens e "Grátis". "R$ 105,00" aparece 2 vezes (Subtotal e Total): conferir `getAllByText('R$ 105,00', { exact: true })` com count 2 dentro do aside, ou escopar pela linha (Subtotal / Total). Proibido `getByText('R$ 105,00')` solto;
   - confirmar vazio → erros de nome e telefone;
   - preencher "Ana Exemplo" e `11900000000`; marcar o checkbox; CPF `12345678900` → erro do CPF; trocar por `12345678909`;
   - confirmar → "Sua pizza já vai pro forno!", "Pedido #1234", "CPF na nota: ***.456.789-**";
   - asserts LGPD:
     - nenhuma mensagem de console/pageerror casa a regex `/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/` (a mesma da régua F1, `cardapio.paridade.mjs` L399; cobre o CPF com e sem máscara);
     - `page.url()` não contém dígitos do CPF nem mudou de path/query/hash desde `/`;
     - `localStorage.length + sessionStorage.length === 0`;
     - `page.content()` da confirmação não casa a mesma regex e não contém "Ana Exemplo" nem `90000-0000`;
   - "Voltar para o início" → hero da Home [P-2: decidido pelo usuário em 2026-10-02: A].
2. Sem CPF: a confirmação não tem "CPF na nota".
3. "← Voltar ao cardápio" e "Alterar pedido" voltam ao Cardápio com "2 pizzas no carrinho".
4. Carrinho vazio: `getByRole('button', { name: 'Finalizar pedido' })` com count 0.

`carrinho.spec.ts` e `navegacao.spec.ts`: sem mudança.

**Paridade (E-6), T10:**
- o testador escreve `tests/paridade/checkout.paridade.mjs` a partir do inventário abaixo, com os estados
  K-V/K-P/K-E/K-C no carrinho Margherita M + Calabresa G (= `EXEMPLO` do mockup), K-$ com Margherita M ×2
  (R$ 102,00) e a prancha I via `Input.test`/régua;
- ajusta a régua F1 **só nos estados P e G**: as checagens das linhas 41-43 (`naoTem`, L262-265, e os
  "4 blocos" de `medirItens`, L293) passam a exigir 6 blocos e a presença do botão e da frase (linhas 1-3
  desta spec). **No estado V nada muda**: continuam os 2 blocos (L274) e o `naoTem` (L282), porque sem
  itens não há botão nem frase. Isso é esperado: não é regressão.

## Método de medição (entrada do inventário)

- **Mockup:** fonte (Lnn = linha do `.dc.html` citado) + medida do **harness** (Contexto). Os valores
  "hint-size" do editor **não** são medidas. Ficam como `nao verificado: hint` (linhas 68-71 do
  inventário): Button md 48, Button sm 180x36, Badge 22, Input 78/96, Cards 440/320/480.
- **App hoje:** a tela de checkout não existe ("inexistente"). Cardápio medido com 2 itens.
- **Estados:**

  | Código | Estado | Carrinho / dados |
  |---|---|---|
  | CV | Cardápio vazio | — |
  | CI | Cardápio com itens | Margherita M + Calabresa G |
  | K-V | Checkout vazio | Margherita M + Calabresa G |
  | K-P | Checkout preenchido | idem; Ana Exemplo / (11) 90000-0000 / CPF ligado `123.456.789-09` |
  | K-E | Checkout com erros | idem; nome vazio / `(11) 9000` / `123.456.789-00` após confirmar |
  | K-$ | Checkout com frete pago e qty > 1 | Margherita M ×2: subtotal R$ 90,00, entrega R$ 12,00, total R$ 102,00 |
  | K-C | Confirmação | com CPF |
  | I | Input | prancha |

- Cor medida → token: `rgb(166,43,31)` `--action-primary`; `rgb(192,57,43)` `--danger`;
  `rgb(227,208,175)` `--border-soft`; `rgb(160,141,126)` `--border-strong`; `rgb(46,33,27)` `--text-title`;
  `rgb(74,58,48)` `--text-body`; `rgb(107,90,78)` `--text-muted`; `rgb(255,253,248)` `--surface-card`;
  `rgb(239,225,200)` `--surface-inset`; `rgb(251,246,235)` `--text-on-primary`; `rgb(51,88,43)` `--manjericao-700`;
  `rgb(222,234,216)` `--accent-success-bg`; `rgb(246,220,215)` `--molho-100`.

## Inventario de paridade

| # | Tela/estado | Elemento | Mockup | App hoje | Token | Decisao |
|---|---|---|---|---|---|---|
| 1 | Cardápio/CI | Botão Finalizar pedido | `ui/Button` primary fullWidth "Finalizar pedido", depois do aviso de frete, gap 20 (Cardapio L119-121); derivado w290 h44 (340 − 2 de borda − 48 de padding; os blocos do aside medem w290) | inexistente (card com 4 blocos, h531.6) | `ui/Button`, `--sp-5` | implementa (resolve F1 linha 42) |
| 2 | Cardápio/CI | Frase de entrega | "Sai do forno e chega quentinha em uns 40 minutos."; Karla 0.75rem, lh 1.5 (18px), `--text-muted`, centralizada, gap 20 abaixo do botão (Cardapio L122) | inexistente | `--fs-caption`, `--lh-body`, `--text-muted` | implementa (resolve F1 linha 43) |
| 3 | Cardápio/CV,CI | Ordem dos blocos do aside | cabeçalho → itens → somas → aviso → botão → frase; 6 blocos com itens; botão e frase só com itens (L77-123); derivado h531.6 → 633.6 | 4 blocos | `--sp-5` | implementa (resolve F1 linha 41) |
| 4 | Cardápio/CI | Ação de Finalizar | `finalizar()` grava `localStorage` e navega por `window.location` (L153-156) | inexistente | — | implementa como `onFinalizar` → tela `checkout`; persistência **corta** (D-e) |
| 5 | Checkout/todos | Wrapper da página | `min-height:100vh`, `--surface-page`, `--font-body`, `--text-body` (L24) | wrapper do `App` (o mesmo do Cardápio) | `--surface-page`, `--font-body`, `--text-body` | implementa (reuso) |
| 6 | Checkout/todos | Header | igual ao do Cardápio (L25-30); harness h81.6; wordmark Young Serif 28px lh 33.6 x40 y24; tagline Karla 14px `--molho-100` x929.5 y35, mesma linha | `CardapioHeader` (régua F1 linhas 1-4 ok) | `--action-primary`, `--sp-6`, `--sp-8`, `--fs-title`, `--fs-small`, `--molho-100` | implementa via reuso; wordmark segue `<button>` → Home (dúvida 8) |
| 7 | Checkout/K-V,K-P,K-E | Main | `max-width:1200px; margin:0 auto; padding: var(--sp-6) var(--sp-8) var(--sp-10); box-sizing:border-box` (L33); harness x40 w1200, conteúdo x72 w1136 | inexistente | `--sp-6`, `--sp-8`, `--sp-10` | implementa (1200 literal, P-4) |
| 8 | Checkout/K-V,K-P,K-E | Botão Voltar ao cardápio | `ui/Button` secondary sm "← Voltar ao cardápio", wrapper margin-bottom 20 (L34-35); harness x72 y105.6 w169 h34; Karla 14px 700 `--action-primary`, anel inset 2px | inexistente | `ui/Button` secondary sm, `--sp-5` | implementa (`onVoltar`, preserva o carrinho) |
| 9 | Checkout/K-V,K-P,K-E | Grid de colunas | `minmax(0,1fr) 320px`, gap 32px, align-items start (L38); harness: card do form x72 w784, aside x888 w320, y159.6 | inexistente | `--sp-8` (gap) | implementa (320 literal, P-4; gap → `var(--sp-8)`) |
| 10 | Checkout/K-V,K-P,K-E | Card do formulário | `ui/Card padding="var(--sp-8)"` (L39); harness h340.6 (K-V), h461.6 (K-P, K-E) | inexistente | `ui/Card`, `--sp-8` | implementa |
| 11 | Checkout/K-V,K-P,K-E | Título do formulário | `h1` "Quase lá — falta só a gente saber quem é você"; Young Serif 400 1.75rem, lh 1.2, `--text-title`, margin 0 0 24px, `text-wrap:pretty` (L40); harness x105 y192.6 w718 h33.6 (1 linha) | inexistente | `--font-display`, `--fw-regular`, `--fs-title`, `--lh-title`, `--text-title`, `--sp-6` | implementa |
| 12 | Checkout/K-V,K-P,K-E | Grid do formulário | 2 colunas `minmax(0,1fr)`, gap 20px (linha) 24px (coluna), align-items start (L41); harness y250.2 w718; colunas w347 em x105 e x476 | inexistente | `--sp-5`, `--sp-6` | implementa |
| 13 | Checkout/K-V | Campo nome | `Input` id `nome`, label "Seu nome", placeholder "Como a gente te chama?", sem ajuda (L42); harness x105 y250.2 w347 h77 | inexistente | — | implementa |
| 14 | Checkout/K-V | Campo telefone | `Input` id `telefone`, label "Telefone (com DDD)", placeholder "(11) 98765-4321", inputMode `tel`, ajuda "A gente só liga se o motoboy se perder." (L43); harness x476 y250.2 w347 h101 | inexistente | — | implementa |
| 15 | Checkout/K-V,K-P,K-E | Checkbox CPF | `Input kind="checkbox"` "Quero CPF na nota", linha inteira (`grid-column:1 / -1`) (L44-46); harness y371.2 h24; caixa x105 y372.2; rótulo x137 | inexistente | — | implementa |
| 16 | Checkout/K-P,K-E | Campo CPF | só com o checkbox marcado (L47); id `cpf`, label "CPF", placeholder "000.000.000-00", inputMode `numeric`, ajuda "Usado só para emitir a nota fiscal." (L48); `autoComplete="off"` (P-5, fora do mockup, sem efeito visual); coluna 1; harness x105 y415.2 w347 h101 | inexistente | — | implementa |
| 17 | Checkout/K-V | Campo CPF oculto | ausente com o checkbox desmarcado (L47, preset `vazio` L171) | inexistente | — | implementa |
| 18 | Checkout/K-V,K-P,K-E | Botão Confirmar | `ui/Button` primary fullWidth `"Confirmar pedido · " + total` (L51, L231); wrapper `grid-column:1 / -1`, margin-top 8px (L50); harness h44 w718, y423.2 (K-V) / y544.2 (K-P, K-E); copy K-V/K-P/K-E (2 itens) = "Confirmar pedido · R$ 105,00", K-$ = "Confirmar pedido · R$ 102,00" | inexistente | `ui/Button`, `--sp-2` | implementa; continua visível e habilitado com erros (prompt L61) |
| 19 | Checkout/K-V,K-P,K-E | Aside | `position:sticky; top:var(--sp-6)`; `ui/Card padding="var(--sp-6)"`; coluna gap 20 (L56-58); harness x888 y159.6 w320 h345.6 | inexistente (o do Cardápio tem 340) | `ui/Card`, `--sp-6`, `--sp-5` | implementa |
| 20 | Checkout/K-V,K-P,K-E | Cabeçalho do aside | flex, baseline, space-between, gap 12 (L59); `h2` "Seu pedido" Young Serif 1.25rem lh 1.2 `--text-title` (L60); harness h2 x913 y184.6 h24 | inexistente | `--sp-3`, `--fs-heading`, `--lh-title` | implementa |
| 21 | Checkout/K-V,K-P,K-E | Alterar pedido | "Alterar pedido"; Karla 0.875rem 700 `--action-primary`, sem sublinhado; hover `--action-primary-hover` + sublinhado (L61, helmet L20-21); harness x1088.6 y188.6 w94.4 h21 | inexistente | `--fs-small`, `--fw-bold`, `--action-primary`, `--action-primary-hover` | implementa como `<button type="button">` com cara de link (`background:none; border:none; padding:0`, `lineHeight: var(--lh-body)`), `onVoltar` |
| 22 | Checkout/K-V,K-P,K-E | Linha do item (aside) | flex, gap 12, align flex-start, padding-bottom 12, borda inferior `1px solid var(--border-soft)` (L65); nome Young Serif 1rem `--text-title`; detalhe Karla 0.75rem `--text-muted` "Tamanho M · 6 fatias" / "Tamanho G · 8 fatias"; coluna gap 2px; total Young Serif 1rem à direita (L66-70); harness h57, linhas em y229.6 e y298.6; lista gap 12 (L63) | inexistente | `--sp-3`, `--border-card`, `--font-display`, `--fs-body`, `--fs-caption`, `--text-muted` | implementa (`ItemResumo comDivisoria`; borda = `var(--border-card)`; 2px P-4) |
| 23 | Checkout/K-$ | Detalhe com unidades | `" · " + qtd + " unidades"` quando qtd > 1 (L234): K-$ mostra "Tamanho M · 6 fatias · 2 unidades" e o total da linha "R$ 90,00" | inexistente | — | implementa |
| 24 | Checkout/K-V,K-P,K-E | Subtotal e entrega | coluna gap 8; "Subtotal" e "Entrega" Karla 0.875rem `--text-body` (L74-79); grátis: "Grátis" `--manjericao-700` 700 (L238-239); harness subtotal y375.6, entrega y404.6 | igual ao `CartPanel` (régua F1 linhas 35-37) | `--sp-2`, `--fs-small`, `--text-body`, `--manjericao-700`, `--fw-bold` | implementa via `TotaisPedido` |
| 25 | Checkout/K-$ | Entrega paga | "R$ 12,00" sem estilo extra (L238); K-$: Subtotal "R$ 90,00", Total "R$ 102,00" | — | — | implementa via `TotaisPedido` |
| 26 | Checkout/K-V,K-P,K-E | Total (aside) | padding-top 12, borda superior `1px solid var(--border-soft)`; rótulo "Total" Karla 0.875rem 700 `--ls-caps` caixa alta `--text-muted`; valor Young Serif 1.75rem lh 1.2 `--text-title` (L81-84); harness h46.6, valor "R$ 105,00" | igual ao `CartPanel` (régua F1 linha 38) | `--sp-3`, `--border-card`, `--fs-small`, `--ls-caps`, `--fs-title` | implementa via `LinhaTotal` |
| 27 | Checkout/K-V,K-P,K-E | Aside só leitura | sem stepper, "tirar", resumo "N pizzas", aviso de frete nem Finalizar (L56-88) | — | — | implementa (ausências testadas) |
| 28 | Input/I | Estrutura do texto | coluna gap 6px, largura 100% (L24); label Karla 0.875rem 700 `--text-title` lh 1.5 (h21); campo; erro ou ajuda (L26-33) | inexistente | `--fs-small`, `--fw-bold`, `--text-title`, `--lh-body` | implementa (6px P-4) |
| 29 | Input/I | Campo padrão | `box-sizing:border-box`, w100%, `--surface-card`, borda `var(--border-card)`, `--radius-md`, padding 12px 14px, Karla 1rem lh 1.5, `--text-body`, outline none (L60-67); harness h50 | inexistente | `--surface-card`, `--border-card`, `--radius-md`, `--fs-body`, `--lh-body`, `--text-body` | implementa (12px 14px P-4) |
| 30 | Input/I | Placeholder | `--text-muted`, opacidade 1 (Input L19) | inexistente | `--text-muted` | implementa via regra `.dm-input::placeholder { color: var(--text-muted); opacity: 1 }` no próprio `ui/Input`, emitida **uma vez por documento**: `<style href="dm-input-placeholder" precedence="default">` (o React 19 iça e deduplica `<style>` com `href`/`precedence`), e não repetida por instância. `tokens.css` não muda. `opacity: 1` está na lista P-4 |
| 31 | Input/I | Hover | borda `1px solid var(--border-strong)` só sem foco (L63); harness rgb(160,141,126) | inexistente | `--border-strong` | implementa |
| 32 | Input/I | Foco | `box-shadow: var(--focus-ring)`; borda continua `--border-card` (L63, L67); harness `rgb(246,220,215) 0 0 0 3px, rgb(192,57,43) 0 0 0 5px` | inexistente | `--focus-ring` | implementa |
| 33 | Input/I,K-E | Erro | borda `1px solid var(--danger)`, que prevalece sobre hover e foco (L63); mensagem `role="alert"` Karla 0.75rem 700 lh 1.5 `--danger` (L29), h18 (1 linha em 347px); a ajuda some (L93); `aria-invalid` | inexistente | `--danger`, `--fs-caption`, `--fw-bold`, `--lh-body` | implementa |
| 34 | Input/I | Ajuda | Karla 0.75rem lh 1.5 `--text-muted` (L32), h18 | inexistente | `--fs-caption`, `--lh-body`, `--text-muted` | implementa |
| 35 | Input/I | Desabilitado | fundo `--surface-inset`, texto `--text-muted`, cursor not-allowed, sem hover/foco (L52-53, L62, L66, L68); prancha "CPF" `123.456.789-09` (Pranchas L47) | inexistente | `--surface-inset`, `--text-muted` | implementa (o checkout não o usa; coberto em `Input.test`) |
| 36 | Input/I | Transição | `border-color, box-shadow, background` .15s ease (L69, L81) | inexistente | — | implementa (.15s P-4) |
| 37 | Input/I | Checkbox desmarcado | caixa 22x22, `--radius-sm`, `--surface-card`, borda `1px solid var(--border-strong)`, sem marca (L72-76); linha flex, centro, gap 10px (L36); rótulo Karla 1rem `--text-body`, cursor pointer, `user-select:none` (L96); harness rótulo w133 h24 | inexistente | `--radius-sm`, `--surface-card`, `--border-strong`, `--fs-body`, `--text-body` | implementa (22px e 10px P-4) |
| 38 | Input/I,K-P,K-E | Checkbox marcado | fundo e borda `--action-primary`; "✓" Karla 0.875rem 700 lh 1 `--text-on-primary` (L75-78, L94) | inexistente | `--action-primary`, `--text-on-primary`, `--fs-small`, `--fw-bold` | implementa |
| 39 | Input/I | Checkbox hover | `--shadow-card` só desmarcado; borda inalterada (L76, L79) | inexistente | `--shadow-card` | implementa |
| 40 | Input/I | Checkbox foco | `--focus-ring` (L79) | inexistente | `--focus-ring` | implementa |
| 41 | Input/I | Checkbox desabilitado | fundo `--surface-inset`, borda `--border-strong`, marca e rótulo `--text-muted`, not-allowed, sem toggle (L75-77, L84, L96) | inexistente | `--surface-inset`, `--text-muted` | implementa |
| 42 | Input/I | Checkbox a11y | `<button role="checkbox" aria-checked aria-label>`; clicar no rótulo alterna (L37-38) | inexistente | — | implementa |
| 43 | Input/— | `forceState` e modo não controlado | props de editor/prancha (L45, L51-58) | — | — | **corta** (só controlado; hover/foco reais por evento) |
| 44 | Checkout/K-E | Erro do nome | "Conta pra gente seu nome." (L197); harness y333.2 | inexistente | — | implementa |
| 45 | Checkout/— | Erro de telefone vazio | "A gente precisa de um telefone com DDD." (L198) | inexistente | — | implementa (não aparece nas pranchas, só no script) |
| 46 | Checkout/K-E | Erro de telefone incompleto | "Esse telefone parece incompleto — confere o DDD?" (L198); harness 1 linha | inexistente | — | implementa |
| 47 | Checkout/K-E | Erro do CPF | "Esse CPF não confere. Dá uma olhadinha nos números?" (L199), também com o CPF vazio | inexistente | — | implementa |
| 48 | Checkout/K-V→K-E | Momento dos erros | só depois da 1ª tentativa; recalculados a cada mudança (L211, L222) | inexistente | — | implementa (dúvida 4) |
| 49 | Checkout/K-P | Valores no campo | telefone "(11) 90000-0000", CPF "123.456.789-09" visíveis no campo (L172) | inexistente | — | implementa (P-7: decidido pelo usuário em 2026-10-02: A) |
| 50 | Checkout/K-P | Máscaras progressivas | `maskTel` / `maskCpf` a cada digitação (L143-158, L217-218) | inexistente | — | implementa via `formatarTelefone`/`formatarCPF` |
| 51 | Checkout/K-C | Main da confirmação | `max-width:1200px`, padding 32px, `box-sizing:border-box`, flex, `justify-content:center` (L94); conteúdo w100% max-width 520px (L95); harness card x380 y113.6 w520 h488 | inexistente | `--sp-8` | implementa (1200/520 P-4) |
| 52 | Checkout/K-C | Card da confirmação | `ui/Card padding="var(--sp-8)"`, coluna gap 20 (L96-97) | inexistente | `ui/Card`, `--sp-8`, `--sp-5` | implementa |
| 53 | Checkout/K-C | Cabeça da confirmação | coluna, `align-items:flex-start`, gap 12 (L98) | inexistente | `--sp-3` | implementa |
| 54 | Checkout/K-C | Badge de confirmado | `ui/Badge tone="success"` "Pedido confirmado" (caixa alta pelo Badge) (L99); harness w158.4 h24.8 (hint 22 = pendência do PO já conhecida) | inexistente | `Badge tone=success` | implementa |
| 55 | Checkout/K-C | Título da confirmação | `h1` "Sua pizza já vai pro forno!" Young Serif 1.75rem lh 1.2 `--text-title` (L100); harness y183.4 h33.6 | inexistente | `--fs-title`, `--lh-title` | implementa |
| 56 | Checkout/K-C | Número do pedido | "Pedido #1234" Karla 0.875rem 700 `--text-title`; coluna gap 2px com o prazo (L101-102); harness y229 h21 | inexistente | `--fs-small`, `--fw-bold`, `--text-title` | implementa; número sequencial a partir de #1234 (P-1 → A); gap 2px literal (P-4 estendido, PL-1, decidido pelo usuário em 2026-10-02) |
| 57 | Checkout/K-C | Prazo | "Chega quentinha em uns 40 minutos." Karla 1rem lh 1.5 `--text-body` (L103); harness y252 h24 | inexistente | `--fs-body`, `--lh-body`, `--text-body` | implementa |
| 58 | Checkout/K-C | Bloco de itens | coluna gap 12, padding-top 16, borda superior `1px solid var(--border-soft)` (L106); harness y296 h208.6 | inexistente | `--sp-3`, `--sp-4`, `--border-card` | implementa (borda = `var(--border-card)`) |
| 59 | Checkout/K-C | Linha do item (confirmação) | igual à linha 22, sem padding-bottom nem borda (L108-114); harness h44, em y313 e y369 | inexistente | idem 22 | implementa (`ItemResumo comDivisoria={false}`) |
| 60 | Checkout/K-C | Total (confirmação) | igual à linha 26 (L116-119); harness y425 h46.6 | inexistente | idem 26 | implementa via `LinhaTotal` |
| 61 | Checkout/K-C | CPF na nota | "CPF na nota: ***.456.789-**" Karla 0.875rem `--text-muted`, só com CPF (L120-122, L241-242); harness y483.6 h21; sem CPF: ausente | inexistente | `--fs-small`, `--text-muted` | implementa (só `cpfMascarado`; nunca o completo) |
| 62 | Checkout/K-C | Botão Voltar para o início | `ui/Button` primary fullWidth "Voltar para o início" (L124); harness y524.6 h44 w454 | inexistente | `ui/Button` | implementa; destino Home (P-2 → A) |
| 63 | Checkout/K-C | Troca de tela | a confirmação substitui o formulário + aside; o header fica (L32, L93) | inexistente | — | implementa (tela `confirmacao` no `App`) |
| 64 | Checkout/— | Persistência | `localStorage` `donamassa-pedido` em mount/inicio (L136, L183-187, L227) | inexistente | — | **corta** (D-e) |
| 65 | Checkout/— | Carrinho de exemplo | `EXEMPLO` quando não há carrinho salvo (L137-140, L205) | — | — | **corta** (D-f) |
| 66 | Checkout/— | Presets `estado` | `interativo/vazio/preenchido/erros/confirmacao` (L132, L170-176, L189-191) | — | — | **corta** (editor; os estados viram dados de teste) |
| 67 | Pranchas/— | Pranchas como tela | `Checkout - Pranchas.dc.html` (canvas, `design_doc_mode`) | — | — | **corta** (documentação de design; os estados delas estão nas linhas acima) |
| 68 | Checkout/K-V,K-P,K-E | Botão Voltar ao cardápio (hint) | `hint-size="180px,36px"` (L35) | inexistente; harness 169x34 | — | **nao verificado: hint** (dica do editor, não medida; a régua relata, não reprova; vale a linha 8) |
| 69 | Checkout/K-V,K-P,K-E,K-C | Cards (hint) | form `hint-size="100%,440px"` (L39), aside `"320px,320px"` (L57), confirmação `"100%,480px"` (L96) | inexistente; harness 340.6/461.6, 345.6, 488 | — | **nao verificado: hint** (as alturas vêm do conteúdo; valem as linhas 10, 19 e 52) |
| 70 | Checkout/todos | Input (hint) | `hint-size` 78 (sem ajuda) / 96 (com ajuda) (L42-48) | inexistente; harness 77 / 101 | — | **nao verificado: hint** (valem as linhas 13-16 e 28-34) |
| 71 | Cardápio/CI, Checkout/todos | Button md e Badge (hint) | Button `hint-size` 48, Badge 22 | app 44 / 24.8 (régua F1) | — | **nao verificado: hint** (pendência do PO já conhecida, fora desta feature) |

## Afirmações que NÃO verifiquei (atacáveis)

- **Geometria do mockup = harness:**
  - Button, Card e Badge do bundle do DS foram trocados pelos de `src/components/ui`;
  - os wrappers `<x-import>`/`<dc-import>` foram ignorados (assumi que não acrescentam caixa);
  - se o bundle diferir, as alturas de botão (34/44) e do Badge (24.8) mudam;
  - o `styles.css` do DS não foi lido.
- **Alterar pedido como `<button>`:** no mockup é um `<a>` inline (h21). A altura e o alinhamento por
  baseline do `<button>` com `lineHeight: var(--lh-body)` não foram renderizados no app.
- **Placeholder `--text-muted`:** o mockup usa CSS global `input::placeholder` (Input L19). O
  `tokens.css` (compartilhado) não tem essa regra. Estilo inline não alcança pseudo-elemento. Opções
  para o planejador: (a) `<style>` local no componente com a regra escopada pelo id/classe; (b) pedir
  autorização literal para acrescentar a regra ao `tokens.css`. **Decidido (a)**: não toca caminho
  compartilhado além do `Input.tsx` já autorizado. Atacável: `<style>` dentro de componente é padrão
  novo no projeto.
- **`nome.trim()` no pedido** e o esvaziamento do carrinho **no momento da confirmação** (e não em "Voltar
  para o início"): decisões minhas, sem efeito visual no caminho do mockup. "Só esvazia ao confirmar" é do usuário (P-6).
- **`aria-describedby`** no Input: acréscimo meu (a11y), fora do mockup.
- **Sem `<form>`:** o mockup não tem, então Enter não envia. Mantido.
- **Cursor saltando** ao editar no meio de um valor mascarado (input controlado): não testei.
  Comportamento igual ao do mockup.
- **README.md L415** cita `useState<'home' | 'cardapio'>`. É material de palestra, não artefato de
  continuidade. Não incluí em T9.
- **`<style href precedence>` do placeholder — VERIFICADO pelo revisor-spec em 2026-10-02:** com React
  19.2.7 + jsdom 29.1.1, 3 `Input` geraram 1 única regra no `head`, sem avisos. Nota dele: o `<style>`
  içado persiste no `head` depois do `unmount`. O teste "length 1" desta spec continua válido, mas um teste
  que só confira a existência da regra pode passar por causa de um teste anterior.
- **Regex de CPF na guarda de LGPD:** `\d{3}\.?\d{3}\.?\d{3}-?\d{2}` também casa um telefone de 11 dígitos sem
  máscara (`11900000000`). Isso é desejado: o telefone também não pode ir ao console.

## Fora do escopo

Endereço/CEP, pagamento, login, mobile/responsivo, backend, persistência e mudanças em `Button`/`Card`/`Badge`.
Os hints Badge 22 e Button 48 continuam como pendência separada do PO. `npm run screenshot` não muda (T11).

## Assinaturas do pipeline
<!-- pipeline: fechado -->

| papel | data | evidencia | veredito |
|---|---|---|---|
| especificador | 2026-10-02 | docs/superpowers/specs/2026-10-02-checkout-cpf-design.md | - |
| revisor-spec | 2026-10-02 | bloqueia: (1) M-7: P-5..P-7 pendentes do PO e dadas como fechadas (autoComplete do CPF L548-549, que muda o contrato do ui/Input; carrinho Home<->Cardapio D-i L555-556 inferido de localStorage cortado; D-d L127 reinterpreta "exibicao sempre mascarada" sem item em Afirmacoes). corrigir: (2) exact:true em getByRole RTL L380 quebra tsc (queries.d.ts:69-130, tsconfig.app.json:25); (3) linha 23 "unidades" atribuida a K-$ com qty 1 (L448/L484); (4) Finalizar w292 -> 290 (app.mjs reexecutado: blocos w290); (5) T9 sem AI_HANDOFF.md:23 e docs/spec-cardapio.md:128. nota: naoTem tambem em V (regua L262-265/L282); inventario 8->7 (L299); hints Button sm 36 e Cards nao listados; E2E "R$ 105,00" duplicado + regex de CPF da regua L399; opacity:1 fora do P-4. Verificado: 4 mockups lidos por inteiro, cpfValido/maskTel/maskCpf executados (35 casos batem), dominio lido pelo corpo, geometria do harness recalculada, alvos da T9 conferidos, npm test 117/117 | bloqueia |
| especificador | 2026-10-02 | re-spec pós revisor-spec: (1) P-5 autoComplete="off" no CPF (+ prop opcional em ui/Input, teste), P-6 carrinho sobrevive Home<->Cardápio e só esvazia ao confirmar (mudança consciente da F1, teste vermelho), P-7 CPF completo só no campo/mascarado depois, registrados como decisões do usuário 2026-10-02; (2) exact removido do getByRole RTL; (3) K-$ = Margherita M x2 R$ 102,00 (linhas 23/25); (4) Finalizar w290; (5) T9 + docs/spec-cardapio.md:128 e AI_HANDOFF.md L7/L23-25; notas: régua F1 só P/G (V mantém 2 blocos/naoTem), inventário 8->7, hints nas linhas 68-71, E2E com R$ 105,00 escopado e regex de CPF da régua F1, opacity:1 na lista P-4 e <style> do placeholder deduplicado (React 19 href/precedence) | - |
| revisor-spec | 2026-10-02 | re-revisao: achados 1-10 fechados na fonte (P-5/P-6/P-7 registradas L117-119 e aplicadas L131/L136/L143-144/L274/L384/L398/L420; exact removido L394; K-$ M x2 R$ 102,00 L466/L501/L503; w290 L479; T9 confere com AI_HANDOFF.md L7/L23-25 e spec-cardapio.md:128; regua F1 so P/G L445-448; inventario 7 L305; hints 68-71; E2E escopado + regex L425/L430/L433). Executado: <style href precedence> React 19.2.7/jsdom 29.1.1 -> 1 regra no head com 3 Inputs, 0 avisos, autocomplete=off so no CPF, tipos ok (@types/react index.d.ts:3504-3505); regex de CPF sem falso positivo em page.content Home/Cardapio. corrigir: L443 ainda diz "K-$ com 1 Margherita M" (contradiz L466). nota: style icado persiste no head apos unmount (L385/L574); constituicao Confidencialidade sem a ressalva da P-7 (sessao principal) | aprova |
| planejador | 2026-10-02 | docs/superpowers/plans/2026-10-02-checkout-cpf.md | - |
| especificador | 2026-10-02 | ajustes pós re-revisão: L443 K-$ M x2; Afirmação L574 verificada pelo revisor-spec; PL-1 -> P-4 estendido com gap 2px (inventário 56), decisão do usuário 2026-10-02 | - |
| revisor (plano) | 2026-10-02 | corrigir: (1) plano L2813-2815 passo 10.2 diz que o item 1 de docs/spec-home.md "termina na linha seguinte", mas termina na L15 ("onClick que troca esse estado."), risco de inserir no meio da frase. nota: (2) PL-1 tratada certo (pre-condicao L2096-2100/L2203, checklist L84-85, 11.3 L2843); resolver antes de despachar o dev, senao para no 7.3 com suite vermelha e Tasks 8-9 travadas; (3) PL-2 procede (oxlint only-export-components reproduzido), desvio ResumoPedidoProps.itens declarado L1342; (4) contagem esperada 246 testes/26 arquivos. Verificado: plano aplicado em copia no scratchpad, checkpoints T5-T8 verdes + tsc 0, final 246/246 + tsc 0 + oxlint sem warning novo; vermelho 9.4 confere (2+3+6 falhas, antigos verdes); E2E 3 FAIL/1 PASS antes da ligacao (timeout em Finalizar pedido) e 12/12 depois, porta 3100; 19 mutacoes de estilo/P-3/P-5 todas mortas; greps 11.3/11.4/11.5 conferem com P-4 e LGPD; copy literal confere com Checkout.dc.html; ancoras T9 conferidas; so ui/Input.tsx+teste como caminho compartilhado | aprova |
| dev | 2026-10-02 | Tasks 1-11 do plano. Criados: src/domain/{cliente,pedido}.ts; src/components/ui/Input.tsx (autorizado); src/components/pedido/TotaisPedido.tsx; src/components/checkout/{itemResumoDe.ts,ItemResumo,ResumoPedido,FormularioCliente,CheckoutPage,PedidoConfirmado}.tsx; tests/unit/domain/{cliente,pedido}.test.ts; tests/unit/ui/Input.test.tsx (autorizado); tests/unit/components/pedido/TotaisPedido.test.tsx; tests/unit/components/checkout/{CheckoutPage,PedidoConfirmado}.test.tsx; tests/e2e/checkout.spec.ts. Alterados: src/App.tsx, src/components/cardapio/{CartPanel,CardapioPage}.tsx, tests/unit/{App.test.tsx,components/cardapio/CartPanel.test.tsx,components/cardapio/CardapioPage.test.tsx}, design/design-system.md, docs/spec-home.md, docs/spec-cardapio.md, AI_HANDOFF.md, esta tabela. Vermelho observado em cada task (modulo ausente: Failed to resolve import; T9: 11 falhas = 2 CartPanel + 3 CardapioPage + 6 App; E2E 3 FAIL/1 PASS) e verde: npm test 246/246 em 26 arquivos, npx tsc -b exit 0, npm run lint 0 erro (so warning preexistente vite.config.ts), E2E checkout 4 passed (porta 3100). Greps 11.3-11.5 conferem com P-4/LGPD. Desvio: ancora do passo 10.3 (spec-cardapio) - item termina na L131, nao L130; anexado ao fim do item. Regua F1 nao rodada (linhas 41-43 P/G a ajustar pelo testador) | - |
| revisor (PR) | 2026-10-02 | corrigir: (1) guarda de console so cobre CPF; nome/telefone sem guarda (spec L153) - CheckoutPage.test.tsx:317-321 e checkout.spec.ts:82; mutacao console.info(telefone) sobrevive (24/24). nota: (2) PedidoConfirmado.test.tsx:369 nao pode falhar (fixture ja mascarada; cobertura real em pedido.test:245-248 + E2E:89-90); (3) pedido.ts:127 telefone sem corte em 11; (4) CardapioPage.tsx:26 linha em branco; (5) desvio 10.3 procede (item spec-cardapio L128-131, "fim do item"). Verificado: npm test 246/246 (26 arquivos), tsc -b 0, lint 0 erro; diff -r vs backup: ui/styles/constitution/framework/patterns intactos, so ui/Input.tsx+teste; package.json/.claude/CLAUDE.md sem mtime pos-backup; P-1..P-7 + extensao P-4 no codigo; greps LGPD (console/storage/location/snapshot) vazios; valores crus = lista P-4; sem aritmetica/regex em componentes; 11 mutacoes de dominio/P-2/P-3/P-5/P-6/LGPD mortas; E2E nao rodado (porta do testador) | aprova |
| testador | 2026-10-02 | premissas atacadas, nenhuma caiu: DV do CPF igual à referência (99 trocas de 1 dígito, 10 inversões, 200k aleatórios sem divergência; repetidos/9/10/12 dígitos false); máscaras tecla a tecla com corte no 11º dígito; erros só após a 1ª tentativa e recalculados ao digitar; P-3 descarta; P-5 off só no CPF; P-7 confirmação ***.456.789-** e DOM pós-confirmação sem CPF/nome/telefone; P-1 #1234->#1235, reload volta a #1234; P-2 Home; P-6 carrinho sobrevive Home<->Cardápio e esvazia ao confirmar; frete 45->12, 95->12, 100 grátis, 90->12/102; console 0 mensagens com CPF/tel, URL fixa, storage/cookie vazios. Réguas: checkout.paridade.mjs exit 0 (572 verificações, 556 implementa ok, 0 divergências, 16 hint/derivado), cardapio.paridade.mjs (P/G 6 blocos + botão + frase) exit 0 (754 implementa ok, 0 divergências); diff de pixels contra o harness 0px em K-V/K-P/K-E/K-C; npm run gate exit 0 (246/246, lint 0 erros, tsc 0, E2E 12 passed). Observações sem defeito: atributo value do #cpf espelha o CPF durante o checkout (P-7 permite); placeholder 000.000.000-00 casa a regex de CPF; paridade visual: ok | confirma |
| dev | 2026-10-02 | fix pós revisor (PR): (1) guarda de console estendida a nome e telefone em CheckoutPage.test.tsx (laço) e checkout.spec.ts (mensagens); dentes provados com console.info(dados.telefone) temporário em CheckoutPage.handleConfirmar: vermelho "expected (11) 90000-0000 not to contain 90000-0000", revertido, grep console. em src vazio; (2) pedido.test.ts: teste 12 dígitos -> 11 (vermelho: expected 119000000001 to be 11900000000) e .slice(0, 11) em pedido.ts; (3) linha em branco removida em CardapioPage.tsx. Verde: npm test 247/247 em 26 arquivos, tsc 0, lint 0 erro (só warning preexistente), E2E checkout 4 passed (porta 3100). tests/paridade intocado | - |
| revisor (PR) | 2026-10-02 | re-revisao pos-fix: (1) fechado - CheckoutPage.test.tsx:321-322 + checkout.spec.ts:83 (nome/telefone); mutacoes console.info(telefone) e console.warn(nome) agora 1 failed/24 cada; (3) fechado - pedido.ts:44 .slice(0, 11) + pedido.test.ts:62-65 (mutacao sem corte: 1 failed/9); (4) fechado - CardapioPage.tsx linha removida; notas 2 e 5 mantidas. Escopo: so os 5 arquivos declarados (CheckoutPage.tsx com mtime novo e conteudo identico; tests/paridade = testador T10); ui/styles/constitution/framework/patterns intactos vs backup. Verificado agora: npm test 247/247 (26 arquivos), tsc -b 0, lint 0 erro; E2E nao rodado (porta do gate) | aprova |
| revisor-design | 2026-10-02 | sem achados; 0 sem linha correspondente; 0 HARD STOP. Comparado a 1280x720, tela inteira, mockup (harness conferido contra Checkout.dc.html L24-129, Input.dc.html L45-100, Cardapio.dc.html L77-123) x app: K-V e K-C 0px (prints proprios porta 3101); K-P 44px/K-E 73px com delta<=3 (imperceptivel); prancha I com estados aplicados (hover/foco de campo e de checkbox) <=3 de delta, salvo 7px de sombra cbh/anel cbf sem diferenca visivel em zoom 3x; K-$ contra a fonte L234/L238; Cardapio CV/CI no topo e com rolagem 400 (botao w290 h44 gap 20, frase 12px --text-muted centralizada, ausentes no vazio, aside sticky); hover de Finalizar/Voltar/Confirmar/Alterar pedido (sublinhado sem deslocar), foco por Tab e por clique igual ao mockup, quebras de linha, baseline do cabecalho do aside, scroll 0 ao abrir checkout/confirmacao. Nota: paridade-checkout-I.png do testador foi tirado apos clique em cb0 e blur (regua L571-577), nao serve de evidencia visual da prancha; a medicao da regua (L553-562) segue valida | aprova |
