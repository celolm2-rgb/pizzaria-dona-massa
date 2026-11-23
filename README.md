# Pizzaria Dona Massa

Cardápio digital de uma pizzaria artesanal de bairro: montagem de pizza (sabor, tamanho e
extras) e carrinho de pedidos, além da landing page de apresentação. Construído com
React + TypeScript + Vite, seguindo fielmente um design system importado do Claude Design.

## Stack

- Vite + React + TypeScript
- Vitest + Testing Library para os testes
- Oxlint para lint
- Playwright para o script de screenshot de validação visual

## Comandos

- `npm install` — instala as dependências
- `npm run dev` — sobe o servidor de desenvolvimento
- `npm test` — roda a suíte de testes (Vitest)
- `npm run test:watch` — roda os testes em modo watch
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run lint` — roda o Oxlint
- `npm run screenshot` — gera `design/atual-home.png` e `design/atual-cardapio.png`
  navegando pelas duas telas, para validação de fidelidade visual

## Estrutura do projeto

- `src/domain` — regras de negócio em funções puras (preço por tamanho/sabor, carrinho, frete)
- `src/components/ui` — componentes base do design system (`Button`, `Card`, `Badge`)
- `src/components/home` e `src/components/cardapio` — telas (Home/landing e Cardápio)
- `src/styles/tokens.css` — tokens de design (cores, tipografia, espaçamento) importados do
  Claude Design
- `design/` — instruções de import do Claude Design (`design-prompt.md`), resumo fiel do
  design system (`design-system.md`) e os screenshots de validação
- `docs/` — specs de implementação de cada tela
- `tests/` — testes de domínio e de componentes, espelhando a estrutura de `src/`

As regras de desenvolvimento do projeto (TDD, uso exclusivo de tokens/componentes base,
separação de camadas, fidelidade visual) estão em `CLAUDE.md`.

## Configuração do Oxlint

Para habilitar regras de lint com verificação de tipos, instale `oxlint-tsgolint` e ajuste
`.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

