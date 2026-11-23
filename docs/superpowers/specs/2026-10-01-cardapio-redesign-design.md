# Spec — Redesenho do Cardápio (feature 1 de 2)

> Especificador, 2026-10-01. Brief: `docs/superpowers/briefs/2026-10-01-cardapio-redesign-especificador.md`.
> Status: **pronta para revisão de spec.** Pendências fechadas pelo usuário em 2026-10-01 (P-1 → opção A;
> valores sem token → `implementa` literal, confirmado pelo PO).

## Pedido

Palavras do usuário: "Redesenhe o cardápio novo primeiro, depois vamos implementar a feature nova."
O pedido é adotar no app o Cardápio redesenhado do Claude Design (projeto
`02dc2137-ef8c-4ce1-a78a-620ac1883b79`, arquivo `Cardapio.dc.html`) no lugar do Cardápio atual, que
veio do projeto `6036dccf-e261-4ed4-a41b-e1751a2451cf`.

Já decidido com o usuário (não reabrir):
- adotar o Cardápio novo INTEIRO;
- a regra de negócio não muda: P/M/G = R$35/45/55, extras +R$0/+5/+10, frete R$12, grátis a partir de R$100;
- `localStorage` → `corta`;
- botão "Finalizar pedido" e frase "Sai do forno e chega quentinha em uns 40 minutos." → `adia` para a feature 2;
- os dados do catálogo mudam em `src/domain/cardapio.ts`;
- a Home fica como está (layout e código; os dados do catálogo que ela exibe seguem P-1 → A, PO 2026-10-01);
- estilo só por tokens e componentes `ui`.

A feature 2 ("Finalizar pedido com CPF na nota") NÃO entra aqui.

## Contexto

- O Cardápio atual está descrito em `docs/spec-cardapio.md` e implementado em `src/components/cardapio/**`
  sobre `src/domain/{cardapio,carrinho,moeda}.ts`. A navegação fica em `App.tsx`
  (`useState<'home' | 'cardapio'>`).
- Fonte do mockup: cópia fiel do `Cardapio.dc.html`, baixada pela sessão principal via `DesignSync get_file`
  em 2026-10-01. Fica em `%TEMP%\...\scratchpad\mockups\02dc2137\Cardapio.dc.html` (248 linhas, lidas por
  inteiro, inclusive o `<script>`).
- `support.js` e `_ds_bundle.js` não foram baixados. Por isso o mockup **não foi renderizado**: as medidas
  do mockup abaixo vêm do código-fonte (estilos inline em tokens). Geometria derivada (posição/altura) está
  marcada "derivado" e é atacável.
- App atual: medido no Chromium do Playwright em viewport 1280x720. Script temporário fora do projeto,
  Vite na 3101, estados vazio / 1 item / frete grátis. Medido em 2026-10-01.
- Dado pessoal: **nenhum** nesta feature. Ver a seção Confidencialidade.

## Gate cruzado

| # | Eixo | Verificação | Resultado |
|---|---|---|---|
| 1 | Pedido | Registrado na seção "Pedido" acima | ok |
| 2 | Tasks | Cada item do pedido e cada "já decidido" vira uma seção/linha: T1-T8 (seção Tasks) e a tabela antes x depois | ok; efeito na Home coberto em T1 (P-1 → opção A, decidido pelo usuário em 2026-10-01) |
| 3 | Design | `Cardapio.dc.html` lido por inteiro: header, intro, card de pizza (foto, nome+selo, ingredientes, tamanho, resumo, Adicionar), aside vazio, aside com itens (linha, stepper, tirar, subtotal, entrega, total, aviso pago/grátis, Finalizar, frase), script (`BASE`, `DESC`, `PIZZAS`, `FRETE`, `FRETE_GRATIS`, `localStorage`, `finalizar`, `addItem`, `mudarQtd`, `carrinho`, `pill`, `renderVals`) | cada elemento tem decisão no inventário |
| 4 | Domínio | Corpo de `cardapio.ts`, `carrinho.ts` e `moeda.ts` lido. O script do mockup bate com o domínio: `BASE` P35/M45/G55 = `TAMANHOS`; extras 0/5/10 = `PIZZAS[].extra`; `FRETE=12`, `FRETE_GRATIS=100` = `VALOR_FRETE`, `LIMIAR_FRETE_GRATIS`; frete 0 se vazio ou se `subtotal >= 100` = `calcularFrete`; `faltam = max(0, 100 - subtotal)` = `calcularFaltaParaFreteGratis`; soma de quantidade igual em `addItem` e `adicionarItem`; `mudarQtd` remove em `qtd <= 0` = `alterarQuantidade`; `brl` (`toFixed(2)`) ≡ `formatarPreco` (`R$ ${n},00`) **só para inteiros** (todos os preços são inteiros) | bate; faltam 3 funções puras novas (ver Domínio; a 3ª, `calcularTotalDoItem`, é a correção C2 do PO em 2026-10-02) |

## Decisões das dúvidas do brief (M-7)

1. **"Adicionado ✓" → `corta`.** Evidência: o `addItem` do mockup (L158-165) só atualiza o estado; o botão
   tem copy fixa "Adicionar" (L72) e não existe estado de feedback. Com "adotar INTEIRO", o feedback de
   1,4 s, o timer e a prop `acabouDeAdicionar` saem.
2. **Wordmark clicável → mantém (sem diferença visual).** Evidência:
   - no mockup ele é um `<span>` (L27), mas o projeto 02dc2137 não tem Home e nenhuma outra saída do Cardápio;
   - hoje é a ÚNICA volta para a Home, decisão registrada em `design/design-system.md` § Home > Navegação;
   - o `<button>` já é renderizado sem aparência de botão (`background:none; border:none; padding:0; font:inherit`);
   - removê-lo deixaria a Home inalcançável e quebraria `App.test` e `navegacao.spec`.

   Ele adota a tipografia nova (linha 3 do inventário). Atacável: ver "Afirmações que NÃO verifiquei".
3. **Selos (troca literal confirmada no script, L133-135):**
   - Margherita: `{tone:'highlight', label:'Mais pedida'}` (era success "Vegetariana");
   - Calabresa: `badge: null` (o mockup tem `selo:''` e `seloTom:'neutral'`; com `''` o `sc-if` não renderiza);
   - Quatro queijos: `{tone:'success', label:'Da casa'}` (era `null`).

   Os ingredientes também mudam (texto literal na seção Domínio).
4. **Tamanho padrão M → mantém.** Evidência: `state.sel` começa com todas as pizzas em `'M'` (L144).
5. **Testes que quebram:** ver a seção Testes (lista arquivo a arquivo).
6. **Fonte e altura de linha dos botões pílula e "tirar" (achado do revisor-spec, M-7) → literal do
   mockup: só `fontFamily: var(--font-body)`, SEM `font: inherit`.** Evidência:
   - no fonte, a pílula (L212-223, `pill()`) e o "tirar" (L98) definem só `fontFamily`; não há `font`,
     `fontSize` nem `lineHeight` no `<button>`. O resto vem do CSS de UA do navegador
     (Chromium: `font-size 13.333px`, `line-height normal`), e os `<span>` filhos fixam o próprio
     `font-size`;
   - medi em 2026-10-01, no Chromium do Playwright, um HTML de teste fora do projeto com
     `src/styles/tokens.css` (Karla e Young Serif carregadas) e o markup literal do mockup:

     | Caso | Altura |
     |---|---|
     | Pílula não selecionada | **45px** |
     | Pílula selecionada (borda 2px) | **47px** |
     | Pílula com `font: inherit` (como o app hoje: line-height 24px) | 46px |
     | "tirar" literal (`line-height normal`) | **14px** |
     | "tirar" com `font: inherit` | 18px |

   Regra para o dev: os `<button>` da pílula e do "tirar" levam `fontFamily: 'var(--font-body)'`, e NÃO
   `font: 'inherit'` nem `lineHeight`. A régua usa 45/47px (pílula) e 14px (tirar). O stepper (L95-97)
   já define `lineHeight: 1` e `fontSize` explicitamente: segue literal. Resíduo atacável: o `styles.css`
   do DS não foi lido (ver "Afirmações que NÃO verifiquei").

