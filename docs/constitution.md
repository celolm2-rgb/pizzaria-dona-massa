# Constituição local — Pizzaria Dona Massa

> Núcleo: `docs/framework/constitution-core.md` — **core v1.5** (2026-10-01), puxado de
> `cq1-developer/ai-working-framework` @ `6f851e4` via `gh api` (repo privado; o `curl` raw dá 404).
> Para atualizar: pedir ao agente "pega a versão atual do núcleo em cq1-developer/ai-working-framework
> e atualiza docs/framework/" — sobrescreve SÓ o núcleo, nunca este arquivo.
>
> Este arquivo contém apenas o **Específico do projeto**. Instalação MÍNIMA: só o necessário para a
> feature de teste "Finalizar pedido com CPF na nota" (demo da palestra "Claude Code na prática").

## Específico do projeto

### O que é
Site fictício da Pizzaria Dona Massa (Home + Cardápio com carrinho/frete), em React/Vite. Atores:
cliente da pizzaria (monta o pedido) e o apresentador (usa o projeto como laboratório). Objetivo:
base da demo da palestra; 1ª feature no pipeline = "Finalizar pedido com CPF na nota".
`project_id`: **`dona-massa`**.

### Stack e comandos
React 19, Vite 8, TypeScript 6, Vitest 4 + Testing Library, Playwright (E2E), oxlint. npm. App único.

| Comando | O quê |
|---|---|
| `npm test` | testes unitários (Vitest) |
| `npm run lint` | oxlint |
| `npx tsc -b` | typecheck |
| `npm run test:e2e` | E2E (Playwright, porta 3100) |
| `npm run screenshot` | prints em `design/atual-*.png` (porta 3101, viewport 1280x720) |
| `npm run gate` | gate completo: test + lint + typecheck + e2e |

### Invariantes técnicos (limites que não se violam)
1. Regras de negócio só em `src/domain` (funções puras, zero UI). Componentes nunca calculam preço,
   frete nem validam CPF.
2. UI usa exclusivamente os tokens de `src/styles/tokens.css` e compõe com `src/components/ui` (E-5).
3. TDD sempre; nada é "pronto" sem `npm run gate` verde com evidência fresca.
4. Toda mudança de UI é validada com `npm run screenshot` contra o mockup do Claude Design (E-6).

### Caminhos compartilhados (M-8 — só com instrução LITERAL no brief)
`src/styles/tokens.css`, `src/components/ui/**`, `CLAUDE.md`, `docs/constitution.md`,
`docs/framework/**`, `docs/patterns/**`, `.claude/**`, `package.json`.

### Fonte de verdade
- **Visual:** Claude Design.
  - **Fonte única: projeto `02dc2137-ef8c-4ce1-a78a-620ac1883b79`** — `Home.dc.html` (adicionado e
    alinhado ao catálogo em 2026-10-02, ver D8), `Cardapio.dc.html` (origem do Cardápio implementado,
    redesenho de 2026-10-01 — spec `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md`),
    `Checkout.dc.html`, `Checkout - Pranchas.dc.html` e `Input.dc.html`. Verificado via
    `DesignSync list_files`/`get_file` em 2026-10-02.
  - Projeto antigo `6036dccf-e261-4ed4-a41b-e1751a2451cf`: SUPERADO por inteiro (Home e Cardápio) —
    não usar como fonte.
  - Design system: projeto `e7eebd99-3f42-41c1-9308-431ca91d321c` (copiado em `_ds/` nos dois). Acesso via ferramenta `DesignSync`
  (MCP `claude_design`, auth `/design-login`). Origem/imports em `design/design-prompt*.md` e
  `design/design-system.md`.
- **Regra de negócio:** o usuário (dono do produto). Divergência protótipo x instrução → vale a
  instrução do usuário (ex.: frete R$12, não os R$8 do protótipo).
- **Já implementado:** `docs/spec-*.md` + `src/domain`. Não há legado, banco nem API.

### Confidencialidade (Valor 4) — LGPD
- A feature coleta nome, telefone e CPF (dados pessoais). CPF é opcional e só para nota fiscal.
- **CPF completo NUNCA** em log, console, analytics, URL, mensagem de erro ou snapshot de teste.
  Exibição sempre mascarada (`***.456.789-**`) — ressalva (P-7, D9): no próprio campo, durante a
  digitação, o cliente vê o CPF formatado completo; toda exibição posterior é mascarada. O campo CPF
  usa `autoComplete="off"` (P-5) e desmarcar "Quero CPF na nota" descarta o valor (P-3).