Veja a [documentação de regras do Oxlint](https://oxc.rs/docs/guide/usage/linter/rules) para a
lista completa de regras e categorias.

## Prompts do projeto

Prompts utilizados para construir este projeto com Claude Design + Claude Code, agrupados em duas
fases — todo o trabalho de prototipagem no Claude Design primeiro, depois toda a geração de código
no Claude Code — na ordem de execução dentro de cada fase. Anatomia comum: **contexto** (onde
buscar a verdade) + **restrição** (o que não fazer) + **critério de aceite** (como saber que
terminou).

Os prompts 2 e 16–21 (tela Home) foram reconstituídos a partir de `docs/spec-home.md` e
`design/design-system.md` — o histórico de git deste repositório está em commit único (sem o texto
literal das mensagens originais), então o texto exato desses prompts é uma reconstrução fiel às
decisões já registradas nesses documentos, não uma cópia literal do prompt original.

### Fase 1 — Claude Design (prototipagem e configuração visual)

### 1. Design system — formulário "Set up your design system" (Claude Design)

Define a identidade visual do projeto. É o único lugar onde os valores de design (cores, escala, componentes) são definidos — todos os demais prompts referenciam, nunca repetem. Anexos (GitHub, `.fig`, fontes/logos) não utilizados neste projeto.

**Campo "Company name and blurb":**
```
Pizzaria Dona Massa: pizzaria artesanal de bairro com cardápio
digital web. Tela principal: montagem de pizzas com seleção de
tamanho e carrinho de pedidos.
```

**Campo "Any other notes":**
```
Paleta quente e artesanal: vermelho-molho (primária), creme-massa
(fundo), verde-manjericão (destaques/sucesso), neutros para texto.
Espaçamento em escala de 4px, cantos arredondados, 1 fonte display
+ 1 fonte de texto. Componentes base: Button (primary/secondary,
hover/disabled), Card e Badge. Tom acolhedor e artesanal, não
genérico de template.
```

Após configurar: copiar a instrução de import com **Share > Copy prompt** no nível do projeto (sem tela selecionada) — ela alimenta o prompt 7.

### 2. Protótipo — tela Home/landing (Claude Design)

Gera a landing no mesmo projeto do design system, logo após a configuração inicial — antes do
Cardápio, já que a Home é a porta de entrada do site. Reaproveita o design system recém-configurado
(tokens e componentes), sem inventar estilos novos.

```
Usando o mesmo design system do projeto (tokens e componentes, sem
inventar cores ou estilos novos), crie a tela Home/landing:

header compacto com wordmark + nav (links "Como funciona" e
"Favoritas da casa" + botão "Pedir agora"); hero com badge "Forno
aceso hoje até as 23h", título "Pizza artesanal, feita como em
casa", parágrafo, botão "Ver o cardápio" e aviso de frete grátis
acima de R$100, com foto de pizza ao lado; seção "Como funciona"
com 3 passos em cards numerados; seção "Favoritas da casa" com 3
cards de pizza (foto, nome, ingredientes, preço "A partir de");
CTA final "Bateu a fome?" com botão "Montar meu pedido"; footer
com endereço e horário de funcionamento.
```

Após gerar: **com a tela selecionada**, Share > Copy prompt (a instrução virá com `?file=Home.dc.html`).

### 3. Protótipo — listagem das pizzas (Claude Design)

Gera a primeira funcionalidade da tela de Cardápio usando exclusivamente o design system configurado. Os preços são os mesmos da spec (prompt 10) — sem eles, o protótipo inventaria valores divergentes da implementação.

```
Usando o design system configurado do projeto (tokens e componentes,
sem inventar cores ou estilos novos), crie a tela de cardápio —
por enquanto SÓ a listagem das pizzas, sem carrinho:

header com logo textual; grade com 3 cards de pizza (Margherita,
Calabresa, Quatro Queijos) — cada card com nome, ingredientes, emoji
grande de pizza no lugar de foto, seletor de tamanho P/M/G com o
preço ao lado de cada tamanho (base P R$35 / M R$45 / G R$55, com
acréscimo por sabor: Margherita +R$0, Calabresa +R$5, Quatro
Queijos +R$10), e botão "Adicionar".
```

### 4. Protótipo — montagem do pedido (Claude Design)

Adiciona a segunda funcionalidade sobre a primeira, tratando-as como incrementos separados desde o design. O "mantenha a listagem exatamente como está" protege o incremento anterior.

```
Agora adicione à tela a funcionalidade de montagem do pedido:
carrinho lateral fixo com os itens adicionados (sabor + tamanho),
subtotal, frete e total. No carrinho, aviso "Faltam R$ X para
frete grátis" (frete grátis ≥ R$100). Mantenha a listagem
exatamente como está.
```

Após gerar: **com a tela selecionada**, Share > Copy prompt (a instrução virá com `?file=NomeDaTela.dc.html`) e salvar um screenshot do protótipo como `design/referencia.png`.

### Fase 2 — Claude Code (scaffolding, import, specs, TDD, implementação, validação)

### 5. Scaffolding do projeto (Claude Code)

Cria a base: Vite + React + TypeScript com Vitest/Testing Library, estrutura de pastas e suíte verde. Rodar com a pasta `pizzaria-dona-massa` vazia aberta no VS Code.

```
> crie um projeto Vite + React + TypeScript NA RAIZ deste diretório
(o diretório atual já é a pasta do projeto — NÃO crie nenhuma
subpasta), com Vitest e Testing Library configurados (ambiente jsdom,
globals habilitados, setupFiles com jest-dom, tipos do Vitest no
tsconfig). Adicione os scripts "test" (vitest run) e "test:watch"
(vitest) no package.json. Crie a estrutura de pastas: src/domain,
src/components, src/components/ui, src/styles, design, docs, tests.
Crie um teste de fumaça em tests/smoke.test.ts. Simplifique o
boilerplate: App.tsx vira só um placeholder <h1>Pizzaria Dona Massa 🍕</h1>
e remova os CSS de exemplo. Ao final, rode npm test na raiz e me
mostre a suíte verde.
```

### 6. Constituição do projeto — CLAUDE.md (Claude Code)

Cria o arquivo de contexto carregado no início de toda sessão do Claude Code. As regras valem para todas as sessões sem precisarem ser repetidas nos prompts.

```
> crie o CLAUDE.md na raiz com exatamente este conteúdo:

# Pizzaria Dona Massa

## Comandos
- Testes: `npm test`
- Dev server: `npm run dev`
- Screenshot da página: `npm run screenshot` (gera design/atual.png)

## Regras da casa (obrigatórias)
1. TDD sempre: testes primeiro, nada é "pronto" sem suíte verde.
2. UI usa exclusivamente os tokens de src/styles/tokens.css e compõe
   com os componentes base de src/components/ui — nenhum valor hardcoded.
3. Camadas: regras de negócio só em src/domain (funções puras, zero UI);
   componentes em src/components nunca calculam preço ou frete.
4. Fidelidade visual: toda mudança de UI é validada com npm run
   screenshot comparado ao design do Claude Design (origem em
   design/design-system.md).
```

### 7. Import do design system para o projeto (Claude Code)

Traz o design system do Claude Design para dentro do código: tokens, componentes base e o registro de origem. Pré-requisito: MCP autenticado com `/design-login`. O direcionamento não repete valores de design — só define onde as coisas moram e veta telas; o sistema importado é a única fonte de verdade.

```
> Importe o design system via a instrução do Claude Design abaixo e
implemente-o COMPLETO neste projeto, extraindo tudo FIELMENTE do
sistema importado (ele é a única fonte de verdade — não invente nem
altere valores): (1) src/styles/tokens.css com as variáveis CSS do
sistema, importado no ponto de entrada da aplicação; (2) os
componentes base definidos no sistema em src/components/ui, com suas
variantes e estados, consumindo somente os tokens; (3) um resumo do
sistema em design/design-system.md, com uma seção "Origem" no topo
contendo a URL do projeto no Claude Design e a instrução MCP de import
completa — é ela que permite reimportar quando o sistema evoluir.
NÃO crie telas nem componentes de negócio — o escopo é só a fundação.
Rode npm test ao final.

[COLAR AQUI A INSTRUÇÃO COPIADA NO PROMPT 1]
```

### 8. Sensor visual — script de screenshot (Claude Code)

Dá "olhos" ao fluxo: um script que captura a página rodando para o loop de validação de fidelidade visual (prompts 15 e 21). Testes validam comportamento; screenshot valida fidelidade ao design.

```
> adicione ao projeto a capacidade de capturar um screenshot da
aplicação rodando: instale o Playwright como dependência de
desenvolvimento e crie um script "npm run screenshot" que sobe o dev
server, captura a página inteira em design/atual.png e encerra.
Critério de aceite: rodar npm run screenshot e o arquivo
design/atual.png mostrar o placeholder atual.
```

### 9. Guardar o contrato visual — Cardápio (Claude Code)

Persiste a instrução de import da tela sem executá-la — a implementação só acontece depois da spec e dos testes. A instrução copiada oferece o atalho de implementar direto; este prompt deliberadamente o adia.

```
> Vou te passar a instrução de import gerada pelo Claude Design
(ela manda implementar a tela do cardápio — NÃO faça isso agora).
Apenas salve o conteúdo abaixo em design/design-prompt.md; a
implementação virá depois da spec e dos testes:

[COLAR AQUI A INSTRUÇÃO COPIADA]
```

### 10. Spec no modo plano — Cardápio (Claude Code — ativar modo de planejamento com Shift+Tab)

Transforma design + regras de negócio em especificação aprovada antes de qualquer código. O design diz "como parece"; a spec adiciona o que ele não sabe: regras de negócio e arquitetura. Na revisão, conferir o caso de borda: subtotal exatamente R$100 (frete grátis).

```
> planeje a implementação do cardápio. O visual deve seguir FIELMENTE
design/design-prompt.md. Escopo FECHADO, em DUAS funcionalidades
incrementais:

Funcionalidade 1 — Listagem das pizzas: 3 pizzas, tamanhos
P (R$35) / M (R$45) / G (R$55) com variação por sabor de
+R$0/+R$5/+R$10, preço exibido por tamanho no card.

Funcionalidade 2 — Montagem do pedido: carrinho com itens
(sabor + tamanho), subtotal, frete de R$12 grátis acima de R$100,
e aviso de quanto falta para o frete grátis.

Estruture cada funcionalidade em: (a) módulo de domínio com funções
puras, (b) componentes React. Liste os casos de teste do domínio
separados por funcionalidade. NÃO escreva código.
```

Com o plano aprovado:
```
> salve o plano aprovado em docs/spec-cardapio.md.
```

### 11. TDD — vermelho primeiro (Claude Code)

Escreve os testes do domínio antes de qualquer implementação. O "me mostre a suíte FALHANDO" força o vermelho como evidência de que os testes testam algo. Revisar os casos antes de aprovar: os testes são a régua.

```
> TDD conforme docs/spec-cardapio.md: escreva PRIMEIRO os testes
Vitest do domínio, organizados por funcionalidade —
Funcionalidade 1 (listagem): preço por tamanho e por sabor;
Funcionalidade 2 (pedido): subtotal do carrinho, frete grátis
>= R$100 e valor faltante para frete grátis.
Rode e me mostre a suíte FALHANDO antes de implementar.
```

### 12. TDD — verde (Claude Code)

Implementa o domínio até a suíte passar. Depois, rodar `npm test` manualmente — confie, mas verifique na fonte.

```
> testes aprovados. Implemente o domínio até a suíte ficar verde.
```

### 13. Implementação — Funcionalidade 1: listagem (Claude Code)

Implementa a listagem buscando o design via MCP e compondo com a fundação já importada. O critério de aceite é duplo de propósito: testes de componente passam mesmo sem a página montada — só a verificação no navegador garante a entrega completa.

```
> implemente a Funcionalidade 1 da spec (listagem das pizzas). Use a
instrução MCP em design/design-prompt.md para buscar o design no
Claude Design e siga-o FIELMENTE, mas SÓ a parte da listagem: header +
grade de cards com seletor P/M/G e preço por tamanho vindo de
src/domain. Componha com os componentes base de src/components/ui e
os tokens de src/styles/tokens.css — nenhum valor hardcoded, nenhum
cálculo na UI. MONTE A PÁGINA: substitua o placeholder de App.tsx
pela tela da listagem. Critério de aceite: npm test verde E npm run
dev mostrando o cardápio no navegador.
```

### 14. Implementação — Funcionalidade 2: montagem do pedido (Claude Code)

Adiciona o carrinho integrado à página existente, sem alterar o incremento anterior, com teste de componente do fluxo.

```
> implemente a Funcionalidade 2 da spec (montagem do pedido):
carrinho lateral conforme o design do Claude Design (via
design/design-prompt.md), compondo com os componentes base de
src/components/ui e consumindo subtotal, frete e valor faltante de
src/domain. INTEGRE à página existente: App.tsx renderiza listagem +
carrinho lado a lado, e o botão "Adicionar" dos cards alimenta o
carrinho. Não altere o visual da listagem. Inclua 1 teste de
componente: adicionar uma pizza G atualiza o total e o aviso de
frete. Critério de aceite: npm test verde E o fluxo completo
funcionando no npm run dev.
```

### 15. Validação de fidelidade visual — Cardápio (Claude Code)

Loop de correção com sensor: screenshot → comparação com o design → ajuste → repete. Pixel-perfect não é a meta; fidelidade de tokens e layout é.

```
> valide a fidelidade visual: rode npm run screenshot, compare
design/atual.png com o design do Claude Design (via a instrução MCP
em design/design-prompt.md) — cores, tipografia, espaçamentos e
layout de header, cards e carrinho. Liste as divergências
encontradas e corrija uma a uma. Repita screenshot + comparação até
a implementação ficar fiel ao design. Ao final: npm test verde e o
antes/depois das correções.
```

### 16. Guardar o novo contrato visual — Home (Claude Code)

Acrescenta a instrução de import do Home à mesma origem de verdade do Cardápio, sem executá-la
ainda — mesmo adiamento deliberado do prompt 9.

```
> Vou te passar a instrução de import do Home.dc.html gerada pelo
Claude Design (ela manda implementar a tela — NÃO faça isso agora).
Apenas acrescente o conteúdo abaixo a design/design-prompt.md,
junto da instrução do Cardápio já salva; a implementação virá
depois da spec:

[COLAR AQUI A INSTRUÇÃO COPIADA]
```

### 17. Brainstorming — decisões de arquitetura da Home (Claude Code)

Antes de planejar, alinha com o usuário as decisões que a spec não deriva sozinha do `.dc.html`:
como navegar entre 2 telas sem router, como reproduzir o botão vermelho-sobre-vermelho do Home sem
componente novo, e como o script de screenshot passa a cobrir as duas telas.

```
> antes de planejar a implementação da Home, quero alinhar as
decisões de arquitetura: como navegar entre Home e Cardápio sem
adicionar um router só para 2 telas, como reproduzir o botão
vermelho-sobre-vermelho do Home reaproveitando o Button existente
(sem criar componente novo), e como scripts/screenshot.mjs deve
cobrir as duas telas num só comando.
```

### 18. Spec no modo plano — Home (Claude Code — modo de planejamento)

Transforma o design da Home + as decisões da conversa de brainstorming em especificação aprovada,
igual ao prompt 10 fez para o Cardápio. `Favoritas.tsx` reaproveita `PIZZAS`, `precoPorTamanho` e
`formatarPreco` de `src/domain/cardapio.ts` — já existentes e testados desde os prompts 12–13.

```
> planeje a implementação da tela Home (landing) conforme
design/design-prompt.md (Home.dc.html) e as decisões de arquitetura
já alinhadas: navegação por estado local em App.tsx (useState,
sem router), nova variant onPrimary no Button, "Favoritas da casa"
reaproveitando PIZZAS/precoPorTamanho/formatarPreco do domínio já
existente (nenhuma regra de negócio nova) e responsividade com
breakpoint ~860px empilhando o hero e os grids de 3 colunas. Liste
os componentes e os casos de teste por componente. NÃO escreva
código.
```

Com o plano aprovado:
```
> salve o plano aprovado em docs/spec-home.md.
```

### 19. TDD por componente — Home (Claude Code)

Como a Home não introduz regra de negócio nova, o TDD é por componente (teste → implementação
mínima), não por função de domínio como nos prompts 11–12.

```
> TDD conforme docs/spec-home.md: para cada componente (HomeHeader,
HomeHero, ComoFunciona, Favoritas, HomeCTA, HomeFooter, HomePage)
escreva PRIMEIRO o teste, rode e confirme FALHANDO, depois
implemente o mínimo até ficar verde. Inclua a variant onPrimary em
tests/ui/Button.test.tsx e o teste do fluxo de navegação em
tests/App.test.tsx. Rode npm test ao final.
```

### 20. Integração e atualização de documentação — Home (Claude Code)

Monta a Home como tela raiz e atualiza os documentos que passam a valer para 2 telas — passo
explícito na spec que não existia no fluxo do Cardápio (tela única).

```
> integre a Home como tela raiz: App.tsx troca para
useState<'home' | 'cardapio'> e monta HomePage por padrão, com o
wordmark do CardapioHeader navegando de volta para a Home. Atualize
scripts/screenshot.mjs para navegar Home → Cardápio num só comando,
gerando design/atual-home.png e design/atual-cardapio.png. Atualize
design/design-system.md (registrar a tela Home, a variant
onPrimary e a navegação) e CLAUDE.md (comando de screenshot com 2
arquivos). Critério de aceite: npm test verde e npm run dev
mostrando a Home como tela inicial.
```

### 21. Validação de fidelidade visual — duas telas (Claude Code)

Mesmo loop do prompt 15, agora cobrindo as duas telas geradas por `npm run screenshot`.

```
> valide a fidelidade visual das duas telas: rode npm run
screenshot, compare design/atual-home.png com Home.dc.html e
design/atual-cardapio.png com Cardapio.dc.html (via
design/design-prompt.md) — cores, tipografia, espaçamentos e
layout. Liste as divergências encontradas e corrija uma a uma.
Repita até ficar fiel. Ao final: npm test verde.
```

### Prompts de manutenção

**Suíte quebrou (nunca corrigir na mão):**
```
> npm test está falhando com [COLAR O ERRO]; investigue a causa raiz
e corrija até a suíte ficar verde.
```

**Página não ficou fiel ao design:**
```
> a página rodando não ficou fiel ao protótipo do Claude Design. Rode
npm run screenshot, compare design/atual.png com o design (via a
instrução MCP em design/design-prompt.md), liste as divergências de
cores, tipografia, espaçamentos e layout, e corrija uma a uma.
Repita até ficar fiel. Critério: npm test verde ao final.
```

**Componentes prontos mas página no placeholder:**
```
> os componentes existem e os testes passam, mas App.tsx ainda
renderiza só o placeholder. Monte a página: App.tsx deve renderizar
a tela completa. Critério de aceite: npm run dev mostrando a
aplicação. Rode npm test ao final para garantir que nada quebrou.
```

**Reimportar o design system após evolução no Claude Design:**
reutilizar o prompt 7 com a instrução guardada na seção "Origem" de `design/design-system.md`.