## Pendente para o usuário — FECHADO

- **Decisão (usuário, 2026-10-01): P-1 → opção A (catálogo único).** A Home passa a refletir os selos e
  ingredientes novos de `PIZZAS`; só o layout dela fica intacto (nenhuma mudança de código em `home/**`;
  muda `Favoritas.test.tsx`, ver Testes). Registro original abaixo, mantido como histórico.

- **P-1 — Efeito na Home.** `src/components/home/Favoritas.tsx` consome `PIZZAS` (selo e ingredientes) de
  `src/domain/cardapio.ts`. Trocar o catálogo (decidido) muda a seção "Favoritas da casa" da Home:
  - Margherita passa a "MAIS PEDIDA";
  - Calabresa fica sem selo;
  - Quatro queijos ganha "DA CASA";
  - os ingredientes mudam.

  Isso contradiz "Home fica como está" se a frase quis dizer "conteúdo" e não só "layout". Opções:

  | Opção | O que acontece | Impacto |
  |---|---|---|
  | A | Catálogo único: a Home segue os dados novos e só o layout dela fica intacto | `Favoritas.test.tsx` muda (linhas 18, 22, 30-33) |
  | B | A Home preserva selos e ingredientes antigos | exige dado separado (duplica o catálogo) |

  **Recomendação: A** (uma fonte por fato; a Home já foi desenhada para refletir o catálogo:
  `design-system.md` diz "reaproveita `PIZZAS`"). → Decidido A pelo usuário em 2026-10-01.

## Afirmações que NÃO verifiquei (atacáveis)

- **Geometria do mockup:** não renderizei (`support.js`/`_ds_bundle.js` ausentes). Posição, altura, quebra
  de linha da intro (`max-width:52ch`) e altura dos botões vêm do fonte. As alturas `hint-size` 48px
  (Button) e 22px (Badge) são *hints* do editor, não medidas. Os `ui/Button` md e `ui/Badge` locais medem
  outra coisa: Badge = 25px, medido no app; Button md não medi. Não sei se o Button/Badge do bundle do DS
  é idêntico ao `src/components/ui`.
- **Valores crus (classe confirmada pelo PO em 2026-10-01):** o mockup usa valores sem token:
  - padding da pílula `10px 16px`;
  - stepper `28px`;
  - gap `2px` na linha do item;
  - foto `180px`;
  - colunas `340px` / `minmax(300px,1fr)`;
  - `max-width 1200px` e `52ch`;
  - anel `0 0 0 3px`;
  - `min-width 14px`;
  - **acrescentados pelo PO em 2026-10-02 (C1 do revisor PR):** espessura de borda `2px solid` (pílula
    selecionada), `1px solid` (pílula não selecionada e stepper, onde a cor da borda alterna no hover
    entre `--border-soft` e `--border-strong`) e duração `.15s` nas transições. Precedente:
    `ui/Card.tsx:31,38` e `ui/Button`. Sem mudança visual.
  - **Fora da lista (PO 2026-10-02, C1):** onde o valor é exatamente `1px solid var(--border-soft)` sem
    variação (borda inferior da linha do item, `CartItemRow.tsx:93`; borda superior do Total,
    `CartPanel.tsx:113`), usa-se o token `var(--border-card)` (`tokens.css:44`). Valor computado igual.

  `implementa` literal — **confirmado pelo PO em 2026-10-01** (alinhado ao precedente de
  `design/design-system.md` § "Fidelidade visual"). Deixa de ser decisão do especificador; o que segue
  atacável aqui é só a geometria derivada (não renderizada), não a decisão.
- **Fonte/altura de linha dos botões pílula e "tirar"** (decisão na seção "Decisões", item 6): baseada no
  CSS de UA do Chromium e na ausência de `support.js`/`_ds_bundle.js`/`styles.css` do DS. Se o `styles.css`
  do DS tiver reset de `button` (não baixado, não lido), a medida do mockup muda.
- **Wordmark** mantido como botão (dúvida 2): é decisão minha a partir da evidência, não do usuário.
- **Pílula selecionada 2px mais alta:** o mockup não compensa a borda 2px (padding fixo `10px 16px` nos
  dois estados), então a selecionada tem 2px a mais que a não selecionada. Implemento literal. O app hoje
  compensa (`9px 13px`). Não renderizei para confirmar.
- **Acessibilidade fora do mockup:** mantenho `type="button"`, `aria-pressed` nas pílulas e `aria-label`
  "Diminuir quantidade"/"Aumentar quantidade". O mockup não tem nenhum deles; não muda o visual.

**Verificado (saiu de "atacáveis"):**
- **E-1 x E-3:** pílula de tamanho e stepper −/+ ficam em `src/components/cardapio/`, não em `ui/`
  (E-3: padrão só na 2ª instância real). O revisor-spec conferiu no `Checkout.dc.html` (02dc2137) que o
  checkout não tem stepper nem pílula: o resumo é só leitura (L234).

## Confidencialidade (Valor 4 / LGPD)

- Esta feature não coleta nem exibe nome, telefone ou CPF. O carrinho contém só sabor, tamanho, preço e
  quantidade. Nada persiste: `localStorage` → `corta`, estado só em memória (`useState`).
- Nenhum dado pessoal pode aparecer em log, console, URL, teste ou print desta feature. Prints usam só o
  catálogo fictício.

## Domínio (`src/domain`)

**`cardapio.ts` — só dados mudam, mais 1 função nova.**

`PIZZAS` passa a ser (ids e `extra` inalterados):

| id | nome | ingredientes (literal, mockup L133-135) | extra | badge |
|---|---|---|---|---|
| `margherita` | Margherita da casa | `Molho de tomate fresco, muçarela de búfala e manjericão colhido na hora.` | 0 | `{ tone: 'highlight', label: 'Mais pedida' }` |
| `calabresa` | Calabresa da Dona | `Calabresa artesanal fatiada fina, cebola roxa e um toque de orégano.` | 5 | `null` |
| `quatroqueijos` | Quatro queijos | `Muçarela, provolone, parmesão e gorgonzola derretidos juntos.` | 10 | `{ tone: 'success', label: 'Da casa' }` |

- Os ingredientes agora terminam em ponto final, como no mockup.
- **id `quatroqueijos` mantido** (o mockup usa `quatro-queijos`). É chave interna, sem efeito visível; trocar
  quebraria `FOTO_POR_PIZZA` e a chave do carrinho → mudança `corta`.
