# Dona Massa — Design System (resumo)

## Origem

- **Projeto no Claude Design:** https://claude.ai/design/p/e7eebd99-3f42-41c1-9308-431ca91d321c
- **Instrução MCP de import completa** (usar para reimportar quando o sistema evoluir):

  ```
  Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
  https://claude.ai/design/p/e7eebd99-3f42-41c1-9308-431ca91d321c

  Implement: the designs in this project
  ```

Este arquivo resume fielmente o conteúdo do projeto acima (fonte da verdade). Nenhum valor foi
inventado ou alterado na implementação local — ver `src/styles/tokens.css` e `src/components/ui/`.

## Escopo desta importação

Implementado localmente (fundação):
- `src/styles/tokens.css` — todas as variáveis CSS (`tokens/colors.css`, `typography.css`,
  `spacing.css`, `fonts.css`) mais o reset base (`tokens/base.css`), concatenados na mesma ordem
  do `styles.css` de origem.
- `src/components/ui/` — os 3 componentes base do sistema: `Button`, `Card`, `Badge`, portados de
  `components/core/*.jsx` para TSX, preservando variantes, estados e valores.

**Fora do escopo** (não implementado — por instrução explícita, esta importação é só a fundação):
- `guidelines/*.html` — cards de especificação visual (cores, tipo, espaçamento, marca, tom).

## Tela de Cardápio (redesenho de 2026-10-01)

A tela de cardápio vem do `Cardapio.dc.html` do projeto Claude Design
`02dc2137-ef8c-4ce1-a78a-620ac1883b79` (redesenho), que substituiu a versão do projeto
`6036dccf-e261-4ed4-a41b-e1751a2451cf`. Spec: `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`
(`docs/spec-cardapio.md` segue valendo só para o domínio de preço/carrinho/frete).

- Componentes: `CardapioHeader`, `CardapioPage`, `PizzaGrid`, `PizzaCard`, `CartPanel`, `CartItemRow`
  (`src/components/cardapio/`), sobre `src/domain/{cardapio,carrinho,moeda}.ts`. Fotos em
  `src/assets/pizzas/`.
- Simplificações assumidas: fotos sempre visíveis; tamanho padrão fixo em `M`; nada persiste (o
  `localStorage` do protótipo foi cortado); o botão "Finalizar pedido" leva ao checkout (feature 2, spec docs/superpowers/specs/2026-10-02-checkout-cpf-design.md).
- Fidelidade visual: os valores sem token do mockup (pílula `10px 16px`, stepper 28px, foto 180px,
  colunas 340px/`minmax(300px,1fr)`, gap 2px, anel 3px, max-width 1200px/52ch, min-width 14px) foram
  reproduzidos literalmente, confirmado pelo PO em 2026-10-01. Botões pílula e "tirar" usam só
  `font-family` (line-height normal do navegador), como no mockup.

## Tela de Checkout ("Finalizar pedido", 2026-10-02)

Vem de `Checkout.dc.html` e `Input.dc.html` do projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79`. Spec:
`docs/superpowers/specs/2026-10-02-checkout-cpf-design.md`. Componentes em `src/components/checkout/`
(`CheckoutPage`, `FormularioCliente`, `ResumoPedido`, `ItemResumo`, `PedidoConfirmado`) e
`src/components/pedido/TotaisPedido.tsx` (compartilhado com o Cardápio), sobre
`src/domain/{cliente,pedido}.ts`. Reusa o `CardapioHeader`. Nada persiste; o CPF só aparece
mascarado depois de digitado.

## Fora do escopo (cardápio)
- `ui_kits/cardapio/` (Carrinho, MontagemPizza do design system original,
  `e7eebd99-3f42-41c1-9308-431ca91d321c`) — superado pela tela dedicada acima.

## Tela Home / Landing (implementada a partir do mesmo projeto do Cardápio)

Veio do mesmo projeto Claude Design do Cardápio (`6036dccf-e261-4ed4-a41b-e1751a2451cf`), arquivo
`Home.dc.html` — instrução de import completa em `design/design-prompt.md`; spec de implementação
em `docs/spec-home.md`. Componentes em `src/components/home/` (`HomeHeader`, `HomeHero`,
`ComoFunciona`, `Favoritas`, `HomeCTA`, `HomeFooter`, `HomePage`).

- **Navegação:** sem router — `App.tsx` guarda `useState<'home' | 'cardapio' | 'checkout' | 'confirmacao'>('home')` e o carrinho (memória); a Home é a
  tela raiz e todo CTA que no `.dc.html` apontava para `Cardapio.dc.html` vira `onClick` que troca
  esse estado. O wordmark "Pizzaria Dona Massa" do `CardapioHeader` também virou clicável
  (`onNavigateToHome`), voltando para a Home — convenção comum de "logo leva para o início", não
  vinda do `.dc.html` original (que não tinha essa navegação de volta).
- **Nova variant no `ui/Button`:** `onPrimary` (fundo `--branco`, texto `--action-primary`, sem
  sombra) reproduz o override `dc-props` usado nos 3 botões do Home sobre fundo vermelho
  (header, hero, CTA final) — mesma API do componente, sem criar um componente novo.
- **"Favoritas da casa"** reaproveita `PIZZAS` de `src/domain/cardapio.ts` (mesmas 3 pizzas do
  Cardápio, mesma ordem) e deriva o preço "A partir de R$ X,00" via
  `precoPorTamanho('P', pizza.extra)` + `formatarPreco` — nenhuma regra de negócio nova. O mapa de
  fotos por pizza foi extraído de `PizzaGrid.tsx` para `src/components/cardapio/fotosPizzas.ts`,
  reaproveitado pelos dois lugares.
- **"Como funciona"** é copy fechada específica da Home (3 passos), sem cálculo — fica como const
  local em `ComoFunciona.tsx`, mesmo padrão da tagline hardcoded em `CardapioHeader.tsx`.
- **Responsividade:** o `Home.dc.html` de origem não define media queries (ferramenta de viewport
  fixo); `src/components/home/home.css` adiciona breakpoints mínimos (~860px) empilhando o grid do
  hero e os grids de 3 colunas — decisão tomada para atender ao pedido de responsividade, sem
  inventar cores/espaçamentos fora dos tokens existentes.
- **Screenshot:** `npm run screenshot` agora navega Home → Cardápio num só comando, gerando
  `design/atual-home.png` e `design/atual-cardapio.png`.

## Conteúdo e tom de voz

- Produto: cardápio digital de uma pizzaria artesanal de bairro; tela principal é a montagem de
  pizza (tamanho, extras, carrinho).
- Sem fontes de origem (nenhum Figma/codebase/marca fornecido) — sistema criado a partir do
  briefing. Sem logotipo: onde a marca apareceria, usar "Pizzaria Dona Massa" em Young Serif.
- Idioma: português brasileiro, informal-caloroso, 1ª pessoa ("a gente"), cliente em "você".
- Tom acolhedor e artesanal — nunca jargão de sistema ("Sua pizza está no forno! Chega quentinha
  em uns 40 minutos", nunca "Pedido processado com sucesso").
- Sentence case em tudo; caixa alta só em rótulos pequenos e badges ("MAIS PEDIDA").
- Preços em `R$ 52,00` (vírgula decimal); tempos aproximados e humanos ("uns 40 minutos").
- Sem emoji. Nomes de pizza com personalidade da casa ("Margherita da casa", "Portuguesa da Dona").

## Tokens visuais

- **Cores:** `--molho-600 #A62B1F` é a primária (ações, header, marca); fundo creme-massa
  `--massa-100 #F6EDDC`; cartões em branco-farinha `--branco #FFFDF8`. Verde-manjericão
  (`--manjericao-600`) = sucesso/vegetariana; dourado-crosta (`--crosta-500`) = destaques
  ("mais pedida"). Texto em neutros quentes carvão (`#2E211B`–`#6B5A4E`) — nunca cinza/preto puro.
  Máx. 1 cor forte por bloco. Tokens semânticos (`--surface-*`, `--text-*`, `--action-*`,
  `--accent-*`, `--danger*`, `--border-*`, `--focus-ring`) resolvem para a paleta base — ver
  `tokens/colors.css` dentro de `src/styles/tokens.css`.
