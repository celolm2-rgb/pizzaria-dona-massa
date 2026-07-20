# Spec — Tela Home (Landing)

## Contexto

`design/design-prompt.md` aponta para o mesmo projeto Claude Design do Cardápio
(`6036dccf-e261-4ed4-a41b-e1751a2451cf`), arquivo `Home.dc.html` — importado e lido fielmente via
`DesignSync`. É a fonte de verdade **visual** (layout, cores, textos, cópias, tokens). O script de
protótipo do arquivo só fornece dados estáticos de conteúdo (`passos`, `favoritas`, `onRedProps`,
`navHover`) — não há regra de negócio nova aqui.

Decisões de arquitetura já validadas com o usuário (ver conversa de brainstorming):

1. **Navegação:** estado local em `App.tsx` (`useState<'home' | 'cardapio'>('home')`), sem router.
   Home passa a ser a tela raiz. Todo link do `.dc.html` que apontava para `Cardapio.dc.html` vira
   `onClick` que troca esse estado.
2. **Button:** nova variant `onPrimary` (fundo `--branco`, texto `--action-primary`, sem sombra)
   reproduz o override `dc-props` usado nos 3 botões do Home sobre fundo vermelho — mesma API do
   `ui/Button`, sem componente novo.
3. **Screenshot:** `scripts/screenshot.mjs` passa a navegar pelas duas telas num só comando e gerar
   `design/atual-home.png` + `design/atual-cardapio.png`.

## Fonte visual — resumo fiel do Home.dc.html

- **Header (nav):** fundo `--action-primary`, padding `16px 32px` (mais compacto que o header do
  Cardápio). Wordmark "Pizzaria Dona Massa" (Young Serif, 1.375rem, `--text-on-primary`). Nav:
  link "Como funciona" (`#como-funciona`), link "Favoritas da casa" (`#favoritas`) — cor
  `--molho-100`, hover `--branco` — e botão "Pedir agora" (`onPrimary`, `sm`) → navega para
  Cardápio.
- **Hero:** fundo `--action-primary`, padding `72px 32px 88px`; grid 2 colunas
  (`minmax(0,1fr) 380px`), gap 48px, align-items center.
  - Esquerda: Badge `highlight` "Forno aceso hoje até as 23h"; h1 "Pizza artesanal, feita como em
    casa" (Young Serif, 3rem, `--text-on-primary`); parágrafo (1.125rem, `--molho-100`, max-width
    480px); linha com botão "Ver o cardápio" (`onPrimary`, `lg`) → navega para Cardápio, e texto
    "Entrega grátis acima de R$ 100,00" (`--molho-100`).
  - Direita: foto `uploads/pizza_calabresa.jpg` (já local em
    `src/assets/pizzas/pizza-calabresa.jpg`), 100% largura, 340px altura, cover, raio 16px,
    `--shadow-raised`.
- **Como funciona** (`#como-funciona`, padding `64px 32px`): h2 "Como funciona" + subtítulo "Do
  cardápio à sua porta em três passos"; grid 3 colunas de `Card` (padding 24px): círculo 44px
  (`--surface-inset`) com número (Young Serif, 1.25rem, `--molho-600`) + título (Young Serif,
  1.125rem) + texto (`--text-muted`). 3 passos, conteúdo fechado (ver tabela abaixo).
- **Favoritas da casa** (`#favoritas`, padding `16px 32px 64px`): cabeçalho com título/subtítulo à
  esquerda e link "Ver cardápio completo →" à direita (navega para Cardápio); grid 3 colunas de
  `Card` (padding 0, `interactive`), cada uma um link para o Cardápio: foto (170px, cover, raio
  16px só em cima) → badge opcional → nome (Young Serif, 1.25rem) → ingredientes (`--text-muted`)
  → preço "A partir de R$ X,00" (Young Serif, `--molho-600`).
- **CTA final:** fundo `--action-primary`, raio 16px, padding 48px, flex row wrap: "Bateu a fome?"
  (h2, `--text-on-primary`) + texto (`--molho-100`) à esquerda; botão "Montar meu pedido"
  (`onPrimary`, `lg`) → navega para Cardápio, à direita.