- `TAMANHOS`, `precoPorTamanho` e `listarTamanhosComPreco`: inalterados (`DESC` do mockup =
  `TAMANHOS[].fatias`).
- **Nova:** `fatiasPorTamanho(tamanho: Tamanho): string` → `'4 fatias' | '6 fatias' | '8 fatias'`, lida de
  `TAMANHOS`. Uso: a linha do carrinho mostra "Tamanho M · 6 fatias · R$ 45,00 cada", e `ItemCarrinho` não
  guarda as fatias.

**`carrinho.ts` — 2 funções novas; o resto não muda.**
- `contarPizzas(carrinho: ItemCarrinho[]): number` → soma de `qty` (no mockup, `qtdTotal`, L181). É uma
  contagem de pedido, por isso fica no domínio. O texto ("Nenhuma pizza ainda" / "1 pizza no carrinho" /
  "N pizzas no carrinho") é copy de UI e fica no `CartPanel`, que recebe `quantidadePizzas: number`.
- `calcularTotalDoItem(item: ItemCarrinho): number` → `item.preco * item.qty`. **Decisão do PO em
  2026-10-02, achado C2 do revisor (plano):** `CardapioPage.tsx:54` calculava
  `formatarPreco(item.preco * item.qty)` dentro do componente (já existia antes desta feature e viola a
  invariante 1). Corrige agora, nesta feature.

**`moeda.ts`:** sem mudança.

**Casos de teste novos de domínio**

| Função | Entrada | Esperado |
|---|---|---|
| `contarPizzas` | `[]` | 0 |
| `contarPizzas` | `[{…qty:1}]` | 1 |
| `contarPizzas` | `[{key:'margherita-M',qty:2},{key:'calabresa-G',qty:1}]` | 3 (soma qty, não conta linhas) |
| `calcularTotalDoItem` | `{key:'margherita-M', nome:'Margherita da casa', tam:'M', preco:45, qty:1}` | 45 (qty 1 → o próprio preço) |
| `calcularTotalDoItem` | `{key:'margherita-M', nome:'Margherita da casa', tam:'M', preco:45, qty:3}` | 135 (3x) |
| `calcularTotalDoItem` | `{key:'calabresa-G', nome:'Calabresa da Dona', tam:'G', preco:60, qty:2}` | 120 (preço já com extra: G 55 + 5) |
| `fatiasPorTamanho` | `'P'` / `'M'` / `'G'` | `'4 fatias'` / `'6 fatias'` / `'8 fatias'` |
| `PIZZAS` (golden) | — | `toEqual` exatamente a tabela acima |

## Componentes

`src/components/ui/**` (caminho compartilhado): **NÃO é tocado nesta feature.** Tudo compõe com o que já
existe:
- `Card` (o padding e o `style` do layout vêm por prop);
- `Badge` (`tone` `highlight`/`success`);
- `Button` (`primary`, `md`, `fullWidth`).

Pílula de tamanho, stepper e "tirar" ficam em `src/components/cardapio/`, com hover por estado local
(mesmo padrão do `ui/Button`), só com tokens/valores do mockup.

| Arquivo | Mudança |
|---|---|
| `App.tsx` | `<main>` deixa de ser grid: `maxWidth:1200px; margin:0 auto; padding: var(--sp-10) var(--sp-8) var(--sp-16)`. O grid de 2 colunas sai daqui. Wrapper `minHeight:100vh` mantido |
| `CardapioHeader.tsx` | Layout, tagline e tipografia novos (inventário 1-4). Mantém `onNavigateToHome` e o `<button>` |
| `CardapioPage.tsx` | Passa a renderizar: `h1` "Nossas pizzas" + parágrafo de intro (saem do `PizzaGrid`), depois o grid `minmax(0,1fr) 340px`, gap `--sp-8`, `align-items:start`, com `PizzaGrid` e `<aside>` sticky (`top: var(--sp-6)`). Calcula via domínio e repassa: `quantidadePizzas = contarPizzas(carrinho)`, `fatias = fatiasPorTamanho(item.tam)` e `precoTotalFormatado = formatarPreco(calcularTotalDoItem(item))` por item (substitui o `formatarPreco(item.preco * item.qty)` da L54 atual; C2, PO 2026-10-02) |
| `PizzaGrid.tsx` | Perde título/subtítulo, o estado `pizzaAdicionada` e o timer. Grid `repeat(auto-fit,minmax(300px,1fr))`, gap `--sp-6`, **sem** `alignItems:'start'` (cards esticam, como no mockup). Repassa ao card o `precoSelecionadoFormatado` e as `fatias` do selecionado |
| `PizzaCard.tsx` | Estrutura nova (inventário 8-22). Props: remove `acabouDeAdicionar`; adiciona `precoSelecionadoFormatado: string` e `fatiasSelecionadas: string`, ambas montadas pelo `PizzaGrid` (o card não deriva nada). Raiz `<Card padding="var(--sp-6)" style={{display:'flex',flexDirection:'column',gap:'var(--sp-4)'}}>` |
| `CartPanel.tsx` | Estrutura nova (inventário 23-41). Props: remove `mostraAviso`/`mostraGratis` (o aviso aparece sempre que há item, pago ou grátis); adiciona `quantidadePizzas: number`. Raiz `<Card padding="var(--sp-6)" style={{display:'flex',flexDirection:'column',gap:'var(--sp-5)'}}>` |
| `CartItemRow.tsx` | Estrutura nova (inventário 28-34). Props: adiciona `fatias: string`. O "×" com `title="Tirar do pedido"` vira o botão-texto "tirar" (nome acessível "tirar") |
| `fotosPizzas.ts`, `home/**` | Sem mudança de código. Efeito de dados na Home: P-1 |

Nenhum componente calcula preço, frete ou contagem: tudo vem de `cardapio.ts`/`carrinho.ts` via
`CardapioPage`/`PizzaGrid` (invariante 1). Conferido em 2026-10-02 contra o código atual: a única conta
de preço em componente era `CardapioPage.tsx:54` (`item.preco * item.qty`), que passa a
`calcularTotalDoItem` (C2). O resto do `CardapioPage` só chama o domínio (`calcularSubtotal`, `calcularFrete`,
`calcularTotal`, `calcularFaltaParaFreteGratis`, `ehFreteGratis`) e formata com `formatarPreco`; o
`PizzaGrid` só faz busca (`find`) no resultado de `listarTamanhosComPreco`, sem aritmética.

## Tasks (cobertura do pedido)

| T | Item | Status |
|---|---|---|
| T1 | Catálogo novo (ingredientes + selos) em `cardapio.ts` | implementa; a Home (Favoritas) passa a refletir selos e ingredientes novos, layout intacto (P-1 → A, usuário 2026-10-01) |
| T2 | `contarPizzas`, `fatiasPorTamanho` | implementa |
| T10 | `calcularTotalDoItem` (C2): total da linha sai do `CardapioPage` e vai para `carrinho.ts` | implementa (decisão do PO em 2026-10-02, achado C2 do revisor (plano); defeito anterior à feature, corrigido agora) |
| T3 | Header novo | implementa |
| T4 | Intro "Nossas pizzas" em largura total + coluna de 340px | implementa |
| T5 | Card de pizza novo | implementa |
| T6 | Aside "Seu pedido" novo (resumo N pizzas, Entrega, tirar, aviso, total) | implementa |
| T7 | `localStorage` / `finalizar()` / `window.location` | **corta** (nada persiste, constituição § Confidencialidade; mecânica de protótipo) |
| T8 | Button "Finalizar pedido" + frase "Sai do forno e chega quentinha em uns 40 minutos." | **adia** → feature 2 (ainda sem destino) |
| T9 | Artefatos de continuidade (M-4) que ficam falsos depois da entrega | implementa, na MESMA leva do código (ver "T9 — texto literal" abaixo) |