- Nome e telefone seguem a mesma proibição do CPF em log/console/URL/erro/snapshot.
- Nada persiste: pedido só em memória, sem backend.
- Bacen: não se aplica (sem pagamento/Pix/cartão).
- Dados de teste SÓ fictícios (CPF de teste `123.456.789-09`). Nunca dado real em teste, fixture,
  print ou gravação.
- Zero segredo real. `.env`, se existir, é fictício e só para demo.
- Ambiente: só local, sem deploy.

### GATE do projeto (rodar no início de toda sessão)
1. `node -v` e `npm -v` respondem; `node_modules` instalado.
2. Base verde: `npm test`, `npm run lint`, `npx tsc -b`.
3. Chromium do Playwright instalado (`npx playwright --version`) — E2E e screenshot.
4. `DesignSync` autenticado — **só quando o trabalho toca tela** (núcleo: fonte de verdade exigida
   pelo tipo de trabalho).
5. Skills de método invocáveis: brainstorming, writing-plans, test-driven-development,
   systematic-debugging, verification-before-completion, requesting-code-review.
6. Nenhum `.env` com valor real.

Falhou qualquer item → PARAR e reportar.

### Portas
Faixa registrada em `C:\Users\<user>\PORTS.md`: **3100-3199** (2026-10-01). **3100** = dev/E2E
(`vite.config.ts` + `playwright.config.ts`), **3101** = screenshot (`scripts/screenshot.mjs`), ambas
com `strictPort` (porta ocupada falha alto, em vez de testar outro app). Ver D5.

### Governança e coordenação
- **Sem git** (D1): projeto local, sem host, sem branch/PR. Revisão sobre os arquivos tocados; o
  dev lista no relatório EXATAMENTE os arquivos criados/alterados.
- Sessão única; subagentes com handoff por arquivo (spec com tabela de assinaturas + `docs/wip.md`).
- Pipeline mínimo (M-9 adaptado, D2): especificador → revisor-spec → planejador → revisor (plano) →
  dev → (testador ∥ revisor (PR)), + revisor-design sob demanda. Agentes em `.claude/agents/`.

### Regras do núcleo que NÃO se aplicam nesta instalação
- Operacional > "Branch sempre, PR sempre" e ordem commit → gate → push (D1).
- Operacional > "Coordenação por issues" e "Coordenação multi-dev/multi-agente" (lock/mural) (D2).
- M-8: a parte de worktree próprio (D1). Brief autossuficiente e subagente limpo continuam valendo.
- M-9: papel `mergeador` (D2). Lint da tabela de assinaturas: inexistente, conferência manual.
- E-4 (paginação no backend): não há backend.
- "Reporte ao farol": MCP `farol` não registrado.

### Módulos (sem `.claude/rules/` — os agentes apontam para estas seções)
- **Specs e paridade:** specs em `docs/superpowers/specs/`, planos em `docs/superpowers/plans/`.
  Forma da tabela de assinaturas: `docs/patterns/pipeline-de-papeis.md`. Inventário de paridade:
  `docs/patterns/inventario-de-paridade.md`. Gate cruzado sem board: (1) pedido do usuário registrado
  na spec, (2) tasks = seções da spec, (3) mockup `*.dc.html` lido por inteiro, (4) `src/domain`.
- **Domínio:** seção "Fonte de verdade" acima + `src/domain`.
- **Telas/E2E:** invariantes 2 e 4; E2E em `tests/e2e/`; comparação visual com
  `npm run screenshot` no viewport 1280x720 (tela inteira dos dois lados).
- **Controles:** `npm run gate`; sem hooks nesta instalação.
- **Decisões:** seção abaixo.

### Log de decisões
- **D1 — 2026-10-01 — Sem git.** O usuário removeu o `.git` e optou por instalar sem git. Por quê:
  decisão do usuário. Consequência: sem branch/PR/worktree/revert; `/rewind` (checkpoints do Claude
  Code) continua disponível. Desvio consciente da pré-condição da skill de instalação.
- **D2 — 2026-10-01 — Pipeline mínimo.** Sem mergeador, worktrees, issues, lock e farol. Por quê:
  sessão única, sem git, escopo = uma feature de demo.