- **Tipografia:** Young Serif (`--font-display`, sempre peso 400) para títulos, nomes de pizza e
  preços em destaque; Karla (`--font-body`) para corpo, botões e rótulos. Escala `--fs-*`
  (2.5rem → 0.75rem). Sem arquivos de fonte fornecidos — substituídas via Google Fonts (ver
  comentário em `tokens.css`; solicitar arquivos oficiais se existirem).
- **Espaçamento:** escala de 4px (`--sp-1` 4px … `--sp-16` 64px). Padding padrão de cartão: 20–24px.
- **Cantos:** generosos — `--radius-sm/md/lg` (8/12/16px); botões e badges em pílula
  (`--radius-pill`).
- **Sombras:** suaves e quentes, base `rgba(46,33,27,…)`: `--shadow-card` (repouso),
  `--shadow-raised` (hover). Sem inner shadows.
- **Bordas:** `--border-card` (1px `--border-soft`) em cartões; seleção = borda 2px vermelho-molho
  + anel `--molho-100`.
- **Interação:** hover escurece (`--action-primary-hover`); cartões clicáveis elevam
  (`translateY(-2px)` + `--shadow-raised`); press = cor mais escura + `scale(.98)`. Transições
  curtas (100–150ms, ease) em cor/sombra/transform — sem bounces, sem parallax.
- **Fundos:** cor chapada creme-massa; sem gradientes, texturas, imagens de fundo ou
  transparência/blur.
- **Iconografia:** nenhum sistema de ícones fornecido; kit usa apenas caracteres tipográficos
  (×, ✓, −, +). Se necessário, recomenda-se Lucide via CDN — a confirmar com o time.

## Componentes base (`src/components/ui`)

- **`Button`** — pílula; `variant`: `primary` \| `secondary`; `size`: `sm` \| `md` \| `lg`;
  `disabled`, `fullWidth`. Uma única ação `primary` por tela; `secondary` (contorno) para ações de
  apoio. Hover escurece o molho; press aplica `scale(.98)`.
- **`Card`** — superfície branca-farinha, raio 16px, sombra suave. `interactive` eleva no hover;
  `selected` aplica borda 2px vermelho-molho + anel.
- **`Badge`** — selo em pílula, caixa alta. `tone`: `neutral` \| `success` \| `highlight` \|
  `danger` (vegetariana/disponível, mais pedida/novidade, esgotada, informativo).
- **`Input`** — campo de formulário (`kind` `text` | `checkbox`): rótulo → campo → ajuda ou erro; estados padrão, hover, foco, erro, desabilitado. Origem `Input.dc.html` (02dc2137).

Inventário: Button, Card, Badge (briefing de origem) + Input (2026-10-02, Input.dc.html).

## Reimportação

Quando o sistema evoluir no Claude Design, repita a instrução MCP na seção **Origem** acima para
buscar as mudanças e atualizar `tokens.css` / `components/ui` fielmente, sem alterar valores por
conta própria.