### T9 — texto literal (M-4)

O dev executa estas 4 edições junto com o código. A 4ª toca **caminho compartilhado (M-8)**. Esta spec
pede LITERALMENTE: o brief do dev deve autorizar a edição de `docs/constitution.md`, seção
"### Fonte de verdade", exatamente como abaixo, e nada além disso.

1. **`docs/spec-cardapio.md`**
   - Inserir logo abaixo do título `# Spec — Tela de Cardápio (Funcionalidades 1 e 2)`:

     > **Superada em parte em 2026-10-01** por `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`
     > (Cardápio redesenhado, projeto Claude Design `02dc2137-ef8c-4ce1-a78a-620ac1883b79`). NÃO valem mais:
     > header/tagline (L24-26), feedback "Adicionado ✓" (L36), catálogo/selos/ingredientes (L37-42), prop
     > `acabouDeAdicionar` (L69-70) e o restante do "resumo fiel" visual. Continuam valendo as regras e os
     > casos de teste de domínio (preço, carrinho, frete).
   - Nas linhas L24-26, L36, L40-42 e L69-70, acrescentar ao fim de cada item ` (superado em 2026-10-01)`.
2. **`docs/spec-home.md` L66-67.** Substituir "As 3 pizzas do Home.dc.html são exatamente as 3 pizzas de
   `PIZZAS` (`src/domain/cardapio.ts`), na mesma ordem, com o mesmo nome/ingredientes/badge." por:

   "As 3 pizzas de "Favoritas da casa" vêm de `PIZZAS` (`src/domain/cardapio.ts`), na mesma ordem e com o
   mesmo nome do Home.dc.html. Desde 2026-10-01, selos e ingredientes seguem o catálogo do Cardápio
   redesenhado e divergem do Home.dc.html por decisão do PO (P-1 → A,
   `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`)."
3. **`design/design-system.md` § "Tela de Cardápio" (L30-48).** Substituir a seção inteira, do título
   `## Tela de Cardápio (implementada a partir de outro projeto Claude Design)` até o fim do item
   "Fidelidade visual", por:

   ```
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
4. **`docs/constitution.md`, seção `### Fonte de verdade` (caminho compartilhado, M-8).** Substituir
   exatamente estas linhas (texto atual conferido em 2026-10-01):

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

## Método de medição (entrada do inventário)

Viewport 1280x720, tela inteira dos dois lados.
- **Mockup:** fonte `Cardapio.dc.html` (Lnn = linha). Não renderizado; geometria "derivado" é cálculo a
  partir do fonte.
- **App hoje:** medido (Playwright 1280x720, 2026-10-01). O `main` do app fica em x8 w1264 (conteúdo
  x40 w1200), o mesmo do mockup.
- **Valores sem token** (pílula `10px 16px`, stepper 28px, foto 180px, colunas 340px/300px, gap 2px, anel
  3px, `max-width` 1200px/52ch, `min-width` 14px): `implementa` literal, **confirmado pelo PO em
  2026-10-01**. Desde 2026-10-02 (C1 do revisor PR) também bordas `2px solid`/`1px solid` com cor
  variável e transições `.15s`; `1px solid var(--border-soft)` fixo vira `var(--border-card)` (linhas 28 e 38). Vale para todas as linhas do inventário que os citam (ex.: 7, 8, 10, 18, 19, 29, 31, 32).

Estados: **V** = vazio, **P** = com itens / frete pago (1 Margherita M), **G** = frete grátis (3 Margherita M,
R$ 135,00).

## Inventario de paridade