- **D3 — 2026-10-01 — Transcrição de assinatura.** `revisor`, `revisor-spec`, `testador` e
  `revisor-design` não têm Edit/Write: devolvem a linha de assinatura pronta no relatório e a sessão
  principal a transcreve LITERALMENTE na tabela. Desvio do M-9 ("o orquestrador não edita em nome de
  outro papel") limitado à transcrição — o coordenador nunca corrige o artefato. Por quê: manter o
  revisor sem ferramenta de escrita.
- **D4 — 2026-10-01 — Ferramentas de escrita para quem produz artefato.** `especificador` e
  `planejador` recebem `Write`/`Edit` (os modelos do framework não têm, mas precisam gravar spec e
  plano), restritos por instrução a `docs/superpowers/**`. Todos os agentes recebem `Skill` para
  invocar as skills de método. INTENÇÃO: validar na 1ª rodada do pipeline.
- **D5 — 2026-10-01 — Portas na faixa própria.** Dev/E2E 5173 → 3100 e screenshot 5183 → 3101, com
  `strictPort`. Por quê: no GATE de instalação os 8 E2E falharam porque o Vite do projeto
  `pizzaria-dona-massa-template` ocupava a 5173 e o `reuseExistingServer` do Playwright testou o app
  errado. Defesa M-6: faixa exclusiva registrada + `strictPort`. Evidência: `npm run gate` verde
  (92 unit + 8 E2E) com o outro projeto ainda na 5173.
- **D6 — 2026-10-02 — Mockup chega ao subagente por cópia local.** `DesignSync` (e ferramentas de
  MCP em geral) NÃO é repassado a subagentes: o especificador parou sem acesso ao mockup (2026-10-01).
  Regra: antes de despachar papel que lê design, a sessão principal baixa os `*.dc.html` via
  `DesignSync get_file` para `<scratchpad>/mockups/<projeto>/`, cita o caminho no brief e re-atesta
  (novo `get_file` idêntico) antes do dev (E-6a). Os `.dc.html` não renderizam sem `support.js`/
  `_ds_bundle.js`: medidas do mockup vêm do fonte; a régua mede o app contra o inventário. O
  `DesignSync` listado nos `tools:` dos agentes é inócuo (não chega) — mantido só como intenção.
- **D7 — 2026-10-02 — Feature 1 (Redesenho do Cardápio) fechada.** Spec
  `docs/superpowers/specs/2026-10-01-cardapio-redesign-design.md` (pipeline fechado), plano
  `docs/superpowers/plans/2026-10-02-cardapio-redesign.md`. Evidência: `npm run gate` verde
  (117 unit + 8 E2E, lint 0, tsc 0) e régua `node tests/paridade/cardapio.paridade.mjs` exit 0
  (754 medidas, 0 divergências) em 2026-10-02.
- **D8 — 2026-10-02 — Home no projeto 02dc2137; mockup corrigido, app inalterado.** O usuário
  adicionou `Home.dc.html` ao 02dc2137 (layout/copy = Home implementada, 23 pontos conferidos), mas as
  Favoritas vinham com o catálogo antigo, contradizendo o Cardápio. Decisão do usuário: corrigir o
  MOCKUP (não o app), mantendo catálogo único (P-1 → A). Re-conferido via `get_file`: Favoritas =
  `PIZZAS` de `src/domain/cardapio.ts` caractere a caractere. O 6036dccf deixa de ser fonte.
- **D9 — 2026-10-02 — Feature 2 (Finalizar pedido com CPF na nota) fechada.** Spec
  `docs/superpowers/specs/2026-10-02-checkout-cpf-design.md` (pipeline fechado), plano
  `docs/superpowers/plans/2026-10-02-checkout-cpf.md`. Decisões do usuário P-1..P-7 + extensão do P-4
  (número sequencial em memória a partir de #1234; "Voltar para o início" → Home; desmarcar CPF
  descarta; valores crus literais em lista fechada; `autoComplete="off"` no CPF; carrinho no `App`
  sobrevive Home↔Cardápio e esvazia ao confirmar; CPF completo só no campo durante a digitação).
  Evidência: `npm run gate` verde (247 unit + 12 E2E, lint 0 erro, tsc 0) e réguas
  `tests/paridade/checkout.paridade.mjs` e `cardapio.paridade.mjs` exit 0, em 2026-10-02.
