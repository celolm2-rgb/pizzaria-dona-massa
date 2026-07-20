# Spec — Tela de Cardápio (Funcionalidades 1 e 2)

## Contexto

O projeto já tem a fundação do design system (`src/styles/tokens.css`, `src/components/ui/{Button,Card,Badge}`)
e as regras da casa em `CLAUDE.md` (TDD sempre; UI só consome tokens/`ui`; regras de negócio só em
`src/domain` como funções puras; fidelidade visual validada via `npm run screenshot`).

`design/design-prompt.md` aponta para o projeto Claude Design "Tela de Cardápio de Pizzas"
(`6036dccf-e261-4ed4-a41b-e1751a2451cf`, arquivo `Cardapio.dc.html`). Esse arquivo foi importado e
lido fielmente via `DesignSync` — é a fonte de verdade **visual** (layout, cores, textos, cópias,
tokens). Ele também contém um script de protótipo interativo (classe `Component`) usado só para a
demo do Claude Design; **não** é tratado como fonte de verdade para a regra de negócio do frete.

**Divergência encontrada e resolvida com o usuário:** o script do protótipo usa frete fixo de R$8;
a instrução do usuário nesta conversa pediu R$12. Confirmado com o usuário: usar **R$12** (a regra
de negócio vem da instrução explícita do usuário, não do script de demo do arquivo visual).

Esta spec cobre **domínio + componentes + casos de teste de domínio**, nas duas funcionalidades
pedidas, escopo fechado. Implementação virá em etapa seguinte, seguindo TDD.

## Fonte visual — resumo fiel do Cardapio.dc.html

- **Header:** fundo `--action-primary`, padding `28px 32px`; wordmark "Pizzaria Dona Massa" (Young
  Serif, 2rem, `--text-on-primary`); tagline "Pizza artesanal de bairro, direto do nosso forno"
  (0.9375rem, `--molho-100`).
- **Layout principal:** `max-width:1200px`, grid de 2 colunas (`minmax(0,1fr) 320px`, gap 32px).
  Coluna esquerda = grade de pizzas; coluna direita (`aside`, sticky top 24px) = "Seu pedido".
- **Card de pizza** (usa `ui/Card` padding 0 + `ui/Badge` + `ui/Button`): foto (190px, cover, raio
  16px só em cima) → badge opcional → nome (Young Serif 1.375rem) → ingredientes (muted) → rótulo
  "Escolha o tamanho" (caption, uppercase) → 3 linhas de tamanho clicáveis (dot indicador + letra +
  contagem de fatias + preço) → botão "Adicionar · R$XX,00" (`Button` primary, fullWidth).
  - Linha de tamanho selecionada: borda 2px `--molho-600` + anel `--molho-100`, fundo `--branco`,
    preço em `--molho-600` (Young Serif). Não selecionada: borda 1px `--border-soft`, fundo
    `--massa-50`, preço em `--text-title`.
  - Após clicar em "Adicionar", o botão mostra "Adicionado ✓" por ~1.4s e volta ao normal.
- **Catálogo (3 pizzas, valores exatos do arquivo — batem com a instrução do usuário):**
  | Pizza | Ingredientes | Extra | Badge |
  |---|---|---|---|
  | Margherita da casa | Molho de tomate, muçarela, tomate fresco e manjericão da horta | +R$0 | `success` "Vegetariana" |
  | Calabresa da Dona | Molho de tomate, muçarela, calabresa fatiada e orégano | +R$5 | `highlight` "Mais pedida" |
  | Quatro queijos | Muçarela, provolone, parmesão e gorgonzola sobre molho de tomate | +R$10 | nenhum |
- **Tamanhos:** P = R$35 (4 fatias), M = R$45 (6 fatias), G = R$55 (8 fatias). Tamanho padrão: M.
- **"Seu pedido" (aside):** vazio → "Seu pedido está vazio — escolha uma pizza ao lado que a gente
  já acende o forno." Com itens → lista de linhas (nome, "Tamanho X · R$Y cada", controles −/qty/+,
  botão × "Tirar do pedido", preço total da linha) → Subtotal → Frete (valor ou "Grátis", verde se
  grátis) → aviso "Faltam **R$X** para o frete grátis" (fundo `--accent-highlight-bg`) OU "Você
  ganhou frete grátis ✓" (fundo `--accent-success-bg`) → Total (Young Serif, `--molho-600`).