| # | Tela/estado | Elemento | Mockup | App hoje | Token | Decisao |
|---|---|---|---|---|---|---|
| 1 | Cardápio/V,P,G | Header container | padding 24px 32px (L25); interno max-width 1200, flex row, baseline, space-between, gap 24px, wrap (L26); derivado: interno x40 | padding 28px 32px; interno max-width 1120, coluna, gap 4px; h118; interno x80 | `--action-primary`, `--sp-6`, `--sp-8` | implementa |
| 2 | Cardápio/V,P,G | Header altura | derivado ~82px (24 + 33,6 + 24) | 118px | — | implementa (consequência de 1/3) |
| 3 | Cardápio/V,P,G | Wordmark | Young Serif 400, 1.75rem (28px), lh 1.2, `--text-on-primary`, `<span>` (L27) | Young Serif 32px, lh 1.1, `<button>` clicável | `--font-display`, `--fs-title`, `--lh-title`, `--text-on-primary` | implementa tipografia; **mantém `<button>`** (dúvida 2) |
| 4 | Cardápio/V,P,G | Tagline do header | "Aberto hoje até 23h · entrega em uns 40 minutos"; Karla 0.875rem, `--molho-100`, à direita na mesma linha (L28) | "Pizza artesanal de bairro, direto do nosso forno"; 15px, abaixo do wordmark | `--font-body`, `--fs-small`, `--molho-100` | implementa |
| 5 | Cardápio/V,P,G | Título "Nossas pizzas" | `h1` Young Serif 2.5rem, lh 1.1, `--text-title`, margin 0 0 8px, largura total do main, acima das 2 colunas (L33) | `h1` 28px, lh 42px (herdado), dentro da coluna esquerda (w848) | `--font-display`, `--fs-display`, `--lh-display`, `--text-title`, `--sp-2` | implementa |
| 6 | Cardápio/V,P,G | Intro | "Massa de fermentação natural, assada no forno a lenha. Escolha o tamanho e a gente já começa a abrir a massa."; Karla 1rem, lh 1.5, `--text-muted`, margin 0 0 32px, max-width 52ch, `text-wrap:pretty` (L34) | "Escolha o tamanho e adicione ao pedido"; 15px | `--fs-body`, `--lh-body`, `--text-muted`, `--sp-8` | implementa |
| 7 | Cardápio/V,P,G | Grid de colunas | `minmax(0,1fr) 340px`, gap 32px, align-items start (L36); derivado: coluna esquerda w828, aside x900 w340 | `minmax(0,1fr) 320px`; esquerda w848; aside x920 w320 | `--sp-8` | implementa |
| 8 | Cardápio/V,P,G | Grid de pizzas | `repeat(auto-fit,minmax(300px,1fr))`, gap 24px, sem align-items (stretch) (L37); derivado: 2 colunas de 402px (2 + 1 card) | igual, mas `alignItems:start`; 2 colunas de 410px | `--sp-6` | implementa |
| 9 | Cardápio/V,P,G | Card de pizza | `--surface-card`, `--radius-lg`, `--border-card`, `--shadow-card`, padding 24px, coluna gap 16px (L39) | `ui/Card` padding 0; conteúdo padding 20/24/24 | `ui/Card` + `--sp-6`, `--sp-4` | implementa via `ui/Card padding="var(--sp-6)"` |
| 10 | Cardápio/V,P,G | Foto da pizza | contêiner altura 180px, `--surface-inset`, `--radius-md`, overflow hidden, dentro do padding; img cover 100% (L40-41) | img 190px a sangria, raio 16 só em cima | `--surface-inset`, `--radius-md` | implementa |
| 11 | Cardápio/V,P,G | Linha nome + selo | flex, space-between, align flex-start, gap 12px; selo à DIREITA do nome (L44-48) | selo ACIMA do nome (coluna) | `--sp-3` | implementa |
| 12 | Cardápio/V,P,G | Nome da pizza | `h2` Young Serif 1.25rem, lh 1.2, `--text-title` (L45) | 22px (1.375rem) | `--fs-heading`, `--lh-title` | implementa |
| 13 | Cardápio/V,P,G | Selo Margherita | `ui/Badge` highlight "Mais pedida" (L133) | success "Vegetariana" | `Badge tone=highlight` | implementa |
| 14 | Cardápio/V,P,G | Selo Calabresa | nenhum (L134) | highlight "Mais pedida" | — | implementa |
| 15 | Cardápio/V,P,G | Selo Quatro queijos | `ui/Badge` success "Da casa" (L135) | nenhum | `Badge tone=success` | implementa |
| 16 | Cardápio/V,P,G | Ingredientes | Karla 0.875rem, lh 1.5, `--text-muted`, pretty; copy da tabela do Domínio; gap 8px do nome (L43, L50) | mesma tipografia; copy antiga | `--fs-small`, `--lh-body`, `--text-muted`, `--sp-2` | implementa |
| 17 | Cardápio/V,P,G | Rótulo de tamanho | "Tamanho"; Karla 0.75rem, 700, `--ls-caps`, uppercase, `--text-muted`; gap 8px até a lista (L53-54) | "Escolha o tamanho" | `--fs-caption`, `--ls-caps`, `--text-muted`, `--sp-2` | implementa |
| 18 | Cardápio/V,P,G | Pílula de tamanho (não selecionada) | flex, space-between, gap 12px, w100%, padding 10px 16px, `--radius-pill`, fundo `--surface-card`, borda 1px `--border-soft`; hover: fundo `--surface-raised`, borda `--border-strong`; transition .15s (L212-223, L238); lista grid gap 8px | radius 12px, fundo `--massa-50`, padding 10px 14px, h46; sem hover | `--radius-pill`, `--surface-card`, `--border-soft`, `--surface-raised`, `--border-strong`, `--sp-3`, `--sp-2` | implementa (10px/16px literal, confirmado pelo PO 2026-10-01). Fonte: só `fontFamily: var(--font-body)`, sem `font: inherit` (line-height normal do UA); altura **45px** (Decisões, item 6) Borda `1px solid` (cor alterna no hover) e transição `.15s`: literais, PO 2026-10-02 (C1 do revisor PR). |
| 19 | Cardápio/V,P,G | Pílula de tamanho (selecionada) | fundo `--massa-50`, borda 2px `--action-primary`, anel `0 0 0 3px --molho-100`, mesmo padding 10px 16px (L217-219); **sem hover** quando selecionada (L238: `estiloHover: {}` se ativo) | fundo `--branco`, borda 2px `--molho-600`, padding compensado 9px 13px, raio 12 | `--massa-50` (= `--surface-raised`), `--action-primary`, `--molho-100` | implementa (sem compensar padding; sem hover; altura **47px**, Decisões item 6) Borda `2px solid var(--action-primary)` e transição `.15s`: literais, PO 2026-10-02 (C1 do revisor PR). |
| 20 | Cardápio/V,P,G | Conteúdo da pílula | sem dot; letra Young Serif 1rem `--text-title`; "N fatias" Karla 0.875rem `--text-muted`; gap 12px; preço Young Serif 1rem `--text-title` nos DOIS estados (L58-62) | dot 16px; letra Karla bold; fatias 13px; preço `--molho-600` quando selecionado | `--font-display`, `--fs-body`, `--fs-small`, `--text-title`, `--text-muted`, `--sp-3` | implementa (mantém espaço entre spans para o nome acessível; `font-size` só nos spans, `line-height` normal herdado do `<button>`, Decisões item 6) |
| 21 | Cardápio/V,P,G | Resumo do selecionado | "Tamanho M · 6 fatias" Karla 0.875rem `--text-muted` + preço atual Young Serif 1.25rem `--text-title`; baseline, space-between, gap 12px, margin-top auto (L68-71) | inexistente | `--fs-small`, `--fs-heading`, `--sp-3` | implementa |
| 22 | Cardápio/V,P,G | Botão Adicionar | `ui/Button` primary fullWidth, copy "Adicionar" (L72) | "Adicionar · R$ 45,00"; "Adicionado ✓" por 1,4s | `ui/Button` | implementa; feedback "Adicionado ✓" → **corta** (dúvida 1) |
| 23 | Cardápio/V,P,G | Aside (card) | sticky top 24px; `--surface-card`, `--radius-lg`, `--border-card`, `--shadow-card`, padding 24px, coluna gap 20px (L77) | sticky top 24px; `ui/Card` padding 24px; gap 16px; w320 | `ui/Card`, `--sp-6`, `--sp-5` | implementa via `ui/Card padding="var(--sp-6)"` |
| 24 | Cardápio/V,P,G | Título "Seu pedido" | `h2` Young Serif 1.25rem, lh 1.2, `--text-title` (L79) | 20px, lh 30px (herdado) | `--fs-heading`, `--lh-title` | implementa |
| 25 | Cardápio/V,P,G | Resumo do carrinho | sob o título, gap 4px; Karla 0.875rem `--text-muted`; "Nenhuma pizza ainda" / "1 pizza no carrinho" / "N pizzas no carrinho" (soma das quantidades) (L80, L195) | inexistente | `--fs-small`, `--text-muted`, `--sp-1` | implementa |
| 26 | Cardápio/V | Mensagem de vazio | "Seu carrinho ainda está vazio. Escolha um sabor e a gente já acende o forno."; 0.875rem, lh 1.5, `--text-muted`, padding 24px 0, centralizado (L84) | "Seu pedido está vazio — escolha uma pizza ao lado que a gente já acende o forno."; alinhado à esquerda, sem padding | `--fs-small`, `--lh-body`, `--text-muted`, `--sp-6` | implementa |
| 27 | Cardápio/P,G | Lista de itens | coluna gap 12px (L88) | igual | `--sp-3` | implementa |
| 28 | Cardápio/P,G | Linha do item | flex, gap 12px, align flex-start, padding-bottom 12px, borda inferior 1px `--border-soft` (L90) | borda inferior `--massa-200` | `--sp-3`, `--border-soft` | implementa Borda inferior = `var(--border-card)` (valor exato `1px solid var(--border-soft)`), PO 2026-10-02 (C1 do revisor PR). |
| 29 | Cardápio/P,G | Nome do item | Young Serif 1rem `--text-title`; coluna gap 2px (L91-92) | Karla 15px bold | `--font-display`, `--fs-body`, `--text-title` | implementa (2px literal, confirmado pelo PO 2026-10-01) |
| 30 | Cardápio/P,G | Detalhe do item | "Tamanho M · 6 fatias · R$ 45,00 cada"; Karla 0.75rem `--text-muted` (L93) | "Tamanho M · R$ 45,00 cada", 13px | `--fs-caption`, `--text-muted` | implementa |
| 31 | Cardápio/P,G | Stepper − / + | 28x28, `--radius-pill`, borda 1px `--border-soft`, fundo `--surface-card`, `--text-title`, Karla 1rem, lh 1; hover fundo `--surface-raised` e borda `--border-strong`; linha margin-top 8px, gap 8px (L94-97, L207) | 26x26, fundo `--massa-50`, fonte Arial 15px (não herda Karla), sem hover | `--radius-pill`, `--border-soft`, `--surface-card`, `--surface-raised`, `--border-strong`, `--font-body`, `--fs-body`, `--sp-2` | implementa (28px literal, confirmado pelo PO 2026-10-01; mantém aria-labels) Borda `1px solid` (cor alterna no hover) e transição `.15s`: literais, PO 2026-10-02 (C1 do revisor PR). |
| 32 | Cardápio/P,G | Quantidade | Karla 0.875rem, 700, `--text-title`, min-width 14px, centro (L96) | igual | `--fs-small`, `--fw-bold` | implementa |
| 33 | Cardápio/P,G | Remover | botão-texto "tirar"; margin-left 8px; Karla 0.75rem `--text-muted`, sublinhado; hover `--action-primary` (L98, L208) | "×" no topo direito, `--carvao-300`, title "Tirar do pedido" | `--fs-caption`, `--text-muted`, `--action-primary`, `--sp-2` | implementa (só `fontFamily` + `fontSize`, sem `font: inherit`; altura **14px**, Decisões item 6) |
| 34 | Cardápio/P,G | Total da linha | Young Serif 1rem `--text-title`, à direita (L101) | Young Serif 15px, sob o × | `--font-display`, `--fs-body` | implementa |
| 35 | Cardápio/P,G | Subtotal | "Subtotal"; Karla 0.875rem `--text-body`; bloco gap 8px (L106-109) | igual | `--fs-small`, `--text-body`, `--sp-2` | implementa |
| 36 | Cardápio/P | Linha de entrega (paga) | rótulo "Entrega", valor "R$ 12,00" sem estilo extra (L110-111) | rótulo "Frete" | `--fs-small`, `--text-body` | implementa |
| 37 | Cardápio/G | Linha de entrega (grátis) | "Grátis" em `--manjericao-700`, 700 (L199) | "Grátis" em `--accent-success` (manjericao-600), 700 | `--manjericao-700`, `--fw-bold` | implementa |
| 38 | Cardápio/P,G | Total | padding-top 12px, borda superior 1px `--border-soft`; rótulo "Total" Karla 0.875rem 700 caps `--ls-caps` `--text-muted`; valor Young Serif 1.75rem lh 1.2 `--text-title` (L113-115) | padding-top 10px + margin-top 2px; rótulo Karla 16px bold `--text-title`; valor 20px `--molho-600` | `--sp-3`, `--border-soft`, `--fs-small`, `--ls-caps`, `--text-muted`, `--fs-title`, `--lh-title`, `--text-title` | implementa Borda superior = `var(--border-card)` (valor exato `1px solid var(--border-soft)`), PO 2026-10-02 (C1 do revisor PR). |
| 39 | Cardápio/P | Aviso de frete (pago) | DEPOIS do total; "Faltam R$ 55,00 para frete grátis" (sem negrito, sem "o"); Karla 0.875rem lh 1.5, padding 12px 16px, `--radius-md`, fundo `--accent-highlight-bg`, cor `--crosta-600` (L119, L200-206) | ANTES do total; "Faltam **R$ 55,00** para o frete grátis"; 13px, padding 10px 12px, cor `--carvao-700` | `--fs-small`, `--lh-body`, `--sp-3`, `--sp-4`, `--radius-md`, `--accent-highlight-bg`, `--crosta-600` | implementa |
| 40 | Cardápio/G | Aviso de frete (grátis) | "Frete grátis liberado! A entrega é por nossa conta."; mesmo box, fundo `--accent-success-bg`, cor `--manjericao-700` (L200-205) | "Você ganhou frete grátis ✓"; 13px, padding 10px 12px | `--accent-success-bg`, `--manjericao-700` | implementa |
| 41 | Cardápio/P,G | Ordem dos blocos do aside | cabeçalho → itens → subtotal/entrega/total → aviso → [Finalizar] → [frase]; gap 20px (L77-123) | título → itens → subtotal/frete/aviso/total; gap 16px | `--sp-5` | implementa (sem os 2 últimos, ver 42-43) |
| 42 | Cardápio/P,G | Botão Finalizar pedido | `ui/Button` primary fullWidth "Finalizar pedido" (L121) | inexistente | `ui/Button` | **adia** → feature 2 (botão sem destino até existir o checkout; decidido com o usuário) |
| 43 | Cardápio/P,G | Frase de entrega | "Sai do forno e chega quentinha em uns 40 minutos."; 0.75rem lh 1.5 `--text-muted`, centro (L122) | inexistente | `--fs-caption`, `--text-muted` | **adia** → feature 2 (acompanha o botão; decidido com o usuário) |
| 44 | Cardápio/— | Persistência | `localStorage` `donamassa-pedido` em mount/finalizar (L141-156) | inexistente | — | **corta** (nada persiste, constituição § Confidencialidade; mecânica de protótipo) |
| 45 | Cardápio/— | Estilos globais de `a` / `body` do helmet (L19-21) | iguais ao `tokens.css` base | já em `tokens.css` | — | implementa (sem mudança, já existe) |
| 46 | Cardápio/V,P,G | Wrapper da página | `min-height:100vh`, fundo `--surface-page`, `--font-body`, `--text-body` (L24) | `div` só com `minHeight:100vh` (fundo, fonte e cor vêm do `body` em `tokens.css`; valor computado igual) | `--surface-page`, `--font-body`, `--text-body` | implementa (declara os 3 tokens no wrapper, como o mockup) |
| 47 | Cardápio/V,P,G | Main | `max-width:1200px; margin:0 auto; padding: var(--sp-10) var(--sp-8) var(--sp-16)` (L32), sem grid | `padding:'40px 32px 64px'` cru (mesmos valores) e `<main>` é o grid de 2 colunas | `--sp-10`, `--sp-8`, `--sp-16` | implementa (tokens no lugar do valor cru; o grid sai do main, ver 7) |
| 48 | Home/Favoritas | Selo Margherita | `Home.dc.html` (6036dccf): success "Vegetariana" (segundo `docs/spec-home.md` L66-67; não li o `Home.dc.html`) | success "Vegetariana" | `Badge tone=highlight` | implementa (P-1 → A, PO 2026-10-01): highlight "Mais pedida" |
| 49 | Home/Favoritas | Selo Calabresa | idem: highlight "Mais pedida" | highlight "Mais pedida" | — | implementa (P-1 → A, PO 2026-10-01): sem selo |
| 50 | Home/Favoritas | Selo Quatro queijos | idem: nenhum | nenhum | `Badge tone=success` | implementa (P-1 → A, PO 2026-10-01): success "Da casa" |
| 51 | Home/Favoritas | Ingredientes (3 pizzas) | idem: textos antigos de `PIZZAS` | textos antigos | — | implementa (P-1 → A, PO 2026-10-01): textos novos da tabela do Domínio |