- **Footer:** borda superior `--massa-300`, padding 24px 32px, flex row wrap: nome da marca +
  "Aberto todos os dias, das 18h às 23h · Rua do Forno, 52 — Vila Mariana" (`--text-muted`).

### Conteúdo fechado — "Como funciona" (`passos`)

| # | Título | Texto |
|---|---|---|
| 1 | Escolha seu sabor | Margherita, calabresa, quatro queijos — todas com massa de fermentação lenta. |
| 2 | Monte do seu jeito | Tamanho P, M ou G, com o preço na hora, sem surpresa no final. |
| 3 | Receba quentinha | Saiu do forno, saiu para entrega — em uns 40 minutos está na sua porta. |

Copy de conteúdo específica da Home, sem cálculo — fica como const local em `ComoFunciona.tsx`
(mesmo padrão da tagline hardcoded em `CardapioHeader.tsx`), não em `src/domain`.

### Conteúdo — "Favoritas da casa"

As 3 pizzas do Home.dc.html são exatamente as 3 pizzas de `PIZZAS` (`src/domain/cardapio.ts`), na
mesma ordem, com o mesmo nome/ingredientes/badge. O preço exibido ("A partir de R$ X,00") bate com
`precoPorTamanho('P', pizza.extra)` formatado por `formatarPreco`:

| Pizza | extra | Preço P | "A partir de" |
|---|---|---|---|
| Margherita da casa | 0 | 35 | R$ 35,00 |
| Calabresa da Dona | 5 | 40 | R$ 40,00 |
| Quatro queijos | 10 | 45 | R$ 45,00 |

→ Não há dado novo: `Favoritas.tsx` reaproveita `PIZZAS` + `precoPorTamanho` + `formatarPreco` do
domínio já existente e testado. Nenhuma regra de negócio nova.

## Estrutura de arquivos (nova)

```
src/components/ui/Button.tsx                    (editado: + variant onPrimary)
src/components/cardapio/fotosPizzas.ts          (novo: extraído de PizzaGrid.tsx)
src/components/cardapio/PizzaGrid.tsx           (editado: usa fotosPizzas.ts)
src/components/home/HomeHeader.tsx
src/components/home/HomeHero.tsx
src/components/home/ComoFunciona.tsx
src/components/home/Favoritas.tsx
src/components/home/HomeCTA.tsx
src/components/home/HomeFooter.tsx
src/components/home/HomePage.tsx
src/components/home/home.css                    (responsividade: grids do hero / 3 colunas)
src/App.tsx                                      (editado: estado de navegação home/cardápio)
tests/ui/Button.test.tsx                        (editado: + casos onPrimary)
tests/components/home/HomeHeader.test.tsx
tests/components/home/HomeHero.test.tsx
tests/components/home/ComoFunciona.test.tsx
tests/components/home/Favoritas.test.tsx
tests/components/home/HomeCTA.test.tsx
tests/components/home/HomeFooter.test.tsx
tests/components/home/HomePage.test.tsx
tests/App.test.tsx                              (novo: fluxo de navegação)
scripts/screenshot.mjs                          (editado: 2 telas, 2 arquivos)
```

## Responsividade

O `.dc.html` de origem não define media queries (ferramenta de viewport fixo), mas o pedido do
usuário inclui responsividade explicitamente. `home.css` adiciona breakpoints mínimos (~860px):
grid do hero (`1fr 380px` → `1fr`, imagem depois do texto) e os dois grids de 3 colunas
(“Como funciona”, “Favoritas”) empilhando em 1 coluna. Só layout — usa os tokens de espaçamento já
existentes, nenhuma cor/valor novo fora de tokens.

## Verificação (na implementação)

1. TDD por componente: teste (RED) → implementação mínima (GREEN) → refactor se necessário.
2. `npm test` verde ao final (regra da casa nº 1).
3. `npm run screenshot` gerando `design/atual-home.png` e `design/atual-cardapio.png`, comparados
   visualmente ao resumo fiel acima e ao já validado `Cardapio.dc.html` (regra da casa nº 4).
4. Atualizar `design/design-prompt.md` (acrescentar instrução de import do `Home.dc.html`) e
   `design/design-system.md` (registrar a tela Home, a variant `onPrimary`, o refactor de fotos e
   a navegação por estado) — e `CLAUDE.md` (comando de screenshot passa a gerar 2 arquivos).