- **Fotos:** `uploads/pizza-margherita.jpg`, `uploads/pizza_calabresa.jpg`, `uploads/pizza-4-queijos.jpg`
  no projeto Claude Design — trazer via `DesignSync` na implementação (fiel ao "mostra fotos por
  padrão" do arquivo). Sem toggle de exibir/ocultar foto nem tamanho-padrão configurável: esses eram
  "knobs" do editor do Claude Design, não requisito de produto — simplificação por escopo fechado /
  YAGNI, a registrar no `design/design-system.md` ao implementar.

## Funcionalidade 1 — Listagem das pizzas

### (a) Domínio — `src/domain/moeda.ts` + `src/domain/cardapio.ts`

- `moeda.ts`: `formatarPreco(valorEmReais: number): string` → `"R$ 35,00"` (vírgula decimal, sem
  centavos fracionários). Reaproveitado pela Funcionalidade 2.
- `cardapio.ts`:
  - `TAMANHOS`: dado fechado `[{ k: 'P', base: 35, fatias: '4 fatias' }, { k: 'M', base: 45, fatias: '6 fatias' }, { k: 'G', base: 55, fatias: '8 fatias' }]`.
  - `PIZZAS`: catálogo fechado das 3 pizzas (id, nome, ingredientes, extra, badge `{tone,label}|null`, caminho da foto).
  - `precoPorTamanho(tamanho: 'P'|'M'|'G', extraSabor: number): number` → base do tamanho + extra do sabor.
  - `listarTamanhosComPreco(extraSabor: number): Array<{ k, fatias, preco: number }>` → os 3 tamanhos já com preço calculado para aquele sabor (função pura usada pela UI para não calcular preço).

### (b) Componentes — `src/components/cardapio/`

- `PizzaCard.tsx` — controlado: props `pizza`, `tamanhoSelecionado`, `onSelecionarTamanho`,
  `onAdicionar`, `acabouDeAdicionar` (bool, para o "Adicionado ✓"). Usa `ui/Card`, `ui/Badge`,
  `ui/Button`. Não calcula preço — recebe os tamanhos já com preço formatado (via `cardapio.ts` +
  `moeda.ts`) por quem o renderiza.
- `PizzaGrid.tsx` (ou `NossasPizzas.tsx`) — título "Nossas pizzas" + subtítulo + grid
  `repeat(auto-fit,minmax(300px,1fr))`; mantém o estado local de tamanho selecionado por pizza
  (dicionário `{ [pizzaId]: tamanho }`, default `'M'`) e chama `precoPorTamanho`/`listarTamanhosComPreco`
  para montar as props de cada `PizzaCard`. Nesta funcionalidade, `onAdicionar` pode não fazer nada
  além de existir como prop (sem carrinho ainda) — evita reabrir a API do componente na F2.

### Casos de teste do domínio (Funcionalidade 1)

1. `precoPorTamanho('P', 0)` → 35 (Margherita, tamanho P).
2. `precoPorTamanho('M', 0)` → 45 (Margherita, tamanho M).
3. `precoPorTamanho('G', 0)` → 55 (Margherita, tamanho G).
4. `precoPorTamanho('P', 5)` → 40 (Calabresa, tamanho P).
5. `precoPorTamanho('M', 10)` → 55 (Quatro queijos, tamanho M).
6. `precoPorTamanho('G', 10)` → 65 (Quatro queijos, tamanho G).
7. `listarTamanhosComPreco(0)` retorna os 3 tamanhos na ordem P/M/G com fatias e preços corretos.
8. `formatarPreco(35)` → `"R$ 35,00"`.
9. `formatarPreco(0)` → `"R$ 0,00"` (caso de borda, reaproveitado depois pelo aviso de frete).
10. Teste "golden" do catálogo: `PIZZAS` tem exatamente 3 itens, com nome/extra/badge batendo
    fielmente com a tabela acima (protege contra alteração acidental de valores importados).
11. Teste "golden" de `TAMANHOS`: P/M/G com base 35/45/55 e fatias "4/6/8 fatias".

## Funcionalidade 2 — Montagem do pedido

### (a) Domínio — `src/domain/carrinho.ts`

Constantes: `LIMIAR_FRETE_GRATIS = 100`, `VALOR_FRETE = 12` (confirmado com o usuário).

Tipo de item de carrinho: chave única `${pizzaId}-${tamanho}`, nome, tamanho, preço unitário, qty.

Funções puras:
- `adicionarItem(carrinho, novoItem)` → se já existe item com a mesma chave (mesmo sabor+tamanho),
  incrementa `qty`; senão, adiciona com `qty: 1`.
- `alterarQuantidade(carrinho, chave, delta)` → soma `delta` à `qty` do item; remove o item se
  `qty` chegar a 0 ou menos.
- `removerItem(carrinho, chave)` → remove o item pela chave.
- `calcularSubtotal(carrinho)` → soma de `preco * qty`.
- `calcularFrete(subtotal, temItens)` → 0 se carrinho vazio; 0 se `subtotal >= LIMIAR_FRETE_GRATIS`;
  senão `VALOR_FRETE`.
- `calcularFaltaParaFreteGratis(subtotal)` → `max(0, LIMIAR_FRETE_GRATIS - subtotal)`.
- `ehFreteGratis(subtotal)` → `subtotal >= LIMIAR_FRETE_GRATIS`.
- `calcularTotal(subtotal, frete)` → `subtotal + frete`.

### (b) Componentes — `src/components/cardapio/`

- `CartPanel.tsx` (o `aside` "Seu pedido") — props: `itens`, `subtotal`, `frete`, `total`,
  `faltaParaFreteGratis`, `ehFreteGratis`, `onIncrementar`, `onDecrementar`, `onRemover`. Não
  calcula nada — só formata/exibe o que já vem pronto do domínio.
- `CartItemRow.tsx` — uma linha do carrinho (nome, "Tamanho X · preço cada", controles −/qty/+,
  botão remover, preço total da linha).
- `CardapioPage.tsx` — compõe header + `PizzaGrid` + `CartPanel`; dono do estado de carrinho
  (`useState`) e do estado de tamanho selecionado por pizza; toda vez que algo muda, recalcula via
  as funções puras de `carrinho.ts`/`cardapio.ts` e repassa os valores prontos para os componentes.
  É aqui que o `onAdicionar` do `PizzaGrid`/`PizzaCard` passa a chamar `adicionarItem` de verdade.

### Casos de teste do domínio (Funcionalidade 2)

1. `adicionarItem([], novoItem)` → carrinho com 1 item, `qty: 1`.
2. `adicionarItem` com item de mesma chave (mesmo sabor + tamanho) já existente → incrementa `qty`
   em vez de duplicar a linha.
3. `adicionarItem` do mesmo sabor em tamanho diferente → dois itens distintos (chaves diferentes).
4. `alterarQuantidade(carrinho, chave, +1)` → `qty` do item aumenta em 1.
5. `alterarQuantidade(carrinho, chave, -1)` quando `qty` é 1 → item é removido do carrinho.
6. `alterarQuantidade` em item inexistente → carrinho retorna inalterado (não quebra).
7. `removerItem` remove só o item da chave indicada, mantendo os demais intactos.
8. `calcularSubtotal([])` → 0.
9. `calcularSubtotal` com múltiplos itens/quantidades → soma correta de `preco * qty`.
10. `calcularFrete(subtotal, false)` (carrinho vazio) → 0, mesmo que `subtotal` seja 0.
11. `calcularFrete(99, true)` → 12 (abaixo do limiar).
12. `calcularFrete(100, true)` → 0 (exatamente no limiar — caso de borda `>=` vs `>`).
13. `calcularFrete(150, true)` → 0 (acima do limiar).
14. `calcularFaltaParaFreteGratis(63)` → 37.
15. `calcularFaltaParaFreteGratis(100)` → 0 (não retorna negativo quando já passou do limiar).
16. `calcularFaltaParaFreteGratis(150)` → 0.
17. `ehFreteGratis(99)` → false; `ehFreteGratis(100)` → true.
18. `calcularTotal(90, 12)` → 102 (com frete cobrado).
19. `calcularTotal(150, 0)` → 150 (com frete grátis).

## Estrutura de arquivos (nova)

```
src/domain/moeda.ts
src/domain/cardapio.ts
src/domain/carrinho.ts
src/components/cardapio/PizzaCard.tsx
src/components/cardapio/PizzaGrid.tsx
src/components/cardapio/CartPanel.tsx
src/components/cardapio/CartItemRow.tsx
src/components/cardapio/CardapioPage.tsx
tests/domain/moeda.test.ts
tests/domain/cardapio.test.ts
tests/domain/carrinho.test.ts
tests/components/cardapio/*.test.tsx   (na implementação de cada funcionalidade)
```

## Verificação (na implementação, etapa seguinte)

1. TDD por funcionalidade: escrever os testes de domínio listados acima (RED) → implementar as
   funções puras (GREEN) → só então construir os componentes React sobre elas.
2. `npm test` verde a cada funcionalidade fechada (regra da casa nº 1).
3. `npm run screenshot` e comparar visualmente com o resumo fiel do Cardapio.dc.html acima
   (regra da casa nº 4) antes de considerar a funcionalidade pronta.
4. Atualizar `design/design-system.md` registrando que a tela de cardápio deixou de estar "fora do
   escopo" e citando as simplificações assumidas (sem toggle de foto/tamanho-padrão).