## Testes (TDD: o teste muda ANTES do código)

**Unitários a alterar (falham contra o código atual):**

| Arquivo | Teste | Mudança |
|---|---|---|
| `tests/unit/domain/cardapio.test.ts` | `PIZZAS (catálogo)` golden | nova tabela (ingredientes e selos) |
| `tests/unit/domain/cardapio.test.ts` | novo | `fatiasPorTamanho` P/M/G |
| `tests/unit/domain/carrinho.test.ts` | novo | `contarPizzas` (3 casos da tabela) |
| `tests/unit/domain/carrinho.test.ts` | novo **(vermelho)** | `calcularTotalDoItem` (3 casos da tabela; falha hoje porque a função não existe). T10/C2 |
| `tests/unit/components/cardapio/CardapioHeader.test.tsx` | "renderiza o wordmark e a tagline" | tagline → "Aberto hoje até 23h · entrega em uns 40 minutos". O teste de clique permanece |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | `renderCard` (L28-41), **typecheck** | ganha as props obrigatórias `precoSelecionadoFormatado: 'R$ 50,00'` e `fatiasSelecionadas: '6 fatias'` (coerentes com o M padrão do fixture) e perde `acabouDeAdicionar`. Testes com `tamanhoSelecionado: 'G'` passam também `precoSelecionadoFormatado: 'R$ 60,00'` e `fatiasSelecionadas: '8 fatias'`. Sem isso `npx tsc -b` quebra (o `tsconfig.app.json` inclui `tests/unit`) |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | fixtures | `pizzaComBadge` passa a ser a Margherita ("Mais pedida", highlight) e `pizzaSemBadge` a Calabresa (sem selo), com os ingredientes novos. Os asserts por nome/alt/foto (L46, L65) acompanham o fixture ("Margherita da casa", `pizza-margherita.jpg`). A troca de fixture é local e NÃO conta como vermelho: o vermelho real vem dos testes marcados **(vermelho)** abaixo |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | "marca visualmente o tamanho selecionado" | `border: 2px solid var(--action-primary)` (era `--molho-600`) |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | "mostra Adicionar · {preço}" **(vermelho)** | `getByRole('button', { name: 'Adicionar', exact: true })` (hoje o nome é "Adicionar · R$ 60,00" → falha). Resumo: `within(screen.getByText('Tamanho G · 8 fatias').parentElement!).getByText('R$ 60,00')`. O "R$ 60,00" aparece 2 vezes (pílula G e resumo), então é proibido `getByText('R$ 60,00')` solto |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | "Adicionado ✓" | **remove** (corta) |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | regex `/P\s+4 fatias/` | permanece; exige o espaço entre os spans |
| `tests/unit/components/cardapio/PizzaCard.test.tsx` | novo **(vermelho)**: "selo fica à direita do nome, na mesma linha" | `const nome = screen.getByRole('heading', { name: 'Margherita da casa' }); expect(nome.nextElementSibling).toBe(screen.getByText('Mais pedida'))` e o pai de ambos com `display: flex` e `justify-content: space-between`. Falha contra o código atual: hoje o `Badge` vem ANTES do `h2` (o `nextElementSibling` do h2 é o `<p>` de ingredientes) |
| `tests/unit/components/cardapio/PizzaGrid.test.tsx` | "título e subtítulo" | **move** para `CardapioPage.test` com a copy nova |
| `tests/unit/components/cardapio/PizzaGrid.test.tsx` | "começa em M" / "selecionar tamanho não afeta outras" | asserts por "Adicionar · R$ X" → asserts pelo preço atual de cada card (ex.: `within(card)` "R$ 45,00" junto de "Tamanho M · 6 fatias") |
| `tests/unit/components/cardapio/PizzaGrid.test.tsx` | "Adicionado ✓ … volta ao normal" | **remove**; também saem os fake timers |
| `tests/unit/components/cardapio/CardapioPage.test.tsx` | integração | aviso `'para frete grátis'` (era `'para o frete grátis'`); `/vazio/` continua casando |
| `tests/unit/components/cardapio/CardapioPage.test.tsx` | novos | h1 "Nossas pizzas" + intro literal; resumo "Nenhuma pizza ainda" → "1 pizza no carrinho" → "2 pizzas no carrinho"; aviso grátis "Frete grátis liberado! A entrega é por nossa conta."; rótulo "Entrega"; botão "tirar" remove o item; **ausência** de "Finalizar pedido" (adia) |
| `tests/unit/components/home/Favoritas.test.tsx` | linhas 18, 22, 30-33 | opção A (P-1, 2026-10-01): sai "Vegetariana"; "Mais pedida" (Margherita) e "Da casa" (Quatro queijos); `getAllByText(/Mais pedida\|Da casa/)` com length 2 (o `\|` é só escape da tabela markdown; no código é `|`); Calabresa sem selo; nomes e preços "A partir de" inalterados |
| `tests/unit/App.test.tsx` | — | sem mudança (wordmark mantido como botão) |
| `tests/unit/ui/*` | — | sem mudança |

**Novo teste de componente:** `tests/unit/components/cardapio/CartPanel.test.tsx` (hoje não existe). Cobre:
- resumo singular/plural com `quantidadePizzas` 0/1/3;
- vazio sem subtotal e sem aviso;
- aviso pago x grátis;
- ordem total → aviso.

**E2E a alterar (`tests/e2e/carrinho.spec.ts`):**
- `cartaoDaPizza`: `heading.locator('..').locator('..')` deixa de achar o card, porque o `h2` agora está
  em linha nome+selo dentro de um bloco. Novo localizador:
  `page.locator('main div').filter({ has: page.getByRole('heading', { name }) }).filter({ has: page.getByRole('button', { name: 'Adicionar', exact: true }) }).last()`.
- `painel`: `heading('Seu pedido').locator('..')` passa a ser só o cabeçalho → usar `page.getByRole('complementary')`.
- Copy:

  | Antes | Depois |
  |---|---|
  | `'Seu pedido está vazio'` | `'Seu carrinho ainda está vazio'` |
  | `'para o frete grátis'` | `'para frete grátis'` |
  | `'Você ganhou frete grátis'` | `'Frete grátis liberado!'` |
  | `getByTitle('Tirar do pedido')` | `getByRole('button', { name: 'tirar' })` |

- Novo assert: `'1 pizza no carrinho'` e depois `'3 pizzas no carrinho'`.

`tests/e2e/navegacao.spec.ts`: sem mudança (o wordmark continua `button`).

**Paridade visual (E-6):** o testador compara `npm run screenshot` (Cardápio) com este inventário, linha a
linha. A geometria "derivado" depende de render do mockup, que não consegui (ver "Afirmações que NÃO
verifiquei").

## Fora do escopo

- Checkout / feature 2 (inclusive o botão e a frase, linhas 42-43).
- Mudança de layout/código da Home (o efeito de dados entra, P-1 → A).
- Responsivo/mobile.
- Mudanças em `src/components/ui/**`.
- Persistência.
- Mudança de preço ou frete.

## Assinaturas do pipeline
<!-- pipeline: fechado (2026-10-02; conferência da tabela completa e npm run gate verde pela sessão principal) -->

| papel | data | evidencia | veredito |
|---|---|---|---|
| especificador | 2026-10-01 | docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md | - |
| revisor-spec | 2026-10-01 | corrigir: (1) M-4 sem task para spec-cardapio.md, spec-home.md L66-67, design-system.md § Tela de Cardápio e constitution § Fonte de verdade (caminho compartilhado: pedir no literal); (2) P-1 A sem linhas Home/Favoritas no inventário (diverge de Home.dc.html); (3) PizzaCard.test: props novas obrigatórias/remover acabouDeAdicionar (tsc inclui tests/unit), assert "R$ 60,00" ambíguo (pílula+resumo), fixtures locais não ficam vermelhas; (4) font/line-height dos botões pílula/"tirar" sem decisão (mockup só fontFamily x app font:inherit; altura 46px). nota: L21 "Home fica como está" sem remissão a P-1; main/wrapper sem linha no inventário; pílula selecionada sem hover não explícito; E-3 conferido (Checkout.dc.html sem stepper). Verificado: domínio pelo corpo, tokens, geometria, E2E, npm test 92/92 | aprova |
| planejador | 2026-10-02 | docs/superpowers/plans/2026-10-02-cardapio-redesign.md | - |
| revisor (plano) | 2026-10-02 | corrigir: (1) fontWeight 400 cru em 9 pontos (plano L397,591,626,928,1011,1124,1509,1588,1651) -> var(--fw-regular) (tokens.css:34); (2) preço calculado no componente formatarPreco(item.preco * item.qty) (plano L1162, já existia em CardapioPage.tsx:54) contradiz invariante 1, plano L40-41 e spec L216: adendo de spec (calcularTotalDoItem em carrinho.ts + teste) ou débito explícito, decisão do PO via especificador; (3) teste "selecionada sem hover" (plano L1385-1387) confere só background, igual a --massa-50; acrescentar a borda 2px --action-primary. nota: exact ausente de ByRoleOptions confirmado (queries.d.ts:69-130); T9.1 célula/fim do item ok; motivo do vermelho "ordem" em 5.3 impreciso; frase de spec-home L66-67 com quebra de linha; guarda Finalizar no CartPanel.test; spec fora da lista de arquivos da 10.7; dev roda o gate em partes (M-8). Verificado: vermelhos contra src/tests reais, toHaveStyle com var() não passa vazio (jsdom 29.1.1), tsc por task, só constitution.md como caminho compartilhado, npm test 92/92, tsc exit 0 | aprova |
| revisor (plano) | 2026-10-02 | re-checagem pós-fix: C1 ok (9x fontWeight var(--fw-regular), zero 400 cru); C2 ok (Task 3 calcularTotalDoItem: vermelho real, função ausente em carrinho.ts; 3 casos = spec L195-197; CardapioPage.tsx:54 trocado no Passo 3.3, grep do Passo 3.4 exige zero conta de preço em src/components, Task 7 L1256 usa a função); C3 ok (L1482 confere a borda 2px --action-primary depois do mouseEnter); N1 ok (Passo 6.3), N4 ok (spec na lista da 11.7), N5 ok (Task 11 em primeiro plano, gate com a sessão principal); renumeração 1-11 coerente (Foco, dependências, mapa de 22 arquivos, L53 = Passo 10.4 em constitution.md). Sem achado novo | aprova |
| dev | 2026-10-02 | src/domain/cardapio.ts, src/domain/carrinho.ts, src/components/cardapio/{CardapioHeader,CardapioPage,CartItemRow,CartPanel,PizzaCard,PizzaGrid}.tsx, src/App.tsx, tests/unit/domain/{cardapio,carrinho}.test.ts, tests/unit/components/home/Favoritas.test.tsx, tests/unit/components/cardapio/{CardapioHeader,CardapioPage,CartPanel(novo),PizzaCard,PizzaGrid}.test.tsx, tests/e2e/carrinho.spec.ts, docs/spec-cardapio.md, docs/spec-home.md, design/design-system.md, docs/constitution.md (so Fonte de verdade, T9.4); vermelho/verde por task no relatorio; final: npm test 117/117, lint exit 0, tsc 0, e2e 8/8, screenshot ok | - |
| revisor (PR) | 2026-10-02 | corrigir: (1) borda/transicao crua fora da lista fechada do PO: PizzaCard.tsx:53,54,57, CartItemRow.tsx:35,42,93, CartPanel.tsx:113 (origem: plano L619,626,677,1087,1626-1630 contradiz plano L43-47); 1px solid var(--border-soft) -> var(--border-card) (tokens.css:44) em CartItemRow:93/CartPanel:113; 2px, 1px border-strong e .15s -> decisao do PO via especificador (incluir na lista, precedente ui/Card.tsx:31,38). nota: e2e carrinho.spec.ts CRLF->LF (diff do arquivo inteiro); carrinho.spec.ts:40,57 getByText(...).first() sem exact casa substring ("Grátis" acha "Frete grátis liberado!"), coberto por CartPanel.test:89; PizzaCard.test:76 nao confere a ordem P/M/G; hover de stepper/"tirar" sem teste; CardapioPage:39 length>0 e checagem de presenca, ja existia; 3 botoes com o mesmo nome "Adicionar" (copy da spec). Verificado: npm test 117/117, tsc exit 0, lint 0 erros, escopo = lista do brief (+ e2e-results/.last-run.json), constitution.md so o hunk do Passo 10.4 literal, nenhum outro caminho compartilhado tocado (mtime), invariante 1 ok (grep sem aritmetica em components), LGPD/localStorage grep vazio, aria-pressed/aria-label/"tirar" ok, toHaveStyle com var() discrimina (jsdom 29.1.1, sonda fora do projeto); vermelhos por task nao verificados | aprova |
| testador | 2026-10-02 | premissas atacadas (1-8 resistem: npm test 117/117, lint 0 erros, tsc 0, e2e 8/8; zero conta/contagem em src/components; zero storage; Finalizar/frase ausentes; 45+12=57 e 3x45=135 Grátis no app; Home com selos novos, layout igual ao print pre-dev; console sem CPF) + paridade visual: ok (regua tests/paridade/cardapio.paridade.mjs, `node tests/paridade/cardapio.paridade.mjs`, V/P/G 1280x720: 754 implementa ok, 0 divergencias, exit 0; mutante -> exit 1; derivados: Badge 24.8 vs hint 22 e Button 44 vs hint 48, relato ao PO) | confirma |
| dev | 2026-10-02 | fix C1/N1/N2: src/components/cardapio/CartItemRow.tsx, src/components/cardapio/CartPanel.tsx, tests/e2e/carrinho.spec.ts (CRLF restaurado) | - |
| revisor (PR) | 2026-10-02 | re-checagem pós-fix: C1 ok (CartItemRow.tsx:93 e CartPanel.tsx:113 -> var(--border-card), tokens.css:44; literais restantes PizzaCard.tsx:53,54,57 e CartItemRow.tsx:35,42 = lista ampliada pelo PO, spec L130-136/L326-327); N2 ok (carrinho.spec.ts:40,55,57 com exact: true, L57 sem .first()); N1 ok (CRLF, 83/83 linhas). Escopo: depois da revisão anterior só mudaram CartItemRow.tsx, CartPanel.tsx, carrinho.spec.ts e a spec (paridade.mjs/prints sao do testador, e2e-results e artefato). npm test 117/117, tsc exit 0, lint 0 erros; e2e nao rodado (porta 3100). Sem achado novo | aprova |
